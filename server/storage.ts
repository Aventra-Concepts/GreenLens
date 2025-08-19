import {
  users,
  subscriptions,
  plantResults,
  blogPosts,
  blogCategories,
  blogViews,
  catalogCache,
  userActivity,
  userPreferences,
  subscriptionReminders,
  reviews,
  adminSettings,
  pricingSettings,
  pricingPlans,
  payments,
  gardeningContent,
  expertApplications,
  consultationRequests,
  studentUsers,
  ebooks,
  ebookPurchases,
  ebookCategories,
  platformSettings,
  ebookReviews,
  authorProfiles,
  studentProfiles,
  type User,
  type UpsertUser,
  type Subscription,
  type InsertSubscription,
  type PlantResult,
  type InsertPlantResult,
  type BlogPost,
  type InsertBlogPost,
  type BlogCategory,
  type InsertBlogCategory,
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
  type PricingPlan,
  type InsertPricingPlan,
  type Payment,
  type InsertPayment,
  type GardeningContent,
  type InsertGardeningContent,
  type ExpertApplication,
  type InsertExpertApplication,
  type ConsultationRequest,
  type InsertConsultationRequest,
  type StudentUser,
  type InsertStudentUser,
  type Ebook,
  type InsertEbook,
  type EbookPurchase,
  type InsertEbookPurchase,
  type EbookCategory,
  type InsertEbookCategory,
  type PlatformSetting,
  type InsertPlatformSetting,
  type EbookReview,
  type InsertEbookReview,
  type AuthorProfile,
  type InsertAuthorProfile,
  gardenContent,
  aiContentLogs,
  type GardenContent,
  type InsertGardenContent,
  type AiContentLog,
  type InsertAiContentLog,
  type StudentProfile,
  type InsertStudentProfile,
  type InsertBlogView,
  type InsertCatalogCache,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gt, lt, gte, lte, asc, desc, like, sql, ne, inArray, count, sum, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isAdmin' | 'isActive' | 'emailVerified' | 'lastLoginAt' | 'freeTierUsed' | 'freeTierStartedAt'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  updateUserLoginActivity(userId: string): Promise<void>;
  updateUserLastLogin(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User>;
  updateUserActiveStatus(userId: string, isActive: boolean): Promise<User>;
  
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
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostsByCategory(categorySlug: string): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  incrementBlogViewCount(blogPostId: string): Promise<void>;
  logBlogView(view: BlogView): Promise<BlogView>;
  getBlogViewCount(blogPostId: string): Promise<number>;
  getUserBlogHistory(userId: string, limit?: number): Promise<BlogView[]>;
  
  // Blog Category operations
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(slug: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, updates: Partial<InsertBlogCategory>): Promise<BlogCategory>;
  
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
  
  // Pricing plans operations
  getPricingPlans(activeOnly?: boolean): Promise<PricingPlan[]>;
  getPricingPlan(planId: string): Promise<PricingPlan | undefined>;
  createPricingPlan(plan: InsertPricingPlan): Promise<PricingPlan>;
  updatePricingPlan(id: string, updates: Partial<InsertPricingPlan>): Promise<PricingPlan>;
  deletePricingPlan(id: string): Promise<boolean>;
  
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

  // Gardening content operations
  getGardeningContent(): Promise<GardeningContent | undefined>;
  updateGardeningContent(content: InsertGardeningContent): Promise<GardeningContent>;
  createGardeningContent(content: InsertGardeningContent): Promise<GardeningContent>;
  
  // Expert application operations
  createExpertApplication(application: InsertExpertApplication): Promise<ExpertApplication>;
  getExpertApplication(id: string): Promise<ExpertApplication | undefined>;
  getExpertApplications(status?: string, limit?: number, offset?: number): Promise<ExpertApplication[]>;
  updateExpertApplicationStatus(id: string, status: string, reviewNotes?: string): Promise<ExpertApplication>;

  // Consultation request operations
  createConsultationRequest(request: InsertConsultationRequest): Promise<ConsultationRequest>;
  getConsultationRequest(id: string): Promise<ConsultationRequest | undefined>;
  getConsultationRequests(userId?: string, status?: string, limit?: number, offset?: number): Promise<ConsultationRequest[]>;
  updateConsultationRequest(id: string, updates: Partial<ConsultationRequest>): Promise<ConsultationRequest>;

  // Student User operations
  createStudentUser(student: InsertStudentUser): Promise<StudentUser>;
  getStudentUser(id: string): Promise<StudentUser | undefined>;
  getStudentUserByEmail(email: string): Promise<StudentUser | undefined>;
  updateStudentUser(id: string, updates: Partial<StudentUser>): Promise<StudentUser>;
  getPendingStudentVerifications(): Promise<StudentUser[]>;
  getStudentsNearGraduation(): Promise<StudentUser[]>;
  getStudentsEligibleForConversion(): Promise<StudentUser[]>;
  extendStudentStatus(studentId: string, adminId: string): Promise<StudentUser>;
  markStudentGraduated(studentId: string): Promise<StudentUser>;

  // E-book operations
  createEbook(ebook: InsertEbook): Promise<Ebook>;
  getEbook(id: string): Promise<Ebook | undefined>;
  getEbooksByAuthor(authorId: string): Promise<Ebook[]>;
  getPublishedEbooks(limit?: number, offset?: number): Promise<Ebook[]>;
  updateEbook(id: string, updates: Partial<Ebook>): Promise<Ebook>;
  
  // E-book Purchase operations
  createEbookPurchase(purchase: InsertEbookPurchase): Promise<EbookPurchase>;
  getEbookPurchase(id: string): Promise<EbookPurchase | undefined>;
  getEbookPurchasesByUser(email: string): Promise<EbookPurchase[]>;
  updateEbookPurchase(id: string, updates: Partial<EbookPurchase>): Promise<EbookPurchase>;

  // Platform Settings operations
  getPlatformSetting(key: string): Promise<PlatformSetting | undefined>;
  updatePlatformSetting(key: string, value: string): Promise<PlatformSetting>;
  getAllPlatformSettings(): Promise<PlatformSetting[]>;

  // E-book Category operations
  createEbookCategory(category: InsertEbookCategory): Promise<EbookCategory>;
  getEbookCategories(): Promise<EbookCategory[]>;

  // Author Profile operations
  createAuthorProfile(profile: InsertAuthorProfile): Promise<AuthorProfile>;
  getAuthorProfile(id: string): Promise<AuthorProfile | undefined>;
  getAuthorProfileByUserId(userId: string): Promise<AuthorProfile | undefined>;
  updateAuthorProfile(id: string, updates: Partial<AuthorProfile>): Promise<AuthorProfile>;
  getAuthorProfiles(status?: string, limit?: number, offset?: number): Promise<AuthorProfile[]>;
  updateAuthorApplicationStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<AuthorProfile>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Database error in getUserByEmail:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isAdmin' | 'isActive' | 'emailVerified' | 'lastLoginAt' | 'freeTierUsed' | 'freeTierStartedAt'>): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          isAdmin: false,
          isActive: true,
          emailVerified: false,
          freeTierUsed: 0,
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }
  }

  async updateUserLoginActivity(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result;
  }

  async updateUserActiveStatus(userId: string, isActive: boolean): Promise<User> {
    const [result] = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result;
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
      .set(updates)
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

  async deleteBlogPost(id: string): Promise<void> {
    await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id));
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

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post;
  }

  async getBlogPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
    return await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        excerpt: blogPosts.excerpt,
        slug: blogPosts.slug,
        authorId: blogPosts.authorId,
        categoryId: blogPosts.categoryId,
        published: blogPosts.published,
        featuredImage: blogPosts.featuredImage,
        tags: blogPosts.tags,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogCategories.slug, categorySlug))
      .orderBy(desc(blogPosts.createdAt));
  }

  // Blog Category operations
  async getBlogCategories(): Promise<BlogCategory[]> {
    return await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.isActive, true))
      .orderBy(blogCategories.sortOrder, blogCategories.name);
  }

  async getBlogCategory(slug: string): Promise<BlogCategory | undefined> {
    const [category] = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug));
    return category;
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const [result] = await db
      .insert(blogCategories)
      .values(category)
      .returning();
    return result;
  }

  async updateBlogCategory(id: string, updates: Partial<InsertBlogCategory>): Promise<BlogCategory> {
    const [result] = await db
      .update(blogCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogCategories.id, id))
      .returning();
    return result;
  }

  async getCacheItem(key: string): Promise<CatalogCache | undefined> {
    const [item] = await db
      .select()
      .from(catalogCache)
      .where(and(
        eq(catalogCache.cacheKey, key),
        gt(catalogCache.expiresAt, new Date())
      ));
    return item;
  }

  async setCacheItem(item: InsertCatalogCache): Promise<CatalogCache> {
    const [result] = await db
      .insert(catalogCache)
      .values(item)
      .onConflictDoUpdate({
        target: catalogCache.cacheKey,
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
        },
        moderatorNotes: reviews.moderatorNotes
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

  // Pricing plans operations
  async getPricingPlans(activeOnly = false): Promise<PricingPlan[]> {
    const whereClause = activeOnly ? eq(pricingPlans.isActive, true) : undefined;
    return db
      .select()
      .from(pricingPlans)
      .where(whereClause)
      .orderBy(pricingPlans.displayOrder);
  }

  async getPricingPlan(planId: string): Promise<PricingPlan | undefined> {
    const [plan] = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.planId, planId));
    return plan;
  }

  async createPricingPlan(plan: InsertPricingPlan): Promise<PricingPlan> {
    const [created] = await db
      .insert(pricingPlans)
      .values(plan)
      .returning();
    return created;
  }

  async updatePricingPlan(id: string, updates: Partial<InsertPricingPlan>): Promise<PricingPlan> {
    const [updated] = await db
      .update(pricingPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pricingPlans.id, id))
      .returning();
    return updated;
  }

  async deletePricingPlan(id: string): Promise<boolean> {
    const result = await db
      .delete(pricingPlans)
      .where(eq(pricingPlans.id, id));
    return (result.rowCount || 0) > 0;
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
    return (result.rowCount || 0) > 0;
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

  // Gardening content operations
  async getGardeningContent(): Promise<GardeningContent | undefined> {
    const [content] = await db.select().from(gardeningContent).where(eq(gardeningContent.isActive, true));
    return content;
  }

  async updateGardeningContent(content: InsertGardeningContent): Promise<GardeningContent> {
    const existing = await this.getGardeningContent();
    if (existing) {
      const [updated] = await db
        .update(gardeningContent)
        .set({ ...content, updatedAt: new Date() })
        .where(eq(gardeningContent.id, existing.id))
        .returning();
      return updated;
    } else {
      return await this.createGardeningContent(content);
    }
  }

  async createGardeningContent(content: InsertGardeningContent): Promise<GardeningContent> {
    const [created] = await db
      .insert(gardeningContent)
      .values(content)
      .returning();
    return created;
  }

  // Expert application operations
  async createExpertApplication(application: InsertExpertApplication): Promise<ExpertApplication> {
    const [created] = await db
      .insert(expertApplications)
      .values(application)
      .returning();
    return created;
  }

  async getExpertApplication(id: string): Promise<ExpertApplication | undefined> {
    const [application] = await db
      .select()
      .from(expertApplications)
      .where(eq(expertApplications.id, id));
    return application;
  }

  async getExpertApplications(status?: string, limit = 10, offset = 0): Promise<ExpertApplication[]> {
    let query = db.select().from(expertApplications);
    
    if (status) {
      query = query.where(eq(expertApplications.applicationStatus, status));
    }
    
    const applications = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(expertApplications.createdAt));
    
    return applications;
  }

  async updateExpertApplicationStatus(id: string, status: string, reviewNotes?: string): Promise<ExpertApplication> {
    const [updated] = await db
      .update(expertApplications)
      .set({
        applicationStatus: status,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(expertApplications.id, id))
      .returning();
    return updated;
  }

  // Consultation request operations
  async createConsultationRequest(request: InsertConsultationRequest): Promise<ConsultationRequest> {
    const [created] = await db
      .insert(consultationRequests)
      .values(request)
      .returning();
    return created;
  }

  async getConsultationRequest(id: string): Promise<ConsultationRequest | undefined> {
    const [request] = await db
      .select()
      .from(consultationRequests)
      .where(eq(consultationRequests.id, id));
    return request;
  }

  async getConsultationRequests(userId?: string, status?: string, limit = 10, offset = 0): Promise<ConsultationRequest[]> {
    let query = db.select().from(consultationRequests);
    
    const conditions = [];
    if (userId) {
      conditions.push(eq(consultationRequests.userId, userId));
    }
    if (status) {
      conditions.push(eq(consultationRequests.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const requests = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(consultationRequests.createdAt));
    
    return requests;
  }

  async updateConsultationRequest(id: string, updates: Partial<ConsultationRequest>): Promise<ConsultationRequest> {
    const [updated] = await db
      .update(consultationRequests)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(consultationRequests.id, id))
      .returning();
    return updated;
  }

  // Student User operations
  async createStudentUser(student: InsertStudentUser): Promise<StudentUser> {
    const [result] = await db
      .insert(studentUsers)
      .values(student)
      .returning();
    return result;
  }

  async getStudentUser(id: string): Promise<StudentUser | undefined> {
    const [student] = await db.select().from(studentUsers).where(eq(studentUsers.id, id));
    return student;
  }

  async getStudentUserByEmail(email: string): Promise<StudentUser | undefined> {
    const [student] = await db.select().from(studentUsers).where(eq(studentUsers.email, email));
    return student;
  }

  async updateStudentUser(id: string, updates: Partial<StudentUser>): Promise<StudentUser> {
    const [result] = await db
      .update(studentUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studentUsers.id, id))
      .returning();
    return result;
  }

  async getPendingStudentVerifications(): Promise<StudentUser[]> {
    return await db
      .select()
      .from(studentUsers)
      .where(eq(studentUsers.verificationStatus, 'pending'))
      .orderBy(studentUsers.createdAt);
  }

  async getStudentsNearGraduation(): Promise<StudentUser[]> {
    return await db
      .select()
      .from(studentUsers)
      .where(
        and(
          eq(studentUsers.verificationStatus, 'approved'),
          eq(studentUsers.isActive, true),
          eq(studentUsers.isConverted, false)
        )
      )
      .orderBy(studentUsers.expectedGraduation);
  }

  async getStudentsEligibleForConversion(): Promise<StudentUser[]> {
    const currentDate = new Date();
    return await db
      .select()
      .from(studentUsers)
      .where(
        and(
          eq(studentUsers.isActive, true),
          eq(studentUsers.isConverted, false),
          eq(studentUsers.verificationStatus, 'approved'),
          or(
            lt(studentUsers.conversionScheduledFor, currentDate),
            eq(studentUsers.graduationCompleted, true)
          )
        )
      );
  }

  async extendStudentStatus(studentId: string, adminId: string): Promise<StudentUser> {
    const currentExtensionCount = await db
      .select({ adminExtensionCount: studentUsers.adminExtensionCount })
      .from(studentUsers)
      .where(eq(studentUsers.id, studentId));
    
    const newExtensionCount = (currentExtensionCount[0]?.adminExtensionCount || 0) + 1;
    const newExtensionDate = new Date();
    newExtensionDate.setFullYear(newExtensionDate.getFullYear() + 1);
    
    const [result] = await db
      .update(studentUsers)
      .set({
        adminExtensionCount: newExtensionCount,
        lastExtensionDate: new Date(),
        extensionExpiryDate: newExtensionDate,
        conversionScheduledFor: newExtensionDate,
        updatedAt: new Date(),
      })
      .where(eq(studentUsers.id, studentId))
      .returning();
    return result;
  }

  async markStudentGraduated(studentId: string): Promise<StudentUser> {
    const [result] = await db
      .update(studentUsers)
      .set({
        graduationCompleted: true,
        graduationCompletionDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(studentUsers.id, studentId))
      .returning();
    return result;
  }

  // E-book operations
  async createEbook(ebook: InsertEbook): Promise<Ebook> {
    const [result] = await db
      .insert(ebooks)
      .values(ebook)
      .returning();
    return result;
  }

  async getEbook(id: string): Promise<Ebook | undefined> {
    const [ebook] = await db.select().from(ebooks).where(eq(ebooks.id, id));
    return ebook;
  }

  async getEbooksByAuthor(authorId: string): Promise<Ebook[]> {
    return await db
      .select()
      .from(ebooks)
      .where(eq(ebooks.authorId, authorId))
      .orderBy(desc(ebooks.createdAt));
  }

  async getPublishedEbooks(limit: number = 50, offset: number = 0): Promise<Ebook[]> {
    return await db
      .select()
      .from(ebooks)
      .where(
        and(
          eq(ebooks.status, 'published'),
          eq(ebooks.isActive, true)
        )
      )
      .orderBy(desc(ebooks.isFeatured), desc(ebooks.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateEbook(id: string, updates: Partial<Ebook>): Promise<Ebook> {
    const [result] = await db
      .update(ebooks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ebooks.id, id))
      .returning();
    return result;
  }

  // E-book Purchase operations
  async createEbookPurchase(purchase: InsertEbookPurchase): Promise<EbookPurchase> {
    const [result] = await db
      .insert(ebookPurchases)
      .values(purchase)
      .returning();
    return result;
  }

  async getEbookPurchase(id: string): Promise<EbookPurchase | undefined> {
    const [purchase] = await db.select().from(ebookPurchases).where(eq(ebookPurchases.id, id));
    return purchase;
  }

  async getEbookPurchasesByUser(email: string): Promise<EbookPurchase[]> {
    return await db
      .select()
      .from(ebookPurchases)
      .where(eq(ebookPurchases.buyerEmail, email))
      .orderBy(desc(ebookPurchases.createdAt));
  }

  async updateEbookPurchase(id: string, updates: Partial<EbookPurchase>): Promise<EbookPurchase> {
    const [result] = await db
      .update(ebookPurchases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ebookPurchases.id, id))
      .returning();
    return result;
  }

  // Platform Settings operations
  async getPlatformSetting(key: string): Promise<PlatformSetting | undefined> {
    const [setting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.settingKey, key))
      .limit(1);
    return setting;
  }

  async updatePlatformSetting(key: string, value: string): Promise<PlatformSetting> {
    const [result] = await db
      .update(platformSettings)
      .set({ settingValue: value, updatedAt: new Date() })
      .where(eq(platformSettings.settingKey, key))
      .returning();
    return result;
  }

  async getAllPlatformSettings(): Promise<PlatformSetting[]> {
    return await db
      .select()
      .from(platformSettings)
      .orderBy(platformSettings.category, platformSettings.settingKey);
  }

  // E-book Category operations
  async createEbookCategory(category: InsertEbookCategory): Promise<EbookCategory> {
    const [result] = await db
      .insert(ebookCategories)
      .values(category)
      .returning();
    return result;
  }

  async getEbookCategories(): Promise<EbookCategory[]> {
    return await db
      .select()
      .from(ebookCategories)
      .where(eq(ebookCategories.isActive, true))
      .orderBy(ebookCategories.sortOrder, ebookCategories.name);
  }

  // E-book marketplace methods

  async getEbooks(filters: {
    search: string;
    category: string;
    sortBy: string;
    priceFilter: string;
    limit: number;
    offset: number;
  }): Promise<Ebook[]> {
    let query = db
      .select()
      .from(ebooks)
      .where(eq(ebooks.status, 'published'));

    // Apply search filter
    if (filters.search) {
      query = query.where(
        or(
          like(ebooks.title, `%${filters.search}%`),
          like(ebooks.description, `%${filters.search}%`),
          like(ebooks.authorName, `%${filters.search}%`)
        )
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      query = query.where(eq(ebooks.category, filters.category));
    }

    // Apply price filter
    if (filters.priceFilter !== 'all') {
      switch (filters.priceFilter) {
        case 'free':
          query = query.where(eq(ebooks.basePrice, '0'));
          break;
        case 'under_10':
          query = query.where(lt(ebooks.basePrice, '10'));
          break;
        case '10_25':
          query = query.where(and(gte(ebooks.basePrice, '10'), lte(ebooks.basePrice, '25')));
          break;
        case '25_50':
          query = query.where(and(gte(ebooks.basePrice, '25'), lte(ebooks.basePrice, '50')));
          break;
        case 'over_50':
          query = query.where(gt(ebooks.basePrice, '50'));
          break;
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        query = query.orderBy(desc(ebooks.publicationDate));
        break;
      case 'rating':
        query = query.orderBy(desc(ebooks.ratingAverage));
        break;
      case 'price_low':
        query = query.orderBy(asc(ebooks.basePrice));
        break;
      case 'price_high':
        query = query.orderBy(desc(ebooks.basePrice));
        break;
      case 'popularity':
      default:
        query = query.orderBy(desc(ebooks.downloadCount), desc(ebooks.ratingAverage));
        break;
    }

    // Apply pagination
    query = query.limit(filters.limit).offset(filters.offset);

    return await query;
  }

  async getFeaturedEbooks(limit: number = 6): Promise<Ebook[]> {
    return await db
      .select()
      .from(ebooks)
      .where(and(eq(ebooks.isFeatured, true), eq(ebooks.status, 'published')))
      .orderBy(desc(ebooks.ratingAverage), desc(ebooks.downloadCount))
      .limit(limit);
  }

  async getEbookById(id: string): Promise<Ebook | undefined> {
    const [ebook] = await db
      .select()
      .from(ebooks)
      .where(and(eq(ebooks.id, id), eq(ebooks.status, 'published')));
    return ebook;
  }

  // Duplicate methods removed - using the original implementations above

  async getEbookPurchases(ebookId: string): Promise<EbookPurchase[]> {
    return await db
      .select()
      .from(ebookPurchases)
      .where(eq(ebookPurchases.ebookId, ebookId))
      .orderBy(desc(ebookPurchases.createdAt));
  }

  async getEbookPurchaseByEmailAndEbook(email: string, ebookId: string): Promise<EbookPurchase | undefined> {
    const [purchase] = await db
      .select()
      .from(ebookPurchases)
      .where(and(eq(ebookPurchases.buyerEmail, email), eq(ebookPurchases.ebookId, ebookId)));
    return purchase;
  }





  async getEbookReviews(ebookId: string): Promise<EbookReview[]> {
    return await db
      .select()
      .from(ebookReviews)
      .where(eq(ebookReviews.ebookId, ebookId))
      .orderBy(desc(ebookReviews.createdAt));
  }

  // Platform settings methods
  async getPlatformSettings(): Promise<PlatformSetting[]> {
    return await db
      .select()
      .from(platformSettings)
      .orderBy(platformSettings.category, platformSettings.settingKey);
  }



  async createPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting> {
    const [created] = await db
      .insert(platformSettings)
      .values(setting)
      .returning();
    return created;
  }

  async setPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting> {
    const [result] = await db
      .insert(platformSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: platformSettings.settingKey,
        set: {
          settingValue: setting.settingValue,
          settingType: setting.settingType,
          description: setting.description,
          category: setting.category,
          isEditable: setting.isEditable,
          updatedBy: setting.updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async updatePlatformSetting(id: string, updates: Partial<InsertPlatformSetting>): Promise<PlatformSetting> {
    const [updated] = await db
      .update(platformSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(platformSettings.id, id))
      .returning();
    return updated;
  }

  // Student user methods
  async getStudentUser(id: string): Promise<StudentUser | undefined> {
    const [student] = await db
      .select()
      .from(studentUsers)
      .where(eq(studentUsers.id, id));
    return student;
  }

  async getStudentUserByEmail(email: string): Promise<StudentUser | undefined> {
    const [student] = await db
      .select()
      .from(studentUsers)
      .where(eq(studentUsers.email, email));
    return student;
  }

  async createStudentUser(student: InsertStudentUser): Promise<StudentUser> {
    const [created] = await db
      .insert(studentUsers)
      .values(student)
      .returning();
    return created;
  }

  async updateStudentUser(id: string, updates: Partial<InsertStudentUser>): Promise<StudentUser> {
    const [updated] = await db
      .update(studentUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studentUsers.id, id))
      .returning();
    return updated;
  }

  async getStudentUsersByGraduationYear(year: string): Promise<StudentUser[]> {
    return await db
      .select()
      .from(studentUsers)
      .where(eq(studentUsers.graduationYear, year));
  }

  async getPendingStudentVerifications(): Promise<StudentUser[]> {
    return await db
      .select()
      .from(studentUsers)
      .where(eq(studentUsers.verificationStatus, 'pending'))
      .orderBy(desc(studentUsers.createdAt));
  }

  // Author Profile operations
  async createAuthorProfile(profile: InsertAuthorProfile): Promise<AuthorProfile> {
    const [result] = await db
      .insert(authorProfiles)
      .values({
        ...profile,
        termsAcceptedAt: new Date(),
        privacyPolicyAcceptedAt: new Date(),
        authorAgreementAcceptedAt: new Date(),
      })
      .returning();
    return result;
  }

  async getAuthorProfile(id: string): Promise<AuthorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.id, id))
      .limit(1);
    return profile;
  }

  async getAuthorProfileByUserId(userId: string): Promise<AuthorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.userId, userId))
      .limit(1);
    return profile;
  }

  async updateAuthorProfile(id: string, updates: Partial<AuthorProfile>): Promise<AuthorProfile> {
    const [result] = await db
      .update(authorProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(authorProfiles.id, id))
      .returning();
    return result;
  }

  async getAuthorProfiles(status?: string, limit: number = 50, offset: number = 0): Promise<AuthorProfile[]> {
    let query = db.select().from(authorProfiles);
    
    if (status) {
      query = query.where(eq(authorProfiles.applicationStatus, status));
    }
    
    return await query
      .orderBy(desc(authorProfiles.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateAuthorApplicationStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<AuthorProfile> {
    const updateData: any = {
      applicationStatus: status,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    // If approved, set verification flags
    if (status === 'approved') {
      updateData.isVerified = true;
      updateData.canPublish = true;
    }

    const [result] = await db
      .update(authorProfiles)
      .set(updateData)
      .where(eq(authorProfiles.id, id))
      .returning();
    return result;
  }

  // Student Profile Operations for Educational Verification
  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const [result] = await db
      .insert(studentProfiles)
      .values(profile)
      .returning();
    return result;
  }

  async getStudentProfile(id: string): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, id))
      .limit(1);
    return profile;
  }

  async getStudentProfileByUserId(userId: string): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId))
      .limit(1);
    return profile;
  }

  async updateStudentProfile(id: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const [result] = await db
      .update(studentProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studentProfiles.id, id))
      .returning();
    return result;
  }

  async getStudentProfiles(status?: string, limit: number = 50, offset: number = 0): Promise<StudentProfile[]> {
    let query = db.select().from(studentProfiles);
    
    if (status) {
      query = query.where(eq(studentProfiles.verificationStatus, status));
    }
    
    return await query
      .orderBy(desc(studentProfiles.submittedAt))
      .limit(limit)
      .offset(offset);
  }

  async updateStudentVerificationStatus(
    id: string, 
    status: string, 
    adminNotes?: string, 
    reviewedBy?: string
  ): Promise<StudentProfile> {
    const updateData: any = {
      verificationStatus: status,
      updatedAt: new Date(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    if (status === 'verified') {
      updateData.verifiedAt = new Date();
      // Set expiration to 1 year from now for verified students
      updateData.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    const [result] = await db
      .update(studentProfiles)
      .set(updateData)
      .where(eq(studentProfiles.id, id))
      .returning();
    return result;
  }

  async getExpiredStudentProfiles(): Promise<StudentProfile[]> {
    return await db
      .select()
      .from(studentProfiles)
      .where(
        and(
          eq(studentProfiles.verificationStatus, 'verified'),
          lt(studentProfiles.expiresAt, new Date())
        )
      );
  }

  async convertExpiredStudentsToRegular(): Promise<number> {
    // This method converts expired student accounts to regular user accounts
    const expiredStudents = await this.getExpiredStudentProfiles();
    
    for (const student of expiredStudents) {
      // Update student profile status
      await this.updateStudentVerificationStatus(student.id, 'expired');
      
      // Remove student-specific privileges from user account
      await this.updateUser(student.userId, {
        isStudent: false,
        studentDiscountEligible: false,
      });
    }
    
    return expiredStudents.length;
  }

  // Garden Content Management Methods
  async getGardenContent(): Promise<GardenContent[]> {
    return await this.db.query.gardenContent.findMany({
      orderBy: [asc(gardenContent.order), asc(gardenContent.createdAt)]
    });
  }

  async getGardenContentById(id: string): Promise<GardenContent | null> {
    return await this.db.query.gardenContent.findFirst({
      where: eq(gardenContent.id, id)
    }) || null;
  }

  async createGardenContent(data: InsertGardenContent): Promise<GardenContent> {
    const [content] = await this.db
      .insert(gardenContent)
      .values(data)
      .returning();
    return content;
  }

  async updateGardenContent(id: string, data: Partial<InsertGardenContent>): Promise<GardenContent | null> {
    const [updatedContent] = await this.db
      .update(gardenContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gardenContent.id, id))
      .returning();
    return updatedContent || null;
  }

  async deleteGardenContent(id: string): Promise<boolean> {
    const result = await this.db
      .delete(gardenContent)
      .where(eq(gardenContent.id, id));
    return result.rowCount > 0;
  }

  // AI Content Logs Methods
  async createAiContentLog(data: InsertAiContentLog): Promise<AiContentLog> {
    const [log] = await this.db
      .insert(aiContentLogs)
      .values(data)
      .returning();
    return log;
  }

  async getAiContentLogs(limit = 50): Promise<AiContentLog[]> {
    return await this.db.query.aiContentLogs.findMany({
      orderBy: [desc(aiContentLogs.createdAt)],
      limit
    });
  }
}

export const storage = new DatabaseStorage();
