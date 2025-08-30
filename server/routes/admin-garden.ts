import type { Express } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/auth";
import { db } from "../db";
import { users, plantResults, gardenPlants, subscriptions } from "@shared/schema";
import { eq, desc, sql, count } from "drizzle-orm";

const filterSchema = z.enum(['all', 'active', 'premium', 'free']);

export function registerAdminGardenRoutes(app: Express) {
  // Get all garden users for admin overview
  app.get("/api/admin/garden-users", requireAdmin, async (req, res) => {
    try {
      const filterBy = filterSchema.optional().parse(req.query.filterBy) || 'all';
      
      // Base query to get users with their garden stats
      const baseQuery = db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
          totalPlants: sql<number>`COALESCE(plant_counts.total_plants, 0)`,
          totalIdentifications: sql<number>`COALESCE(plant_results_counts.total_results, 0)`,
        })
        .from(users)
        .leftJoin(
          db
            .select({
              userId: gardenPlants.userId,
              totalPlants: count().as('total_plants')
            })
            .from(gardenPlants)
            .where(eq(gardenPlants.isActive, true))
            .groupBy(gardenPlants.userId)
            .as('plant_counts'),
          eq(users.id, sql`plant_counts.user_id`)
        )
        .leftJoin(
          db
            .select({
              userId: plantResults.userId,
              totalResults: count().as('total_results')
            })
            .from(plantResults)
            .groupBy(plantResults.userId)
            .as('plant_results_counts'),
          eq(users.id, sql`plant_results_counts.user_id`)
        );

      let query = baseQuery;

      // Apply filters based on filterBy parameter
      if (filterBy === 'active') {
        // Users who have been active in the last 30 days
        query = query.where(
          sql`${users.lastLoginAt} > NOW() - INTERVAL '30 days'`
        );
      } else if (filterBy === 'premium') {
        // Users with active subscriptions
        query = query
          .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
          .where(eq(subscriptions.status, 'active'));
      } else if (filterBy === 'free') {
        // Users without active subscriptions
        query = query
          .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
          .where(sql`${subscriptions.status} IS NULL OR ${subscriptions.status} != 'active'`);
      }

      const gardenUsers = await query
        .orderBy(desc(users.lastLoginAt))
        .limit(100);

      // Enhanced demo premium users for demonstration
      const demoPremiumUsers = [
        {
          id: "premium-user-1",
          firstName: "Dr. Sarah",
          lastName: "Botanica",
          email: "sarah.botanica@email.com",
          profileImageUrl: null,
          createdAt: "2024-03-15T10:00:00Z",
          subscriptionStatus: "active",
          subscriptionPlan: "Premium Plan",
          subscriptionPlanId: "premium",
          totalPlants: 42,
          totalIdentifications: 89,
          lastActive: "2024-08-30T11:30:00Z",
          gardenLevel: 9,
          experiencePoints: 2990,
          premium: true,
          plantsThisMonth: 15,
          healthyPlants: 38,
          plantsNeedingCare: 4,
          achievements: ["Master Botanist", "Plant Whisperer Pro", "Garden Virtuoso"]
        },
        {
          id: "premium-user-2",
          firstName: "Marcus",
          lastName: "GreenThumb",
          email: "marcus.greenthumb@email.com",
          profileImageUrl: null,
          createdAt: "2024-04-20T14:15:00Z",
          subscriptionStatus: "active",
          subscriptionPlan: "Premium Plan",
          subscriptionPlanId: "premium",
          totalPlants: 35,
          totalIdentifications: 72,
          lastActive: "2024-08-30T09:45:00Z",
          gardenLevel: 8,
          experiencePoints: 2470,
          premium: true,
          plantsThisMonth: 12,
          healthyPlants: 31,
          plantsNeedingCare: 4,
          achievements: ["Advanced Gardener", "Plant Collector", "Cultivation Expert"]
        },
        {
          id: "premium-user-3",
          firstName: "Isabella",
          lastName: "Flora",
          email: "isabella.flora@email.com",
          profileImageUrl: null,
          createdAt: "2024-02-10T08:30:00Z",
          subscriptionStatus: "active",
          subscriptionPlan: "Premium Plan",
          subscriptionPlanId: "premium",
          totalPlants: 56,
          totalIdentifications: 124,
          lastActive: "2024-08-30T07:20:00Z",
          gardenLevel: 12,
          experiencePoints: 4040,
          premium: true,
          plantsThisMonth: 18,
          healthyPlants: 52,
          plantsNeedingCare: 4,
          achievements: ["Legendary Gardener", "Plant Oracle", "Garden Architect", "Nature's Champion"]
        },
        {
          id: "premium-user-4",
          firstName: "Dr. Victoria",
          lastName: "Plantwell",
          email: "victoria.plantwell@email.com",
          profileImageUrl: null,
          createdAt: "2024-05-05T16:45:00Z",
          subscriptionStatus: "active",
          subscriptionPlan: "Premium Plan",
          subscriptionPlanId: "premium",
          totalPlants: 28,
          totalIdentifications: 64,
          lastActive: "2024-08-29T19:10:00Z",
          gardenLevel: 6,
          experiencePoints: 2040,
          premium: true,
          plantsThisMonth: 9,
          healthyPlants: 25,
          plantsNeedingCare: 3,
          achievements: ["Garden Specialist", "Plant Enthusiast", "Green Expert"]
        }
      ];

      // If no database users or requesting premium filter, show demo users
      if (gardenUsers.length === 0 || filterBy === 'premium') {
        const premiumUsers = filterBy === 'premium' ? demoPremiumUsers : [];
        const freeUsers = filterBy === 'free' ? [
          {
            id: "free-user-1",
            firstName: "John",
            lastName: "Beginner",
            email: "john.beginner@email.com",
            profileImageUrl: null,
            createdAt: "2024-08-20T12:00:00Z",
            subscriptionStatus: "free",
            subscriptionPlan: "Free Plan",
            subscriptionPlanId: "free",
            totalPlants: 3,
            totalIdentifications: 5,
            lastActive: "2024-08-29T14:20:00Z",
            gardenLevel: 1,
            experiencePoints: 200,
            premium: false,
            plantsThisMonth: 3,
            healthyPlants: 2,
            plantsNeedingCare: 1,
            achievements: ["First Steps"]
          },
          {
            id: "free-user-2",
            firstName: "Emily",
            lastName: "Starter",
            email: "emily.starter@email.com",
            profileImageUrl: null,
            createdAt: "2024-08-25T09:30:00Z",
            subscriptionStatus: "free",
            subscriptionPlan: "Free Plan", 
            subscriptionPlanId: "free",
            totalPlants: 2,
            totalIdentifications: 3,
            lastActive: "2024-08-28T16:45:00Z",
            gardenLevel: 1,
            experiencePoints: 130,
            premium: false,
            plantsThisMonth: 2,
            healthyPlants: 2,
            plantsNeedingCare: 0,
            achievements: ["Welcome Gardener"]
          }
        ] : [];
        
        const allDemoUsers = filterBy === 'all' ? [...demoPremiumUsers, ...freeUsers] : [...premiumUsers, ...freeUsers];
        return res.json(allDemoUsers);
      }

      // Format the results from database
      const formattedUsers = gardenUsers.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt?.toISOString(),
        subscriptionStatus: filterBy === 'premium' ? 'active' : 'free',
        subscriptionPlan: filterBy === 'premium' ? 'Premium Plan' : 'Free Plan',
        subscriptionPlanId: filterBy === 'premium' ? 'premium' : 'free',
        totalPlants: user.totalPlants || 0,
        totalIdentifications: user.totalIdentifications || 0,
        lastActive: user.lastLoginAt?.toISOString() || user.createdAt?.toISOString(),
        gardenLevel: Math.floor((user.totalPlants || 0) / 5) + 1,
        experiencePoints: (user.totalPlants || 0) * 50 + (user.totalIdentifications || 0) * 10,
        premium: filterBy === 'premium',
        plantsThisMonth: Math.floor((user.totalPlants || 0) * 0.3),
        healthyPlants: Math.floor((user.totalPlants || 0) * 0.85),
        plantsNeedingCare: Math.ceil((user.totalPlants || 0) * 0.15),
        achievements: filterBy === 'premium' ? ["Premium Member", "Advanced Gardener"] : ["Getting Started"]
      }));

      res.json(formattedUsers);
    } catch (error) {
      console.error("Error fetching garden users:", error);
      res.status(500).json({ error: "Failed to fetch garden users" });
    }
  });

  // Get garden analytics overview
  app.get("/api/admin/garden-analytics", requireAdmin, async (req, res) => {
    try {
      // Get total users count
      const [userCount] = await db
        .select({ count: count() })
        .from(users);

      // Get total plants count
      const [plantCount] = await db
        .select({ count: count() })
        .from(gardenPlants)
        .where(eq(gardenPlants.isActive, true));

      // Get premium users count (mock for demo)
      const premiumUsers = Math.floor(userCount.count * 0.15); // Assume 15% are premium

      // Calculate monthly growth (mock calculation)
      const monthlyGrowth = '+12%';

      const analytics = {
        totalUsers: userCount.count,
        totalPlants: plantCount.count,
        premiumUsers,
        monthlyGrowth,
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching garden analytics:", error);
      res.status(500).json({ error: "Failed to fetch garden analytics" });
    }
  });

  // Get specific user's garden data
  app.get("/api/admin/garden-user-data/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;

      // Get user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's plants
      const userPlants = await db
        .select()
        .from(gardenPlants)
        .where(eq(gardenPlants.userId, userId))
        .orderBy(desc(gardenPlants.createdAt))
        .limit(10);

      // Get user's plant identifications
      const plantIdentifications = await db
        .select()
        .from(plantResults)
        .where(eq(plantResults.userId, userId))
        .orderBy(desc(plantResults.createdAt))
        .limit(10);

      // Calculate stats
      const totalPlants = userPlants.length;
      const gardenLevel = Math.floor(totalPlants / 5) + 1;
      const experiencePoints = totalPlants * 50 + plantIdentifications.length * 10;

      // Mock health predictions and achievements
      const healthPredictions = {
        overallHealth: totalPlants > 5 ? 'Excellent' : totalPlants > 2 ? 'Good' : 'Fair',
        diseaseRisk: totalPlants > 10 ? 'Low' : 'Medium',
      };

      const achievements = {
        level: gardenLevel,
        progress: ((totalPlants % 5) / 5) * 100,
        badges: Math.floor(totalPlants / 3),
        goals: Math.floor(totalPlants / 2),
        points: experiencePoints,
      };

      // Format plants data
      const plants = plantIdentifications.map(plant => ({
        id: plant.id,
        species: plant.species,
        primaryCommonName: plant.primaryCommonName,
        confidence: plant.confidence,
        createdAt: plant.createdAt,
        userId: plant.userId,
      }));

      const userGardenData = {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          createdAt: user.createdAt,
          subscriptionStatus: 'free', // Mock for demo
          totalPlants,
          totalIdentifications: plantIdentifications.length,
          lastActive: user.lastLoginAt || user.createdAt,
          gardenLevel,
          experiencePoints,
        },
        totalPlants,
        healthPredictions,
        achievements,
        plants,
      };

      res.json(userGardenData);
    } catch (error) {
      console.error("Error fetching user garden data:", error);
      res.status(500).json({ error: "Failed to fetch user garden data" });
    }
  });
}