import { users, type User, type InsertUser, type UpdateUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<UpdateUser>): Promise<void>;
  deleteUser(id: number): Promise<void>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create default admin user
    this.createDefaultAdminUser();
  }
  
  private async createDefaultAdminUser() {
    // Sjekk om admin-brukeren allerede finnes
    const existingAdmin = await this.getUserByUsername('admin');
    if (!existingAdmin) {
      // Hash of 'admin' password
      const hashedPassword = "9de7de29ea0c680a43d4e9915b4bf18b5c9d319de13e0829fb15a8c786b1b8ce1e96d3fc49397a499491c0a238994d499cf8fffebf8dcc1d25faefb79a4b5d48.07329fa5c90df385e79ea20f8ee9c6a3";
      
      const adminUser: User = {
        id: this.currentId++,
        username: 'admin',
        password: hashedPassword,
        email: 'admin@admin.com',
        name: 'Admin Testuser',
        phone: null,
        avatar: null,
        bio: null,
        socialLinks: [],
        theme: 'system'
      };
      
      this.users.set(adminUser.id, adminUser);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      phone: null,
      avatar: null,
      bio: null,
      socialLinks: [],
      theme: "system",
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<UpdateUser>): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users.delete(id);
  }
}

export const storage = new MemStorage();
