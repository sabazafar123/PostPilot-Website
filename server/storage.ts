// Reference: javascript_database blueprint + Replit Auth blueprint
import {
  users,
  connectedAccounts,
  posts,
  type User,
  type UpsertUser,
  type ConnectedAccount,
  type InsertConnectedAccount,
  type Post,
  type InsertPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Connected accounts
  getConnectedAccountsByUser(userId: string): Promise<ConnectedAccount[]>;
  createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount>;
  
  // Posts
  getPostsByUser(userId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Connected accounts
  async getConnectedAccountsByUser(userId: string): Promise<ConnectedAccount[]> {
    return await db
      .select()
      .from(connectedAccounts)
      .where(eq(connectedAccounts.userId, userId));
  }

  async createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount> {
    const [newAccount] = await db
      .insert(connectedAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  // Posts
  async getPostsByUser(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.scheduledFor));
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(postData)
      .returning();
    return post;
  }
}

export const storage = new DatabaseStorage();
