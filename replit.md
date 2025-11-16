# GreenLens - AI Plant Identification & Care Platform

## Overview
GreenLens is a production-grade web application for AI-powered plant identification and comprehensive care recommendations. It enables users to identify plants via photo upload, receive personalized care plans, get disease diagnoses, and generate detailed PDF reports. The platform also features an e-commerce platform for digital and physical gardening products, an expert consultation system, automated blog generation, and a robust user management system with multi-currency payment support. The subscription model uses a **2-tier system (Free and Pro plans)**, with Pro plan features fully editable by admins through the admin dashboard. The project aims to provide a comprehensive and user-friendly experience for plant enthusiasts.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18 and TypeScript**, using functional components and hooks. **Wouter** handles routing, and **TanStack Query** manages server state. The design system uses **shadcn/ui + Tailwind CSS** for consistent styling with a light and dark green theme. **React Hook Form** is used for form management, and **Vite** for development and builds. Key features include optimized image loading, virtualized lists, debounced search, and a dedicated 3-slot image upload interface. UI/UX emphasizes a professional appearance with refined typography, smaller components, and improved spacing. The My Garden dashboard has been redesigned with 8 tabbed sections:
- **Overview**: Dashboard stats and plant overview
- **Plant Diary**: Individual plant management and care tracking
- **Smart Assistant**: AI-powered features (Disease & Pest Detection, Nutrient Deficiency Checker, Expert Q&A, Companion Planting, Variety Recommendations)
- **Environment & Automation**: Weather Dashboard, Microclimate Tracking, Irrigation Scheduling, Moon Phase Calendar
- **Planning & Layout**: Garden Map with bed/container management, Crop Rotation Tracker with family-based rotation warnings, Planting Schedule Generator with frost date calculations
- **Inventory & Costs**: Seeds Inventory with viability tracking, Supplies & Materials with low-stock alerts, Expenses tracking, Harvest Logs with yield/revenue
- **Analytics**: Dynamic data visualizations using Recharts (watering frequency vs health, task heatmaps, harvest analysis, variety success rates)
- **Social & Sharing**: Care sheet export, shareable plant links, Ask an Expert ticket system with priority for Pro users ($4.99 discounted vs $9.99 regular), weekly email digest, **WhatsApp sharing for Pro users only** (sends to registered phone number)
- **Calendar**: Care schedules and reminders (coming soon)
- **Reports**: Analytics and PDF generation (coming soon)

### Backend Architecture
The backend is an **Express.js with TypeScript** RESTful API server. It features a custom email/password authentication system with bcrypt and session management. **Drizzle ORM** manages PostgreSQL queries. A service-oriented architecture is used for modularity. **Multer** handles file uploads. Admin management includes role-based access control and a dashboard for user and content management. An automated AI-powered blog generation system is implemented. Performance features include compression middleware, HTTP caching, API rate limiting, and memory caching. An HR management system with job postings and application management is also integrated.

### Database Design
**PostgreSQL with Neon** serves as the cloud-hosted database. Core entities include Users, Subscriptions, PlantResults, BlogPosts, CatalogCache, and Sessions. The Users table stores authentication details, admin flags, location, and free tier usage. PlantResults stores localized species information. A TTL-based caching strategy is implemented for the plant catalog. New tables support e-commerce (products, cart_items, orders), consultations (consultation_requests), multi-currency transactions, environment automation (microclimate_logs), garden planning (garden_beds, bed_plant_assignments, crop_rotation_history, planting_schedules), and inventory management (seeds_inventory with viability tracking, supplies_inventory with low-stock alerts, garden_expenses for cost tracking, harvest_logs for yield/revenue). User profiles include `preferredCurrency`, `timezone`, and `region` for localization, optimized for USA users.

### AI Integration Pipeline
The AI pipeline utilizes the **OpenAI API** for image quality assessment, care plan synthesis, disease treatment advice, and structured content generation. **Plant.id API v3** is used for primary species identification and health assessment. Structured output schemas ensure consistent JSON responses. The system includes intelligent quota management, graceful error handling for API quotas, and comprehensive error sanitization.

### Amazon Affiliate Integration
A comprehensive **Amazon Affiliate marketplace** is integrated, supporting multi-region (US, India, UK) product searches, curated categories, market-specific pricing, and automated affiliate link generation. It includes API fallbacks and FTC disclosure compliance.

### Content Management
Content management includes a Markdown-based blog system, **Puppeteer** for PDF report generation, and **Google Cloud Storage** for uploaded images and PDFs. A `PlantNamesService` provides multilingual plant names.

## External Dependencies

### AI and Machine Learning Services
- **Plant.id API v3**: Plant identification and health assessment.
- **OpenAI API**: AI services for content generation, analysis, and recommendations.

### Plant Information APIs
- **Perenual API**: Primary plant catalog.
- **Trefle API**: Fallback plant database.

### Weather and Environmental APIs
- **Open-Meteo API**: Free weather forecasting service (10,000 calls/day, no API key required).
- **Nominatim (OpenStreetMap)**: Free geocoding service for location coordinates.

### Payment Providers
- **Stripe**: Primary payment processor.
- **Razorpay**: Indian market payment processing.
- **Cashfree**: Additional Indian payment gateway.

### Subscription System
- **2-Tier Pricing Model**: Free and Pro plans only
- **Free Plan**: 3 plant identifications, basic care recommendations, community access
- **Pro Plan**: Unlimited identifications, Pro My Garden dashboard access, priority expert consultation ($4.99 vs $9.99 regular), health assessment, PDF reports
- **Admin-Editable Features**: Pro plan features are fully configurable via Admin Dashboard at `/admin` → "Pricing Plans" tab

### Communication Services
- **Twilio WhatsApp API**: WhatsApp messaging for Pro users (sends to verified phone number only). Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER.

### Infrastructure Services
- **Neon PostgreSQL**: Serverless database.
- **Google Cloud Storage**: Scalable file storage.
- **Puppeteer**: Headless browser for PDF generation.