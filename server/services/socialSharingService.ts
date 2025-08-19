import { db } from '../db';
import { 
  plantMilestoneShares, 
  userAchievements, 
  achievements, 
  gardenPlants,
  type InsertPlantMilestoneShare,
  type PlantMilestoneShare 
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export class SocialSharingService {
  async createMilestoneShare(userId: string, shareData: InsertPlantMilestoneShare): Promise<PlantMilestoneShare> {
    try {
      const [share] = await db
        .insert(plantMilestoneShares)
        .values({
          ...shareData,
          userId,
        })
        .returning();

      // If sharing an achievement, mark it as shared
      if (shareData.achievementId) {
        await db
          .update(userAchievements)
          .set({ sharedAt: new Date() })
          .where(and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementId, shareData.achievementId)
          ));
      }

      return share;
    } catch (error) {
      console.error('Error creating milestone share:', error);
      throw error;
    }
  }

  async generateShareContent(milestoneType: string, plant: any, achievement?: any): Promise<{
    title: string;
    description: string;
    hashtags: string[];
  }> {
    const shareContent = {
      title: '',
      description: '',
      hashtags: ['#PlantParent', '#GreenThumb', '#GreenLens', '#PlantCare']
    };

    switch (milestoneType) {
      case 'growth':
        shareContent.title = `🌱 My ${plant.name} is thriving!`;
        shareContent.description = `Celebrating the amazing growth of my ${plant.species || plant.name}! Another milestone in my plant journey. 🌿`;
        shareContent.hashtags.push('#PlantGrowth', '#GardeningSuccess');
        break;

      case 'flowering':
        shareContent.title = `🌸 First blooms on my ${plant.name}!`;
        shareContent.description = `So excited to see the first flowers on my ${plant.species || plant.name}! All the care and patience has paid off. 🌺`;
        shareContent.hashtags.push('#FirstBlooms', '#FlowerPower', '#GardeningRewards');
        break;

      case 'fruiting':
        shareContent.title = `🍅 Harvest time for my ${plant.name}!`;
        shareContent.description = `From seed to fruit - my ${plant.species || plant.name} is ready for harvest! Nothing beats homegrown produce. 🥕`;
        shareContent.hashtags.push('#Harvest', '#HomegrownFood', '#GardenToTable');
        break;

      case 'achievement':
        if (achievement) {
          shareContent.title = `🏆 Achievement Unlocked: ${achievement.name}!`;
          shareContent.description = `Just earned the "${achievement.name}" badge! ${achievement.description} 🎉`;
          shareContent.hashtags.push('#Achievement', '#GamifiedGardening', '#PlantBadge');
        }
        break;

      case 'care_streak':
        shareContent.title = `🔥 Plant Care Streak Active!`;
        shareContent.description = `Keeping up with consistent plant care! Every plant deserves daily attention and love. 💚`;
        shareContent.hashtags.push('#CareStreak', '#Consistency', '#DailyPlantCare');
        break;

      case 'health_improvement':
        shareContent.title = `💪 Plant Recovery Success!`;
        shareContent.description = `My ${plant.species || plant.name} has made an amazing recovery! Proper care and patience really work. 🌱`;
        shareContent.hashtags.push('#PlantRecovery', '#HealthyPlants', '#NeverGiveUp');
        break;

      default:
        shareContent.title = `🌿 Plant Milestone Achieved!`;
        shareContent.description = `Celebrating another milestone in my plant journey with ${plant.species || plant.name}! 🎯`;
    }

    return shareContent;
  }

  async generateSocialMediaPost(share: PlantMilestoneShare, platform: string): Promise<{
    text: string;
    imageUrl?: string;
    url?: string;
  }> {
    const baseText = `${share.title}\n\n${share.description}`;
    
    const plantData = await db
      .select()
      .from(gardenPlants)
      .where(eq(gardenPlants.id, share.plantId))
      .limit(1);

    const plant = plantData[0];

    switch (platform) {
      case 'twitter':
        // Twitter has character limits
        const twitterText = `${share.title}\n\n${share.description}\n\n#PlantParent #GreenThumb #GreenLens`;
        return {
          text: twitterText.length > 280 ? twitterText.substring(0, 277) + '...' : twitterText,
          imageUrl: share.imageUrl || undefined,
        };

      case 'facebook':
        return {
          text: `${baseText}\n\nShared via GreenLens - AI Plant Care Platform 🌱`,
          imageUrl: share.imageUrl || undefined,
          url: process.env.BASE_URL ? `${process.env.BASE_URL}/plant/${share.plantId}` : undefined,
        };

      case 'instagram':
        return {
          text: `${baseText}\n\n#PlantParent #GreenThumb #GreenLens #PlantCare #IndoorPlants #GardeningLife`,
          imageUrl: share.imageUrl || undefined,
        };

      default:
        return {
          text: baseText,
          imageUrl: share.imageUrl || undefined,
        };
    }
  }

  async getUserShares(userId: string, limit: number = 20): Promise<PlantMilestoneShare[]> {
    try {
      const shares = await db
        .select()
        .from(plantMilestoneShares)
        .where(eq(plantMilestoneShares.userId, userId))
        .orderBy(desc(plantMilestoneShares.createdAt))
        .limit(limit);

      return shares;
    } catch (error) {
      console.error('Error getting user shares:', error);
      throw error;
    }
  }

  async getPublicShares(limit: number = 50): Promise<Array<PlantMilestoneShare & { plantName: string }>> {
    try {
      const shares = await db
        .select({
          share: plantMilestoneShares,
          plantName: gardenPlants.name,
        })
        .from(plantMilestoneShares)
        .innerJoin(gardenPlants, eq(plantMilestoneShares.plantId, gardenPlants.id))
        .where(eq(plantMilestoneShares.isPublic, true))
        .orderBy(desc(plantMilestoneShares.createdAt))
        .limit(limit);

      return shares.map(s => ({
        ...s.share,
        plantName: s.plantName
      }));
    } catch (error) {
      console.error('Error getting public shares:', error);
      throw error;
    }
  }

  async likeShare(shareId: string, userId: string): Promise<void> {
    try {
      // In a real app, you'd track individual likes to prevent duplicate likes
      await db
        .update(plantMilestoneShares)
        .set({
          likes: db.$sql`${plantMilestoneShares.likes} + 1`
        })
        .where(eq(plantMilestoneShares.id, shareId));
    } catch (error) {
      console.error('Error liking share:', error);
      throw error;
    }
  }

  async incrementShareCount(shareId: string): Promise<void> {
    try {
      await db
        .update(plantMilestoneShares)
        .set({
          shares: db.$sql`${plantMilestoneShares.shares} + 1`
        })
        .where(eq(plantMilestoneShares.id, shareId));
    } catch (error) {
      console.error('Error incrementing share count:', error);
      throw error;
    }
  }

  async deleteShare(shareId: string, userId: string): Promise<void> {
    try {
      await db
        .delete(plantMilestoneShares)
        .where(and(
          eq(plantMilestoneShares.id, shareId),
          eq(plantMilestoneShares.userId, userId)
        ));
    } catch (error) {
      console.error('Error deleting share:', error);
      throw error;
    }
  }

  async getShareById(shareId: string): Promise<PlantMilestoneShare | null> {
    try {
      const [share] = await db
        .select()
        .from(plantMilestoneShares)
        .where(eq(plantMilestoneShares.id, shareId))
        .limit(1);

      return share || null;
    } catch (error) {
      console.error('Error getting share by ID:', error);
      throw error;
    }
  }
}

export const socialSharingService = new SocialSharingService();