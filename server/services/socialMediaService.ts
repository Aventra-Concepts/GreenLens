import { db } from "../db";
import { socialMediaSettings, socialMediaPosts, socialMediaAnalytics } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export class SocialMediaService {
  // Settings Management
  async getSettings() {
    const [settings] = await db.select().from(socialMediaSettings).limit(1);
    return settings;
  }

  async updateSettings(data: any) {
    const existingSettings = await this.getSettings();
    
    if (existingSettings) {
      const [updated] = await db
        .update(socialMediaSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(socialMediaSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(socialMediaSettings)
        .values(data)
        .returning();
      return created;
    }
  }

  // Posts Management
  async createPost(data: any, userId: string) {
    const [post] = await db
      .insert(socialMediaPosts)
      .values({
        ...data,
        createdBy: userId,
        status: data.scheduledFor ? "scheduled" : "draft",
      })
      .returning();
    return post;
  }

  async getPosts() {
    return await db
      .select()
      .from(socialMediaPosts)
      .orderBy(desc(socialMediaPosts.createdAt));
  }

  async getPostById(id: string) {
    const [post] = await db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.id, id));
    return post;
  }

  async updatePostStatus(id: string, status: string, data?: any) {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === "published") {
      updateData.publishedAt = new Date();
    }
    
    if (data?.externalPostId) {
      updateData.externalPostId = data.externalPostId;
    }
    
    if (data?.errorMessage) {
      updateData.errorMessage = data.errorMessage;
    }

    const [updated] = await db
      .update(socialMediaPosts)
      .set(updateData)
      .where(eq(socialMediaPosts.id, id))
      .returning();
    return updated;
  }

  // Analytics
  async getAnalytics() {
    // Get total posts this month
    const postsThisMonth = await db
      .select({ count: sql<number>`count(*)` })
      .from(socialMediaPosts)
      .where(sql`DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`);

    // Get recent analytics data
    const recentAnalytics = await db
      .select()
      .from(socialMediaAnalytics)
      .orderBy(desc(socialMediaAnalytics.date))
      .limit(30);

    // Calculate totals
    const totalFollowers = recentAnalytics
      .filter(a => a.metric === 'followers')
      .reduce((sum, a) => sum + a.value, 0);

    const engagementData = recentAnalytics
      .filter(a => ['likes', 'shares', 'comments'].includes(a.metric))
      .reduce((sum, a) => sum + a.value, 0);

    return {
      totalFollowers,
      postsThisMonth: postsThisMonth[0]?.count || 0,
      engagementRate: engagementData > 0 ? Math.round((engagementData / totalFollowers) * 100 * 100) / 100 : 0,
      recentAnalytics,
    };
  }

  async saveAnalytics(platform: string, metric: string, value: number, date: string) {
    return await db
      .insert(socialMediaAnalytics)
      .values({
        platform,
        metric,
        value,
        date,
      })
      .returning();
  }

  // Platform Integration Methods
  async publishToFacebook(post: any, settings: any) {
    // Facebook Graph API integration
    try {
      if (!settings.facebookAccessToken || !settings.facebookPageId) {
        throw new Error("Facebook credentials not configured");
      }

      const url = `https://graph.facebook.com/${settings.facebookPageId}/feed`;
      const params = new URLSearchParams({
        message: post.content + (post.hashtags ? `\n\n${post.hashtags}` : ''),
        access_token: settings.facebookAccessToken,
      });

      if (post.imageUrl) {
        params.append('link', post.imageUrl);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: params,
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.id;
    } catch (error) {
      console.error('Facebook publish error:', error);
      throw error;
    }
  }

  async publishToTwitter(post: any, settings: any) {
    // Twitter API v2 integration
    try {
      if (!settings.twitterAccessToken) {
        throw new Error("Twitter credentials not configured");
      }

      const tweetContent = post.content + (post.hashtags ? ` ${post.hashtags}` : '');
      
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.twitterAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: tweetContent.slice(0, 280), // Twitter character limit
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data?.id;
    } catch (error) {
      console.error('Twitter publish error:', error);
      throw error;
    }
  }

  async publishToInstagram(post: any, settings: any) {
    // Instagram Basic Display API integration
    try {
      if (!settings.instagramAccessToken || !settings.instagramUserId) {
        throw new Error("Instagram credentials not configured");
      }

      if (!post.imageUrl) {
        throw new Error("Instagram posts require an image");
      }

      // Create media container
      const mediaResponse = await fetch(
        `https://graph.instagram.com/${settings.instagramUserId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            image_url: post.imageUrl,
            caption: post.content + (post.hashtags ? `\n\n${post.hashtags}` : ''),
            access_token: settings.instagramAccessToken,
          }),
        }
      );

      const mediaResult = await mediaResponse.json();
      
      if (mediaResult.error) {
        throw new Error(mediaResult.error.message);
      }

      // Publish the media
      const publishResponse = await fetch(
        `https://graph.instagram.com/${settings.instagramUserId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            creation_id: mediaResult.id,
            access_token: settings.instagramAccessToken,
          }),
        }
      );

      const publishResult = await publishResponse.json();
      
      if (publishResult.error) {
        throw new Error(publishResult.error.message);
      }

      return publishResult.id;
    } catch (error) {
      console.error('Instagram publish error:', error);
      throw error;
    }
  }

  async publishToWhatsApp(post: any, settings: any) {
    // WhatsApp Business API integration
    try {
      if (!settings.whatsappAccessToken || !settings.whatsappBusinessNumber) {
        throw new Error("WhatsApp credentials not configured");
      }

      // Note: WhatsApp Business API requires approved templates for broadcasting
      // This is a simplified example - real implementation would need proper templates
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${settings.whatsappBusinessNumber}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: 'broadcast', // This would need to be a specific contact list
            type: 'text',
            text: {
              body: post.content + (post.hashtags ? `\n\n${post.hashtags}` : ''),
            },
          }),
        }
      );

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.messages?.[0]?.id;
    } catch (error) {
      console.error('WhatsApp publish error:', error);
      throw error;
    }
  }

  async publishPost(postId: string) {
    const post = await this.getPostById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const settings = await this.getSettings();
    if (!settings) {
      throw new Error("Social media settings not configured");
    }

    try {
      let externalPostId: string | undefined;

      switch (post.platform) {
        case 'facebook':
          externalPostId = await this.publishToFacebook(post, settings);
          break;
        case 'twitter':
          externalPostId = await this.publishToTwitter(post, settings);
          break;
        case 'instagram':
          externalPostId = await this.publishToInstagram(post, settings);
          break;
        case 'whatsapp':
          externalPostId = await this.publishToWhatsApp(post, settings);
          break;
        default:
          throw new Error(`Unsupported platform: ${post.platform}`);
      }

      await this.updatePostStatus(postId, 'published', { externalPostId });
      return { success: true, externalPostId };
    } catch (error) {
      await this.updatePostStatus(postId, 'failed', { 
        errorMessage: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }
}

export const socialMediaService = new SocialMediaService();