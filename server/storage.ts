import { users, type User, type InsertUser, type UpdateUser } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<UpdateUser> | any): Promise<void>;
  deleteUser(id: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Create default admin user
    this.createDefaultAdminUser();
  }
  
  private async createDefaultAdminUser() {
    try {
      // Sjekk om admin-brukeren allerede finnes
      const existingAdmin = await this.getUserByUsername('admin');
      if (!existingAdmin) {
        // Vi lager ikke admin-brukeren automatisk her
        // Dette vil bli gjort via registrering eller API
        console.log("Admin user does not exist yet");
      } else {
        console.log("Admin user already exists");
      }
    } catch (error) {
      console.error("Error checking admin user:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      phone: null,
      avatar: null,
      bio: null,
      socialLinks: [],
      theme: "system",
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, updates: Partial<UpdateUser> | any): Promise<void> {
    // Hent brukeren først for å få tilgang til gjeldende data
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    // Oppdater brukeren i databasen
    await db.update(users)
      .set(updates)
      .where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();
