import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  jsonb,
  uuid,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Microclimate Zones - Premium Feature
export const microclimatezones = pgTable("microclimate_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coordinates: jsonb("coordinates"), // {lat, lng, radius}
  soilType: varchar("soil_type", { length: 100 }),
  sunlightHours: decimal("sunlight_hours", { precision: 4, scale: 2 }),
  moistureLevel: varchar("moisture_level", { length: 50 }),
  temperatureRange: jsonb("temperature_range"), // {min, max}
  plantSpecies: jsonb("plant_species").default('[]'), // Array of plant IDs in this zone
  microSensors: jsonb("micro_sensors").default('[]'), // IoT sensor data
  automationRules: jsonb("automation_rules").default('[]'), // Smart care rules
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Plant Social Network - Companion Planting
export const plantconnections = pgTable("plant_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plantIdA: varchar("plant_id_a").notNull(),
  plantIdB: varchar("plant_id_b").notNull(),
  userId: varchar("user_id").notNull(),
  connectionType: varchar("connection_type", { length: 50 }).notNull(), // companion, antagonist, neutral
  benefitDescription: text("benefit_description"),
  distanceRecommended: decimal("distance_recommended", { precision: 6, scale: 2 }),
  seasonalEffectiveness: jsonb("seasonal_effectiveness"), // {spring: 85, summer: 92, fall: 78, winter: 45}
  scientificBasis: text("scientific_basis"),
  userRating: integer("user_rating").default(0), // 1-5 star rating
  communityConfirmed: boolean("community_confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// AI-Powered Predictive Analytics
export const aiinsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  plantId: varchar("plant_id"),
  insightType: varchar("insight_type", { length: 50 }).notNull(), // prediction, warning, recommendation, optimization
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // AI confidence 0-100
  actionRequired: boolean("action_required").default(false),
  urgencyLevel: varchar("urgency_level", { length: 20 }), // low, medium, high, critical
  predictedDate: timestamp("predicted_date"), // When issue might occur
  aiModel: varchar("ai_model", { length: 100 }), // Which AI model generated this
  dataPoints: jsonb("data_points"), // Raw data used for prediction
  recommendations: jsonb("recommendations"), // Array of suggested actions
  userFeedback: varchar("user_feedback", { length: 20 }), // helpful, not_helpful, incorrect
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Professional Garden Management
export const gardenblueprints = pgTable("garden_blueprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  gardenSize: jsonb("garden_size"), // {width, height, units}
  blueprint3D: jsonb("blueprint_3d"), // 3D layout data
  plantPlacements: jsonb("plant_placements"), // Array of plant positions
  irrigationSystem: jsonb("irrigation_system"), // Irrigation layout
  pathways: jsonb("pathways"), // Garden paths and walkways
  structures: jsonb("structures"), // Sheds, greenhouses, etc.
  seasonalPlans: jsonb("seasonal_plans"), // Plans for each season
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  implementationStatus: varchar("implementation_status", { length: 50 }), // planned, in_progress, completed
  professionalReview: text("professional_review"),
  isPublic: boolean("is_public").default(false),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community Social Features
export const gardencommunity = pgTable("garden_community", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  postType: varchar("post_type", { length: 50 }).notNull(), // photo, tip, question, achievement, trade
  title: varchar("title", { length: 255 }),
  content: text("content"),
  images: jsonb("images").default('[]'), // Array of image URLs
  plantTags: jsonb("plant_tags").default('[]'), // Tagged plant species
  location: varchar("location", { length: 255 }),
  privacy: varchar("privacy", { length: 20 }).default('public'), // public, friends, private
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  isVerified: boolean("is_verified").default(false), // Expert verified content
  createdAt: timestamp("created_at").defaultNow()
});

export const communityinteractions = pgTable("community_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  postId: varchar("post_id").notNull(),
  interactionType: varchar("interaction_type", { length: 20 }).notNull(), // like, comment, share, follow
  content: text("content"), // For comments
  createdAt: timestamp("created_at").defaultNow()
});

// Advanced Analytics & Insights
export const gardenanalytics = pgTable("garden_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  reportDate: timestamp("report_date").defaultNow(),
  carbonFootprint: jsonb("carbon_footprint"), // CO2 absorbed, emissions saved
  waterUsage: jsonb("water_usage"), // Daily, weekly, monthly usage
  soilHealth: jsonb("soil_health"), // pH, nutrients, organic matter
  biodiversityIndex: decimal("biodiversity_index", { precision: 5, scale: 2 }),
  yieldAnalysis: jsonb("yield_analysis"), // Harvest data and predictions
  costBenefitAnalysis: jsonb("cost_benefit_analysis"), // Expenses vs savings
  sustainabilityScore: decimal("sustainability_score", { precision: 5, scale: 2 }),
  recommendations: jsonb("recommendations"), // AI-generated improvement suggestions
  benchmarkComparison: jsonb("benchmark_comparison"), // vs local gardens, national avg
  createdAt: timestamp("created_at").defaultNow()
});

// Smart Technology Integration
export const iotdevices = pgTable("iot_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceName: varchar("device_name", { length: 255 }).notNull(),
  deviceType: varchar("device_type", { length: 100 }).notNull(), // sensor, irrigation, camera, weather_station
  macAddress: varchar("mac_address", { length: 17 }).unique(),
  location: jsonb("location"), // GPS coordinates or zone assignment
  isOnline: boolean("is_online").default(false),
  batteryLevel: integer("battery_level"), // 0-100%
  lastDataReceived: timestamp("last_data_received"),
  configurations: jsonb("configurations"), // Device-specific settings
  dataFrequency: integer("data_frequency").default(300), // Seconds between readings
  alertThresholds: jsonb("alert_thresholds"), // Threshold values for alerts
  installationDate: timestamp("installation_date").defaultNow(),
  maintenanceSchedule: jsonb("maintenance_schedule"),
  createdAt: timestamp("created_at").defaultNow()
});

export const iotsensordata = pgTable("iot_sensor_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  sensorType: varchar("sensor_type", { length: 50 }).notNull(), // soil_moisture, temperature, humidity, ph, light
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 20 }), // celsius, fahrenheit, %, ppm
  quality: varchar("quality", { length: 20 }).default('good'), // good, warning, error
  rawData: jsonb("raw_data"), // Full sensor payload
  processedData: jsonb("processed_data"), // AI-processed insights
  timestamp: timestamp("timestamp").defaultNow()
});

// Export insert schemas
export const insertMicroclimatezoneSchema = createInsertSchema(microclimatezones);
export const insertPlantconnectionSchema = createInsertSchema(plantconnections);
export const insertAiinsightSchema = createInsertSchema(aiinsights);
export const insertGardenblueprintSchema = createInsertSchema(gardenblueprints);
export const insertGardencommunitySchema = createInsertSchema(gardencommunity);
export const insertCommunityinteractionSchema = createInsertSchema(communityinteractions);
export const insertGardenanalyticsSchema = createInsertSchema(gardenanalytics);
export const insertIotdeviceSchema = createInsertSchema(iotdevices);
export const insertIotsensordataSchema = createInsertSchema(iotsensordata);

// Export types
export type Microclimatezone = typeof microclimatezones.$inferSelect;
export type InsertMicroclimatezone = z.infer<typeof insertMicroclimatezoneSchema>;
export type Plantconnection = typeof plantconnections.$inferSelect;
export type InsertPlantconnection = z.infer<typeof insertPlantconnectionSchema>;
export type Aiinsight = typeof aiinsights.$inferSelect;
export type InsertAiinsight = z.infer<typeof insertAiinsightSchema>;
export type Gardenblueprint = typeof gardenblueprints.$inferSelect;
export type InsertGardenblueprint = z.infer<typeof insertGardenblueprintSchema>;
export type Gardencommunity = typeof gardencommunity.$inferSelect;
export type InsertGardencommunity = z.infer<typeof insertGardencommunitySchema>;
export type Communityinteraction = typeof communityinteractions.$inferSelect;
export type InsertCommunityinteraction = z.infer<typeof insertCommunityinteractionSchema>;
export type Gardenanalytics = typeof gardenanalytics.$inferSelect;
export type InsertGardenanalytics = z.infer<typeof insertGardenanalyticsSchema>;
export type Iotdevice = typeof iotdevices.$inferSelect;
export type InsertIotdevice = z.infer<typeof insertIotdeviceSchema>;
export type Iotsensordata = typeof iotsensordata.$inferSelect;
export type InsertIotsensordata = z.infer<typeof insertIotsensordataSchema>;