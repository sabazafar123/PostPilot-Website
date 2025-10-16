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
import { eq, and, desc, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Connected accounts
  getConnectedAccountsByUser(userId: string): Promise<ConnectedAccount[]>;
  getConnectedAccountById(id: string): Promise<ConnectedAccount | undefined>;
  createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount>;
  deleteConnectedAccount(id: string): Promise<void>;
  
  // Posts
  getPostsByUser(userId: string): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostStatus(id: string, status: string, publishedAt?: Date): Promise<Post>;
  
  // Get connected accounts by platforms
  getConnectedAccountsByPlatforms(userId: string, platforms: string[]): Promise<ConnectedAccount[]>;
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

  async getConnectedAccountById(id: string): Promise<ConnectedAccount | undefined> {
    const [account] = await db
      .select()
      .from(connectedAccounts)
      .where(eq(connectedAccounts.id, id));
    return account || undefined;
  }

  async createConnectedAccount(account: InsertConnectedAccount): Promise<ConnectedAccount> {
    const [newAccount] = await db
      .insert(connectedAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async deleteConnectedAccount(id: string): Promise<void> {
    await db
      .delete(connectedAccounts)
      .where(eq(connectedAccounts.id, id));
  }

  // Posts
  async getPostsByUser(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.scheduledFor));
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(postData as any)
      .returning();
    return post;
  }

  async updatePostStatus(id: string, status: string, publishedAt?: Date): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set({ 
        status,
        publishedAt: publishedAt || (status === 'published' ? new Date() : undefined)
      })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async getConnectedAccountsByPlatforms(userId: string, platforms: string[]): Promise<ConnectedAccount[]> {
    return await db
      .select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.userId, userId),
          eq(connectedAccounts.isConnected, true),
          inArray(connectedAccounts.platform, platforms)
        )
      );
  }
}

export const storage = new DatabaseStorage();
