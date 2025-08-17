import { storage } from "../storage";
import type { InsertBlogCategory } from "@shared/schema";

const BLOG_CATEGORIES: InsertBlogCategory[] = [
  {
    name: "Indoor Plants",
    slug: "indoor-plants",
    description: "Expert guides for houseplants, indoor gardening, and caring for plants inside your home",
    icon: "🏠",
    sortOrder: 1,
  },
  {
    name: "Outdoor Plants",
    slug: "outdoor-plants", 
    description: "Complete outdoor gardening guides, landscape plants, and garden maintenance tips",
    icon: "🌳",
    sortOrder: 2,
  },
  {
    name: "Fruiting Plants",
    slug: "fruiting-plants",
    description: "Growing and caring for fruit trees, berry bushes, and fruit-bearing plants",
    icon: "🍎",
    sortOrder: 3,
  },
  {
    name: "Flowering Plants",
    slug: "flowering-plants",
    description: "Beautiful flowering plants, bloom care, and seasonal flower gardening",
    icon: "🌸",
    sortOrder: 4,
  },
  {
    name: "Decorative Plants",
    slug: "decorative-plants",
    description: "Ornamental plants, landscape design, and decorative gardening techniques",
    icon: "🎨",
    sortOrder: 5,
  },
  {
    name: "Non-Flowering Plants",
    slug: "non-flowering-plants",
    description: "Ferns, mosses, succulents, and other plants valued for foliage and form",
    icon: "🌿",
    sortOrder: 6,
  },
  {
    name: "Agricultural Crops",
    slug: "agri-crops",
    description: "Commercial farming, crop management, and agricultural best practices",
    icon: "🌾",
    sortOrder: 7,
  },
  {
    name: "Seeds",
    slug: "seeds",
    description: "Seed selection, germination techniques, and starting plants from seeds",
    icon: "🌱",
    sortOrder: 8,
  },
  {
    name: "Agricultural Tools",
    slug: "agri-tools",
    description: "Farm equipment, gardening tools, and agricultural technology reviews",
    icon: "🔧",
    sortOrder: 9,
  },
  {
    name: "Fertilizers",
    slug: "fertilizers",
    description: "Plant nutrition, fertilizer types, organic and synthetic feeding guides",
    icon: "💩",
    sortOrder: 10,
  },
  {
    name: "Disinfectants",
    slug: "disinfectants",
    description: "Plant disease prevention, pest control, and garden sanitization methods",
    icon: "🧴",
    sortOrder: 11,
  },
  {
    name: "First Aid Treatment for Human Toxicity",
    slug: "first-aid-toxicity",
    description: "Safety guides for toxic plants, emergency treatments, and poisonous plant identification",
    icon: "⚕️",
    sortOrder: 12,
  },
];

export async function seedBlogCategories(): Promise<void> {
  console.log("Starting blog categories seeding...");
  
  try {
    // Check if categories already exist
    const existingCategories = await storage.getBlogCategories();
    if (existingCategories.length > 0) {
      console.log("Blog categories already exist. Skipping seeding.");
      return;
    }

    // Create all categories
    for (const category of BLOG_CATEGORIES) {
      await storage.createBlogCategory(category);
      console.log(`Created category: ${category.name}`);
    }

    console.log("Blog categories seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding blog categories:", error);
    throw error;
  }
}

export { BLOG_CATEGORIES };