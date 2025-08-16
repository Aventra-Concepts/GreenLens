import {
  users,
  subscriptions,
  plantResults,
  blogPosts,
  blogViews,
  catalogCache,
  userActivity,
  userPreferences,
  subscriptionReminders,
  reviews,
  adminSettings,
  pricingSettings,
  payments,
  type User,
  type UpsertUser,
  type Subscription,
  type InsertSubscription,
  type PlantResult,
  type InsertPlantResult,
  type BlogPost,
  type InsertBlogPost,
  type BlogView,
  type CatalogCache,
  type UserActivity,
  type InsertUserActivity,
  type UserPreferences,
  type InsertUserPreferences,
  type SubscriptionReminder,
  type InsertSubscriptionReminder,
  type Review,
  type InsertReview,
  type AdminSettings,
  type InsertAdminSettings,
  type PricingSettings,
  type InsertPricingSettings,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  updateUserLoginActivity(userId: string): Promise<void>;
  
  // User Activity operations
  logUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivity(userId: string, limit?: number): Promise<UserActivity[]>;
  getUserActivityByAction(userId: string, action: string, limit?: number): Promise<UserActivity[]>;
  
  // User Preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences[]>;
  setUserPreference(preference: InsertUserPreferences): Promise<UserPreferences>;
  getUserPreferencesByCategory(userId: string, category: string): Promise<UserPreferences[]>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription>;
  
  // Subscription Reminder operations
  createSubscriptionReminder(reminder: InsertSubscriptionReminder): Promise<SubscriptionReminder>;
  getPendingReminders(): Promise<SubscriptionReminder[]>;
  markReminderSent(reminderId: string): Promise<void>;
  
  // Plant result operations
  createPlantResult(result: InsertPlantResult): Promise<PlantResult>;
  getPlantResult(id: string): Promise<PlantResult | undefined>;
  getUserPlantResults(userId: string): Promise<PlantResult[]>;
  updatePlantResult(id: string, updates: Partial<InsertPlantResult>): Promise<PlantResult>;
  
  // Free tier operations
  checkFreeTierEligibility(userId: string): Promise<{ eligible: boolean; remainingUses: number; daysLeft: number }>;
  incrementFreeTierUsage(userId: string): Promise<void>;
  
  // Enhanced Blog operations
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  incrementBlogViewCount(blogPostId: string): Promise<void>;
  logBlogView(view: BlogView): Promise<BlogView>;
  getBlogViewCount(blogPostId: string): Promise<number>;
  getUserBlogHistory(userId: string, limit?: number): Promise<BlogView[]>;
  
  // Cache operations
  getCacheItem(key: string): Promise<CatalogCache | undefined>;
  setCacheItem(item: CatalogCache): Promise<CatalogCache>;
  clearExpiredCache(): Promise<void>;

  // Reviews operations
  createReview(review: InsertReview): Promise<Review>;
  getReviews(publishedOnly?: boolean): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | undefined>;
  updateReview(id: string, updates: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: string): Promise<void>;

  // Admin settings operations
  getAdminSetting(key: string): Promise<AdminSettings | undefined>;
  setAdminSetting(setting: InsertAdminSettings): Promise<AdminSettings>;
  updateAdminSetting(key: string, value: string, updatedBy?: string): Promise<AdminSettings>;
  deleteAdminSetting(key: string): Promise<void>;
  
  // Pricing settings operations
  getPricingSettings(): Promise<PricingSettings[]>;
  getAllPricingSettings(): Promise<PricingSettings[]>;
  getPricingSetting(featureName: string): Promise<PricingSettings | undefined>;
  createPricingSetting(setting: InsertPricingSettings): Promise<PricingSettings>;
  updatePricingSetting(id: string, updates: Partial<PricingSettings>): Promise<PricingSettings>;
  deletePricingSetting(id: string): Promise<boolean>;
  getPricingByFeature(featureName: string): Promise<PricingSettings | undefined>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
  getUserPayments(userId: string): Promise<Payment[]>;
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

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  async updateUserLoginActivity(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // User Activity operations
  async logUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [result] = await db
      .insert(userActivity)
      .values(activity)
      .returning();
    return result;
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .orderBy(userActivity.timestamp)
      .limit(limit);
  }

  async getUserActivityByAction(userId: string, action: string, limit: number = 20): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivity)
      .where(and(eq(userActivity.userId, userId), eq(userActivity.activityType, action)))
      .orderBy(userActivity.timestamp)
      .limit(limit);
  }

  // User Preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences[]> {
    return await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
  }

  async setUserPreference(preference: InsertUserPreferences): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferences)
      .values(preference)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...preference,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getUserPreferencesByCategory(userId: string, category: string): Promise<UserPreferences[]> {
    return await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
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

  // Subscription Reminder operations
  async createSubscriptionReminder(reminder: InsertSubscriptionReminder): Promise<SubscriptionReminder> {
    const [result] = await db
      .insert(subscriptionReminders)
      .values(reminder)
      .returning();
    return result;
  }

  async getPendingReminders(): Promise<SubscriptionReminder[]> {
    return await db
      .select()
      .from(subscriptionReminders)
      .where(and(
        eq(subscriptionReminders.sent, false),
        gt(subscriptionReminders.scheduledFor, new Date())
      ))
      .orderBy(subscriptionReminders.scheduledFor);
  }

  async markReminderSent(reminderId: string): Promise<void> {
    await db
      .update(subscriptionReminders)
      .set({ 
        sent: true,
        sentAt: new Date()
      })
      .where(eq(subscriptionReminders.id, reminderId));
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

  // Enhanced Blog operations
  async incrementBlogViewCount(blogPostId: string): Promise<void> {
    await db
      .update(blogPosts)
      .set({ 
        viewCount: sql`${blogPosts.viewCount} + 1`
      })
      .where(eq(blogPosts.id, blogPostId));
  }

  async logBlogView(view: InsertBlogView): Promise<BlogView> {
    const [result] = await db
      .insert(blogViews)
      .values(view)
      .returning();
    return result;
  }

  async getBlogViewCount(blogPostId: string): Promise<number> {
    const [result] = await db
      .select({ count: blogPosts.viewCount })
      .from(blogPosts)
      .where(eq(blogPosts.id, blogPostId));
    return result?.count || 0;
  }

  async getUserBlogHistory(userId: string, limit: number = 20): Promise<BlogView[]> {
    return await db
      .select()
      .from(blogViews)
      .where(eq(blogViews.userId, userId))
      .orderBy(desc(blogViews.viewedAt))
      .limit(limit);
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

  // Reviews operations
  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return result;
  }

  async getReviews(publishedOnly: boolean = true): Promise<Review[]> {
    const query = db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        location: reviews.location,
        platform: reviews.platform,
        isPublished: reviews.isPublished,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt));

    if (publishedOnly) {
      return await query.where(eq(reviews.isPublished, true));
    }
    
    return await query;
  }

  async getReviewById(id: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review> {
    const [result] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return result;
  }

  async deleteReview(id: string): Promise<void> {
    await db
      .delete(reviews)
      .where(eq(reviews.id, id));
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<AdminSettings | undefined> {
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, key));
    return setting;
  }

  async setAdminSetting(setting: InsertAdminSettings): Promise<AdminSettings> {
    const [result] = await db
      .insert(adminSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: adminSettings.settingKey,
        set: {
          settingValue: setting.settingValue,
          description: setting.description,
          lastUpdatedBy: setting.lastUpdatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async updateAdminSetting(key: string, value: string, updatedBy?: string): Promise<AdminSettings> {
    const [result] = await db
      .update(adminSettings)
      .set({
        settingValue: value,
        lastUpdatedBy: updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(adminSettings.settingKey, key))
      .returning();
    return result;
  }

  async deleteAdminSetting(key: string): Promise<void> {
    await db
      .delete(adminSettings)
      .where(eq(adminSettings.settingKey, key));
  }

  // Pricing settings operations
  async getPricingSettings(): Promise<PricingSettings[]> {
    return await db.select().from(pricingSettings).orderBy(pricingSettings.featureName);
  }

  async getPricingSetting(featureName: string): Promise<PricingSettings | undefined> {
    const [setting] = await db
      .select()
      .from(pricingSettings)
      .where(eq(pricingSettings.featureName, featureName));
    return setting;
  }

  async createPricingSetting(setting: InsertPricingSettings): Promise<PricingSettings> {
    const [result] = await db
      .insert(pricingSettings)
      .values(setting)
      .returning();
    return result;
  }

  async updatePricingSetting(id: string, updates: Partial<PricingSettings>): Promise<PricingSettings> {
    const [result] = await db
      .update(pricingSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pricingSettings.id, id))
      .returning();
    return result;
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [result] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return result;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const [result] = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return result;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  // Missing pricing setting methods
  async deletePricingSetting(id: string): Promise<boolean> {
    const result = await db
      .delete(pricingSettings)
      .where(eq(pricingSettings.id, id));
    return result.rowCount > 0;
  }

  async getAllPricingSettings(): Promise<PricingSettings[]> {
    return db.select().from(pricingSettings).orderBy(pricingSettings.createdAt);
  }

  async getPricingByFeature(featureName: string): Promise<PricingSettings | undefined> {
    const [setting] = await db
      .select()
      .from(pricingSettings)
      .where(and(eq(pricingSettings.featureName, featureName), eq(pricingSettings.isActive, true)));
    return setting;
  }
}

export const storage = new DatabaseStorage();
