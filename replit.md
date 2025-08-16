# GreenLens - AI Plant Identification & Care Platform

## Overview

GreenLens is a production-grade web application that leverages AI technology to identify plants through photo uploads and provide comprehensive care recommendations. The platform combines multiple AI services and plant databases to deliver accurate species identification, personalized care plans, disease diagnosis, and generates detailed PDF reports for users to track their plant collection.

## Recent Updates (August 2025)

### UI/UX Redesign (August 16, 2025)
- **Enhanced Banner Transparency**: Increased background image opacity for better visual appeal
- **Streamlined Banner Interface**: Simplified banner text from "AI Plant Identification" to "Quick Upload"
- **Redesigned Plant Identification Section**: Complete overhaul with modern gradient backgrounds, improved layout, and enhanced user experience
- **Visual Benefits Showcase**: Added feature cards highlighting 99% accuracy, personalized care guides, and instant results
- **Multiple Image Upload Emphasis**: Clear messaging encouraging 2-3 photos for optimal accuracy

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
- **Drizzle ORM**: Type-safe database queries with PostgreSQL
- **Service-oriented architecture**: Modular services for external API integrations
- **Multer**: File upload handling for plant images (up to 3 images, 10MB limit)
- **Session-based authentication**: Secure user sessions with PostgreSQL storage

### Database Design
- **PostgreSQL with Neon**: Cloud-hosted database with connection pooling
- **Core entities**: Users, Subscriptions, PlantResults, BlogPosts, CatalogCache, Sessions
- **Free Tier Tracking**: User table includes freeTierUsed, freeTierStartedAt, preferredLanguage fields
- **Enhanced Plant Data**: PlantResults includes isFreeIdentification flag and localized species information
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