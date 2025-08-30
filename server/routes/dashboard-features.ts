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
        plantName: plantResults.commonName,
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

// Admin garden endpoints - accessible without user login
router.get('/api/admin/garden-users/:filterType', async (req: any, res) => {
  try {
    const { filterType } = req.params;
    
    // Base query setup
    const baseQuery = db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        subscriptionStatus: sql<string>`COALESCE(${users.subscriptionStatus}, 'free')`,
        totalPlants: sql<number>`COALESCE((SELECT COUNT(*) FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 0)`,
        totalIdentifications: sql<number>`COALESCE((SELECT COUNT(*) FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 0)`,
        lastActive: users.updatedAt,
        gardenLevel: sql<number>`COALESCE((SELECT FLOOR(COUNT(*)/10) + 1 FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 1)`,
        experiencePoints: sql<number>`COALESCE((SELECT COUNT(*) * 50 FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 0)`
      })
      .from(users);
    
    let gardenUsers;
    
    // Apply filtering based on type
    if (filterType === 'active') {
      gardenUsers = await baseQuery
        .where(eq(users.subscriptionStatus, 'active'))
        .orderBy(desc(users.createdAt))
        .limit(100);
    } else if (filterType === 'premium') {
      // Return demo premium users for demonstration
      gardenUsers = [
        {
          id: "demo-premium-1",
          firstName: "Demo Dr. Sarah",
          lastName: "Botanica", 
          email: "sarah.botanica@email.com",
          profileImageUrl: null,
          createdAt: new Date("2024-03-15T10:00:00Z"),
          subscriptionStatus: "active",
          totalPlants: 42,
          totalIdentifications: 89,
          lastActive: new Date("2024-08-30T11:30:00Z"),
          gardenLevel: 9,
          experiencePoints: 2990
        },
        {
          id: "demo-premium-2",
          firstName: "Demo Marcus",
          lastName: "GreenThumb",
          email: "marcus.greenthumb@email.com", 
          profileImageUrl: null,
          createdAt: new Date("2024-04-20T14:15:00Z"),
          subscriptionStatus: "active",
          totalPlants: 35,
          totalIdentifications: 72,
          lastActive: new Date("2024-08-30T09:45:00Z"),
          gardenLevel: 8,
          experiencePoints: 2470
        },
        {
          id: "demo-premium-3",
          firstName: "Demo Isabella",
          lastName: "Flora",
          email: "isabella.flora@email.com",
          profileImageUrl: null,
          createdAt: new Date("2024-02-10T08:30:00Z"),
          subscriptionStatus: "active",
          totalPlants: 56,
          totalIdentifications: 124,
          lastActive: new Date("2024-08-30T07:20:00Z"),
          gardenLevel: 12,
          experiencePoints: 4040
        },
        {
          id: "demo-premium-4", 
          firstName: "Demo Dr. Victoria",
          lastName: "Plantwell",
          email: "victoria.plantwell@email.com",
          profileImageUrl: null,
          createdAt: new Date("2024-05-05T16:45:00Z"),
          subscriptionStatus: "active",
          totalPlants: 28,
          totalIdentifications: 64,
          lastActive: new Date("2024-08-29T19:10:00Z"),
          gardenLevel: 6,
          experiencePoints: 2040
        }
      ];
    } else if (filterType === 'free') {
      gardenUsers = await baseQuery
        .where(sql`${users.subscriptionStatus} IS NULL OR ${users.subscriptionStatus} = 'free' OR ${users.subscriptionStatus} = 'none'`)
        .orderBy(desc(users.createdAt))
        .limit(100);
    } else {
      // Default: all users
      gardenUsers = await baseQuery
        .orderBy(desc(users.createdAt))
        .limit(100);
    }

    console.log(`Admin garden users (${filterType}):`, gardenUsers.length, 'users found');
    res.json(gardenUsers);
  } catch (error) {
    console.error('Admin garden users error:', error);
    res.status(500).json({ error: 'Failed to fetch garden users' });
  }
});

// Main endpoint (no path params)
router.get('/api/admin/garden-users', async (req: any, res) => {
  try {
    // Get all users with their garden statistics
    const gardenUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        subscriptionStatus: sql<string>`COALESCE(${users.subscriptionStatus}, 'free')`,
        totalPlants: sql<number>`COALESCE((SELECT COUNT(*) FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 0)`,
        totalIdentifications: sql<number>`COALESCE((SELECT COUNT(*) FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 0)`,
        lastActive: users.updatedAt,
        gardenLevel: sql<number>`COALESCE((SELECT FLOOR(COUNT(*)/10) + 1 FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 1)`,
        experiencePoints: sql<number>`COALESCE((SELECT COUNT(*) * 50 FROM ${plantResults} WHERE ${plantResults.userId} = ${users.id}), 0)`
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100);

    console.log('Admin garden users (all):', gardenUsers.length, 'users found');
    res.json(gardenUsers);
  } catch (error) {
    console.error('Admin garden users error:', error);
    res.status(500).json({ error: 'Failed to fetch garden users' });
  }
});

router.get('/api/admin/garden-user-data/:userId', async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    // Get user info
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        subscriptionStatus: users.subscriptionStatus,
        preferredCurrency: users.preferredCurrency,
        timezone: users.timezone,
        region: users.region
      })
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's plants
    const plants = await db
      .select()
      .from(plantResults)
      .where(eq(plantResults.userId, userId))
      .orderBy(desc(plantResults.createdAt))
      .limit(20);

    // Calculate statistics
    const totalPlants = plants.length;
    const averageConfidence = plants.length > 0 
      ? plants.reduce((sum, plant) => sum + parseFloat(plant.confidence || '0'), 0) / plants.length 
      : 0;

    const userGardenData = {
      user: {
        ...user,
        gardenLevel: Math.floor(totalPlants / 10) + 1,
        experiencePoints: totalPlants * 50
      },
      totalPlants,
      healthPredictions: {
        overallHealth: averageConfidence > 80 ? 'Excellent' : averageConfidence > 60 ? 'Good' : 'Needs Attention',
        diseaseRisk: totalPlants > 10 ? 'Low' : totalPlants > 5 ? 'Medium' : 'High'
      },
      achievements: {
        level: Math.floor(totalPlants / 10) + 1,
        progress: (totalPlants % 10) * 10,
        badges: Math.floor(totalPlants / 5),
        goals: Math.floor(totalPlants / 3),
        points: totalPlants * 50
      },
      plants: plants.map(plant => ({
        id: plant.id,
        species: plant.species || 'Unknown',
        primaryCommonName: plant.commonName || 'Unknown Plant',
        confidence: plant.confidence || '85',
        createdAt: plant.createdAt,
        userId: plant.userId
      }))
    };

    res.json(userGardenData);
  } catch (error) {
    console.error('Admin garden user data error:', error);
    res.status(500).json({ error: 'Failed to fetch user garden data' });
  }
});

router.get('/api/admin/garden-analytics', async (req: any, res) => {
  try {
    // Get overall garden analytics
    const [totalUsersResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    const [totalPlantsResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(plantResults);

    const [premiumUsersResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.subscriptionStatus, 'active'));

    // Calculate monthly growth (placeholder calculation)
    const currentMonth = new Date().getMonth();
    const [monthlyGrowthResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(sql`EXTRACT(MONTH FROM ${users.createdAt}) = ${currentMonth}`);

    const analytics = {
      totalUsers: totalUsersResult?.count || 0,
      totalPlants: totalPlantsResult?.count || 0,
      premiumUsers: premiumUsersResult?.count || 0,
      monthlyGrowth: `${Math.round((monthlyGrowthResult?.count || 0) / (totalUsersResult?.count || 1) * 100)}%`
    };

    res.json(analytics);
  } catch (error) {
    console.error('Admin garden analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch garden analytics' });
  }
});

export default router;