import type { Express } from "express";
import { requireAuth } from "../middleware/auth";

export function registerGardenDashboardRoutes(app: Express) {
  
  // Premium Garden Dashboard API
  app.get("/api/premium-garden-dashboard", requireAuth, async (req, res) => {
    try {
      // Mock premium dashboard data
      const dashboardData = {
        user: {
          id: "user123",
          firstName: "John",
          lastName: "Gardner",
          email: "john@example.com",
          profileImageUrl: null,
          subscriptionPlan: "Premium Plan",
          subscriptionPlanId: "premium",
          joinDate: new Date().toISOString(),
        },
        analytics: {
          totalPlants: 15,
          healthyPlants: 12,
          plantsNeedingCare: 2,
          plantsDiagnosed: 9,
          achievementScore: 150,
          gardenLevel: 4,
          experiencePoints: 375,
          streakDays: 12,
          monthlyGrowth: 3,
        },
        recentActivity: [
          {
            id: "1",
            type: 'identification',
            title: 'Identified Rose Bush',
            description: 'Successfully identified with 95% confidence',
            timestamp: '2 hours ago',
            status: 'success'
          },
          {
            id: "2", 
            type: 'care_plan',
            title: 'Care Plan Updated',
            description: 'New watering schedule for your tomatoes',
            timestamp: '1 day ago',
            status: 'info'
          }
        ],
        plants: [
          {
            id: "plant1",
            species: "Rosa gallica",
            commonName: "French Rose",
            confidence: 95,
            healthStatus: 'healthy',
            lastCared: '2 days ago',
            nextCareDate: 'Tomorrow',
            careTasks: ['Water regularly', 'Check for pests', 'Prune dead leaves'],
            imageUrl: null
          },
          {
            id: "plant2",
            species: "Solanum lycopersicum", 
            commonName: "Tomato Plant",
            confidence: 88,
            healthStatus: 'needs_care',
            lastCared: '3 days ago',
            nextCareDate: 'Today',
            careTasks: ['Water deeply', 'Add fertilizer', 'Support stems'],
            imageUrl: null
          }
        ],
        weatherData: {
          temperature: 72,
          humidity: 65,
          conditions: "Partly Cloudy",
          uvIndex: 6,
          recommendation: "Great weather for outdoor gardening! Consider watering your outdoor plants in the early morning to maximize water absorption."
        },
        aiInsights: [
          {
            type: 'tip',
            title: 'Optimal Watering Schedule',
            content: 'Based on your garden\'s composition and current weather conditions, we recommend watering your plants every 2-3 days in the morning for best results.',
            priority: 'high'
          },
          {
            type: 'opportunity',
            title: 'Seasonal Plant Suggestions',
            content: 'Fall is approaching! Consider adding chrysanthemums or ornamental kale to your garden for beautiful autumn colors.',
            priority: 'medium'
          }
        ]
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching premium garden dashboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Free Tier Garden Dashboard API
  app.get("/api/free-garden-dashboard", requireAuth, async (req, res) => {
    try {
      // Mock free tier dashboard data
      const dashboardData = {
        user: {
          id: "user456",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          profileImageUrl: null,
          subscriptionPlan: "Free Plan",
          subscriptionPlanId: "free",
          joinDate: new Date().toISOString(),
        },
        basicStats: {
          totalPlants: 3,
          plantsIdentified: 3,
          freeUsageRemaining: 7,
          freeUsageLimit: 10
        },
        recentPlants: [
          {
            id: "plant1",
            commonName: "Sunflower",
            species: "Helianthus annuus",
            confidence: 92,
            dateAdded: '3 days ago',
            imageUrl: null
          },
          {
            id: "plant2",
            commonName: "Lavender",
            species: "Lavandula angustifolia",
            confidence: 87,
            dateAdded: '1 week ago', 
            imageUrl: null
          }
        ],
        limitations: {
          maxPlantsPerMonth: 10,
          advancedFeaturesLocked: [
            'Advanced Health Diagnostics',
            'AI-Powered Care Plans',
            'Weather Integration',
            'Disease Detection',
            'Growth Tracking',
            'Expert Consultations',
            'Unlimited Plant Identifications',
            'Priority Support'
          ],
          premiumBenefits: [
            'Unlimited Plant Identifications',
            'AI Health Diagnostics',
            'Personalized Care Plans',
            'Weather Integration',
            'Disease Detection & Treatment',
            'Growth Progress Tracking',
            'Expert Plant Consultations',
            'Advanced Analytics Dashboard',
            'Premium Plant Database Access',
            'Priority Customer Support'
          ]
        }
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching free garden dashboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}