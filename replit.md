# GreenLens - AI Plant Identification & Care Platform

## Overview

GreenLens is a production-grade web application that leverages AI technology to identify plants through photo uploads and provide comprehensive care recommendations. The platform combines multiple AI services and plant databases to deliver accurate species identification, personalized care plans, disease diagnosis, and generates detailed PDF reports for users to track their plant collection.

## Recent Updates (August 2025)

### E-commerce Platform Integration (August 16, 2025)
- **Complete E-commerce System**: Integrated full-featured gardening tools shop with product catalog, shopping cart, and order management
- **Database Schema**: Added products, cart_items, orders, order_items, categories, and shipping_rates tables
- **Navigation Integration**: Added shopping cart button with item badge and shop link to main navigation
- **Sample Product Catalog**: Populated shop with 6 essential gardening tools and supplies
- **PayPal Payment Ready**: Payment infrastructure prepared for PayPal integration (API keys needed)
- **Guest Cart Support**: Anonymous users can add items to cart using session-based storage

### Mobile Camera Functionality (August 16, 2025)
- **Direct Camera Capture**: Mobile users can now take photos directly within the app using device camera
- **Three-Slot Upload Interface**: Restored dedicated 3-slot image upload layout for optimal user experience
- **Camera Controls**: Front/back camera switching and intuitive capture interface per slot
- **File Restrictions**: Strict JPEG/PNG only format with 100KB maximum file size per image
- **Auto-Cleanup System**: Automatic image deletion from memory after successful identification to prevent system crashes
- **Enhanced Validation**: Client and server-side file type and size validation for system stability

### Custom Authentication System Implementation (August 16, 2025)
- **Complete Auth Overhaul**: Replaced Replit Auth with custom email/password authentication system
- **Registration Template**: Implemented comprehensive registration form with name, location, email, password fields
- **Admin Controls**: Added admin-only user management dashboard with user status controls
- **Database Schema Updates**: Enhanced users table with admin flags, location, and authentication fields
- **Session Management**: Secure session-based authentication with PostgreSQL storage
- **Password Security**: Implemented bcrypt-based password hashing and validation
- **Auth Routes Integration**: Updated all protected routes to use custom authentication middleware

### UI/UX Redesign (August 16, 2025)
- **Complete Banner Overhaul**: Restored banner image with overlay text "Identify Any Plant with GreenLens-Powered Precision"
- **Green Color Theme**: Applied light and dark green color scheme to buttons and image upload areas
- **Three-Slot Upload Interface**: Maintained dedicated 3-slot image upload layout for optimal user experience
- **Authentication Gate**: Plant analysis now requires user login with clear notice under analyze button
- **Complete Section Restoration**: Added back PoweredBySection, GardeningToolsSection, MyGardenSection, and InArticleAd
- **Enhanced Visual Hierarchy**: Consistent green branding across all interactive elements

### Free Tier System
- **3 Free Identifications**: New users get 3 free plant identifications
- **7-Day Validity**: Free tier expires after 7 days from first use
- **Usage Tracking**: Database tracks free tier usage with timestamps
- **Automatic Upgrade Prompts**: Smart messaging when limits are reached

### Multilingual Plant Names
- **12 Language Support**: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, Russian
- **Localized Plant Names**: Users see plant names in their preferred language
- **Scientific Name Display**: Always shows scientific names alongside common names
- **Regional Variations**: Support for regional name variations

### Enhanced Features
- **Plant Health Monitoring**: Dedicated health check endpoint for existing plants
- **Language Preferences**: User-configurable language settings
- **Care Tips API**: Detailed care information extraction
- **Feature Showcase Page**: Comprehensive overview of all platform capabilities
- **Free Tier Status Dashboard**: Real-time tracking of remaining uses and validity

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18 with TypeScript**: Modern component-based architecture using functional components and hooks
- **Wouter**: Lightweight client-side routing solution replacing traditional React Router
- **TanStack Query**: Server state management with caching, background updates, and error handling
- **shadcn/ui + Tailwind CSS**: Consistent design system with utility-first styling
- **React Hook Form**: Form handling with validation and performance optimization
- **Vite**: Fast development server and build tool with hot module replacement

### Backend Architecture
- **Express.js with TypeScript**: RESTful API server with type safety
- **Custom Authentication**: Email/password based auth with bcrypt hashing and session management
- **Drizzle ORM**: Type-safe database queries with PostgreSQL
- **Service-oriented architecture**: Modular services for external API integrations
- **Multer**: File upload handling for plant images (up to 3 images, 10MB limit)
- **Admin Management**: Role-based access control with admin-only endpoints

### Database Design
- **PostgreSQL with Neon**: Cloud-hosted database with connection pooling
- **Core entities**: Users, Subscriptions, PlantResults, BlogPosts, CatalogCache, Sessions
- **Authentication Schema**: Users table with email, password hash, admin flags, and location
- **Free Tier Tracking**: User table includes freeTierUsed, freeTierStartedAt, preferredLanguage fields
- **Enhanced Plant Data**: PlantResults includes isFreeIdentification flag and localized species information
- **Admin Controls**: User management with isAdmin, isActive, emailVerified flags
- **Caching strategy**: TTL-based catalog cache to reduce external API calls
- **Data relationships**: User → Subscription (1:1), User → PlantResults (1:many)

### AI Integration Pipeline
- **Image Quality Assessment**: Google Gemini AI validates image suitability before processing
- **Plant Identification**: Plant.id API v3 for species identification and health assessment
- **Care Plan Generation**: Gemini AI synthesizes personalized care recommendations
- **Disease Detection**: Plant.id health assessment with Gemini-powered treatment advice

### Payment Processing
- **Multi-provider support**: Stripe, Razorpay, Cashfree with adapter pattern
- **Lazy loading**: Payment providers loaded only when needed to prevent startup errors
- **Subscription management**: Recurring billing with webhook handling for status updates
- **Plan tiers**: Free (3 identifications/7 days), Pro ($9/month), Premium ($19/month) with different feature sets

### Content Management
- **Markdown-based blog system**: Simple CMS for plant care articles and tips
- **PDF generation**: Puppeteer-based report creation with custom templates
- **File storage**: Google Cloud Storage for uploaded images and generated PDFs
- **Multilingual Content**: PlantNamesService provides localized plant names
- **Feature Documentation**: Comprehensive feature showcase with interactive components

## External Dependencies

### AI and Machine Learning Services
- **Plant.id API v3**: Primary plant identification and health assessment service
- **Google Gemini AI**: Care plan synthesis, image quality assessment, and disease advice generation
- **Structured output schemas**: Ensures consistent JSON responses from AI services

### Plant Information APIs
- **Perenual API**: Primary plant catalog for species information and care guidelines
- **Trefle API**: Fallback plant database for comprehensive species coverage
- **Caching layer**: Reduces API calls and improves response times

### Payment Providers
- **Stripe**: Primary payment processor for US/EU markets with subscription management
- **Razorpay**: Indian market payment processing with local payment methods
- **Cashfree**: Additional Indian payment gateway for redundancy

### Infrastructure Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Google Cloud Storage**: Scalable file storage for images and PDF reports
- **Replit Authentication**: OpenID Connect integration for user management
- **Puppeteer**: Headless browser for PDF report generation

### Development and Deployment
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast production bundling for server-side code
- **Vite**: Development server with HMR and optimized production builds
- **Drizzle Kit**: Database migration and schema management tools