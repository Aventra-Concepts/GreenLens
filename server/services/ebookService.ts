import { db } from "../db";
import { 
  ebooks, 
  ebookPurchases, 
  authorProfiles, 
  ebookUploads,
  salesAnalytics,
  authorPayments,
  termsAndConditions,
  users,
  type Ebook,
  type InsertEbook,
  type EbookPurchase,
  type InsertEbookPurchase,
  type EbookUpload,
  type AuthorProfile,
} from "@shared/schema";
import { eq, and, desc, asc, sql, gte, lte, count, sum } from "drizzle-orm";
import { nanoid } from "nanoid";
import crypto from "crypto";

export class EbookService {
  
  // Author Registration and Verification
  async registerAuthor(userId: string, profileData: any): Promise<AuthorProfile> {
    const [profile] = await db
      .insert(authorProfiles)
      .values({
        userId,
        applicationStatus: 'pending',
        ...profileData,
      })
      .returning();
    
    return profile;
  }

  async approveAuthor(profileId: string, adminId: string): Promise<AuthorProfile> {
    const [profile] = await db
      .update(authorProfiles)
      .set({
        applicationStatus: 'approved',
        isActive: true,
        isVerified: true,
        canPublish: true,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(authorProfiles.id, profileId))
      .returning();

    // Update user's author status
    await db
      .update(users)
      .set({
        isAuthor: true,
        authorVerified: true,
      })
      .where(eq(users.id, profile.userId));

    return profile;
  }

  // E-book Upload Process Management
  async startUploadSession(authorId: string): Promise<EbookUpload> {
    const uploadSessionId = nanoid();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [upload] = await db
      .insert(ebookUploads)
      .values({
        authorId,
        uploadSessionId,
        expiresAt,
      })
      .returning();

    return upload;
  }

  async updateUploadStep(sessionId: string, step: string, data: any): Promise<EbookUpload> {
    const [upload] = await db
      .update(ebookUploads)
      .set({
        currentStep: step,
        temporaryData: data,
        lastActivityAt: new Date(),
      })
      .where(eq(ebookUploads.uploadSessionId, sessionId))
      .returning();

    return upload;
  }

  async completeUpload(sessionId: string, ebookData: InsertEbook): Promise<Ebook> {
    // Create the e-book
    const [ebook] = await db
      .insert(ebooks)
      .values({
        ...ebookData,
        status: 'submitted',
        submittedAt: new Date(),
        slug: this.generateSlug(ebookData.title),
      })
      .returning();

    // Mark upload session as completed
    await db
      .update(ebookUploads)
      .set({
        isCompleted: true,
        ebookId: ebook.id,
        completedAt: new Date(),
      })
      .where(eq(ebookUploads.uploadSessionId, sessionId));

    return ebook;
  }

  // E-book Management
  async publishEbook(ebookId: string, adminId: string): Promise<Ebook> {
    const [ebook] = await db
      .update(ebooks)
      .set({
        status: 'published',
        approvedBy: adminId,
        approvedAt: new Date(),
        publishedAt: new Date(),
      })
      .where(eq(ebooks.id, ebookId))
      .returning();

    return ebook;
  }

  async rejectEbook(ebookId: string, adminId: string, reason: string): Promise<Ebook> {
    const [ebook] = await db
      .update(ebooks)
      .set({
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: adminId,
        approvedAt: new Date(),
      })
      .where(eq(ebooks.id, ebookId))
      .returning();

    return ebook;
  }

  // Sales Processing
  async createPurchase(purchaseData: {
    userId: string;
    ebookId: string;
    purchasePrice: number;
    currency: string;
    paymentProvider: string;
    paymentIntentId?: string;
  }): Promise<EbookPurchase> {
    const ebook = await this.getEbookById(purchaseData.ebookId);
    if (!ebook) {
      throw new Error('E-book not found');
    }

    // Calculate fees and earnings
    const platformFee = purchaseData.purchasePrice * parseFloat(ebook.platformCommissionRate.toString());
    const authorEarnings = purchaseData.purchasePrice - platformFee;
    const purchaseOrderId = this.generateOrderId();

    const [purchase] = await db
      .insert(ebookPurchases)
      .values({
        purchaseOrderId,
        userId: purchaseData.userId,
        ebookId: purchaseData.ebookId,
        purchasePrice: purchaseData.purchasePrice.toString(),
        listPrice: ebook.basePrice,
        platformFee: platformFee.toString(),
        authorEarnings: authorEarnings.toString(),
        currency: purchaseData.currency,
        paymentProvider: purchaseData.paymentProvider,
        paymentIntentId: purchaseData.paymentIntentId,
        status: 'pending',
      })
      .returning();

    return purchase;
  }

  async completePurchase(purchaseId: string, transactionId: string): Promise<EbookPurchase> {
    const [purchase] = await db
      .update(ebookPurchases)
      .set({
        status: 'completed',
        transactionId,
        confirmationEmailSent: true,
      })
      .where(eq(ebookPurchases.id, purchaseId))
      .returning();

    // Update e-book sales statistics
    await this.updateEbookSalesStats(purchase.ebookId);

    return purchase;
  }

  // Sales Analytics
  async updateEbookSalesStats(ebookId: string): Promise<void> {
    const stats = await db
      .select({
        totalSales: count(),
        totalRevenue: sum(ebookPurchases.purchasePrice),
        totalAuthorEarnings: sum(ebookPurchases.authorEarnings),
        totalPlatformEarnings: sum(ebookPurchases.platformFee),
      })
      .from(ebookPurchases)
      .where(and(
        eq(ebookPurchases.ebookId, ebookId),
        eq(ebookPurchases.status, 'completed')
      ));

    if (stats[0]) {
      await db
        .update(ebooks)
        .set({
          totalSales: stats[0].totalSales,
          totalRevenue: stats[0].totalRevenue || '0',
          authorEarnings: stats[0].totalAuthorEarnings || '0',
          platformEarnings: stats[0].totalPlatformEarnings || '0',
        })
        .where(eq(ebooks.id, ebookId));
    }
  }

  async generateSalesReport(
    startDate: Date, 
    endDate: Date, 
    authorId?: string
  ): Promise<any> {
    let query = db
      .select({
        ebookId: ebooks.id,
        ebookTitle: ebooks.title,
        authorName: ebooks.authorName,
        totalSales: count(ebookPurchases.id),
        totalRevenue: sum(ebookPurchases.purchasePrice),
        totalDiscounts: sum(ebookPurchases.discountAmount),
        totalTaxes: sum(ebookPurchases.taxAmount),
        totalPlatformFees: sum(ebookPurchases.platformFee),
        totalAuthorEarnings: sum(ebookPurchases.authorEarnings),
      })
      .from(ebookPurchases)
      .innerJoin(ebooks, eq(ebookPurchases.ebookId, ebooks.id))
      .where(and(
        eq(ebookPurchases.status, 'completed'),
        gte(ebookPurchases.createdAt, startDate),
        lte(ebookPurchases.createdAt, endDate)
      ))
      .groupBy(ebooks.id, ebooks.title, ebooks.authorName);

    if (authorId) {
      query = query.where(eq(ebooks.authorId, authorId));
    }

    return await query;
  }

  // Terms and Conditions Management
  async createTerms(termsData: {
    type: string;
    version: string;
    title: string;
    content: string;
    effectiveDate: Date;
    lastModifiedBy: string;
  }): Promise<any> {
    // Deactivate previous version
    await db
      .update(termsAndConditions)
      .set({ isActive: false })
      .where(eq(termsAndConditions.type, termsData.type));

    const [terms] = await db
      .insert(termsAndConditions)
      .values(termsData)
      .returning();

    return terms;
  }

  async getCurrentTerms(type: string): Promise<any> {
    const [terms] = await db
      .select()
      .from(termsAndConditions)
      .where(and(
        eq(termsAndConditions.type, type),
        eq(termsAndConditions.isActive, true)
      ))
      .orderBy(desc(termsAndConditions.createdAt))
      .limit(1);

    return terms;
  }

  // Utility Methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + nanoid(8);
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `EB${timestamp.slice(-8)}${random}`;
  }

  async getEbookById(id: string): Promise<Ebook | null> {
    const [ebook] = await db
      .select()
      .from(ebooks)
      .where(eq(ebooks.id, id))
      .limit(1);

    return ebook || null;
  }

  async getAuthorEbooks(authorId: string): Promise<Ebook[]> {
    return await db
      .select()
      .from(ebooks)
      .where(eq(ebooks.authorId, authorId))
      .orderBy(desc(ebooks.createdAt));
  }

  async getPublishedEbooks(limit = 20, offset = 0): Promise<Ebook[]> {
    return await db
      .select()
      .from(ebooks)
      .where(eq(ebooks.status, 'published'))
      .orderBy(desc(ebooks.publishedAt))
      .limit(limit)
      .offset(offset);
  }
}

export const ebookService = new EbookService();