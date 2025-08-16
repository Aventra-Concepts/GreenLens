import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  real,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Enhanced fields for free tier and multilingual support
  freeTierUsed: integer("free_tier_used").default(0),
  freeTierStartedAt: timestamp("free_tier_started_at"),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default('en'),
  timezone: varchar("timezone", { length: 50 }).default('UTC'),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Subscription management
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planType: varchar("plan_type").notNull(), // 'pro', 'premium'
  status: varchar("status").notNull(), // 'active', 'cancelled', 'expired'
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  razorpaySubscriptionId: varchar("razorpay_subscription_id"),
  cashfreeSubscriptionId: varchar("cashfree_subscription_id"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Plant identification results
export const plantResults = pgTable("plant_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrls: text("image_urls").array(),
  species: text("species"), // Scientific name
  commonName: text("common_name"), // Common name
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  healthStatus: varchar("health_status", { length: 50 }),
  diseaseDetected: boolean("disease_detected"),
  careInstructions: text("care_instructions"),
  analysisData: jsonb("analysis_data"), // Full analysis result JSON
  healthAssessment: jsonb("health_assessment"),
  diseaseInfo: jsonb("disease_info"),
  pdfReportUrl: varchar("pdf_report_url"),
  createdAt: timestamp("created_at").defaultNow(),
  // Enhanced fields for free tier tracking and multilingual support
  isFreeIdentification: boolean("is_free_identification").default(false),
  detectedLanguage: varchar("detected_language", { length: 10 }).default('en'),
  localizedSpecies: jsonb("localized_species"), // Localized plant names
});

export type PlantResult = typeof plantResults.$inferSelect;
export const insertPlantResultSchema = createInsertSchema(plantResults).omit({
  id: true,
  createdAt: true,
});
export type InsertPlantResult = z.infer<typeof insertPlantResultSchema>;

// Blog posts for plant care tips
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  slug: varchar("slug").unique().notNull(),
  authorId: varchar("author_id").references(() => users.id),
  published: boolean("published").default(false),
  featuredImage: varchar("featured_image"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Blog views tracking
export const blogViews = pgTable("blog_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blogPostId: varchar("blog_post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export type BlogView = typeof blogViews.$inferSelect;

// Plant catalog cache for external API data
export const catalogCache = pgTable("catalog_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cacheKey: varchar("cache_key").unique().notNull(),
  data: jsonb("data").notNull(),
  source: varchar("source").notNull(), // 'perenual', 'trefle', etc.
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type CatalogCache = typeof catalogCache.$inferSelect;

// User activity tracking for comprehensive behavior analysis
export const userActivity = pgTable("user_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id"),
  activityType: varchar("activity_type").notNull(), // 'login', 'plant_identification', 'subscription_purchase', 'page_view', 'feature_use', 'pdf_download'
  activityData: jsonb("activity_data"), // Flexible storage for activity-specific data
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: varchar("referrer"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = typeof userActivity.$inferInsert;

// Subscription reminder system
export const subscriptionReminders = pgTable("subscription_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  reminderType: varchar("reminder_type").notNull(), // 'renewal_due', 'payment_failed', 'trial_ending'
  scheduledFor: timestamp("scheduled_for").notNull(),
  sent: boolean("sent").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SubscriptionReminder = typeof subscriptionReminders.$inferSelect;
export type InsertSubscriptionReminder = typeof subscriptionReminders.$inferInsert;

// User preferences for enhanced customization
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailNotifications: boolean("email_notifications").default(true),
  plantCareReminders: boolean("plant_care_reminders").default(true),
  weeklyDigest: boolean("weekly_digest").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  theme: varchar("theme", { length: 20 }).default('light'), // 'light', 'dark', 'auto'
  measurementUnit: varchar("measurement_unit", { length: 10 }).default('metric'), // 'metric', 'imperial'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

// Reviews system for user feedback
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  location: varchar("location"), // Where the review was posted from
  platform: varchar("platform").default('web'), // 'web', 'mobile', 'api'
  isPublished: boolean("is_published").default(false),
  moderatorNotes: text("moderator_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Admin settings for banner image management
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: text("setting_value"),
  description: text("description"),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = typeof adminSettings.$inferInsert;

// Enhanced pricing plans management
export const pricingPlans = pgTable("pricing_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").unique().notNull(), // 'free', 'pro', 'premium'
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  billingInterval: varchar("billing_interval").default('monthly'), // 'monthly', 'yearly'
  description: text("description"),
  features: jsonb("features").notNull(), // Array of feature objects
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  stripePriceId: varchar("stripe_price_id"),
  razorpayPlanId: varchar("razorpay_plan_id"),
  cashfreePlanId: varchar("cashfree_plan_id"),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PricingPlan = typeof pricingPlans.$inferSelect;
export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;

// Admin pricing settings for individual features
export const pricingSettings = pgTable("pricing_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  featureName: varchar("feature_name").unique().notNull(), // 'plant_analysis', 'pdf_report'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PricingSettings = typeof pricingSettings.$inferSelect;
export const insertPricingSettingsSchema = createInsertSchema(pricingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPricingSettings = z.infer<typeof insertPricingSettingsSchema>;

// Payment transactions for plant analysis
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plantResultId: varchar("plant_result_id").references(() => plantResults.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  paymentProvider: varchar("payment_provider").notNull(), // 'stripe', 'razorpay', 'cashfree'
  transactionId: varchar("transaction_id").unique(),
  status: varchar("status").notNull().default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  featureType: varchar("feature_type").notNull(), // 'plant_analysis', 'pdf_report'
  paymentData: jsonb("payment_data"), // Provider-specific data
  analysisId: varchar("analysis_id"), // Link to plant analysis
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Gardening tools and content management
export const gardeningContent = pgTable("gardening_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionTitle: varchar("section_title").notNull(),
  sectionDescription: text("section_description"),
  tools: jsonb("tools").notNull(), // Array of tool objects
  soilPreparation: jsonb("soil_preparation").notNull(), // Array of soil prep guides
  isActive: boolean("is_active").default(true),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type GardeningContent = typeof gardeningContent.$inferSelect;
export const insertGardeningContentSchema = createInsertSchema(gardeningContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGardeningContent = z.infer<typeof insertGardeningContentSchema>;