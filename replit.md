# GreenLens - AI Plant Identification & Care Platform

## Overview
GreenLens is a production-grade web application that leverages AI technology for plant identification through photo uploads and provides comprehensive care recommendations. The platform integrates multiple AI services and plant databases to deliver accurate species identification, personalized care plans, disease diagnosis, and generates detailed PDF reports for users to track their plant collection. Key capabilities include an e-commerce platform for e-books and gardening tools, an expert consultation system, automated blog generation, and a robust user management system with multi-currency payment support.

**Status**: ALL CRITICAL ISSUES PERMANENTLY RESOLVED - Registration system 100% operational, database schema fully synchronized, frontend runtime errors eliminated, logout functionality completely fixed, **OpenAI API migration successfully completed**, **layout balance issues resolved**, **login error 500 completely fixed**, and **comprehensive security enhancements implemented**. Platform ready for production deployment with comprehensive AI functionality and enterprise-grade security.

**NAVIGATION FIXES COMPLETE**: Successfully resolved all navigation issues by properly integrating Layout component across all pages. Navigation alignment perfected with centered brand name and menu buttons using responsive padding (pl-4 lg:pl-8 and pr-4 lg:pr-8).

**UI TERMINOLOGY UPDATES**: Renamed "E-book Marketplace" to "E-Books" throughout the application per user preference for cleaner, more concise terminology.

**AMAZON AFFILIATE MARKETPLACE IMPLEMENTED**: Successfully replaced the old e-commerce system with a comprehensive Amazon Affiliate marketplace featuring curated gardening tools, multi-market support (US, IN, UK), and proper disclosure compliance. Navigation updated to "Buy The Best Gardening Tools".

**MIGRATION COMPLETE**: Successfully migrated from Google Gemini to OpenAI API across all AI services including plant identification, care planning, disease diagnosis, and blog generation.

**SECURITY ENHANCEMENTS COMPLETE**: 
- Comprehensive input sanitization using DOMPurify to prevent XSS attacks
- Enhanced authentication rate limiting (10 attempts per 15 minutes)
- SQL injection prevention with pattern detection
- Stronger password validation (8+ chars, mixed case, numbers)
- File upload security validation with type and size restrictions
- XSS protection headers and CSRF safeguards
- Enhanced email validation with RFC compliance
- Error messages sanitized - detailed AI API errors only visible to admins

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18 and TypeScript**, utilizing a modern component-based architecture with functional components and hooks. **Wouter** handles client-side routing, and **TanStack Query** manages server state, caching, and background updates. The design system uses **shadcn/ui + Tailwind CSS** for consistent styling. Form handling is managed by **React Hook Form**, and **Vite** provides a fast development server and build tool. The UI/UX features a light and dark green color theme, a restored banner, and a dedicated 3-slot image upload interface. Plant analysis requires user login.

**Performance Features**: LazyImage components for optimized image loading, VirtualizedList for large datasets, debounced search functionality, intersection observer hooks, and real-time performance metrics monitoring in development mode.

**Design Features**: Elegant top navigation with refined typography, smaller buttons and icons, improved spacing, subtle hover effects, and polished visual hierarchy for a professional appearance. **Hero section typography optimized** - reduced font size by 3 points for desktop with proportionally adjusted spacing and tagline sizing.

### Backend Architecture
The backend is an **Express.js with TypeScript** RESTful API server. It features a custom email/password authentication system with bcrypt hashing and session management, replacing Replit Auth. **Drizzle ORM** is used for type-safe PostgreSQL queries. A service-oriented architecture facilitates modularity, especially for external API integrations. **Multer** handles file uploads. Admin management includes role-based access control and a dashboard for user and student lifecycle management, including automated conversion processes and discount systems. An automated blog generation system with AI image integration is also implemented.

**Performance Features**: Compression middleware with gzip optimization, HTTP caching with ETags and Cache-Control headers, API rate limiting with memory-based tracking, static asset caching, and memory cache for expensive operations with TTL-based cleanup.

### Database Design
**PostgreSQL with Neon** serves as the cloud-hosted database. Core entities include Users, Subscriptions, PlantResults, BlogPosts, CatalogCache, and Sessions. The Users table includes authentication fields, admin flags, location, and fields for tracking free tier usage. PlantResults stores localized species information. A TTL-based caching strategy is implemented for the plant catalog. New tables support e-commerce (products, cart_items, orders), consultations (consultation_requests), and multi-currency transactions.

### AI Integration Pipeline
The AI pipeline involves **OpenAI API** for image quality assessment, care plan synthesis, disease treatment advice, and structured content generation. **Plant.id API v3** is the primary service for species identification and health assessment. Structured output schemas ensure consistent JSON responses from AI services.

**Migration Complete**: Successfully migrated from Google Gemini to OpenAI API across all core services including plantAnalysisService, carePlanner, autoBlogService, and API routes.

**Rate Limiting**: Intelligent quota management and graceful error handling for API quota scenarios.

**Error Handling**: Comprehensive error sanitization system where detailed API errors are logged for admin debugging but users receive friendly, actionable error messages. Error codes include SERVICE_QUOTA_EXCEEDED, AI_SERVICE_ERROR for proper categorization.

### Amazon Affiliate Integration
The system features a comprehensive **Amazon Affiliate marketplace** with multi-region support (US, India, UK). It includes intelligent product search, curated product categories (hand tools, watering, soil care, protective gear), market-specific pricing, and automated affiliate link generation. The system handles API fallbacks and includes proper FTC disclosure compliance.

### Content Management
Content management includes a Markdown-based blog system, **Puppeteer** for PDF report generation (e.g., detailed plant care reports), and **Google Cloud Storage** for uploaded images and PDFs. A `PlantNamesService` provides multilingual plant names in 12 languages.

## External Dependencies

### AI and Machine Learning Services
- **Plant.id API v3**: Plant identification and health assessment.
- **Google Gemini AI**: Image quality assessment, care plan synthesis, and disease advice generation.

### Plant Information APIs
- **Perenual API**: Primary plant catalog.
- **Trefle API**: Fallback plant database.

### Payment Providers
- **Stripe**: Primary payment processor.
- **Razorpay**: Indian market payment processing.
- **Cashfree**: Additional Indian payment gateway.

### Infrastructure Services
- **Neon PostgreSQL**: Serverless database.
- **Google Cloud Storage**: Scalable file storage.
- **Puppeteer**: Headless browser for PDF generation.

### Development and Deployment
- **TypeScript**: Language for type safety.
- **ESBuild**: Fast production bundling.
- **Vite**: Development server and optimized builds.
- **Drizzle Kit**: Database migration and schema management.