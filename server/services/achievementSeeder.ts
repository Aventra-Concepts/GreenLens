import { db } from '../db';
import { achievements } from '@shared/schema';
import { eq } from 'drizzle-orm';

const defaultAchievements = [
  {
    name: "First Plant Parent",
    description: "Add your first plant to your garden",
    icon: "🌱",
    category: "care" as const,
    points: 10,
    requirement: { type: "plants_owned", value: 1 }
  },
  {
    name: "Green Thumb",
    description: "Successfully care for 5 plants",
    icon: "👍",
    category: "care" as const,
    points: 25,
    requirement: { type: "plants_owned", value: 5 }
  },
  {
    name: "Plant Collector",
    description: "Own 10 different plants",
    icon: "🌿",
    category: "growth" as const,
    points: 50,
    requirement: { type: "plants_owned", value: 10 }
  },
  {
    name: "Care Streak Champion",
    description: "Take care of plants for 7 days in a row",
    icon: "🔥",
    category: "consistency" as const,
    points: 30,
    requirement: { type: "care_streak", value: 7 }
  },
  {
    name: "Care Master",
    description: "Complete 50 care activities",
    icon: "💪",
    category: "care" as const,
    points: 40,
    requirement: { type: "care_activities", value: 50 }
  },
  {
    name: "Dedicated Gardener",
    description: "Care for plants for 30 days straight",
    icon: "🏆",
    category: "consistency" as const,
    points: 100,
    requirement: { type: "care_streak", value: 30 }
  },
  {
    name: "Social Gardener",
    description: "Share your first plant milestone",
    icon: "📱",
    category: "social" as const,
    points: 15,
    requirement: { type: "milestone_shared", value: 1 }
  },
  {
    name: "Learning Enthusiast",
    description: "Active gardener for 30 days",
    icon: "📚",
    category: "learning" as const,
    points: 35,
    requirement: { type: "time_based", days: 30 }
  },
  {
    name: "Botanist",
    description: "Own 25 plants and maintain them well",
    icon: "🔬",
    category: "growth" as const,
    points: 150,
    requirement: { type: "plants_owned", value: 25 }
  },
  {
    name: "Consistency King",
    description: "Maintain a 60-day care streak",
    icon: "👑",
    category: "consistency" as const,
    points: 200,
    requirement: { type: "care_streak", value: 60 }
  }
];

export async function seedAchievements() {
  try {
    console.log('Starting achievement seeding...');
    
    for (const achievement of defaultAchievements) {
      // Check if achievement already exists
      const [existing] = await db
        .select()
        .from(achievements)
        .where(eq(achievements.name, achievement.name))
        .limit(1);

      if (!existing) {
        await db.insert(achievements).values(achievement);
        console.log(`Seeded achievement: ${achievement.name}`);
      }
    }
    
    console.log('Achievement seeding completed successfully');
  } catch (error) {
    console.error('Error seeding achievements:', error);
  }
}