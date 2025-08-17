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
// Enhanced for custom authentication with admin management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  location: varchar("location"),
  password: varchar("password").notNull(), // Hashed password
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
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

export type InsertUser = z.infer<typeof insertUserSchema>;

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
  parentId: varchar("parent_id").references(() => categories.id),
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

export type LoginUser = z.infer<typeof loginUserSchema>;

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
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default(0),
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