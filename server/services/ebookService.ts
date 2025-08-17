import { eq, desc, and, ilike, or, count, sql } from "drizzle-orm";
import { db } from "../db";
import { 
  ebooks, 
  ebookPurchases, 
  ebookReviews, 
  ebookCategories,
  authorProfiles,
  studentUsers,
  users,
  type Ebook,
  type EbookPurchase,
  type EbookReview,
  type EbookCategory,
  type AuthorProfile,
  type StudentUser,
  type InsertEbook,
  type InsertEbookPurchase,
  type InsertEbookReview,
  type InsertEbookCategory,
  type InsertAuthorProfile
} from "@shared/schema";

export interface EbookWithStats extends Ebook {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  categoryName?: string;
  authorName: string;
}

export interface EbookFilterOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
  authorId?: string;
  status?: 'published' | 'pending' | 'rejected';
  sort?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'sales';
  page?: number;
  limit?: number;
}

export interface GeographicRestriction {
  allowedCountries: string[];
  restrictedCountries: string[];
  globalAccess: boolean;
}

export class EbookService {
  // Platform initialization
  static async initializePlatformSettings(): Promise<void> {
    // Initialize any required platform settings
    console.log('E-book platform settings initialized');
  }

  // Price calculation with student discounts
  static async calculatePricing(basePrice: number, isStudent: boolean): Promise<{
    originalPrice: number;
    studentDiscount: number;
    platformFee: number;
    authorEarnings: number;
    finalPrice: number;
  }> {
    const originalPrice = basePrice;
    const studentDiscountRate = isStudent ? 0.10 : 0; // 10% student discount
    const studentDiscount = originalPrice * studentDiscountRate;
    const finalPrice = originalPrice - studentDiscount;
    const platformFeeRate = 0.30; // 30% platform fee
    const platformFee = finalPrice * platformFeeRate;
    const authorEarnings = finalPrice - platformFee;

    return {
      originalPrice,
      studentDiscount,
      platformFee,
      authorEarnings,
      finalPrice
    };
  }

  // Student verification
  static async isVerifiedStudent(email: string): Promise<boolean> {
    try {
      const { db } = await import("../db");
      const { studentUsers } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");

      const [student] = await db
        .select()
        .from(studentUsers)
        .where(and(
          eq(studentUsers.email, email),
          eq(studentUsers.verificationStatus, 'verified'),
          eq(studentUsers.isActive, true)
        ));

      return !!student;
    } catch (error) {
      console.error('Error checking student status:', error);
      return false;
    }
  }

  // Download password generation
  static generateDownloadPassword(email: string, ebookId: string): string {
    const crypto = require('crypto');
    const combinedString = `${email}-${ebookId}-${Date.now()}`;
    return crypto.createHash('sha256').update(combinedString).digest('hex').substring(0, 16);
  }

  // Download access verification
  static async verifyDownloadAccess(ebookId: string, email: string, password: string): Promise<boolean> {
    try {
      const { db } = await import("../db");
      const { ebookPurchases } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");

      const [purchase] = await db
        .select()
        .from(ebookPurchases)
        .where(and(
          eq(ebookPurchases.ebookId, ebookId),
          eq(ebookPurchases.buyerEmail, email),
          eq(ebookPurchases.paymentStatus, 'completed')
        ));

      return !!purchase;
    } catch (error) {
      console.error('Error verifying download access:', error);
      return false;
    }
  }

  // E-book Management
  async getEbooks(filters: EbookFilterOptions = {}): Promise<{
    ebooks: EbookWithStats[];
    totalCount: number;
    totalPages: number;
  }> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      language,
      authorId,
      status = 'published',
      sort = 'newest',
      page = 1,
      limit = 20
    } = filters;

    // Build where conditions
    const conditions: any[] = [eq(ebooks.status, status)];

    if (search) {
      conditions.push(
        or(
          ilike(ebooks.title, `%${search}%`),
          ilike(ebooks.description, `%${search}%`),
          ilike(ebooks.tags, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(ebooks.categoryId, category));
    }

    if (minPrice !== undefined) {
      conditions.push(sql`${ebooks.price} >= ${minPrice}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(sql`${ebooks.price} <= ${maxPrice}`);
    }

    if (language) {
      conditions.push(eq(ebooks.language, language));
    }

    if (authorId) {
      conditions.push(eq(ebooks.authorId, authorId));
    }

    // Count total results
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(ebooks)
      .where(and(...conditions));

    // Build main query with statistics
    let baseQuery = db
      .select({
        id: ebooks.id,
        title: ebooks.title,
        description: ebooks.description,
        authorId: ebooks.authorId,
        authorName: ebooks.authorName,
        categoryId: ebooks.categoryId,
        price: ebooks.price,
        originalPrice: ebooks.originalPrice,
        currency: ebooks.currency,
        language: ebooks.language,
        fileUrl: ebooks.fileUrl,
        fileSize: ebooks.fileSize,
        coverImageUrl: ebooks.coverImageUrl,
        previewUrl: ebooks.previewUrl,
        isbn: ebooks.isbn,
        pages: ebooks.pages,
        publicationDate: ebooks.publicationDate,
        tags: ebooks.tags,
        status: ebooks.status,
        downloadCount: ebooks.downloadCount,
        isActive: ebooks.isActive,
        createdAt: ebooks.createdAt,
        updatedAt: ebooks.updatedAt,
        // Statistics - these would be computed separately
        totalSales: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${ebookPurchases} 
          WHERE ${ebookPurchases.ebookId} = ${ebooks.id}
        ), 0)`,
        totalRevenue: sql<number>`COALESCE((
          SELECT SUM(${ebookPurchases.finalPrice}) FROM ${ebookPurchases} 
          WHERE ${ebookPurchases.ebookId} = ${ebooks.id}
        ), 0)`,
        averageRating: sql<number>`COALESCE((
          SELECT AVG(${ebookReviews.rating}) FROM ${ebookReviews} 
          WHERE ${ebookReviews.ebookId} = ${ebooks.id}
        ), 0)`,
        totalReviews: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${ebookReviews} 
          WHERE ${ebookReviews.ebookId} = ${ebooks.id}
        ), 0)`
      })
      .from(ebooks)
      .where(and(...conditions));

    // Apply sorting
    switch (sort) {
      case 'oldest':
        baseQuery = baseQuery.orderBy(ebooks.createdAt);
        break;
      case 'price-low':
        baseQuery = baseQuery.orderBy(ebooks.price);
        break;
      case 'price-high':
        baseQuery = baseQuery.orderBy(desc(ebooks.price));
        break;
      case 'rating':
        baseQuery = baseQuery.orderBy(desc(sql`COALESCE((
          SELECT AVG(${ebookReviews.rating}) FROM ${ebookReviews} 
          WHERE ${ebookReviews.ebookId} = ${ebooks.id}
        ), 0)`));
        break;
      case 'sales':
        baseQuery = baseQuery.orderBy(desc(sql`COALESCE((
          SELECT COUNT(*) FROM ${ebookPurchases} 
          WHERE ${ebookPurchases.ebookId} = ${ebooks.id}
        ), 0)`));
        break;
      default: // newest
        baseQuery = baseQuery.orderBy(desc(ebooks.createdAt));
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const results = await baseQuery.limit(limit).offset(offset);

    return {
      ebooks: results as EbookWithStats[],
      totalCount: Number(totalCount),
      totalPages: Math.ceil(Number(totalCount) / limit)
    };
  }

  async getEbook(id: string): Promise<EbookWithStats | undefined> {
    const [result] = await db
      .select({
        id: ebooks.id,
        title: ebooks.title,
        description: ebooks.description,
        authorId: ebooks.authorId,
        authorName: ebooks.authorName,
        categoryId: ebooks.categoryId,
        price: ebooks.price,
        originalPrice: ebooks.originalPrice,
        currency: ebooks.currency,
        language: ebooks.language,
        fileUrl: ebooks.fileUrl,
        fileSize: ebooks.fileSize,
        coverImageUrl: ebooks.coverImageUrl,
        previewUrl: ebooks.previewUrl,
        isbn: ebooks.isbn,
        pages: ebooks.pages,
        publicationDate: ebooks.publicationDate,
        tags: ebooks.tags,
        status: ebooks.status,
        downloadCount: ebooks.downloadCount,
        isActive: ebooks.isActive,
        createdAt: ebooks.createdAt,
        updatedAt: ebooks.updatedAt,
        totalSales: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${ebookPurchases} 
          WHERE ${ebookPurchases.ebookId} = ${ebooks.id}
        ), 0)`,
        totalRevenue: sql<number>`COALESCE((
          SELECT SUM(${ebookPurchases.finalPrice}) FROM ${ebookPurchases} 
          WHERE ${ebookPurchases.ebookId} = ${ebooks.id}
        ), 0)`,
        averageRating: sql<number>`COALESCE((
          SELECT AVG(${ebookReviews.rating}) FROM ${ebookReviews} 
          WHERE ${ebookReviews.ebookId} = ${ebooks.id}
        ), 0)`,
        totalReviews: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${ebookReviews} 
          WHERE ${ebookReviews.ebookId} = ${ebooks.id}
        ), 0)`
      })
      .from(ebooks)
      .where(eq(ebooks.id, id));

    return result as EbookWithStats | undefined;
  }

  async createEbook(ebookData: InsertEbook & { authorId: string }): Promise<Ebook> {
    // Get author information
    const [author] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, ebookData.authorId));

    if (!author) {
      throw new Error('Author not found');
    }

    const authorName = `${author.firstName} ${author.lastName}`;

    const [newEbook] = await db
      .insert(ebooks)
      .values({
        ...ebookData,
        authorName,
        status: 'pending' // All new ebooks start as pending for moderation
      })
      .returning();

    return newEbook;
  }

  async updateEbook(id: string, updates: Partial<Ebook>): Promise<Ebook> {
    const [updatedEbook] = await db
      .update(ebooks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ebooks.id, id))
      .returning();

    return updatedEbook;
  }

  async deleteEbook(id: string): Promise<void> {
    await db.delete(ebooks).where(eq(ebooks.id, id));
  }

  // Purchase Management with Student Discounts
  async purchaseEbook(purchaseData: {
    ebookId: string;
    buyerId?: string;
    studentBuyerId?: string;
    paymentIntentId: string;
    paymentProvider: string;
    originalPrice: number;
    finalPrice: number;
    currency: string;
    paymentStatus: string;
  }): Promise<EbookPurchase> {
    const studentDiscount = purchaseData.studentBuyerId ? 
      purchaseData.originalPrice - purchaseData.finalPrice : 0;

    // Get author's fee percentage (default 70% to author, 30% platform fee)
    const authorFeePercentage = 0.70;
    const authorEarnings = purchaseData.finalPrice * authorFeePercentage;

    const [purchase] = await db
      .insert(ebookPurchases)
      .values({
        ...purchaseData,
        studentDiscount,
        authorEarnings,
        currency: purchaseData.currency,
        paymentStatus: purchaseData.paymentStatus
      })
      .returning();

    // Update download count
    await db
      .update(ebooks)
      .set({ 
        downloadCount: sql`${ebooks.downloadCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(ebooks.id, purchaseData.ebookId));

    return purchase;
  }

  async getUserPurchases(userId: string, studentUserId?: string): Promise<EbookPurchase[]> {
    const conditions: any[] = [];
    
    if (userId) {
      conditions.push(eq(ebookPurchases.buyerId, userId));
    }
    
    if (studentUserId) {
      conditions.push(eq(ebookPurchases.studentBuyerId, studentUserId));
    }

    if (conditions.length === 0) {
      return [];
    }

    return db
      .select()
      .from(ebookPurchases)
      .where(or(...conditions))
      .orderBy(desc(ebookPurchases.purchaseDate));
  }

  // Student Verification System
  async applyStudentDiscount(
    originalPrice: number, 
    studentId: string, 
    currency: string = 'USD'
  ): Promise<{ finalPrice: number; discountAmount: number; discountPercentage: number }> {
    // Verify student status
    const [student] = await db
      .select()
      .from(studentUsers)
      .where(and(
        eq(studentUsers.id, studentId),
        eq(studentUsers.verificationStatus, 'verified'),
        eq(studentUsers.isActive, true)
      ));

    if (!student) {
      throw new Error('Student verification required or invalid student status');
    }

    // Check if student hasn't graduated and is within 3-year limit
    const now = new Date();
    const graduationDate = student.expectedGraduation ? new Date(student.expectedGraduation) : null;
    const enrollmentDate = new Date(student.enrollmentDate);
    const threeYearsFromEnrollment = new Date(enrollmentDate);
    threeYearsFromEnrollment.setFullYear(threeYearsFromEnrollment.getFullYear() + 3);

    if (graduationDate && graduationDate <= now) {
      throw new Error('Student discount not available - graduation date has passed');
    }

    if (now > threeYearsFromEnrollment) {
      throw new Error('Student discount not available - 3-year limit exceeded');
    }

    const discountPercentage = 0.10; // 10% student discount
    const discountAmount = originalPrice * discountPercentage;
    const finalPrice = originalPrice - discountAmount;

    return {
      finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountPercentage: discountPercentage * 100
    };
  }

  // Geographic Restrictions
  async checkGeographicRestrictions(
    ebookId: string, 
    userCountry: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const [ebook] = await db
      .select()
      .from(ebooks)
      .where(eq(ebooks.id, ebookId));

    if (!ebook) {
      return { allowed: false, reason: 'E-book not found' };
    }

    // E-books are available globally by default
    // Only gardening tools have geographic restrictions (India only)
    // This could be extended with specific e-book geographic restrictions if needed
    
    return { allowed: true };
  }

  // Author Management
  async createAuthorProfile(profileData: InsertAuthorProfile): Promise<AuthorProfile> {
    const [profile] = await db
      .insert(authorProfiles)
      .values(profileData)
      .returning();

    // Update user to mark as author
    await db
      .update(users)
      .set({ 
        isAuthor: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, profileData.userId));

    return profile;
  }

  async getAuthorProfile(userId: string): Promise<AuthorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.userId, userId));

    return profile;
  }

  async updateAuthorProfile(userId: string, updates: Partial<AuthorProfile>): Promise<AuthorProfile> {
    const [updatedProfile] = await db
      .update(authorProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(authorProfiles.userId, userId))
      .returning();

    return updatedProfile;
  }

  // E-book Categories
  async getEbookCategories(): Promise<EbookCategory[]> {
    return db
      .select()
      .from(ebookCategories)
      .where(eq(ebookCategories.isActive, true))
      .orderBy(ebookCategories.sortOrder, ebookCategories.name);
  }

  async createEbookCategory(categoryData: InsertEbookCategory): Promise<EbookCategory> {
    const [category] = await db
      .insert(ebookCategories)
      .values(categoryData)
      .returning();

    return category;
  }

  // Reviews and Ratings
  async addReview(reviewData: InsertEbookReview): Promise<EbookReview> {
    const [review] = await db
      .insert(ebookReviews)
      .values(reviewData)
      .returning();

    return review;
  }

  async getEbookReviews(ebookId: string, page: number = 1, limit: number = 10): Promise<{
    reviews: EbookReview[];
    totalCount: number;
    averageRating: number;
  }> {
    // Get reviews with pagination
    const offset = (page - 1) * limit;
    const reviews = await db
      .select()
      .from(ebookReviews)
      .where(eq(ebookReviews.ebookId, ebookId))
      .orderBy(desc(ebookReviews.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count and average rating
    const [stats] = await db
      .select({
        totalCount: count(),
        averageRating: sql<number>`COALESCE(AVG(${ebookReviews.rating}), 0)`
      })
      .from(ebookReviews)
      .where(eq(ebookReviews.ebookId, ebookId));

    return {
      reviews,
      totalCount: Number(stats.totalCount),
      averageRating: Number(stats.averageRating)
    };
  }

  // Analytics for Authors and Admins
  async getAuthorAnalytics(authorId: string): Promise<{
    totalEbooks: number;
    totalSales: number;
    totalEarnings: number;
    averageRating: number;
    topSellingEbooks: EbookWithStats[];
  }> {
    // Get total ebooks
    const [{ count: totalEbooks }] = await db
      .select({ count: count() })
      .from(ebooks)
      .where(and(
        eq(ebooks.authorId, authorId),
        eq(ebooks.status, 'published')
      ));

    // Get sales and earnings
    const [salesStats] = await db
      .select({
        totalSales: sql<number>`COALESCE(COUNT(*), 0)`,
        totalEarnings: sql<number>`COALESCE(SUM(${ebookPurchases.authorEarnings}), 0)`,
      })
      .from(ebookPurchases)
      .innerJoin(ebooks, eq(ebookPurchases.ebookId, ebooks.id))
      .where(eq(ebooks.authorId, authorId));

    // Get average rating
    const [{ averageRating }] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${ebookReviews.rating}), 0)`
      })
      .from(ebookReviews)
      .innerJoin(ebooks, eq(ebookReviews.ebookId, ebooks.id))
      .where(eq(ebooks.authorId, authorId));

    // Get top selling ebooks
    const topSellingEbooks = await this.getEbooks({
      authorId,
      status: 'published',
      sort: 'sales',
      limit: 5
    });

    return {
      totalEbooks: Number(totalEbooks),
      totalSales: Number(salesStats.totalSales),
      totalEarnings: Number(salesStats.totalEarnings),
      averageRating: Number(averageRating),
      topSellingEbooks: topSellingEbooks.ebooks
    };
  }
}

export const ebookService = new EbookService();