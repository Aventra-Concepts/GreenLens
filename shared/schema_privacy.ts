import { sql } from 'drizzle-orm';
import {
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./schema";

// Privacy Rights Requests - CCPA/GDPR Compliance
export const privacyRequests = pgTable("privacy_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  fullName: varchar("full_name").notNull(),
  requestType: varchar("request_type").notNull(), // 'DATA_ACCESS', 'DATA_DELETION', 'DATA_EXPORT', 'OPT_OUT'
  reason: text("reason"),
  verificationToken: varchar("verification_token").notNull().unique(),
  status: varchar("status").default('PENDING_VERIFICATION'), // 'PENDING_VERIFICATION', 'VERIFIED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'EXPIRED'
  expiresAt: timestamp("expires_at").notNull(),
  processedAt: timestamp("processed_at"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  exportFormat: varchar("export_format"), // 'JSON', 'CSV', 'PDF' for export requests
  optOutTypes: jsonb("opt_out_types").default("[]"), // Array of opt-out types for opt-out requests
  adminNotes: text("admin_notes"), // Internal admin notes
  processedBy: varchar("processed_by").references(() => users.id), // Admin who processed the request
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PrivacyRequest = typeof privacyRequests.$inferSelect;
export type InsertPrivacyRequest = typeof privacyRequests.$inferInsert;

// Privacy Request schema
export const insertPrivacyRequestSchema = createInsertSchema(privacyRequests).omit({
  id: true,
  processedAt: true,
  processedBy: true,
  createdAt: true,
  updatedAt: true,
});