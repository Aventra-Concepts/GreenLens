import { storage } from "../storage";
import crypto from "crypto";

export class EbookService {
  // Initialize platform settings with default values
  static async initializePlatformSettings() {
    try {
      // Check if settings already exist
      const existingSettings = await storage.getPlatformSettings();
      
      if (existingSettings.length === 0) {
        // Create default platform settings
        const defaultSettings = [
          {
            key: 'student_discount_percentage',
            value: '20',
            description: 'Student discount percentage',
            category: 'pricing'
          },
          {
            key: 'platform_fee_percentage',
            value: '15',
            description: 'Platform fee percentage',
            category: 'pricing'
          },
          {
            key: 'author_earnings_percentage', 
            value: '85',
            description: 'Author earnings percentage',
            category: 'pricing'
          },
          {
            key: 'min_ebook_price',
            value: '0.99',
            description: 'Minimum e-book price',
            category: 'pricing'
          },
          {
            key: 'max_ebook_size_mb',
            value: '50',
            description: 'Maximum e-book file size in MB',
            category: 'uploads'
          }
        ];

        for (const setting of defaultSettings) {
          await storage.createPlatformSetting(setting);
        }
        
        console.log('Platform settings initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing platform settings:', error);
    }
  }

  // Check if user is a verified student
  static async isVerifiedStudent(email: string): Promise<boolean> {
    try {
      const student = await storage.getStudentUserByEmail(email);
      return student?.verificationStatus === 'approved';
    } catch (error) {
      console.error('Error checking student status:', error);
      return false;
    }
  }

  // Calculate pricing based on base price and student status
  static async calculatePricing(basePrice: number, isStudent: boolean) {
    try {
      // Get platform settings
      const studentDiscountSetting = await storage.getPlatformSetting('student_discount_percentage');
      const platformFeeSetting = await storage.getPlatformSetting('platform_fee_percentage');
      
      const studentDiscountPercentage = parseFloat(studentDiscountSetting?.value || '20');
      const platformFeePercentage = parseFloat(platformFeeSetting?.value || '15');

      let originalPrice = basePrice;
      let studentDiscount = 0;
      let finalPrice = originalPrice;

      // Apply student discount if applicable
      if (isStudent) {
        studentDiscount = (originalPrice * studentDiscountPercentage) / 100;
        finalPrice = originalPrice - studentDiscount;
      }

      // Calculate platform fee (from final price)
      const platformFee = (finalPrice * platformFeePercentage) / 100;
      
      // Calculate author earnings (final price minus platform fee)
      const authorEarnings = finalPrice - platformFee;

      return {
        originalPrice: parseFloat(originalPrice.toFixed(2)),
        studentDiscount: parseFloat(studentDiscount.toFixed(2)),
        platformFee: parseFloat(platformFee.toFixed(2)),
        authorEarnings: parseFloat(authorEarnings.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2))
      };
    } catch (error) {
      console.error('Error calculating pricing:', error);
      throw new Error('Failed to calculate pricing');
    }
  }

  // Generate secure download password
  static generateDownloadPassword(email: string, ebookId: string): string {
    const secret = process.env.DOWNLOAD_SECRET || 'default-secret-key';
    const data = `${email}:${ebookId}:${Date.now()}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 16);
  }

  // Verify download access
  static async verifyDownloadAccess(ebookId: string, email: string, password: string): Promise<boolean> {
    try {
      // Check if there's a valid purchase for this email and ebook
      const purchase = await storage.getEbookPurchaseByEmailAndEbook(email, ebookId);
      
      if (!purchase || purchase.paymentStatus !== 'completed') {
        return false;
      }

      // Verify the download password
      return purchase.downloadPassword === password;
    } catch (error) {
      console.error('Error verifying download access:', error);
      return false;
    }
  }

  // Get platform setting value
  static async getPlatformSetting(key: string): Promise<string | null> {
    try {
      const setting = await storage.getPlatformSetting(key);
      return setting?.value || null;
    } catch (error) {
      console.error(`Error getting platform setting ${key}:`, error);
      return null;
    }
  }

  // Update platform setting
  static async updatePlatformSetting(key: string, value: string): Promise<boolean> {
    try {
      const existingSetting = await storage.getPlatformSetting(key);
      
      if (existingSetting) {
        await storage.updatePlatformSetting(existingSetting.id, { value });
      } else {
        await storage.createPlatformSetting({
          key,
          value,
          description: `Auto-created setting for ${key}`,
          category: 'general'
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating platform setting ${key}:`, error);
      return false;
    }
  }

  // Validate e-book file
  static validateEbookFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
    const maxSizeBytes = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF, EPUB, and MOBI files are allowed.'
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 50MB.'
      };
    }

    return { valid: true };
  }

  // Validate cover image
  static validateCoverImage(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Invalid image type. Only JPG, PNG, and WebP files are allowed.'
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'Image too large. Maximum size is 5MB.'
      };
    }

    return { valid: true };
  }

  // Generate e-book statistics
  static async getEbookStatistics(ebookId: string) {
    try {
      const ebook = await storage.getEbookById(ebookId);
      if (!ebook) {
        throw new Error('E-book not found');
      }

      const purchases = await storage.getEbookPurchases(ebookId);
      const reviews = await storage.getEbookReviews(ebookId);

      const totalSales = purchases.filter(p => p.paymentStatus === 'completed').length;
      const totalRevenue = purchases
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.finalPrice), 0);

      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      return {
        totalSales,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviews.length,
        downloadCount: ebook.downloadCount || 0
      };
    } catch (error) {
      console.error('Error generating e-book statistics:', error);
      throw new Error('Failed to generate statistics');
    }
  }
}