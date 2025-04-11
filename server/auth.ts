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
      console.log("Registration request:", req.body);
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        console.log("Validation error:", errorMessage);
        return res.status(400).send(errorMessage);
      }

      // Sjekk om brukernavn allerede finnes
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        console.log("Username already exists:", req.body.username);
        return res.status(400).send("Username already exists");
      }

      // Sjekk om e-post allerede finnes
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        console.log("Email already exists:", req.body.email);
        return res.status(400).send("Email already exists");
      }

      // Hash passordet
      const hashedPassword = await hashPassword(req.body.password);
      console.log("Password hashed successfully");

      // Lagre brukeren i databasen
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });
      console.log("User created successfully:", user.id);

      // Logge inn brukeren automatisk
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return next(err);
        }
        // Fjern passord før sending av respons
        const { password, ...userWithoutPassword } = user;
        console.log("User logged in after registration");
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      console.log("Login request:", req.body);
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        console.log("Validation error:", errorMessage);
        return res.status(400).send(errorMessage);
      }

      passport.authenticate("local", (err: Error, user: SelectUser) => {
        if (err) {
          console.error("Authentication error:", err);
          return next(err);
        }
        
        if (!user) {
          console.log("Invalid login attempt for:", req.body.username);
          return res.status(400).send("Invalid username or password");
        }

        req.login(user, (err) => {
          if (err) {
            console.error("Session error:", err);
            return next(err);
          }
          
          console.log("User logged in successfully:", user.id);
          // Bruk destrukturering i stedet for delete
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
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

      console.log("Update password request for user:", req.user.id);
      const result = updatePasswordSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        console.log("Validation error:", errorMessage);
        return res.status(400).send(errorMessage);
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        console.log("User not found:", req.user.id);
        return res.status(404).send("User not found");
      }

      const { currentPassword, newPassword } = req.body;
      if (!(await comparePasswords(currentPassword, user.password))) {
        console.log("Current password is incorrect for user:", req.user.id);
        return res.status(400).send("Current password is incorrect");
      }

      const hashedNewPassword = await hashPassword(newPassword);
      // Oppdater brukerens passord i databasen
      await storage.updateUser(req.user.id, { password: hashedNewPassword });
      console.log("Password updated successfully for user:", req.user.id);

      res.status(200).send("Password updated successfully");
    } catch (error) {
      console.error("Update password error:", error);
      next(error);
    }
  });

  app.put("/api/user", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      console.log("Update user request for user:", req.user.id, "data:", req.body);
      
      await storage.updateUser(req.user.id, req.body);
      console.log("User updated in database");
      
      const updatedUser = await storage.getUser(req.user.id);
      
      if (!updatedUser) {
        console.log("Updated user not found:", req.user.id);
        return res.status(404).send("User not found");
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      console.log("User profile updated successfully for user:", req.user.id);
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      next(error);
    }
  });
}
