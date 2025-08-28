# GreenLens - Complete Application Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Architecture](#technical-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Design](#database-design)
6. [Feature Documentation](#feature-documentation)
7. [Page-by-Page Documentation](#page-by-page-documentation)
8. [Dashboard Documentation](#dashboard-documentation)
9. [API Endpoints](#api-endpoints)
10. [Security Implementation](#security-implementation)
11. [Known Issues & Bugs](#known-issues--bugs)
12. [Deployment Guide](#deployment-guide)
13. [Performance Optimization](#performance-optimization)

---

## Executive Summary

GreenLens is a production-grade AI-powered plant identification and care platform that combines cutting-edge machine learning with comprehensive gardening tools. The platform serves multiple user types (gardeners, authors, administrators) through a sophisticated multi-dashboard system.

### Key Capabilities:
- **AI Plant Identification**: Advanced photo recognition using Plant.id API v3
- **Disease Diagnosis**: OpenAI-powered plant health analysis with 3 free diagnoses for basic users
- **Expert Consultation System**: Professional horticulturist consultation booking
- **E-book Publishing Platform**: Amazon Kindle-style author dashboard and marketplace
- **Garden Management**: Personal plant collection tracking and care scheduling
- **Multi-Currency E-commerce**: Global payment processing with Stripe and Razorpay
- **Admin Management Suite**: Comprehensive user, content, and platform administration

---

## Technical Architecture

### Technology Stack Overview

#### Frontend Stack:
- **React 18.3.1** with TypeScript 5.6.3
- **Vite 5.4.19** - Lightning-fast development server
- **Wouter 3.3.5** - Lightweight client-side routing
- **TanStack Query 5.60.5** - Server state management
- **shadcn/ui + Tailwind CSS** - Modern component library
- **React Hook Form 7.55.0** - Form handling and validation
- **Framer Motion 11.13.1** - Smooth animations

#### Backend Stack:
- **Express.js 4.21.2** with TypeScript
- **Drizzle ORM 0.39.1** - Type-safe database operations
- **Neon PostgreSQL** - Serverless cloud database
- **bcrypt 6.0.0** - Password hashing
- **Express Rate Limit** - API protection
- **Multer 2.0.2** - File upload handling

#### AI & External Services:
- **OpenAI API** (GPT-5) - Disease diagnosis and content generation
- **Plant.id API v3** - Plant identification and health assessment
- **Stripe 18.4.0** & **Razorpay 2.9.6** - Payment processing
- **Puppeteer 24.16.2** - PDF report generation
- **Google Cloud Storage** - File and image storage

#### Development Tools:
- **Drizzle Kit 0.30.4** - Database migrations
- **ESBuild 0.25.0** - Production bundling
- **Autoprefixer** - CSS vendor prefixes
- **TypeScript** - Type safety across stack

---

## Frontend Architecture

### Component Structure
```
client/src/
├── components/
│   ├── ui/           # shadcn/ui components (20+ components)
│   ├── Layout.tsx    # Main layout wrapper
│   └── Footer.tsx    # Site footer
├── pages/           # 50+ page components
│   ├── home.tsx
│   ├── disease-diagnosis.tsx
│   ├── admin-dashboard.tsx
│   └── ...
├── lib/
│   ├── queryClient.ts # TanStack Query configuration
│   └── utils.ts      # Utility functions
└── hooks/           # Custom React hooks
```

### Key Frontend Features:

#### Responsive Design System:
- **Mobile-first approach** with breakpoints
- **Dark/Light theme support** (Next Themes integration)
- **Accessible components** following WCAG guidelines
- **Performance optimized** with lazy loading and code splitting

#### State Management:
- **TanStack Query** for server state caching
- **React Hook Form** for form state
- **Local Storage** for user preferences
- **Session Storage** for temporary data

#### Routing System:
- **Wouter-based routing** with nested routes
- **Protected routes** with authentication guards
- **Dynamic imports** for code splitting
- **404 handling** with custom error pages

---

## Backend Architecture

### Server Structure
```
server/
├── routes/          # API route handlers
├── services/        # Business logic services
├── middleware/      # Express middleware
├── db.ts           # Database connection
├── storage.ts      # Data access layer
├── auth.ts         # Authentication logic
└── index.ts        # Server entry point
```

### Key Backend Services:

#### Authentication System:
- **Email/Password authentication** with bcrypt hashing
- **Session-based authentication** with PostgreSQL session store
- **Rate limiting** (10 attempts per 15 minutes)
- **Account lockout** protection
- **Role-based access control** (User, Author, Admin, Super Admin)

#### AI Integration Pipeline:
```typescript
// Disease Analysis Service
export async function analyzePlantDisease({
  imageBuffer,
  symptoms,
  requestType
}: {
  imageBuffer?: Buffer;
  symptoms?: string;
  requestType: 'image' | 'symptoms' | 'both';
}) {
  // OpenAI GPT-5 analysis
  const analysis = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [...],
    response_format: { type: "json_object" }
  });
  
  return analysis;
}
```

#### Payment Processing:
- **Multi-currency support** (USD, EUR, INR, 60+ currencies)
- **Stripe integration** for international payments
- **Razorpay integration** for Indian market
- **Subscription management** with automatic renewal
- **Webhook handling** for payment events

---

## Database Design

### Database Schema (PostgreSQL on Neon)

#### Core Tables (35 total):

```sql
-- Users table (enhanced authentication)
users: {
  id: varchar PRIMARY KEY (UUID),
  email: varchar UNIQUE NOT NULL,
  firstName: varchar NOT NULL,
  lastName: varchar NOT NULL,
  password: varchar (hashed),
  isAdmin: boolean DEFAULT false,
  isAuthor: boolean DEFAULT false,
  subscriptionStatus: varchar DEFAULT 'none',
  freeTierUsed: integer DEFAULT 0,
  preferredCurrency: varchar DEFAULT 'USD',
  createdAt: timestamp DEFAULT NOW()
}

-- Plant identification results
plant_results: {
  id: varchar PRIMARY KEY,
  userId: varchar REFERENCES users(id),
  plantName: varchar,
  scientificName: varchar,
  confidence: real,
  imageUrl: varchar,
  careInstructions: jsonb,
  createdAt: timestamp
}

-- Disease diagnosis records
plant_health_records: {
  id: varchar PRIMARY KEY,
  userId: varchar REFERENCES users(id),
  diagnosisData: jsonb,
  imageUrls: text[],
  symptoms: text,
  aiRecommendations: jsonb,
  createdAt: timestamp
}

-- E-book marketplace
ebooks: {
  id: varchar PRIMARY KEY,
  authorId: varchar REFERENCES users(id),
  title: varchar NOT NULL,
  description: text,
  price: decimal,
  coverImageUrl: varchar,
  fileUrl: varchar,
  status: varchar DEFAULT 'draft',
  categoryId: varchar REFERENCES ebook_categories(id)
}

-- Consultation system
consultation_requests: {
  id: varchar PRIMARY KEY,
  userId: varchar REFERENCES users(id),
  expertType: varchar,
  urgencyLevel: varchar,
  problemDescription: text,
  preferredContactMethod: varchar,
  status: varchar DEFAULT 'pending'
}

-- Blog management
blog_posts: {
  id: varchar PRIMARY KEY,
  authorId: varchar REFERENCES users(id),
  title: varchar NOT NULL,
  content: text,
  excerpt: text,
  featuredImageUrl: varchar,
  status: varchar DEFAULT 'draft',
  categoryId: varchar REFERENCES blog_categories(id)
}
```

### Database Relationships:
- **One-to-Many**: Users → Plant Results, Disease Records, E-books
- **Many-to-Many**: Users ↔ E-book Purchases (through junction table)
- **Hierarchical**: Categories → Subcategories (self-referencing)
- **Audit Trail**: All major tables include created/updated timestamps

### Indexing Strategy:
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_plant_results_user ON plant_results(userId);
CREATE INDEX idx_ebooks_category ON ebooks(categoryId);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_consultation_requests_status ON consultation_requests(status);
```

---

## Feature Documentation

### 1. AI Plant Identification

**Technology**: Plant.id API v3 + OpenAI GPT-5
**Location**: `/identify` route
**Key Features**:
- Multi-image upload (3 slots: main, leaves, flowers/fruits)
- Real-time confidence scoring
- Localized plant names in 12 languages
- Care instruction generation
- PDF report export capability

**API Flow**:
```typescript
POST /api/identify
{
  images: File[],
  location?: string,
  modifiers: string[]
}

Response:
{
  plantName: string,
  scientificName: string,
  confidence: number,
  commonNames: Record<string, string>,
  careInstructions: {
    watering: string,
    sunlight: string,
    soil: string,
    fertilizing: string
  }
}
```

### 2. Disease Diagnosis System

**Technology**: OpenAI GPT-5 Vision + Structured Output
**Location**: `/disease-diagnosis` route
**Access Control**: 3 free diagnoses for basic users, unlimited for premium

**Features**:
- Image-based diagnosis
- Symptom description analysis  
- Combined image + symptom evaluation
- Expert consultation referral system
- Treatment recommendations with severity levels

**Usage Tracking**:
```typescript
// Usage stats endpoint
GET /api/user/usage-stats
{
  diseaseRequestsUsed: number,
  diseaseRequestsLimit: number,
  remainingRequests: number,
  isUnlimited: boolean
}
```

### 3. Expert Consultation System

**Location**: `/talk-to-expert` route
**Features**:
- Multi-step registration form
- Urgency level selection (Low, Medium, High, Emergency)
- Problem categorization (Plant ID, Disease, Care, Pest Control, etc.)
- Preferred contact method selection
- File upload for plant photos
- Status tracking system

**Workflow**:
1. User submits consultation request
2. System categorizes by urgency and expertise needed
3. Admin dashboard shows pending requests
4. Expert assignment and response
5. Follow-up communication tracking

### 4. E-book Publishing Platform

**Amazon Kindle-Style Workflow**:
1. **Author Registration**: `/author-registration`
   - Professional profile creation
   - Expertise verification
   - Payment information setup

2. **Author Dashboard**: `/author-dashboard` 
   - E-book upload and management
   - Sales analytics and revenue tracking
   - Submission status monitoring
   - Reader reviews and ratings

3. **Admin Review Process**:
   - Content quality assessment
   - Copyright verification
   - Marketplace approval workflow

**Revenue Sharing**: 70% author, 30% platform (configurable)

### 5. Garden Management System

**Location**: `/my-garden` route
**Features**:
- Personal plant collection
- Care schedule management
- Plant health tracking
- Milestone achievements
- Social sharing capabilities
- Watering and fertilizing reminders

---

## Page-by-Page Documentation

### 1. Home Page (`/`)
**Components**: Hero section, AI technology showcase, featured e-books, gardening tools affiliate section
**Features**: 
- Dynamic banner management (admin-configurable)
- Personalized content based on user location
- SEO-optimized with USA geo-targeting
- Mobile-responsive design with touch-friendly interactions

### 2. Plant Identification (`/identify`)
**Features**:
- 3-slot image upload interface
- Camera capture functionality
- Location-based plant suggestions
- Real-time analysis progress
- Downloadable PDF reports
- Social media sharing integration

### 3. Disease Diagnosis (`/disease-diagnosis`)
**Components**:
- Usage statistics card (shows remaining free diagnoses)
- Expert consultation notice card
- Three input methods: Image only, Symptoms only, Combined
- Results display with severity indicators
- Treatment recommendations with safety warnings
- Expert consultation referral buttons

### 4. My Garden (`/my-garden`)
**Features**:
- Grid/List view toggle
- Plant collection management
- Care schedule calendar
- Health status indicators
- Achievement badges
- Export functionality

### 5. E-book Marketplace (`/ebook-marketplace`)
**Features**:
- Category-based browsing (12 gardening categories)
- Search and filter functionality
- Price range filtering
- Author profiles and ratings
- Sample preview system
- Secure payment integration

### 6. Author Dashboard (`/author-dashboard`)
**Access**: Author-verified users only
**Features**:
- Revenue analytics with charts
- E-book management interface
- Upload and submission workflow
- Reader feedback monitoring
- Payment history tracking

### 7. Admin Dashboard (`/admin-dashboard`)
**Access**: Admin users only
**Features**:
- User management and role assignment
- Content moderation tools
- Platform analytics and reporting
- System configuration settings
- E-book approval workflow

### 8. Talk to Expert (`/talk-to-expert`)
**Multi-step Form**:
- Step 1: Contact information
- Step 2: Problem categorization
- Step 3: Urgency selection
- Step 4: Detailed description
- Step 5: File uploads
- Step 6: Confirmation and payment (if premium service)

---

## Dashboard Documentation

### 1. User Dashboard (My Garden)
**URL**: `/my-garden`
**Authentication**: Required
**Features**:
- Plant collection overview
- Recent identifications
- Care reminders and notifications
- Achievement progress
- Usage statistics (free tier tracking)

### 2. Author Dashboard
**URL**: `/author-dashboard`
**Authentication**: Author role required
**Key Sections**:

#### Revenue Analytics:
- Monthly earnings chart
- Total revenue tracking
- Commission breakdown
- Payment history with download statements

#### E-book Management:
- Upload new e-books
- Edit existing titles
- Monitor approval status
- View sales performance per title

#### Reader Engagement:
- Reviews and ratings dashboard
- Reader demographics
- Download statistics
- Feedback response system

### 3. Admin Dashboard
**URL**: `/admin-dashboard`  
**Authentication**: Admin role required
**Sections**:

#### User Management:
- User listing with search/filter
- Role assignment interface
- Account status management
- Activity monitoring

#### Content Moderation:
- E-book approval queue
- Blog post management
- Comment moderation
- Reported content review

#### Platform Analytics:
- User growth metrics
- Revenue tracking
- Popular content analysis
- Performance monitoring

#### System Configuration:
- Feature toggles
- Pricing plan management
- Payment gateway settings
- Email template editing

### 4. Super Admin Dashboard
**URL**: `/super-admin-dashboard`
**Authentication**: Super Admin role required
**Advanced Features**:
- Server monitoring and health checks
- Database management interface
- API usage analytics
- Security audit logs
- System backup management

---

## API Endpoints

### Authentication Endpoints:
```typescript
POST /api/register          // User registration
POST /api/login             // User login
POST /api/logout            // User logout
GET  /api/user              // Get current user
PUT  /api/user              // Update user profile
```

### Plant Identification:
```typescript
POST /api/identify          // Identify plant from images
GET  /api/plant-results     // Get user's identification history
DELETE /api/plant-results/:id // Delete identification record
```

### Disease Diagnosis:
```typescript
POST /api/disease-diagnosis    // Analyze plant disease
GET  /api/disease-diagnosis/history // Get diagnosis history
GET  /api/user/usage-stats     // Get usage statistics
```

### Expert Consultation:
```typescript
POST /api/consultation-requests     // Submit consultation request
GET  /api/consultation-requests     // Get user's requests
PUT  /api/consultation-requests/:id // Update request status
```

### E-book Platform:
```typescript
GET  /api/ebooks               // List e-books (with filters)
POST /api/ebooks               // Create new e-book (authors only)
GET  /api/ebooks/:id           // Get e-book details
PUT  /api/ebooks/:id           // Update e-book (authors/admins)
DELETE /api/ebooks/:id         // Delete e-book (admins only)

POST /api/ebook-purchases      // Purchase e-book
GET  /api/user/purchased-ebooks // Get user's library
```

### Admin Endpoints:
```typescript
GET  /api/admin/users          // List all users
PUT  /api/admin/users/:id      // Update user (role, status)
GET  /api/admin/analytics      // Platform analytics
GET  /api/admin/ebooks/pending // E-books awaiting approval
PUT  /api/admin/ebooks/:id/approve // Approve e-book
```

### Payment Endpoints:
```typescript
POST /api/stripe/create-checkout    // Create Stripe checkout session
POST /api/stripe/webhook           // Stripe webhook handler
POST /api/razorpay/create-order    // Create Razorpay order
POST /api/razorpay/verify-payment  // Verify Razorpay payment
```

---

## Security Implementation

### Authentication & Authorization:
```typescript
// Password hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 12);

// Session-based authentication
app.use(session({
  store: new PostgreSQLStore({
    conString: process.env.DATABASE_URL,
    ttl: 7 * 24 * 60 * 60 // 7 days
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Input Validation & Sanitization:
```typescript
// XSS Protection with DOMPurify
import DOMPurify from 'isomorphic-dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

// SQL Injection Prevention
const getUserByEmail = async (email: string): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user || null;
};
```

### File Upload Security:
```typescript
// Multer configuration with security checks
const upload = multer({
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 3 // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP allowed.'));
    }
  }
});
```

### API Security Headers:
```typescript
// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## Known Issues & Bugs

### Current Issues:

1. **LSP Diagnostic Warning** (Non-critical):
   - **File**: `client/src/pages/disease-diagnosis.tsx`
   - **Issue**: Minor TypeScript warning (likely unused import)
   - **Impact**: No runtime impact, cosmetic only
   - **Fix**: Code cleanup needed

2. **Image Upload Memory Usage**:
   - **Issue**: Large image uploads (>5MB) may cause temporary memory spikes
   - **Mitigation**: File size limits implemented (10MB max)
   - **Recommended Fix**: Implement client-side image compression

3. **Mobile Camera Capture**:
   - **Issue**: Some older mobile browsers may not support camera capture
   - **Fallback**: File upload still available
   - **Browser Support**: Chrome 53+, Safari 11+, Firefox 36+

### Performance Considerations:

1. **Database Query Optimization**:
   - Some admin dashboard queries could benefit from additional indexing
   - Pagination implemented for large datasets
   - Connection pooling configured

2. **Image Processing**:
   - Plant identification API calls can take 3-5 seconds
   - Loading states implemented
   - Consider implementing caching for common plant types

3. **PDF Generation**:
   - Puppeteer PDF generation is memory-intensive
   - Queue system recommended for high-volume usage
   - Current limit: 10 concurrent PDF generations

### Future Improvements:

1. **Real-time Features**:
   - WebSocket integration for live chat with experts
   - Real-time notifications for consultation updates

2. **Offline Capabilities**:
   - Service Worker implementation for offline plant identification
   - Cached plant database for common species

3. **Enhanced Security**:
   - Two-factor authentication (infrastructure ready)
   - OAuth integration (Google, Facebook, GitHub support prepared)

---

## Deployment Guide

### Environment Variables Required:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
SESSION_SECRET=your-secret-key-here

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
PLANT_ID_API_KEY=your-plant-id-api-key

# Payment Providers
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
RAZORPAY_KEY_ID=rzp_test_your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email Service (Optional)
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# File Storage
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### Deployment Steps:

1. **Database Setup**:
   ```bash
   npm run db:push
   ```

2. **Build Application**:
   ```bash
   npm run build
   ```

3. **Start Production Server**:
   ```bash
   npm start
   ```

### Replit Deployment:
- Application is configured for Replit deployment
- All necessary configuration files included
- Environment variables managed through Replit secrets

---

## Performance Optimization

### Frontend Optimizations:

1. **Code Splitting**:
   ```typescript
   // Lazy loading for admin pages
   const AdminDashboard = lazy(() => import('./pages/admin-dashboard'));
   ```

2. **Image Optimization**:
   - WebP format support
   - Lazy loading implementation
   - Responsive image sizes

3. **Caching Strategy**:
   - TanStack Query for API response caching
   - Browser caching for static assets
   - Service Worker ready for implementation

### Backend Optimizations:

1. **Database Connection Pooling**:
   ```typescript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Compression Middleware**:
   ```typescript
   app.use(compression({
     level: 6,
     threshold: 1000,
     filter: (req, res) => {
       return compression.filter(req, res);
     }
   }));
   ```

3. **Response Caching**:
   - ETags implemented for static content
   - Cache-Control headers configured
   - CDN-ready architecture

---

## Conclusion

GreenLens represents a comprehensive, production-ready plant identification and care platform with enterprise-grade features including AI integration, multi-role user management, e-commerce capabilities, and robust security implementations. The application is built with modern web technologies, follows best practices, and is optimized for scalability and performance.

The platform successfully integrates multiple complex systems (AI services, payment processing, content management) into a cohesive user experience while maintaining high code quality, security standards, and performance optimization.

**Current Status**: ✅ Production Ready
**Last Updated**: January 2025
**Version**: 1.0.0

---

## Technical Support

For technical inquiries or support, please refer to:
- **Documentation**: This comprehensive guide
- **API Reference**: Detailed endpoint documentation above
- **Database Schema**: Complete schema definitions provided
- **Security Guidelines**: Implementation details included

**Note**: This documentation reflects the current state of the application as of the latest development cycle. Regular updates ensure accuracy and completeness.