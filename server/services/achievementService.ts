import { db } from '../db';
import { 
  achievements, 
  userAchievements, 
  userGardenStats, 
  careActivities, 
  gardenPlants,
  type Achievement,
  type InsertUserAchievement,
  type UserGardenStats 
} from '@shared/schema';
import { eq, and, count, desc, gte } from 'drizzle-orm';

export class AchievementService {
  async initializeUserStats(userId: string): Promise<UserGardenStats> {
    try {
      // Check if user stats already exist
      const [existingStats] = await db
        .select()
        .from(userGardenStats)
        .where(eq(userGardenStats.userId, userId))
        .limit(1);

      if (existingStats) {
        return existingStats;
      }

      // Create initial stats for new user
      const [newStats] = await db
        .insert(userGardenStats)
        .values({
          userId,
          totalPoints: 0,
          level: 1,
          plantsOwned: 0,
          achievementsUnlocked: 0,
          careStreak: 0,
          longestStreak: 0,
          experiencePoints: 0,
          rank: 'seedling',
          badgeCount: 0,
        })
        .returning();

      return newStats;
    } catch (error) {
      console.error('Error initializing user stats:', error);
      throw error;
    }
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    try {
      const unlockedAchievements: Achievement[] = [];
      
      // Get all active achievements
      const allAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true));

      // Get user's current achievements
      const userAchievementIds = await db
        .select({ achievementId: userAchievements.achievementId })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const unlockedIds = new Set(userAchievementIds.map(ua => ua.achievementId));

      // Check each achievement
      for (const achievement of allAchievements) {
        if (unlockedIds.has(achievement.id)) continue;

        const isUnlocked = await this.checkAchievementRequirement(userId, achievement);
        if (isUnlocked) {
          await this.unlockAchievement(userId, achievement.id);
          unlockedAchievements.push(achievement);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  private async checkAchievementRequirement(userId: string, achievement: Achievement): Promise<boolean> {
    const requirement = achievement.requirement as any;
    
    switch (requirement.type) {
      case 'plants_owned':
        const plantCount = await db
          .select({ count: count() })
          .from(gardenPlants)
          .where(and(
            eq(gardenPlants.userId, userId),
            eq(gardenPlants.isActive, true)
          ));
        return plantCount[0].count >= requirement.value;

      case 'care_streak':
        const stats = await db
          .select()
          .from(userGardenStats)
          .where(eq(userGardenStats.userId, userId))
          .limit(1);
        return stats[0]?.careStreak >= requirement.value;

      case 'care_activities':
        const activityCount = await db
          .select({ count: count() })
          .from(careActivities)
          .where(and(
            eq(careActivities.userId, userId),
            eq(careActivities.isCompleted, true)
          ));
        return activityCount[0].count >= requirement.value;

      case 'time_based':
        // Check if user has been active for certain period
        const userStats = await db
          .select()
          .from(userGardenStats)
          .where(eq(userGardenStats.userId, userId))
          .limit(1);
        
        if (!userStats[0]) return false;
        
        const daysSinceJoin = Math.floor(
          (Date.now() - userStats[0].createdAt!.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceJoin >= requirement.days;

      default:
        return false;
    }
  }

  private async unlockAchievement(userId: string, achievementId: string, plantId?: string): Promise<void> {
    try {
      // Add achievement to user
      await db.insert(userAchievements).values({
        userId,
        achievementId,
        plantId,
      });

      // Update user stats
      const achievement = await db
        .select()
        .from(achievements)
        .where(eq(achievements.id, achievementId))
        .limit(1);

      if (achievement[0]) {
        await db
          .update(userGardenStats)
          .set({
            totalPoints: db.$sql`${userGardenStats.totalPoints} + ${achievement[0].points}`,
            achievementsUnlocked: db.$sql`${userGardenStats.achievementsUnlocked} + 1`,
            experiencePoints: db.$sql`${userGardenStats.experiencePoints} + ${achievement[0].points * 2}`,
            updatedAt: new Date(),
          })
          .where(eq(userGardenStats.userId, userId));

        // Check for level up
        await this.checkLevelUp(userId);
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  private async checkLevelUp(userId: string): Promise<void> {
    const [stats] = await db
      .select()
      .from(userGardenStats)
      .where(eq(userGardenStats.userId, userId))
      .limit(1);

    if (!stats) return;

    // Level calculation: every 100 XP = 1 level
    const newLevel = Math.floor(stats.experiencePoints / 100) + 1;
    
    if (newLevel > stats.level) {
      // Determine new rank based on level
      let newRank: string = stats.rank;
      if (newLevel >= 20) newRank = 'botanist';
      else if (newLevel >= 15) newRank = 'expert';
      else if (newLevel >= 10) newRank = 'gardener';
      else if (newLevel >= 5) newRank = 'sprout';

      await db
        .update(userGardenStats)
        .set({
          level: newLevel,
          rank: newRank as any,
          updatedAt: new Date(),
        })
        .where(eq(userGardenStats.userId, userId));
    }
  }

  async updateCareStreak(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [stats] = await db
        .select()
        .from(userGardenStats)
        .where(eq(userGardenStats.userId, userId))
        .limit(1);

      if (!stats) return;

      const lastCareDate = stats.lastCareDate;
      let newStreak = 1;

      if (lastCareDate) {
        const lastCareDateStr = lastCareDate.toString();
        if (lastCareDateStr === yesterday) {
          // Consecutive day
          newStreak = stats.careStreak + 1;
        } else if (lastCareDateStr === today) {
          // Already updated today
          return;
        }
        // If gap > 1 day, streak resets to 1
      }

      await db
        .update(userGardenStats)
        .set({
          careStreak: newStreak,
          longestStreak: Math.max(newStreak, stats.longestStreak),
          lastCareDate: today,
          updatedAt: new Date(),
        })
        .where(eq(userGardenStats.userId, userId));

    } catch (error) {
      console.error('Error updating care streak:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: string) {
    try {
      const userAchievementsList = await db
        .select({
          achievement: achievements,
          unlockedAt: userAchievements.unlockedAt,
          sharedAt: userAchievements.sharedAt,
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.unlockedAt));

      return userAchievementsList;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<UserGardenStats | null> {
    try {
      const [stats] = await db
        .select()
        .from(userGardenStats)
        .where(eq(userGardenStats.userId, userId))
        .limit(1);

      return stats || null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export const achievementService = new AchievementService();