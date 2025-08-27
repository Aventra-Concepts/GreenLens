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
  date,
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

// User storage table - Define first to avoid circular references
// Enhanced for custom authentication with admin management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  location: varchar("location"),
  password: varchar("password"), // Hashed password - nullable for OAuth users
  // OAuth provider fields
  gmail: varchar("gmail"),
  facebookId: varchar("facebook_id"),
  githubId: varchar("github_id"),
  twitterId: varchar("twitter_id"),
  provider: varchar("provider").default('local'), // 'local', 'google', 'facebook', 'github', 'twitter'
  profileImageUrl: varchar("profile_image_url"),
  country: varchar("country"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false).notNull(), // Enhanced admin levels
  isActive: boolean("is_active").default(true).notNull(),
  isAuthor: boolean("is_author").default(false).notNull(),
  authorVerified: boolean("author_verified").default(false).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Enhanced fields for free tier and multilingual support
  freeTierUsed: integer("free_tier_used").default(0),
  freeTierStartedAt: timestamp("free_tier_started_at"),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default('en'),
  timezone: varchar("timezone", { length: 50 }).default('America/New_York'),
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default('USD'),
  region: varchar("region", { length: 10 }).default('US'),
  // Stripe subscription fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  // Garden Monitoring Premium Add-on
  gardenMonitoringSubscriptionId: varchar("garden_monitoring_subscription_id"),
  gardenMonitoringActive: boolean("garden_monitoring_active").default(false).notNull(),
  gardenMonitoringExpiresAt: timestamp("garden_monitoring_expires_at"),
  // General subscription fields for plan management
  subscriptionStatus: varchar("subscription_status").default('none'), // 'active', 'inactive', 'trialing', 'none'
  subscriptionPlan: varchar("subscription_plan").default('Free Plan'),
  subscriptionPlanId: varchar("subscription_plan_id").default('free'),
  // COPPA compliance fields removed - not in actual database
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Garden Content Management Table for Admin Editing
export const gardenContent = pgTable("garden_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionType: varchar("section_type").notNull(), // 'hero', 'features', 'tips', 'statistics'
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For additional configuration
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastEditedBy: varchar("last_edited_by").references(() => users.id),
});

export type GardenContent = typeof gardenContent.$inferSelect;
export type InsertGardenContent = typeof gardenContent.$inferInsert;

// Garden Content schema
export const insertGardenContentSchema = createInsertSchema(gardenContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI Garden Content Generation Logs
export const aiContentLogs = pgTable("ai_content_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: varchar("content_type").notNull(), // 'garden_tip', 'plant_care', 'seasonal_advice'
  prompt: text("prompt").notNull(),
  generatedContent: text("generated_content").notNull(),
  status: varchar("status").default('generated'), // 'generated', 'approved', 'published'
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"), // Store additional AI response data
});

export type AiContentLog = typeof aiContentLogs.$inferSelect;
export type InsertAiContentLog = typeof aiContentLogs.$inferInsert;

// Auth schemas for registration and login
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  isActive: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  freeTierUsed: true,
  freeTierStartedAt: true,
});

// Social Media Settings Table
export const socialMediaSettings = pgTable("social_media_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  facebookPageId: varchar("facebook_page_id"),
  facebookAccessToken: text("facebook_access_token"),
  twitterApiKey: text("twitter_api_key"),
  twitterApiSecret: text("twitter_api_secret"),
  twitterAccessToken: text("twitter_access_token"),
  twitterAccessTokenSecret: text("twitter_access_token_secret"),
  instagramUserId: varchar("instagram_user_id"),
  instagramAccessToken: text("instagram_access_token"),
  whatsappBusinessNumber: varchar("whatsapp_business_number"),
  whatsappAccessToken: text("whatsapp_access_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social Media Posts Table
export const socialMediaPosts = pgTable("social_media_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform", { enum: ["facebook", "twitter", "instagram", "whatsapp"] }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  hashtags: text("hashtags"),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  status: varchar("status", { enum: ["draft", "scheduled", "published", "failed"] }).default("draft"),
  externalPostId: varchar("external_post_id"), // ID from the social platform
  engagementStats: jsonb("engagement_stats"), // likes, shares, comments, etc.
  errorMessage: text("error_message"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social Media Analytics Table
export const socialMediaAnalytics = pgTable("social_media_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform", { enum: ["facebook", "twitter", "instagram", "whatsapp"] }).notNull(),
  metric: varchar("metric").notNull(), // followers, likes, shares, comments, reach, etc.
  value: integer("value").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SocialMediaSettings = typeof socialMediaSettings.$inferSelect;
export type InsertSocialMediaSettings = typeof socialMediaSettings.$inferInsert;

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

export type SocialMediaAnalytics = typeof socialMediaAnalytics.$inferSelect;
export type InsertSocialMediaAnalytics = typeof socialMediaAnalytics.$inferInsert;

export const insertSocialMediaSettingsSchema = createInsertSchema(socialMediaSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({
  id: true,
  publishedAt: true,
  externalPostId: true,
  engagementStats: true,
  errorMessage: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Premium Garden Monitoring Tables
export const gardenPlants = pgTable("garden_plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  species: varchar("species"),
  variety: varchar("variety"),
  dateAdded: timestamp("date_added").defaultNow(),
  location: varchar("location"), // Indoor/Outdoor/Greenhouse
  status: varchar("status", { enum: ["healthy", "warning", "critical", "dormant"] }).default("healthy"),
  photoUrl: varchar("photo_url"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const careActivities = pgTable("care_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull().references(() => gardenPlants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { 
    enum: ["watering", "fertilizing", "pruning", "repotting", "pest_treatment", "observation"] 
  }).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const plantMeasurements = pgTable("plant_measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull().references(() => gardenPlants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  height: decimal("height", { precision: 8, scale: 2 }),
  width: decimal("width", { precision: 8, scale: 2 }),
  leafCount: integer("leaf_count"),
  flowerCount: integer("flower_count"),
  fruitCount: integer("fruit_count"),
  healthScore: integer("health_score"), // 1-100
  photoUrl: varchar("photo_url"),
  notes: text("notes"),
  measurementDate: timestamp("measurement_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const environmentalReadings = pgTable("environmental_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plantId: varchar("plant_id").references(() => gardenPlants.id, { onDelete: "cascade" }), // Optional - can be garden-wide
  location: varchar("location").notNull(), // Indoor/Outdoor/Greenhouse
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  lightLevel: decimal("light_level", { precision: 8, scale: 2 }), // in lux
  soilMoisture: decimal("soil_moisture", { precision: 5, scale: 2 }), // percentage
  phLevel: decimal("ph_level", { precision: 4, scale: 2 }),
  readingDate: timestamp("reading_date").defaultNow(),
  deviceId: varchar("device_id"), // For IoT sensors
  createdAt: timestamp("created_at").defaultNow(),
});

export const gardenReports = pgTable("garden_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportType: varchar("report_type", { 
    enum: ["weekly", "monthly", "seasonal", "annual", "custom"] 
  }).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  plantCount: integer("plant_count"),
  activitiesCompleted: integer("activities_completed"),
  healthScore: integer("health_score"), // Average garden health
  pdfUrl: varchar("pdf_url"),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Garden Monitoring Subscription Plans
export const gardenSubscriptionPlans = pgTable("garden_subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  interval: varchar("interval", { enum: ["month", "year"] }).default("year"),
  maxPlants: integer("max_plants").default(50),
  features: jsonb("features").default("[]"),
  stripePriceId: varchar("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievement System Tables
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(), // Icon name or emoji
  category: varchar("category", { enum: ["care", "growth", "consistency", "social", "learning"] }).notNull(),
  points: integer("points").default(10),
  requirement: jsonb("requirement").notNull(), // Condition to unlock
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  plantId: varchar("plant_id").references(() => gardenPlants.id), // Optional - specific plant achievement
  sharedAt: timestamp("shared_at"), // When user shared this achievement
});

// Weather Integration Table
export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: varchar("location").notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: decimal("humidity", { precision: 5, scale: 2 }),
  uvIndex: decimal("uv_index", { precision: 4, scale: 2 }),
  precipitation: decimal("precipitation", { precision: 6, scale: 2 }),
  windSpeed: decimal("wind_speed", { precision: 5, scale: 2 }),
  condition: varchar("condition"), // sunny, cloudy, rainy, etc.
  forecastDate: date("forecast_date").notNull(),
  isActual: boolean("is_actual").default(true), // true for current weather, false for forecast
  createdAt: timestamp("created_at").defaultNow(),
});

// Plant Health Predictions Table
export const plantHealthPredictions = pgTable("plant_health_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantId: varchar("plant_id").notNull().references(() => gardenPlants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  predictionDate: date("prediction_date").notNull(),
  healthScore: integer("health_score"), // 1-100
  riskFactors: jsonb("risk_factors").default("[]"), // Array of risk factors
  recommendations: jsonb("recommendations").default("[]"), // AI recommendations
  weatherImpact: jsonb("weather_impact"), // How weather affects this plant
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }), // AI confidence %
  actualOutcome: integer("actual_outcome"), // User reported actual health (for learning)
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Sharing Table
export const plantMilestoneShares = pgTable("plant_milestone_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plantId: varchar("plant_id").notNull().references(() => gardenPlants.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").references(() => achievements.id),
  milestoneType: varchar("milestone_type", { 
    enum: ["growth", "flowering", "fruiting", "achievement", "care_streak", "health_improvement"] 
  }).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  platform: varchar("platform", { enum: ["twitter", "facebook", "instagram", "internal"] }).notNull(),
  shareData: jsonb("share_data"), // Platform specific data
  isPublic: boolean("is_public").default(true),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Stats for Gamification
export const userGardenStats = pgTable("user_garden_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  plantsOwned: integer("plants_owned").default(0),
  achievementsUnlocked: integer("achievements_unlocked").default(0),
  careStreak: integer("care_streak").default(0), // Days in a row with plant care
  longestStreak: integer("longest_streak").default(0),
  lastCareDate: date("last_care_date"),
  experiencePoints: integer("experience_points").default(0),
  rank: varchar("rank", { enum: ["seedling", "sprout", "gardener", "expert", "botanist"] }).default("seedling"),
  badgeCount: integer("badge_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for Garden Monitoring
export type GardenPlant = typeof gardenPlants.$inferSelect;
export type InsertGardenPlant = typeof gardenPlants.$inferInsert;

export type CareActivity = typeof careActivities.$inferSelect;
export type InsertCareActivity = typeof careActivities.$inferInsert;

export type PlantMeasurement = typeof plantMeasurements.$inferSelect;
export type InsertPlantMeasurement = typeof plantMeasurements.$inferInsert;

export type EnvironmentalReading = typeof environmentalReadings.$inferSelect;
export type InsertEnvironmentalReading = typeof environmentalReadings.$inferInsert;

export type GardenReport = typeof gardenReports.$inferSelect;
export type InsertGardenReport = typeof gardenReports.$inferInsert;

export type GardenSubscriptionPlan = typeof gardenSubscriptionPlans.$inferSelect;
export type InsertGardenSubscriptionPlan = typeof gardenSubscriptionPlans.$inferInsert;

// Zod schemas for Garden Monitoring
export const insertGardenPlantSchema = createInsertSchema(gardenPlants).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareActivitySchema = createInsertSchema(careActivities).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPlantMeasurementSchema = createInsertSchema(plantMeasurements).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertEnvironmentalReadingSchema = createInsertSchema(environmentalReadings).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertGardenReportSchema = createInsertSchema(gardenReports).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Type exports for new gamification and social features
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = typeof weatherData.$inferInsert;

export type PlantHealthPrediction = typeof plantHealthPredictions.$inferSelect;
export type InsertPlantHealthPrediction = typeof plantHealthPredictions.$inferInsert;

export type PlantMilestoneShare = typeof plantMilestoneShares.$inferSelect;
export type InsertPlantMilestoneShare = typeof plantMilestoneShares.$inferInsert;

export type UserGardenStats = typeof userGardenStats.$inferSelect;
export type InsertUserGardenStats = typeof userGardenStats.$inferInsert;

// Zod schemas for new features
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  createdAt: true,
});

export const insertPlantHealthPredictionSchema = createInsertSchema(plantHealthPredictions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPlantMilestoneShareSchema = createInsertSchema(plantMilestoneShares).omit({
  id: true,
  userId: true,
  createdAt: true,
  likes: true,
  shares: true,
});

export const insertUserGardenStatsSchema = createInsertSchema(userGardenStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Community Posts Table
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { 
    enum: ["experience", "plant_barter", "green_revolution", "decoration", "general", "tips", "questions"] 
  }).notNull(),
  tags: jsonb("tags").default("[]"), // Array of tags
  imageUrl: varchar("image_url"),
  location: varchar("location"), // User's location for bartering
  telegramId: varchar("telegram_id"), // Contact info for bartering
  emailContact: varchar("email_contact"), // Secondary email if different from user email
  isBarterPost: boolean("is_barter_post").default(false),
  barterType: varchar("barter_type", { enum: ["offering", "seeking", "exchange"] }),
  plantSpecies: varchar("plant_species"), // For barter posts
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false),
  isModerated: boolean("is_moderated").default(true),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Comments Table
export const communityComments = pgTable("community_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // For threaded comments
  likeCount: integer("like_count").default(0),
  isActive: boolean("is_active").default(true),
  isModerated: boolean("is_moderated").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Post Likes Table
export const communityPostLikes = pgTable("community_post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Comment Likes Table
export const communityCommentLikes = pgTable("community_comment_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull().references(() => communityComments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Community
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;

export type CommunityPostLike = typeof communityPostLikes.$inferSelect;
export type InsertCommunityPostLike = typeof communityPostLikes.$inferInsert;

export type CommunityCommentLike = typeof communityCommentLikes.$inferSelect;
export type InsertCommunityCommentLike = typeof communityCommentLikes.$inferInsert;

// Zod schemas for Community
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  userId: true,
  viewCount: true,
  likeCount: true,
  commentCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Custom validation - no phone numbers allowed
  content: z.string().min(10).max(5000).refine(
    (val) => !/((\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})|(\+\d{1,3}[\s.-]?\d{4,14})/g.test(val),
    "Phone numbers are not allowed. Please use Telegram ID or email only."
  ),
  telegramId: z.string().optional().refine(
    (val) => !val || val.startsWith('@') || val.match(/^[a-zA-Z0-9_]{5,32}$/),
    "Invalid Telegram ID format"
  ),
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({
  id: true,
  userId: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  content: z.string().min(1).max(1000).refine(
    (val) => !/((\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})|(\+\d{1,3}[\s.-]?\d{4,14})/g.test(val),
    "Phone numbers are not allowed. Please use Telegram ID or email only."
  ),
});

export type InsertCommunityPostType = z.infer<typeof insertCommunityPostSchema>;
export type InsertCommunityCommentType = z.infer<typeof insertCommunityCommentSchema>;

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

// Enhanced Admin Roles and Permissions
export const adminRoles = pgTable("admin_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").default("[]"), // Array of permission strings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdminRole = typeof adminRoles.$inferSelect;
export const insertAdminRoleSchema = createInsertSchema(adminRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Employee Management System
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employeeId: varchar("employee_id").unique().notNull(),
  department: varchar("department").notNull(),
  position: varchar("position").notNull(),
  roleId: varchar("role_id").references(() => adminRoles.id),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  hireDate: date("hire_date").notNull(),
  terminationDate: date("termination_date"),
  isActive: boolean("is_active").default(true),
  managerId: varchar("manager_id"), // Remove self-reference for now
  phoneNumber: varchar("phone_number"),
  emergencyContact: jsonb("emergency_contact"),
  skills: jsonb("skills").default("[]"),
  certifications: jsonb("certifications").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Employee = typeof employees.$inferSelect;
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Two-Factor Authentication for Admin
export const adminTwoFactor = pgTable("admin_two_factor", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  secret: varchar("secret").notNull(), // TOTP secret
  backupCodes: jsonb("backup_codes").default("[]"), // Array of backup codes
  isEnabled: boolean("is_enabled").default(false),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminTwoFactor = typeof adminTwoFactor.$inferSelect;

// Admin Session Management
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminSession = typeof adminSessions.$inferSelect;

// Analytics and Data Tracking
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(),
  entityType: varchar("entity_type"), // user, plant, order, etc.
  entityId: varchar("entity_id"),
  userId: varchar("user_id").references(() => users.id),
  properties: jsonb("properties").default("{}"),
  timestamp: timestamp("timestamp").defaultNow(),
  sessionId: varchar("session_id"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  timestamp: true,
});

// Brand and Design Management
export const brandSettings = pgTable("brand_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  category: varchar("category").notNull().default("general"),
  description: text("description"),
  dataType: varchar("data_type").notNull().default("string"), // string, number, boolean, json, file
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BrandSetting = typeof brandSettings.$inferSelect;
export const insertBrandSettingSchema = createInsertSchema(brandSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Content Moderation System
export const moderationQueue = pgTable("moderation_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // blog_post, ebook, review, comment
  entityId: varchar("entity_id").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  moderatorId: varchar("moderator_id").references(() => users.id),
  reason: text("reason"),
  notes: text("notes"),
  automatedFlags: jsonb("automated_flags").default("[]"),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export type ModerationItem = typeof moderationQueue.$inferSelect;
export const insertModerationItemSchema = createInsertSchema(moderationQueue).omit({
  id: true,
  submittedAt: true,
});

// E-commerce Product Management Schema
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  shortDescription: varchar("short_description"),
  category: varchar("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  sku: varchar("sku").unique(),
  stockQuantity: integer("stock_quantity").default(0),
  trackQuantity: boolean("track_quantity").default(true),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: jsonb("dimensions"), // {length, width, height}
  images: jsonb("images").default("[]"), // Array of image URLs
  tags: jsonb("tags").default("[]"), // Array of tags
  features: jsonb("features").default("[]"), // Array of feature strings
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  // Geographic Restrictions for Product Availability
  allowedCountries: jsonb("allowed_countries").default("[]"), // Array of allowed country codes
  restrictedCountries: jsonb("restricted_countries").default("[]"), // Array of restricted country codes  
  globalAccess: boolean("global_access").default(false), // If true, available worldwide
  regionRestrictions: jsonb("region_restrictions").default("{}"), // Custom region-based rules
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Product = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Shopping Cart Schema
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(), // For guest users
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type CartItem = typeof cartItems.$inferSelect;
export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Orders Schema
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestEmail: varchar("guest_email"),
  status: varchar("status").notNull().default('pending'), // pending, processing, shipped, delivered, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  paymentStatus: varchar("payment_status").default('pending'), // pending, paid, failed, refunded
  paymentProvider: varchar("payment_provider"), // stripe, paypal, cashfree, razorpay
  paymentIntentId: varchar("payment_intent_id"),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  notes: text("notes"),
  trackingNumber: varchar("tracking_number"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Order Items Schema
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  productName: varchar("product_name").notNull(), // Store name at time of order
  productImage: varchar("product_image"),
  sku: varchar("sku"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Product Categories Schema
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  image: varchar("image"),
  parentId: varchar("parent_id"), // Remove self-reference for now
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Shipping Rates Schema
export const shippingRates = pgTable("shipping_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }),
  estimatedDays: varchar("estimated_days"), // "3-5 business days"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ShippingRate = typeof shippingRates.$inferSelect;
export const insertShippingRateSchema = createInsertSchema(shippingRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;

// Subscription management with multi-currency support
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planType: varchar("plan_type").notNull(), // 'pro', 'premium'
  status: varchar("status").notNull(), // 'active', 'cancelled', 'expired'
  currency: varchar("currency", { length: 3 }).notNull().default('USD'), // ISO currency code
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Amount in local currency
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  razorpaySubscriptionId: varchar("razorpay_subscription_id"),
  cashfreeSubscriptionId: varchar("cashfree_subscription_id"),
  paypalSubscriptionId: varchar("paypal_subscription_id"),
  preferredProvider: varchar("preferred_provider"), // stripe, razorpay, cashfree, paypal
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

// Blog categories for organized content
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"), // For UI representation
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

// Blog posts for plant care tips
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  slug: varchar("slug").unique().notNull(),
  authorId: varchar("author_id").references(() => users.id),
  categoryId: varchar("category_id").references(() => blogCategories.id),
  published: boolean("published").default(false),
  featuredImage: varchar("featured_image"),
  tags: text("tags").array(),
  viewCount: integer("view_count").default(0),
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
export const insertBlogViewSchema = createInsertSchema(blogViews).omit({
  id: true,
  viewedAt: true,
});
export type InsertBlogView = z.infer<typeof insertBlogViewSchema>;

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
export const insertCatalogCacheSchema = createInsertSchema(catalogCache).omit({
  id: true,
  createdAt: true,
});
export type InsertCatalogCache = z.infer<typeof insertCatalogCacheSchema>;

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

// Expert onboarding system for plant specialists
export const expertApplications = pgTable("expert_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Personal Information
  firstName: varchar("first_name").notNull(),
  middleName: varchar("middle_name"),
  lastName: varchar("last_name").notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender").notNull(), // 'male', 'female', 'other', 'prefer_not_to_say'
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  
  // Address Information
  houseNumber: varchar("house_number").notNull(),
  buildingName: varchar("building_name"),
  roadName: varchar("road_name").notNull(),
  colonyName: varchar("colony_name"),
  areaName: varchar("area_name").notNull(),
  cityName: varchar("city_name").notNull(),
  stateName: varchar("state_name").notNull(),
  countryName: varchar("country_name").notNull(),
  postalCode: varchar("postal_code"),
  
  // Professional Information
  qualifications: jsonb("qualifications").notNull(), // Array of qualification objects
  specialization: varchar("specialization"), // Plant specialty area
  experience: integer("experience"), // Years of experience
  
  // Documents (stored as object storage paths)
  profilePhotoPath: varchar("profile_photo_path"),
  qualificationDocuments: text("qualification_documents").array(), // Array of document paths
  
  // Bank Details
  bankAccountHolderName: varchar("bank_account_holder_name"),
  bankAccountNumber: varchar("bank_account_number"),
  bankName: varchar("bank_name"),
  branchName: varchar("branch_name"),
  ifscCode: varchar("ifsc_code"),
  swiftCode: varchar("swift_code"),
  
  // Alternative Payment Details
  paypalEmail: varchar("paypal_email"),
  skydoDetails: text("skydo_details"),
  
  // Application Status and Review
  applicationStatus: varchar("application_status").default('pending'), // 'pending', 'under_review', 'approved', 'rejected'
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Terms and Conditions
  termsAccepted: boolean("terms_accepted").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  
  // Contact Preferences
  availableHours: varchar("available_hours"), // When expert is available for consultations
  timeZone: varchar("time_zone").default('UTC'),
  consultationRate: decimal("consultation_rate", { precision: 10, scale: 2 }), // Per hour rate
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ExpertApplication = typeof expertApplications.$inferSelect;
export const insertExpertApplicationSchema = createInsertSchema(expertApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedBy: true,
  reviewedAt: true,
});
export type InsertExpertApplication = z.infer<typeof insertExpertApplicationSchema>;

// Approved experts for consultation services
export const experts = pgTable("experts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").notNull().references(() => expertApplications.id),
  expertCode: varchar("expert_code").unique().notNull(), // Unique identifier for experts
  
  // Active Status
  isActive: boolean("is_active").default(true),
  isAvailable: boolean("is_available").default(true), // Currently available for consultations
  
  // Performance Metrics
  totalConsultations: integer("total_consultations").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default('0'),
  responseTime: integer("response_time"), // Average response time in minutes
  
  // Profile Information (copied from application for quick access)
  displayName: varchar("display_name").notNull(),
  specialization: varchar("specialization"),
  bio: text("bio"),
  profileImagePath: varchar("profile_image_path"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Expert = typeof experts.$inferSelect;
export const insertExpertSchema = createInsertSchema(experts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertExpert = z.infer<typeof insertExpertSchema>;

// Expert consultations for user interactions
export const expertConsultations = pgTable("expert_consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  expertId: varchar("expert_id").notNull().references(() => experts.id),
  
  // Consultation Details
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  plantImages: text("plant_images").array(), // Array of image paths
  
  // Session Information
  sessionType: varchar("session_type").notNull(), // 'chat', 'video', 'email'
  status: varchar("status").default('pending'), // 'pending', 'active', 'completed', 'cancelled'
  scheduledAt: timestamp("scheduled_at"),
  duration: integer("duration"), // Duration in minutes
  
  // Feedback and Rating
  userRating: integer("user_rating"), // 1-5 stars
  userFeedback: text("user_feedback"),
  expertNotes: text("expert_notes"),
  
  // Payment Information
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('USD'),
  paymentStatus: varchar("payment_status").default('pending'), // 'pending', 'paid', 'refunded'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ExpertConsultation = typeof expertConsultations.$inferSelect;
export const insertExpertConsultationSchema = createInsertSchema(expertConsultations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertExpertConsultation = z.infer<typeof insertExpertConsultationSchema>;

// Consultation requests for "Talk to Our Expert" feature
export const consultationRequests = pgTable("consultation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Optional if guest users allowed
  
  // User Information
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phoneNumber: varchar("phone_number").notNull(), // Now mandatory
  
  // Detailed Address Information
  houseNumber: varchar("house_number"),
  buildingName: varchar("building_name"),
  roadNumber: varchar("road_number"),
  colony: varchar("colony"),
  area: varchar("area"),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  country: varchar("country").notNull(),
  pinZip: varchar("pin_zip").notNull(),
  
  // Problem Description
  problemDescription: text("problem_description").notNull(), // Max 60 words validation in frontend
  
  // Scheduling
  preferredDate: timestamp("preferred_date").notNull(),
  preferredTimeSlot: varchar("preferred_time_slot").notNull(), // e.g., "09:00-10:00"
  
  // Status and Assignment
  status: varchar("status").default('pending'), // 'pending', 'payment_pending', 'paid', 'assigned', 'scheduled', 'completed', 'cancelled'
  assignedExpertId: varchar("assigned_expert_id").references(() => experts.id),
  
  // Payment Information
  amount: decimal("amount", { precision: 10, scale: 2 }).default('29.99'), // Default consultation fee
  currency: varchar("currency", { length: 3 }).default('USD'),
  paymentStatus: varchar("payment_status").default('pending'), // 'pending', 'paid', 'failed', 'refunded'
  paymentIntentId: varchar("payment_intent_id"), // Stripe payment intent ID
  
  // Communication Details
  consultationNotes: text("consultation_notes"), // Expert's notes
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ConsultationRequest = typeof consultationRequests.$inferSelect;
export const insertConsultationRequestSchema = createInsertSchema(consultationRequests).omit({
  id: true,
  status: true,
  assignedExpertId: true,
  paymentStatus: true,
  paymentIntentId: true,
  consultationNotes: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConsultationRequest = z.infer<typeof insertConsultationRequestSchema>;

// Student Users Schema - Separate registration for students with academic verification
export const studentUsers = pgTable("student_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  country: varchar("country").notNull(),
  password: varchar("password").notNull(),
  
  // Academic Information
  universityName: varchar("university_name", { length: 255 }).notNull(),
  instituteName: varchar("institute_name", { length: 255 }),
  academicBranch: varchar("academic_branch", { length: 100 }).notNull(),
  yearOfJoining: integer("year_of_joining").notNull(),
  currentAcademicYear: varchar("current_academic_year", { length: 50 }).notNull(),
  academicStatus: varchar("academic_status", { length: 50 }).notNull(), // undergraduate, graduate, phd, etc.
  subjectsStudying: text("subjects_studying").array(),
  expectedGraduation: varchar("expected_graduation", { length: 50 }),
  studentId: varchar("student_id", { length: 100 }),
  
  // Verification Documents
  studentDocumentUrl: varchar("student_document_url", { length: 500 }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(), // id_card, enrollment_certificate, etc.
  
  // Verification Status
  verificationStatus: varchar("verification_status", { length: 20 }).default('pending'), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  
  // Lifecycle Management
  isActive: boolean("is_active").default(true),
  isConverted: boolean("is_converted").default(false), // Converted to regular user after graduation
  convertedUserId: varchar("converted_user_id").references(() => users.id),
  conversionDate: timestamp("conversion_date"),
  
  // Admin Extension Management
  adminExtensionCount: integer("admin_extension_count").default(0), // Number of extensions granted
  lastExtensionDate: timestamp("last_extension_date"),
  extensionExpiryDate: timestamp("extension_expiry_date"), // Custom expiry date if extended
  conversionScheduledFor: timestamp("conversion_scheduled_for"), // Auto-calculated conversion date
  
  // Automatic discount and conversion tracking
  discountApplied: boolean("discount_applied").default(true), // 10% student discount
  graduationCompleted: boolean("graduation_completed").default(false),
  graduationCompletionDate: timestamp("graduation_completion_date"),
  
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type StudentUser = typeof studentUsers.$inferSelect;
export const insertStudentUserSchema = createInsertSchema(studentUsers).omit({
  id: true,
  verificationStatus: true,
  adminNotes: true,
  verifiedBy: true,
  verifiedAt: true,
  isActive: true,
  isConverted: true,
  convertedUserId: true,
  conversionDate: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStudentUser = z.infer<typeof insertStudentUserSchema>;

// E-books Schema - Matching actual database structure
export const ebooks = pgTable("ebooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  subtitle: varchar("subtitle"),
  description: text("description"),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id"),
  coverImageUrl: varchar("cover_image_url"),
  previewFileUrl: varchar("preview_file_url"),
  fullFileUrl: varchar("full_file_url").notNull(),
  fileSize: integer("file_size"),
  fileFormat: varchar("file_format"),
  language: varchar("language"),
  pageCount: integer("page_count"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency"),
  tags: text("tags").array(),
  isbn: varchar("isbn"),
  publishDate: date("publish_date"),
  isPublished: boolean("is_published"),
  adminApproved: boolean("admin_approved"),
  adminNotes: text("admin_notes"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  downloadCount: integer("download_count"),
  ratingAverage: decimal("rating_average", { precision: 3, scale: 2 }),
  ratingCount: integer("rating_count"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  authorName: varchar("author_name"),
  status: varchar("status"),
  isActive: boolean("is_active"),
  isFeatured: boolean("is_featured"),
  category: varchar("category"),
  subcategory: varchar("subcategory"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  copyrightStatus: varchar("copyright_status"),
  publishingRights: boolean("publishing_rights"),
  contentRating: varchar("content_rating"),
  publicationDate: timestamp("publication_date"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count"),
  allowedCountries: jsonb("allowed_countries"),
  restrictedCountries: jsonb("restricted_countries"),
  globalAccess: boolean("global_access"),
  regionRestrictions: jsonb("region_restrictions"),
});

export type Ebook = typeof ebooks.$inferSelect;
export const insertEbookSchema = createInsertSchema(ebooks).omit({
  id: true,
  authorName: true,
  downloadCount: true,
  ratingAverage: true,
  ratingCount: true,
  status: true,
  adminNotes: true,
  approvedBy: true,
  approvedAt: true,
  isActive: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEbook = z.infer<typeof insertEbookSchema>;

// E-book Purchases Schema
export const ebookPurchases = pgTable("ebook_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ebookId: varchar("ebook_id").notNull().references(() => ebooks.id, { onDelete: "cascade" }),
  buyerId: varchar("buyer_id").references(() => users.id, { onDelete: "cascade" }),
  studentBuyerId: varchar("student_buyer_id").references(() => studentUsers.id, { onDelete: "cascade" }),
  buyerEmail: varchar("buyer_email").notNull(),
  
  // Pricing at time of purchase
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  studentDiscount: decimal("student_discount", { precision: 10, scale: 2 }).default('0'),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  authorEarnings: decimal("author_earnings", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  
  // Payment Details
  paymentStatus: varchar("payment_status").default('pending'), // pending, completed, failed, refunded
  paymentProvider: varchar("payment_provider"), // stripe, paypal, etc.
  paymentIntentId: varchar("payment_intent_id"),
  transactionId: varchar("transaction_id"),
  
  // Access Management
  downloadPassword: varchar("download_password").notNull(), // Email-based password
  downloadCount: integer("download_count").default(0),
  lastDownloadAt: timestamp("last_download_at"),
  accessExpiresAt: timestamp("access_expires_at"), // Optional expiry
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EbookPurchase = typeof ebookPurchases.$inferSelect;
export const insertEbookPurchaseSchema = createInsertSchema(ebookPurchases).omit({
  id: true,
  downloadPassword: true,
  downloadCount: true,
  lastDownloadAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEbookPurchase = z.infer<typeof insertEbookPurchaseSchema>;

// Platform Settings Schema for Admin Control
export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: text("setting_value").notNull(),
  settingType: varchar("setting_type").notNull(), // string, number, boolean, json
  description: text("description"),
  category: varchar("category").notNull(), // ebook, payment, student, general
  isEditable: boolean("is_editable").default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;

// E-book Reviews Schema
export const ebookReviews = pgTable("ebook_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ebookId: varchar("ebook_id").notNull().references(() => ebooks.id, { onDelete: "cascade" }),
  reviewerId: varchar("reviewer_id").references(() => users.id, { onDelete: "cascade" }),
  studentReviewerId: varchar("student_reviewer_id").references(() => studentUsers.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewTitle: varchar("review_title"),
  reviewContent: text("review_content"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  isApproved: boolean("is_approved").default(true),
  helpfulVotes: integer("helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EbookReview = typeof ebookReviews.$inferSelect;
export const insertEbookReviewSchema = createInsertSchema(ebookReviews).omit({
  id: true,
  isVerifiedPurchase: true,
  isApproved: true,
  helpfulVotes: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEbookReview = z.infer<typeof insertEbookReviewSchema>;

// E-book Categories Schema
export const ebookCategories = pgTable("ebook_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  parentId: varchar("parent_id"), // Remove self-reference for now
  icon: varchar("icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EbookCategory = typeof ebookCategories.$inferSelect;
export const insertEbookCategorySchema = createInsertSchema(ebookCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEbookCategory = z.infer<typeof insertEbookCategorySchema>;

// Student Verification Schema for Educational Discounts
export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Student Information
  studentId: varchar("student_id").notNull(),
  universityName: varchar("university_name").notNull(),
  degreeProgram: varchar("degree_program").notNull(),
  yearOfStudy: integer("year_of_study").notNull(),
  expectedGraduationDate: date("expected_graduation_date").notNull(),
  
  // Contact Information
  universityEmail: varchar("university_email").notNull(),
  phoneNumber: varchar("phone_number"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  
  // Address
  currentAddress: jsonb("current_address"),
  permanentAddress: jsonb("permanent_address"),
  
  // Documents
  studentIdDocumentUrl: varchar("student_id_document_url"),
  enrollmentCertificateUrl: varchar("enrollment_certificate_url"),
  transcriptUrl: varchar("transcript_url"),
  
  // Verification Status
  verificationStatus: varchar("verification_status").default('pending'), // pending, under_review, verified, rejected, expired
  submittedAt: timestamp("submitted_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  
  // Admin Review
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  adminNotes: text("admin_notes"),
  
  // Student Benefits
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default('15.00'),
  accessLevel: varchar("access_level").default('student'), // student, premium_student
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  verifiedAt: true,
  reviewedBy: true,
});
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;

// Author Profiles Schema for E-book Marketplace
export const authorProfiles = pgTable("author_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Basic Information
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  websiteUrl: varchar("website_url"),
  socialLinks: jsonb("social_links"), // {twitter, linkedin, facebook, etc.}
  
  // Professional Information
  expertise: text("expertise").array(), // Areas of expertise
  publications: text("publications").array(), // Previous publications
  qualifications: text("qualifications").array(), // Academic/professional qualifications
  experience: text("experience"), // Professional experience description
  
  // Publishing Standards Compliance
  hasPublishingExperience: boolean("has_publishing_experience").default(false),
  publishingExperienceDetails: text("publishing_experience_details"),
  copyrightAgreement: boolean("copyright_agreement").default(false),
  qualityStandardsAgreement: boolean("quality_standards_agreement").default(false),
  exclusivityAgreement: boolean("exclusivity_agreement").default(false),
  
  // Document Verification
  identityDocumentUrl: varchar("identity_document_url"), // ID verification
  portfolioDocumentUrl: varchar("portfolio_document_url"), // Writing samples
  qualificationDocumentUrl: varchar("qualification_document_url"), // Academic credentials
  
  // Bank Details for Payments
  bankAccountHolderName: varchar("bank_account_holder_name"),
  bankAccountNumber: varchar("bank_account_number"),
  bankName: varchar("bank_name"),
  branchName: varchar("branch_name"),
  routingNumber: varchar("routing_number"), // For US accounts
  ifscCode: varchar("ifsc_code"), // For Indian accounts
  swiftCode: varchar("swift_code"), // For international transfers
  
  // Alternative Payment Methods
  paypalEmail: varchar("paypal_email"),
  stripeAccountId: varchar("stripe_account_id"),
  
  // Application Status
  applicationStatus: varchar("application_status").default('pending'), // pending, under_review, approved, rejected, suspended
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Profile Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  canPublish: boolean("can_publish").default(false),
  
  // Terms and Agreements
  termsAcceptedAt: timestamp("terms_accepted_at"),
  privacyPolicyAcceptedAt: timestamp("privacy_policy_accepted_at"),
  authorAgreementAcceptedAt: timestamp("author_agreement_accepted_at"),
  
  // Performance Metrics
  totalEbooks: integer("total_ebooks").default(0),
  totalSales: integer("total_sales").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default('0'),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default('0'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AuthorProfile = typeof authorProfiles.$inferSelect;
export const insertAuthorProfileSchema = createInsertSchema(authorProfiles).omit({
  id: true,
  applicationStatus: true,
  adminNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  isActive: true,
  isVerified: true,
  canPublish: true,
  totalEbooks: true,
  totalSales: true,
  averageRating: true,
  totalEarnings: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAuthorProfile = z.infer<typeof insertAuthorProfileSchema>;

// KDP-Style Terms and Conditions Management
export const termsAndConditions = pgTable("terms_and_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // author_agreement, platform_terms, privacy_policy, publishing_guidelines
  version: varchar("version").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  requiresAcceptance: boolean("requires_acceptance").default(true),
  
  // Tracking changes
  previousVersionId: varchar("previous_version_id"), // Remove self-reference for now
  changeNotes: text("change_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TermsAndConditions = typeof termsAndConditions.$inferSelect;
export const insertTermsAndConditionsSchema = createInsertSchema(termsAndConditions).omit({
  id: true,
  lastModifiedBy: true,
  createdAt: true,
  updatedAt: true,
});

// User Terms Acceptance Tracking
export const userTermsAcceptance = pgTable("user_terms_acceptance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  termsId: varchar("terms_id").notNull().references(() => termsAndConditions.id),
  acceptedAt: timestamp("accepted_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
});

export type UserTermsAcceptance = typeof userTermsAcceptance.$inferSelect;

// Enhanced Sales Analytics for Admin Dashboard
export const salesAnalytics = pgTable("sales_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ebookId: varchar("ebook_id").notNull().references(() => ebooks.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Date/Period for the analytics
  reportDate: date("report_date").notNull(),
  reportPeriod: varchar("report_period").notNull(), // daily, weekly, monthly, yearly
  
  // Sales Metrics
  totalSales: integer("total_sales").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default('0'),
  totalDiscounts: decimal("total_discounts", { precision: 12, scale: 2 }).default('0'),
  totalTaxes: decimal("total_taxes", { precision: 12, scale: 2 }).default('0'),
  totalPlatformFees: decimal("total_platform_fees", { precision: 12, scale: 2 }).default('0'),
  totalAuthorEarnings: decimal("total_author_earnings", { precision: 12, scale: 2 }).default('0'),
  
  // Performance Metrics
  averageDailyDownloads: decimal("avg_daily_downloads", { precision: 8, scale: 2 }).default('0'),
  peakSalesDay: date("peak_sales_day"),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).default('0'), // views to purchases
  
  // Geographic breakdown (top 5 countries)
  topCountriesData: jsonb("top_countries_data").default("[]"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SalesAnalytics = typeof salesAnalytics.$inferSelect;

// Author Payment History
export const authorPayments = pgTable("author_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Payment Details
  paymentPeriodStart: date("payment_period_start").notNull(),
  paymentPeriodEnd: date("payment_period_end").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).notNull(),
  totalBooks: integer("total_books").notNull(), // Number of books sold in period
  totalSales: integer("total_sales").notNull(), // Number of individual sales
  
  // Payment Processing
  paymentMethod: varchar("payment_method").notNull(), // bank_transfer, paypal, stripe, etc.
  paymentReference: varchar("payment_reference"),
  paymentStatus: varchar("payment_status").default('pending'), // pending, processing, paid, failed
  paidAt: timestamp("paid_at"),
  
  // Bank Details (for payment)
  bankDetails: jsonb("bank_details"), // Encrypted bank account info
  paymentNotes: text("payment_notes"),
  
  // Tax Information
  taxWithheld: decimal("tax_withheld", { precision: 10, scale: 2 }).default('0'),
  taxDocumentPath: varchar("tax_document_path"), // Path to tax document
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AuthorPayment = typeof authorPayments.$inferSelect;

// E-book Upload Process Tracking
export const ebookUploads = pgTable("ebook_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Upload Session
  uploadSessionId: varchar("upload_session_id").unique().notNull(),
  currentStep: varchar("current_step").default('basic_info'), // basic_info, files, pricing, review, submit
  stepProgress: jsonb("step_progress").default("{}"), // Track completion of each step
  
  // Temporary Data Storage (before final submission)
  temporaryData: jsonb("temporary_data").default("{}"), // Store form data between steps
  
  // File Upload Status
  coverImageUploaded: boolean("cover_image_uploaded").default(false),
  manuscriptUploaded: boolean("manuscript_uploaded").default(false),
  previewGenerated: boolean("preview_generated").default(false),
  
  // Validation Status
  contentValidated: boolean("content_validated").default(false),
  metadataValidated: boolean("metadata_validated").default(false),
  pricingValidated: boolean("pricing_validated").default(false),
  
  // Final Status
  isCompleted: boolean("is_completed").default(false),
  ebookId: varchar("ebook_id").references(() => ebooks.id), // Set when upload completes
  completedAt: timestamp("completed_at"),
  
  // Session Management
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Upload session expiry
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EbookUpload = typeof ebookUploads.$inferSelect;

// Platform Configuration for E-book Publishing
export const publishingSettings = pgTable("publishing_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Royalty and Commission Rates
  defaultRoyaltyRate: decimal("default_royalty_rate", { precision: 5, scale: 4 }).default('0.7000'), // 70%
  platformCommissionRate: decimal("platform_commission_rate", { precision: 5, scale: 4 }).default('0.3000'), // 30%
  minimumRoyaltyRate: decimal("minimum_royalty_rate", { precision: 5, scale: 4 }).default('0.3500'), // 35%
  maximumRoyaltyRate: decimal("maximum_royalty_rate", { precision: 5, scale: 4 }).default('0.7000'), // 70%
  
  // Pricing Limits
  minimumBookPrice: decimal("minimum_book_price", { precision: 8, scale: 2 }).default('0.99'),
  maximumBookPrice: decimal("maximum_book_price", { precision: 8, scale: 2 }).default('999.99'),
  
  // Publishing Requirements
  minimumPageCount: integer("minimum_page_count").default(10),
  maximumFileSize: integer("maximum_file_size").default(52428800), // 50MB in bytes
  allowedFileFormats: text("allowed_file_formats").array().default(['pdf', 'epub', 'mobi']),
  
  // Review Process
  autoPublishEnabled: boolean("auto_publish_enabled").default(false),
  requireManualReview: boolean("require_manual_review").default(true),
  reviewTimeframeDays: integer("review_timeframe_days").default(7),
  
  // Payment Processing
  paymentSchedule: varchar("payment_schedule").default('monthly'), // weekly, monthly, quarterly
  minimumPayoutAmount: decimal("minimum_payout_amount", { precision: 8, scale: 2 }).default('25.00'),
  
  // Content Guidelines
  allowAdultContent: boolean("allow_adult_content").default(false),
  requireContentWarnings: boolean("require_content_warnings").default(true),
  plagiarismCheckEnabled: boolean("plagiarism_check_enabled").default(true),
  
  // Tax Settings
  collectTaxes: boolean("collect_taxes").default(true),
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 4 }).default('0.0000'),
  taxByLocation: boolean("tax_by_location").default(true),
  
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PublishingSetting = typeof publishingSettings.$inferSelect;