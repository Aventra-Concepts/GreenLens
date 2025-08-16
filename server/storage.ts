import {
  users,
  subscriptions,
  plantResults,
  blogPosts,
  catalogCache,
  type User,
  type UpsertUser,
  type Subscription,
  type InsertSubscription,
  type PlantResult,
  type InsertPlantResult,
  type BlogPost,
  type InsertBlogPost,
  type CatalogCache,
  type InsertCatalogCache,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription>;
  
  // Plant result operations
  createPlantResult(result: InsertPlantResult): Promise<PlantResult>;
  getPlantResult(id: string): Promise<PlantResult | undefined>;
  getUserPlantResults(userId: string): Promise<PlantResult[]>;
  updatePlantResult(id: string, updates: Partial<InsertPlantResult>): Promise<PlantResult>;
  
  // Free tier operations
  checkFreeTierEligibility(userId: string): Promise<{ eligible: boolean; remainingUses: number; daysLeft: number }>;
  incrementFreeTierUsage(userId: string): Promise<void>;
  
  // Blog operations
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  
  // Cache operations
  getCacheItem(key: string): Promise<CatalogCache | undefined>;
  setCacheItem(item: InsertCatalogCache): Promise<CatalogCache>;
  clearExpiredCache(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [result] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return result;
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription> {
    const [result] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return result;
  }

  async createPlantResult(result: InsertPlantResult): Promise<PlantResult> {
    const [plantResult] = await db
      .insert(plantResults)
      .values(result)
      .returning();
    return plantResult;
  }

  async getPlantResult(id: string): Promise<PlantResult | undefined> {
    const [result] = await db
      .select()
      .from(plantResults)
      .where(eq(plantResults.id, id));
    return result;
  }

  async getUserPlantResults(userId: string): Promise<PlantResult[]> {
    return await db
      .select()
      .from(plantResults)
      .where(eq(plantResults.userId, userId))
      .orderBy(plantResults.createdAt);
  }

  async updatePlantResult(id: string, updates: Partial<InsertPlantResult>): Promise<PlantResult> {
    const [result] = await db
      .update(plantResults)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(plantResults.id, id))
      .returning();
    return result;
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    const query = db.select().from(blogPosts);
    if (published !== undefined) {
      return await query.where(eq(blogPosts.published, published));
    }
    return await query;
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return result;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [result] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return result;
  }

  async getCacheItem(key: string): Promise<CatalogCache | undefined> {
    const [item] = await db
      .select()
      .from(catalogCache)
      .where(and(
        eq(catalogCache.key, key),
        gt(catalogCache.expiresAt, new Date())
      ));
    return item;
  }

  async setCacheItem(item: InsertCatalogCache): Promise<CatalogCache> {
    const [result] = await db
      .insert(catalogCache)
      .values(item)
      .onConflictDoUpdate({
        target: catalogCache.key,
        set: item,
      })
      .returning();
    return result;
  }

  async clearExpiredCache(): Promise<void> {
    await db
      .delete(catalogCache)
      .where(gt(catalogCache.expiresAt, new Date()));
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async checkFreeTierEligibility(userId: string): Promise<{ eligible: boolean; remainingUses: number; daysLeft: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const freeTierUsed = user.freeTierUsed || 0;
    const freeTierStartedAt = user.freeTierStartedAt;

    // If free tier never started, user is eligible
    if (!freeTierStartedAt) {
      return {
        eligible: true,
        remainingUses: 3,
        daysLeft: 7,
      };
    }

    // Check if 7 days have passed since free tier started
    const daysSinceStart = Math.floor((now.getTime() - freeTierStartedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceStart >= 7) {
      // Free tier expired
      return {
        eligible: false,
        remainingUses: 0,
        daysLeft: 0,
      };
    }

    // Check if user has used all 3 free identifications
    if (freeTierUsed >= 3) {
      return {
        eligible: false,
        remainingUses: 0,
        daysLeft: Math.max(0, 7 - daysSinceStart),
      };
    }

    // User still has free tier eligibility
    return {
      eligible: true,
      remainingUses: Math.max(0, 3 - freeTierUsed),
      daysLeft: Math.max(0, 7 - daysSinceStart),
    };
  }

  async incrementFreeTierUsage(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const updates: Partial<UpsertUser> = {
      freeTierUsed: (user.freeTierUsed || 0) + 1,
    };

    // If this is the first free tier usage, set the start date
    if (!user.freeTierStartedAt) {
      updates.freeTierStartedAt = now;
    }

    await this.updateUser(userId, updates);
  }
}

export const storage = new DatabaseStorage();
