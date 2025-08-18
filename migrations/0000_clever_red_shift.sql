CREATE TABLE "admin_roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "admin_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar NOT NULL,
	"setting_value" text,
	"description" text,
	"last_updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "admin_two_factor" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"secret" varchar NOT NULL,
	"backup_codes" jsonb DEFAULT '[]',
	"is_enabled" boolean DEFAULT false,
	"last_used" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar NOT NULL,
	"entity_type" varchar,
	"entity_id" varchar,
	"user_id" varchar,
	"properties" jsonb DEFAULT '{}',
	"timestamp" timestamp DEFAULT now(),
	"session_id" varchar,
	"ip_address" varchar,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "author_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"bio" text,
	"profile_image_url" varchar,
	"website_url" varchar,
	"social_links" jsonb,
	"expertise" text[],
	"publications" text[],
	"qualifications" text[],
	"experience" text,
	"has_publishing_experience" boolean DEFAULT false,
	"publishing_experience_details" text,
	"copyright_agreement" boolean DEFAULT false,
	"quality_standards_agreement" boolean DEFAULT false,
	"exclusivity_agreement" boolean DEFAULT false,
	"identity_document_url" varchar,
	"portfolio_document_url" varchar,
	"qualification_document_url" varchar,
	"bank_account_holder_name" varchar,
	"bank_account_number" varchar,
	"bank_name" varchar,
	"branch_name" varchar,
	"routing_number" varchar,
	"ifsc_code" varchar,
	"swift_code" varchar,
	"paypal_email" varchar,
	"stripe_account_id" varchar,
	"application_status" varchar DEFAULT 'pending',
	"admin_notes" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"can_publish" boolean DEFAULT false,
	"terms_accepted_at" timestamp,
	"privacy_policy_accepted_at" timestamp,
	"author_agreement_accepted_at" timestamp,
	"total_ebooks" integer DEFAULT 0,
	"total_sales" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT 0,
	"total_earnings" numeric(12, 2) DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"slug" varchar NOT NULL,
	"author_id" varchar,
	"category_id" varchar,
	"published" boolean DEFAULT false,
	"featured_image" varchar,
	"tags" text[],
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_post_id" varchar NOT NULL,
	"user_id" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brand_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"value" text,
	"category" varchar DEFAULT 'general' NOT NULL,
	"description" text,
	"data_type" varchar DEFAULT 'string' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brand_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar,
	"product_id" varchar NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "catalog_cache" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cache_key" varchar NOT NULL,
	"data" jsonb NOT NULL,
	"source" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "catalog_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"image" varchar,
	"parent_id" varchar,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "consultation_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"house_number" varchar,
	"building_name" varchar,
	"road_number" varchar,
	"colony" varchar,
	"area" varchar,
	"city" varchar NOT NULL,
	"state" varchar NOT NULL,
	"country" varchar NOT NULL,
	"pin_zip" varchar NOT NULL,
	"problem_description" text NOT NULL,
	"preferred_date" timestamp NOT NULL,
	"preferred_time_slot" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"assigned_expert_id" varchar,
	"amount" numeric(10, 2) DEFAULT 29.99,
	"currency" varchar(3) DEFAULT 'USD',
	"payment_status" varchar DEFAULT 'pending',
	"payment_intent_id" varchar,
	"consultation_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ebook_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"parent_id" varchar,
	"icon" varchar,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ebook_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "ebook_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ebook_purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ebook_id" varchar NOT NULL,
	"buyer_id" varchar,
	"student_buyer_id" varchar,
	"buyer_email" varchar NOT NULL,
	"original_price" numeric(10, 2) NOT NULL,
	"student_discount" numeric(10, 2) DEFAULT '0',
	"platform_fee" numeric(10, 2) NOT NULL,
	"author_earnings" numeric(10, 2) NOT NULL,
	"final_price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"payment_status" varchar DEFAULT 'pending',
	"payment_provider" varchar,
	"payment_intent_id" varchar,
	"transaction_id" varchar,
	"download_password" varchar NOT NULL,
	"download_count" integer DEFAULT 0,
	"last_download_at" timestamp,
	"access_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ebook_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ebook_id" varchar NOT NULL,
	"reviewer_id" varchar,
	"student_reviewer_id" varchar,
	"rating" integer NOT NULL,
	"review_title" varchar,
	"review_content" text,
	"is_verified_purchase" boolean DEFAULT false,
	"is_approved" boolean DEFAULT true,
	"helpful_votes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ebooks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"author_id" varchar NOT NULL,
	"author_name" varchar NOT NULL,
	"isbn" varchar,
	"category" varchar NOT NULL,
	"subcategory" varchar,
	"language" varchar DEFAULT 'en',
	"page_count" integer,
	"publication_date" timestamp,
	"tags" text[],
	"base_price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"cover_image_url" varchar NOT NULL,
	"preview_file_url" varchar,
	"full_file_url" varchar NOT NULL,
	"file_size" integer,
	"file_format" varchar NOT NULL,
	"copyright_status" varchar NOT NULL,
	"publishing_rights" boolean DEFAULT false,
	"content_rating" varchar,
	"status" varchar DEFAULT 'pending',
	"admin_notes" text,
	"approved_by" varchar,
	"approved_at" timestamp,
	"download_count" integer DEFAULT 0,
	"rating_average" numeric(3, 2),
	"rating_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"allowed_countries" jsonb DEFAULT '[]',
	"restricted_countries" jsonb DEFAULT '[]',
	"global_access" boolean DEFAULT true,
	"region_restrictions" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ebooks_isbn_unique" UNIQUE("isbn")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"employee_id" varchar NOT NULL,
	"department" varchar NOT NULL,
	"position" varchar NOT NULL,
	"role_id" varchar,
	"salary" numeric(10, 2),
	"hire_date" date NOT NULL,
	"termination_date" date,
	"is_active" boolean DEFAULT true,
	"manager_id" varchar,
	"phone_number" varchar,
	"emergency_contact" jsonb,
	"skills" jsonb DEFAULT '[]',
	"certifications" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "expert_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar NOT NULL,
	"middle_name" varchar,
	"last_name" varchar NOT NULL,
	"age" integer NOT NULL,
	"gender" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"house_number" varchar NOT NULL,
	"building_name" varchar,
	"road_name" varchar NOT NULL,
	"colony_name" varchar,
	"area_name" varchar NOT NULL,
	"city_name" varchar NOT NULL,
	"state_name" varchar NOT NULL,
	"country_name" varchar NOT NULL,
	"postal_code" varchar,
	"qualifications" jsonb NOT NULL,
	"specialization" varchar,
	"experience" integer,
	"profile_photo_path" varchar,
	"qualification_documents" text[],
	"bank_account_holder_name" varchar,
	"bank_account_number" varchar,
	"bank_name" varchar,
	"branch_name" varchar,
	"ifsc_code" varchar,
	"swift_code" varchar,
	"paypal_email" varchar,
	"skydo_details" text,
	"application_status" varchar DEFAULT 'pending',
	"review_notes" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"terms_accepted" boolean DEFAULT false,
	"terms_accepted_at" timestamp,
	"available_hours" varchar,
	"time_zone" varchar DEFAULT 'UTC',
	"consultation_rate" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "expert_applications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "expert_consultations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"expert_id" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"description" text NOT NULL,
	"plant_images" text[],
	"session_type" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"scheduled_at" timestamp,
	"duration" integer,
	"user_rating" integer,
	"user_feedback" text,
	"expert_notes" text,
	"amount" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"payment_status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "experts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" varchar NOT NULL,
	"expert_code" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_available" boolean DEFAULT true,
	"total_consultations" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT 0,
	"response_time" integer,
	"display_name" varchar NOT NULL,
	"specialization" varchar,
	"bio" text,
	"profile_image_path" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "experts_expert_code_unique" UNIQUE("expert_code")
);
--> statement-breakpoint
CREATE TABLE "gardening_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_title" varchar NOT NULL,
	"section_description" text,
	"tools" jsonb NOT NULL,
	"soil_preparation" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "moderation_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"moderator_id" varchar,
	"reason" text,
	"notes" text,
	"automated_flags" jsonb DEFAULT '[]',
	"priority" varchar DEFAULT 'normal',
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"product_name" varchar NOT NULL,
	"product_image" varchar,
	"sku" varchar,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar NOT NULL,
	"user_id" varchar,
	"guest_email" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"shipping_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"payment_status" varchar DEFAULT 'pending',
	"payment_provider" varchar,
	"payment_intent_id" varchar,
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"notes" text,
	"tracking_number" varchar,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plant_result_id" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"payment_provider" varchar NOT NULL,
	"transaction_id" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"feature_type" varchar NOT NULL,
	"payment_data" jsonb,
	"analysis_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "plant_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"image_urls" text[],
	"species" text,
	"common_name" text,
	"confidence" numeric(5, 4),
	"health_status" varchar(50),
	"disease_detected" boolean,
	"care_instructions" text,
	"analysis_data" jsonb,
	"health_assessment" jsonb,
	"disease_info" jsonb,
	"pdf_report_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"is_free_identification" boolean DEFAULT false,
	"detected_language" varchar(10) DEFAULT 'en',
	"localized_species" jsonb
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_key" varchar NOT NULL,
	"setting_value" text NOT NULL,
	"setting_type" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"is_editable" boolean DEFAULT true,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "pricing_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"billing_interval" varchar DEFAULT 'monthly',
	"description" text,
	"features" jsonb NOT NULL,
	"is_popular" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"stripe_price_id" varchar,
	"razorpay_plan_id" varchar,
	"cashfree_plan_id" varchar,
	"last_updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pricing_plans_plan_id_unique" UNIQUE("plan_id")
);
--> statement-breakpoint
CREATE TABLE "pricing_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_name" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"description" text,
	"is_active" boolean DEFAULT true,
	"last_updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pricing_settings_feature_name_unique" UNIQUE("feature_name")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"short_description" varchar,
	"category" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"sku" varchar,
	"stock_quantity" integer DEFAULT 0,
	"track_quantity" boolean DEFAULT true,
	"weight" numeric(8, 2),
	"dimensions" jsonb,
	"images" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"features" jsonb DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"meta_title" varchar,
	"meta_description" text,
	"allowed_countries" jsonb DEFAULT '[]',
	"restricted_countries" jsonb DEFAULT '[]',
	"global_access" boolean DEFAULT false,
	"region_restrictions" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"location" varchar,
	"platform" varchar DEFAULT 'web',
	"is_published" boolean DEFAULT false,
	"moderator_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"rate" numeric(10, 2) NOT NULL,
	"free_shipping_threshold" numeric(10, 2),
	"estimated_days" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_media_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar NOT NULL,
	"metric" varchar NOT NULL,
	"value" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_media_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"hashtags" text,
	"scheduled_for" timestamp,
	"published_at" timestamp,
	"status" varchar DEFAULT 'draft',
	"external_post_id" varchar,
	"engagement_stats" jsonb,
	"error_message" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_media_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facebook_page_id" varchar,
	"facebook_access_token" text,
	"twitter_api_key" text,
	"twitter_api_secret" text,
	"twitter_access_token" text,
	"twitter_access_token_secret" text,
	"instagram_user_id" varchar,
	"instagram_access_token" text,
	"whatsapp_business_number" varchar,
	"whatsapp_access_token" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"university_name" varchar NOT NULL,
	"degree_program" varchar NOT NULL,
	"year_of_study" integer NOT NULL,
	"expected_graduation_date" date NOT NULL,
	"university_email" varchar NOT NULL,
	"phone_number" varchar,
	"emergency_contact_name" varchar,
	"emergency_contact_phone" varchar,
	"current_address" jsonb,
	"permanent_address" jsonb,
	"student_id_document_url" varchar,
	"enrollment_certificate_url" varchar,
	"transcript_url" varchar,
	"verification_status" varchar DEFAULT 'pending',
	"submitted_at" timestamp DEFAULT now(),
	"verified_at" timestamp,
	"expires_at" timestamp,
	"reviewed_by" varchar,
	"admin_notes" text,
	"discount_percentage" numeric(5, 2) DEFAULT '15.00',
	"access_level" varchar DEFAULT 'student',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"country" varchar NOT NULL,
	"password" varchar NOT NULL,
	"university_name" varchar NOT NULL,
	"institute_name" varchar,
	"academic_branch" varchar NOT NULL,
	"year_of_joining" integer NOT NULL,
	"current_academic_year" varchar NOT NULL,
	"academic_status" varchar NOT NULL,
	"subjects_studying" text[],
	"expected_graduation" varchar,
	"student_id" varchar,
	"student_document_url" varchar NOT NULL,
	"document_type" varchar NOT NULL,
	"verification_status" varchar DEFAULT 'pending',
	"admin_notes" text,
	"verified_by" varchar,
	"verified_at" timestamp,
	"is_active" boolean DEFAULT true,
	"is_converted" boolean DEFAULT false,
	"converted_user_id" varchar,
	"conversion_date" timestamp,
	"admin_extension_count" integer DEFAULT 0,
	"last_extension_date" timestamp,
	"extension_expiry_date" timestamp,
	"conversion_scheduled_for" timestamp,
	"discount_applied" boolean DEFAULT true,
	"graduation_completed" boolean DEFAULT false,
	"graduation_completion_date" timestamp,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subscription_reminders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" varchar NOT NULL,
	"reminder_type" varchar NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent" boolean DEFAULT false,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_type" varchar NOT NULL,
	"status" varchar NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"stripe_subscription_id" varchar,
	"razorpay_subscription_id" varchar,
	"cashfree_subscription_id" varchar,
	"paypal_subscription_id" varchar,
	"preferred_provider" varchar,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"activity_type" varchar NOT NULL,
	"activity_data" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"referrer" varchar,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"plant_care_reminders" boolean DEFAULT true,
	"weekly_digest" boolean DEFAULT true,
	"marketing_emails" boolean DEFAULT false,
	"theme" varchar(20) DEFAULT 'light',
	"measurement_unit" varchar(10) DEFAULT 'metric',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"location" varchar,
	"password" varchar NOT NULL,
	"profile_image_url" varchar,
	"country" varchar,
	"is_admin" boolean DEFAULT false,
	"is_super_admin" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_author" boolean DEFAULT false,
	"author_verified" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"two_factor_enabled" boolean DEFAULT false,
	"last_login_at" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"free_tier_used" integer DEFAULT 0,
	"free_tier_started_at" timestamp,
	"preferred_language" varchar(10) DEFAULT 'en',
	"timezone" varchar(50) DEFAULT 'UTC',
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_settings" ADD CONSTRAINT "admin_settings_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_two_factor" ADD CONSTRAINT "admin_two_factor_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "author_profiles" ADD CONSTRAINT "author_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "author_profiles" ADD CONSTRAINT "author_profiles_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_assigned_expert_id_experts_id_fk" FOREIGN KEY ("assigned_expert_id") REFERENCES "public"."experts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_categories" ADD CONSTRAINT "ebook_categories_parent_id_ebook_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ebook_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_purchases" ADD CONSTRAINT "ebook_purchases_ebook_id_ebooks_id_fk" FOREIGN KEY ("ebook_id") REFERENCES "public"."ebooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_purchases" ADD CONSTRAINT "ebook_purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_purchases" ADD CONSTRAINT "ebook_purchases_student_buyer_id_student_users_id_fk" FOREIGN KEY ("student_buyer_id") REFERENCES "public"."student_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_reviews" ADD CONSTRAINT "ebook_reviews_ebook_id_ebooks_id_fk" FOREIGN KEY ("ebook_id") REFERENCES "public"."ebooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_reviews" ADD CONSTRAINT "ebook_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebook_reviews" ADD CONSTRAINT "ebook_reviews_student_reviewer_id_student_users_id_fk" FOREIGN KEY ("student_reviewer_id") REFERENCES "public"."student_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebooks" ADD CONSTRAINT "ebooks_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebooks" ADD CONSTRAINT "ebooks_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_applications" ADD CONSTRAINT "expert_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_consultations" ADD CONSTRAINT "expert_consultations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_consultations" ADD CONSTRAINT "expert_consultations_expert_id_experts_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."experts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experts" ADD CONSTRAINT "experts_application_id_expert_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."expert_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gardening_content" ADD CONSTRAINT "gardening_content_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_plant_result_id_plant_results_id_fk" FOREIGN KEY ("plant_result_id") REFERENCES "public"."plant_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_results" ADD CONSTRAINT "plant_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_settings" ADD CONSTRAINT "pricing_settings_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_users" ADD CONSTRAINT "student_users_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_users" ADD CONSTRAINT "student_users_converted_user_id_users_id_fk" FOREIGN KEY ("converted_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_reminders" ADD CONSTRAINT "subscription_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_reminders" ADD CONSTRAINT "subscription_reminders_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");