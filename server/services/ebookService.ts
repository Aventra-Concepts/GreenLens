import { db } from "../db";
import { ebooks, ebookPurchases, ebookCategories, platformSettings, studentUsers } from "@shared/schema";
import { eq, desc, and, or } from "drizzle-orm";
import crypto from "crypto";

export class EbookService {
  // Get platform settings
  static async getPlatformSetting(key: string): Promise<string | null> {
    const [setting] = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.settingKey, key))
      .limit(1);
    
    return setting?.settingValue || null;
  }

  // Calculate pricing with platform fees and student discounts
  static async calculatePricing(basePrice: number, isStudent: boolean = false) {
    const platformFeeType = await this.getPlatformSetting('platform_fee_type') || 'percentage';
    const platformFeeValue = parseFloat(await this.getPlatformSetting('platform_fee_value') || '10');
    const studentDiscountPercent = parseFloat(await this.getPlatformSetting('student_discount_percent') || '15');

    let platformFee = 0;
    if (platformFeeType === 'percentage') {
      platformFee = (basePrice * platformFeeValue) / 100;
    } else {
      platformFee = platformFeeValue;
    }

    let studentDiscount = 0;
    if (isStudent) {
      studentDiscount = (basePrice * studentDiscountPercent) / 100;
    }

    const finalPrice = basePrice - studentDiscount;
    const authorEarnings = finalPrice - platformFee;

    return {
      originalPrice: basePrice,
      studentDiscount,
      platformFee,
      authorEarnings: Math.max(0, authorEarnings), // Ensure non-negative
      finalPrice
    };
  }

  // Generate secure download password based on email
  static generateDownloadPassword(email: string, ebookId: string): string {
    const salt = process.env.SESSION_SECRET || 'default-salt';
    return crypto.createHash('sha256')
      .update(`${email}:${ebookId}:${salt}`)
      .digest('hex')
      .substring(0, 16);
  }

  // Verify download access
  static async verifyDownloadAccess(ebookId: string, email: string, password: string): Promise<boolean> {
    const expectedPassword = this.generateDownloadPassword(email, ebookId);
    
    if (password !== expectedPassword) {
      return false;
    }

    // Check if purchase exists and is valid
    const [purchase] = await db
      .select()
      .from(ebookPurchases)
      .where(
        and(
          eq(ebookPurchases.ebookId, ebookId),
          eq(ebookPurchases.buyerEmail, email),
          eq(ebookPurchases.paymentStatus, 'completed')
        )
      )
      .limit(1);

    return !!purchase;
  }

  // Get e-books with author verification
  static async getPublishedEbooks(limit: number = 50, offset: number = 0) {
    return await db
      .select({
        id: ebooks.id,
        title: ebooks.title,
        description: ebooks.description,
        authorName: ebooks.authorName,
        category: ebooks.category,
        subcategory: ebooks.subcategory,
        language: ebooks.language,
        pageCount: ebooks.pageCount,
        basePrice: ebooks.basePrice,
        currency: ebooks.currency,
        coverImageUrl: ebooks.coverImageUrl,
        previewFileUrl: ebooks.previewFileUrl,
        fileFormat: ebooks.fileFormat,
        contentRating: ebooks.contentRating,
        downloadCount: ebooks.downloadCount,
        rating: ebooks.rating,
        reviewCount: ebooks.reviewCount,
        isFeatured: ebooks.isFeatured,
        createdAt: ebooks.createdAt,
        tags: ebooks.tags
      })
      .from(ebooks)
      .where(
        and(
          eq(ebooks.status, 'published'),
          eq(ebooks.isActive, true)
        )
      )
      .orderBy(desc(ebooks.isFeatured), desc(ebooks.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Check if user is verified student
  static async isVerifiedStudent(email: string): Promise<boolean> {
    const [student] = await db
      .select()
      .from(studentUsers)
      .where(
        and(
          eq(studentUsers.email, email),
          eq(studentUsers.verificationStatus, 'approved'),
          eq(studentUsers.isActive, true),
          eq(studentUsers.isConverted, false)
        )
      )
      .limit(1);

    return !!student;
  }

  // Initialize default platform settings
  static async initializePlatformSettings() {
    const defaultSettings = [
      {
        settingKey: 'platform_fee_type',
        settingValue: 'percentage',
        settingType: 'string',
        description: 'Platform fee calculation method (percentage or fixed)',
        category: 'ebook'
      },
      {
        settingKey: 'platform_fee_value',
        settingValue: '10',
        settingType: 'number',
        description: 'Platform fee value (10% or fixed amount)',
        category: 'ebook'
      },
      {
        settingKey: 'student_discount_percent',
        settingValue: '15',
        settingType: 'number',
        description: 'Student discount percentage',
        category: 'student'
      },
      {
        settingKey: 'max_file_size_mb',
        settingValue: '50',
        settingType: 'number',
        description: 'Maximum e-book file size in MB',
        category: 'ebook'
      },
      {
        settingKey: 'allowed_file_formats',
        settingValue: 'pdf,epub,mobi',
        settingType: 'string',
        description: 'Allowed e-book file formats',
        category: 'ebook'
      }
    ];

    for (const setting of defaultSettings) {
      try {
        await db.insert(platformSettings).values(setting).onConflictDoNothing();
      } catch (error) {
        console.log(`Setting ${setting.settingKey} already exists`);
      }
    }
  }
}