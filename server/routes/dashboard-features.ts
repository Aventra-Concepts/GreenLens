import express from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { plantResults, userAchievements, achievements, users, gardenPlants } from '@shared/schema';
import { achievementService } from '../services/achievementService';
import { isAuthenticated } from '../auth';

const router = express.Router();

// AI Health Predictions endpoint
router.get('/api/health-predictions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's plant health data
    const healthData = await db
      .select({
        overallHealth: sql<string>`CASE 
          WHEN AVG(CAST(${plantResults.confidence} as numeric)) > 80 THEN 'Excellent'
          WHEN AVG(CAST(${plantResults.confidence} as numeric)) > 60 THEN 'Good'
          ELSE 'Needs Attention'
        END`,
        diseaseRisk: sql<string>`CASE 
          WHEN COUNT(*) > 10 THEN 'Low'
          WHEN COUNT(*) > 5 THEN 'Medium'
          ELSE 'High'
        END`,
        totalPlants: sql<number>`COUNT(*)`,
        avgConfidence: sql<number>`AVG(CAST(${plantResults.confidence} as numeric))`
      })
      .from(plantResults)
      .where(eq(plantResults.userId, userId));

    res.json(healthData[0] || {
      overallHealth: 'Good',
      diseaseRisk: 'Low',
      totalPlants: 0,
      avgConfidence: 85
    });
  } catch (error) {
    console.error('Health predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch health predictions' });
  }
});

// User achievements endpoint
router.get('/api/user-achievements', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // Initialize user stats if not exists
    await achievementService.initializeUserStats(userId);
    
    // Get user stats
    const stats = await achievementService.getUserStats(userId);
    
    // Get recent achievements
    const recentAchievements = await db
      .select({
        achievement: achievements,
        unlockedAt: userAchievements.unlockedAt
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt))
      .limit(5);

    res.json({
      stats,
      recentAchievements
    });
  } catch (error) {
    console.error('User achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// Recent community predictions endpoint
router.get('/api/recent-predictions', isAuthenticated, async (req: any, res) => {
  try {
    // Get recent plant identifications from the community (anonymized)
    const recentPredictions = await db
      .select({
        plantName: plantResults.primaryCommonName,
        scientificName: plantResults.species,
        confidence: plantResults.confidence,
        createdAt: plantResults.createdAt,
        // Don't include user info for privacy
      })
      .from(plantResults)
      .orderBy(desc(plantResults.createdAt))
      .limit(12);

    res.json(recentPredictions);
  } catch (error) {
    console.error('Recent predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent predictions' });
  }
});

// Social sharing milestone endpoint
router.post('/api/share-milestone', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { plantId, milestoneType, title, description } = req.body;

    // Validate inputs
    if (!plantId || !milestoneType || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create share record (placeholder implementation)
    const shareData = {
      userId,
      plantId,
      milestoneType,
      title,
      description,
      platform: 'internal',
      createdAt: new Date()
    };

    res.json({ 
      success: true, 
      message: 'Milestone shared successfully!',
      shareData 
    });
  } catch (error) {
    console.error('Share milestone error:', error);
    res.status(500).json({ error: 'Failed to share milestone' });
  }
});

export default router;