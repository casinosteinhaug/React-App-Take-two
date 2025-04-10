import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up theme preference route
  app.post("/api/theme", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { theme } = req.body;
      if (theme !== "light" && theme !== "dark" && theme !== "system") {
        return res.status(400).send("Invalid theme value");
      }
      
      await storage.updateUser(req.user.id, { theme });
      res.status(200).json({ theme });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
