import type { Express } from 'express';
import { isAuthenticated } from '../auth';
import { achievementService } from '../services/achievementService';
import { aiHealthPredictionService } from '../services/aiHealthPredictionService';
import { socialSharingService } from '../services/socialSharingService';
import { weatherService } from '../services/weatherService';
import { db } from '../db';
import { 
  achievements, 
  gardenPlants, 
  plantHealthPredictions,
  plantMilestoneShares,
  userGardenStats,
  insertPlantMilestoneShareSchema 
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export function registerPlantCareRoutes(app: Express) {
  // User Stats and Achievements
  app.get('/api/garden/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Initialize user stats if they don't exist
      let stats = await achievementService.getUserStats(userId);
      if (!stats) {
        stats = await achievementService.initializeUserStats(userId);
      }

      // Check for new achievements
      const newAchievements = await achievementService.checkAndUnlockAchievements(userId);
      
      // Get user achievements
      const userAchievements = await achievementService.getUserAchievements(userId);

      res.json({
        stats,
        newAchievements,
        recentAchievements: userAchievements.slice(0, 5),
        totalAchievements: userAchievements.length
      });
    } catch (error) {
      console.error('Error getting garden stats:', error);
      res.status(500).json({ message: 'Failed to get garden stats' });
    }
  });

  // Get all available achievements
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const allAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true));

      const userAchievements = await achievementService.getUserAchievements(req.user.id);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievement.id));

      const achievementData = allAchievements.map(achievement => ({
        ...achievement,
        isUnlocked: unlockedIds.has(achievement.id),
        unlockedAt: userAchievements.find(ua => ua.achievement.id === achievement.id)?.unlockedAt
      }));

      res.json(achievementData);
    } catch (error) {
      console.error('Error getting achievements:', error);
      res.status(500).json({ message: 'Failed to get achievements' });
    }
  });

  // Update care streak
  app.post('/api/garden/care-activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await achievementService.updateCareStreak(userId);
      
      // Check for new achievements after care activity
      const newAchievements = await achievementService.checkAndUnlockAchievements(userId);
      
      res.json({ 
        message: 'Care activity recorded',
        newAchievements 
      });
    } catch (error) {
      console.error('Error recording care activity:', error);
      res.status(500).json({ message: 'Failed to record care activity' });
    }
  });

  // AI Health Prediction Routes
  app.get('/api/plants/:plantId/health-prediction', isAuthenticated, async (req: any, res) => {
    try {
      const { plantId } = req.params;
      const userId = req.user.id;

      const prediction = await aiHealthPredictionService.generateHealthPrediction(plantId, userId);
      res.json(prediction);
    } catch (error) {
      console.error('Error generating health prediction:', error);
      res.status(500).json({ message: 'Failed to generate health prediction' });
    }
  });

  app.get('/api/plants/:plantId/predictions', isAuthenticated, async (req: any, res) => {
    try {
      const { plantId } = req.params;
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;

      const predictions = await aiHealthPredictionService.getPlantPredictions(plantId, userId, limit);
      res.json(predictions);
    } catch (error) {
      console.error('Error getting plant predictions:', error);
      res.status(500).json({ message: 'Failed to get predictions' });
    }
  });

  app.post('/api/predictions/:predictionId/accuracy', isAuthenticated, async (req: any, res) => {
    try {
      const { predictionId } = req.params;
      const { actualOutcome } = req.body;

      await aiHealthPredictionService.updatePredictionAccuracy(predictionId, actualOutcome);
      res.json({ message: 'Prediction accuracy updated' });
    } catch (error) {
      console.error('Error updating prediction accuracy:', error);
      res.status(500).json({ message: 'Failed to update prediction accuracy' });
    }
  });

  app.post('/api/garden/batch-predictions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const predictions = await aiHealthPredictionService.generateBatchPredictions(userId);
      res.json(predictions);
    } catch (error) {
      console.error('Error generating batch predictions:', error);
      res.status(500).json({ message: 'Failed to generate batch predictions' });
    }
  });

  // Weather Integration Routes
  app.get('/api/weather/current/:location', isAuthenticated, async (req, res) => {
    try {
      const { location } = req.params;
      const weather = await weatherService.getCurrentWeather(location);
      res.json(weather);
    } catch (error) {
      console.error('Error getting current weather:', error);
      res.status(500).json({ message: 'Failed to get weather data' });
    }
  });

  app.get('/api/weather/forecast/:location', isAuthenticated, async (req, res) => {
    try {
      const { location } = req.params;
      const days = parseInt(req.query.days as string) || 7;
      const forecast = await weatherService.getWeatherForecast(location, days);
      res.json(forecast);
    } catch (error) {
      console.error('Error getting weather forecast:', error);
      res.status(500).json({ message: 'Failed to get weather forecast' });
    }
  });

  // Social Sharing Routes
  app.post('/api/milestones/share', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const shareData = insertPlantMilestoneShareSchema.parse(req.body);

      const share = await socialSharingService.createMilestoneShare(userId, shareData);
      res.json(share);
    } catch (error) {
      console.error('Error creating milestone share:', error);
      res.status(500).json({ message: 'Failed to create milestone share' });
    }
  });

  app.get('/api/milestones/my-shares', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const shares = await socialSharingService.getUserShares(userId, limit);
      res.json(shares);
    } catch (error) {
      console.error('Error getting user shares:', error);
      res.status(500).json({ message: 'Failed to get user shares' });
    }
  });

  app.get('/api/milestones/public', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const shares = await socialSharingService.getPublicShares(limit);
      res.json(shares);
    } catch (error) {
      console.error('Error getting public shares:', error);
      res.status(500).json({ message: 'Failed to get public shares' });
    }
  });

  app.post('/api/milestones/:shareId/like', isAuthenticated, async (req: any, res) => {
    try {
      const { shareId } = req.params;
      const userId = req.user.id;

      await socialSharingService.likeShare(shareId, userId);
      res.json({ message: 'Share liked successfully' });
    } catch (error) {
      console.error('Error liking share:', error);
      res.status(500).json({ message: 'Failed to like share' });
    }
  });

  app.post('/api/milestones/:shareId/generate-post', isAuthenticated, async (req: any, res) => {
    try {
      const { shareId } = req.params;
      const { platform } = req.body;

      const share = await socialSharingService.getShareById(shareId);
      if (!share) {
        return res.status(404).json({ message: 'Share not found' });
      }

      const post = await socialSharingService.generateSocialMediaPost(share, platform);
      
      // Increment share count
      await socialSharingService.incrementShareCount(shareId);
      
      res.json(post);
    } catch (error) {
      console.error('Error generating social media post:', error);
      res.status(500).json({ message: 'Failed to generate social media post' });
    }
  });

  app.delete('/api/milestones/:shareId', isAuthenticated, async (req: any, res) => {
    try {
      const { shareId } = req.params;
      const userId = req.user.id;

      await socialSharingService.deleteShare(shareId, userId);
      res.json({ message: 'Share deleted successfully' });
    } catch (error) {
      console.error('Error deleting share:', error);
      res.status(500).json({ message: 'Failed to delete share' });
    }
  });

  // Dashboard overview route
  app.get('/api/garden/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Get user stats
      let stats = await achievementService.getUserStats(userId);
      if (!stats) {
        stats = await achievementService.initializeUserStats(userId);
      }

      // Get user plants
      const plants = await db
        .select()
        .from(gardenPlants)
        .where(and(
          eq(gardenPlants.userId, userId),
          eq(gardenPlants.isActive, true)
        ))
        .orderBy(desc(gardenPlants.createdAt))
        .limit(10);

      // Get recent predictions
      const recentPredictions = await db
        .select()
        .from(plantHealthPredictions)
        .where(eq(plantHealthPredictions.userId, userId))
        .orderBy(desc(plantHealthPredictions.createdAt))
        .limit(5);

      // Get recent achievements
      const recentAchievements = await achievementService.getUserAchievements(userId);

      // Get recent shares
      const recentShares = await socialSharingService.getUserShares(userId, 5);

      res.json({
        stats,
        plants,
        recentPredictions,
        recentAchievements: recentAchievements.slice(0, 3),
        recentShares,
        weatherLocation: req.user.location || 'general'
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ message: 'Failed to get dashboard data' });
    }
  });
}