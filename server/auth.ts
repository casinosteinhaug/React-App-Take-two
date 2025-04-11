import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, loginSchema, resetPasswordSchema, updatePasswordSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "temporary-secret-for-development";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Sjekk om brukernavnet er en e-postadresse
        const isEmail = username.includes('@');
        
        // Hent brukeren basert på brukernavn eller e-post
        let user;
        if (isEmail) {
          user = await storage.getUserByEmail(username);
        } else {
          user = await storage.getUserByUsername(username);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send(fromZodError(result.error).message);
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Lag en ny bruker uten passord for å sende til klienten
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send(fromZodError(result.error).message);
      }

      passport.authenticate("local", (err: Error, user: SelectUser) => {
        if (err) return next(err);
        if (!user) return res.status(400).send("Invalid username or password");

        req.login(user, (err) => {
          if (err) return next(err);
          // Bruk destrukturering i stedet for delete
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const result = resetPasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send(fromZodError(result.error).message);
      }

      const user = await storage.getUserByEmail(req.body.email);
      if (!user) {
        // For security reasons, don't reveal whether the email exists
        return res.status(200).send("If the email exists, a reset link has been sent");
      }

      // In a real app, we would generate a token and send an email
      // For this example, we'll simulate success
      res.status(200).send("If the email exists, a reset link has been sent");
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/update-password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const result = updatePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send(fromZodError(result.error).message);
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).send("User not found");
      }

      const { currentPassword, newPassword } = req.body;
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).send("Current password is incorrect");
      }

      const hashedNewPassword = await hashPassword(newPassword);
      // Vi kan nå bruke direkte oppdatering av passord med endringen i IStorage-grensesnittet
      await storage.updateUser(user.id, { password: hashedNewPassword });

      res.status(200).send("Password updated successfully");
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/user", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      await storage.updateUser(req.user.id, req.body);
      const updatedUser = await storage.getUser(req.user.id);
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
}
