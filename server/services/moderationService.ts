import { storage } from '../storage';
import { ModerationItem } from '@shared/schema';
import { AdminAuthService } from './adminAuthService';

export interface ModerationAction {
  status: 'approved' | 'rejected';
  reason?: string;
  notes?: string;
}

export interface ContentFlags {
  inappropriate: boolean;
  spam: boolean;
  copyright: boolean;
  misinformation: boolean;
  lowQuality: boolean;
  offensive: boolean;
}

export class ModerationService {
  /**
   * Submit content for moderation
   */
  static async submitForModeration(
    entityType: string,
    entityId: string,
    submitterId?: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<ModerationItem> {
    // Auto-flag content based on content analysis
    const automatedFlags = await this.analyzeContent(entityType, entityId);

    const item = await storage.createModerationItem({
      entityType,
      entityId,
      status: 'pending',
      automatedFlags,
      priority
    });

    // Log moderation submission
    if (submitterId) {
      await AdminAuthService.logAdminAction(
        submitterId,
        'content_submitted_for_moderation',
        {
          entityType,
          entityId,
          priority,
          automatedFlags
        }
      );
    }

    return item;
  }

  /**
   * Moderate content (approve/reject)
   */
  static async moderateContent(
    moderationId: string,
    action: ModerationAction,
    moderatorId: string
  ): Promise<void> {
    const item = await storage.getModerationItem(moderationId);
    if (!item) {
      throw new Error('Moderation item not found');
    }

    // Update moderation status
    await storage.updateModerationItem(moderationId, {
      status: action.status,
      moderatorId,
      reason: action.reason,
      notes: action.notes,
      reviewedAt: new Date()
    });

    // Apply moderation decision to the actual content
    await this.applyModerationDecision(item, action);

    // Log moderation action
    await AdminAuthService.logAdminAction(
      moderatorId,
      'content_moderated',
      {
        moderationId,
        entityType: item.entityType,
        entityId: item.entityId,
        decision: action.status,
        reason: action.reason
      }
    );

    // Send notification if rejected
    if (action.status === 'rejected') {
      await this.notifyContentRejection(item, action.reason);
    }
  }

  /**
   * Get moderation queue for admin dashboard
   */
  static async getModerationQueue(filters?: {
    status?: string;
    entityType?: string;
    priority?: string;
    moderatorId?: string;
  }): Promise<ModerationItem[]> {
    return await storage.getModerationQueue(filters);
  }

  /**
   * Get moderation statistics
   */
  static async getModerationStats(dateRange: { start: Date; end: Date }): Promise<any> {
    const [
      totalItems,
      pendingItems,
      approvedItems,
      rejectedItems,
      avgResponseTime,
      topModerators
    ] = await Promise.all([
      storage.getTotalModerationItems(dateRange),
      storage.getPendingModerationItems(),
      storage.getApprovedModerationItems(dateRange),
      storage.getRejectedModerationItems(dateRange),
      storage.getAvgModerationResponseTime(dateRange),
      storage.getTopModerators(dateRange)
    ]);

    return {
      total: totalItems,
      pending: pendingItems,
      approved: approvedItems,
      rejected: rejectedItems,
      approvalRate: totalItems > 0 ? (approvedItems / totalItems) * 100 : 0,
      avgResponseTime,
      topModerators
    };
  }

  /**
   * Bulk moderate multiple items
   */
  static async bulkModerate(
    moderationIds: string[],
    action: ModerationAction,
    moderatorId: string
  ): Promise<void> {
    const items = await Promise.all(
      moderationIds.map(id => storage.getModerationItem(id))
    );

    // Filter out null items
    const validItems = items.filter(item => item !== null) as ModerationItem[];

    // Process each item
    await Promise.all(
      validItems.map(item => 
        this.moderateContent(item.id, action, moderatorId)
      )
    );

    // Log bulk action
    await AdminAuthService.logAdminAction(
      moderatorId,
      'bulk_moderation',
      {
        itemCount: validItems.length,
        decision: action.status,
        reason: action.reason
      }
    );
  }

  /**
   * Auto-moderate content based on AI analysis
   */
  static async autoModerate(entityType: string, entityId: string): Promise<boolean> {
    const flags = await this.analyzeContent(entityType, entityId);
    
    // Auto-reject if high-risk flags are detected
    const highRiskFlags = ['inappropriate', 'spam', 'offensive'];
    const hasHighRiskFlags = highRiskFlags.some(flag => 
      flags.includes(flag)
    );

    if (hasHighRiskFlags) {
      await this.submitForModeration(entityType, entityId, undefined, 'high');
      return false; // Content blocked
    }

    // Auto-approve if no flags
    if (flags.length === 0) {
      return true; // Content approved
    }

    // Submit for manual review
    await this.submitForModeration(entityType, entityId);
    return false; // Pending review
  }

  /**
   * Analyze content for automated flagging
   */
  private static async analyzeContent(entityType: string, entityId: string): Promise<string[]> {
    const flags: string[] = [];

    try {
      let content: any;

      // Get content based on entity type
      switch (entityType) {
        case 'blog_post':
          content = await storage.getBlogPost(entityId);
          break;
        case 'ebook':
          content = await storage.getEbook(entityId);
          break;
        case 'review':
          content = await storage.getReview(entityId);
          break;
        default:
          return flags;
      }

      if (!content) return flags;

      // Simple content analysis (in production, use AI/ML services)
      const text = (content.title + ' ' + content.content + ' ' + content.description).toLowerCase();

      // Check for spam indicators
      if (this.containsSpamKeywords(text)) {
        flags.push('spam');
      }

      // Check for inappropriate content
      if (this.containsInappropriateContent(text)) {
        flags.push('inappropriate');
      }

      // Check for offensive language
      if (this.containsOffensiveLanguage(text)) {
        flags.push('offensive');
      }

      // Check content quality
      if (this.isLowQuality(text)) {
        flags.push('lowQuality');
      }

    } catch (error) {
      console.error('Content analysis error:', error);
    }

    return flags;
  }

  /**
   * Apply moderation decision to actual content
   */
  private static async applyModerationDecision(
    item: ModerationItem,
    action: ModerationAction
  ): Promise<void> {
    const isApproved = action.status === 'approved';

    switch (item.entityType) {
      case 'blog_post':
        await storage.updateBlogPostStatus(item.entityId, isApproved ? 'published' : 'rejected');
        break;
      case 'ebook':
        await storage.updateEbookStatus(item.entityId, isApproved ? 'approved' : 'rejected');
        break;
      case 'review':
        await storage.updateReviewStatus(item.entityId, isApproved ? 'approved' : 'rejected');
        break;
      default:
        // Handle other content types
        break;
    }
  }

  /**
   * Send notification for content rejection
   */
  private static async notifyContentRejection(
    item: ModerationItem,
    reason?: string
  ): Promise<void> {
    // Get content author/creator
    let authorId: string | null = null;

    switch (item.entityType) {
      case 'blog_post':
        const blogPost = await storage.getBlogPost(item.entityId);
        authorId = blogPost?.authorId;
        break;
      case 'ebook':
        const ebook = await storage.getEbook(item.entityId);
        authorId = ebook?.authorId;
        break;
      case 'review':
        const review = await storage.getReview(item.entityId);
        authorId = review?.userId;
        break;
    }

    if (authorId) {
      // Send email notification (implement email service)
      // For now, just log the notification
      await AdminAuthService.logAdminAction(
        'system',
        'content_rejection_notification',
        {
          recipientId: authorId,
          entityType: item.entityType,
          entityId: item.entityId,
          reason
        }
      );
    }
  }

  /**
   * Simple spam detection
   */
  private static containsSpamKeywords(text: string): boolean {
    const spamKeywords = [
      'buy now', 'click here', 'limited time', 'act now',
      'free money', 'guaranteed', 'no risk', 'winner'
    ];
    return spamKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Inappropriate content detection
   */
  private static containsInappropriateContent(text: string): boolean {
    // Basic inappropriate content detection
    const inappropriateKeywords = [
      // Add appropriate keywords for your use case
    ];
    return inappropriateKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Offensive language detection
   */
  private static containsOffensiveLanguage(text: string): boolean {
    // Basic offensive language detection
    const offensiveWords = [
      // Add appropriate words for your use case
    ];
    return offensiveWords.some(word => text.includes(word));
  }

  /**
   * Low quality content detection
   */
  private static isLowQuality(text: string): boolean {
    // Check for various quality indicators
    const wordCount = text.split(/\s+/).length;
    const hasMultipleExclamation = (text.match(/!/g) || []).length > 5;
    const hasExcessiveCaps = text.toUpperCase() === text && text.length > 20;
    
    return wordCount < 50 || hasMultipleExclamation || hasExcessiveCaps;
  }

  /**
   * Get moderation guidelines for moderators
   */
  static getModerationGuidelines(): any {
    return {
      blogPosts: {
        criteria: [
          'Content must be relevant to plants and gardening',
          'No promotional content without disclosure',
          'Must be original or properly attributed',
          'Professional language and tone',
          'Factually accurate information'
        ],
        rejectionReasons: [
          'Off-topic content',
          'Promotional spam',
          'Copyright violation',
          'Factual inaccuracies',
          'Poor quality or formatting'
        ]
      },
      ebooks: {
        criteria: [
          'Comprehensive gardening content',
          'Professional formatting and structure',
          'Original content or proper licensing',
          'Educational value',
          'Appropriate pricing'
        ],
        rejectionReasons: [
          'Insufficient content depth',
          'Copyright issues',
          'Poor formatting',
          'Misleading information',
          'Inappropriate pricing'
        ]
      },
      reviews: {
        criteria: [
          'Genuine user experience',
          'Constructive feedback',
          'Relevant to product/service',
          'Respectful language',
          'Helpful to other users'
        ],
        rejectionReasons: [
          'Fake or spam review',
          'Offensive language',
          'Not product-related',
          'Promotional content',
          'Personal attacks'
        ]
      }
    };
  }
}