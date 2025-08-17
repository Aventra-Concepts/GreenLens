import { storage } from "../storage";
import openaiService from "./openai";
import type { InsertBlogPost, BlogCategory } from "@shared/schema";
import { BLOG_CATEGORIES } from "./blogSeeder";

interface BlogContentStructure {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  featuredImagePrompt: string;
}

interface DailyBlogConfig {
  enabled: boolean;
  postsPerDay: number;
  publishTime: string; // Format: "HH:MM"
  lastGenerated: Date | null;
}

export class AutoBlogService {
  private config: DailyBlogConfig = {
    enabled: true,
    postsPerDay: 2,
    publishTime: "09:00",
    lastGenerated: null,
  };

  constructor() {
    // Initialize auto-blogging on service creation
    this.scheduleDaily();
  }

  private scheduleDaily(): void {
    // Schedule daily blog generation
    const now = new Date();
    const [hour, minute] = this.config.publishTime.split(':').map(Number);
    
    const nextRun = new Date();
    nextRun.setHours(hour, minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const msUntilNext = nextRun.getTime() - now.getTime();
    
    setTimeout(() => {
      this.generateDailyBlogs();
      // Schedule recurring daily execution
      setInterval(() => this.generateDailyBlogs(), 24 * 60 * 60 * 1000);
    }, msUntilNext);

    console.log(`Auto-blog system scheduled for ${this.config.publishTime} daily`);
  }

  async generateDailyBlogs(): Promise<void> {
    if (!this.config.enabled) return;

    console.log("Starting daily blog generation...");
    
    try {
      const categories = await storage.getBlogCategories();
      const selectedCategories = this.selectDailyCategories(categories);
      
      for (const category of selectedCategories) {
        await this.generateBlogForCategory(category);
        // Add delay between generations to avoid rate limits
        await this.delay(5000);
      }
      
      this.config.lastGenerated = new Date();
      console.log(`Successfully generated ${selectedCategories.length} blog posts`);
    } catch (error) {
      console.error("Error in daily blog generation:", error);
    }
  }

  private selectDailyCategories(categories: BlogCategory[]): BlogCategory[] {
    // Rotate through categories to ensure even distribution
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, this.config.postsPerDay);
  }

  private async generateBlogForCategory(category: BlogCategory): Promise<void> {
    try {
      console.log(`Generating blog for category: ${category.name}`);
      
      // Get recent topics to avoid duplicates
      const recentPosts = await storage.getBlogPostsByCategory(category.slug);
      const recentTitles = recentPosts.slice(0, 10).map(post => post.title);
      
      // Generate content structure
      const contentStructure = await this.generateContentStructure(category, recentTitles);
      
      // Generate featured image
      const featuredImageUrl = await this.generateFeaturedImage(contentStructure.featuredImagePrompt);
      
      // Create blog post
      const blogPost: InsertBlogPost = {
        title: contentStructure.title,
        content: contentStructure.content,
        excerpt: contentStructure.excerpt,
        slug: this.generateSlug(contentStructure.title),
        categoryId: category.id,
        published: true,
        featuredImage: featuredImageUrl,
        tags: contentStructure.tags,
        authorId: null, // Auto-generated content
      };
      
      await storage.createBlogPost(blogPost);
      console.log(`Created blog post: ${contentStructure.title}`);
      
    } catch (error) {
      console.error(`Error generating blog for ${category.name}:`, error);
    }
  }

  private async generateContentStructure(category: BlogCategory, recentTitles: string[]): Promise<BlogContentStructure> {
    const prompt = `
Create a comprehensive, engaging blog article for the "${category.name}" category. 

Category Description: ${category.description}

Requirements:
- Write approximately 1500 words
- Use engaging, informative tone suitable for plant enthusiasts
- Include practical tips and actionable advice
- Structure with clear headings and subheadings
- Avoid these recent titles: ${recentTitles.join(', ')}
- Make content SEO-friendly with natural keyword usage
- Include seasonal relevance when applicable

Return a JSON response with:
{
  "title": "Engaging article title (60-80 characters)",
  "excerpt": "Compelling 2-3 sentence summary (150-200 characters)",
  "content": "Full article content in markdown format with headings",
  "tags": ["relevant", "tags", "for", "the", "article"],
  "featuredImagePrompt": "Detailed prompt for AI image generation"
}

Focus on providing valuable, accurate information that helps readers succeed with their plants or gardening goals.
`;

    try {
      const response = await openaiService.generateStructuredContent(prompt);

      return {
        title: (response as any).title,
        excerpt: (response as any).excerpt,
        content: this.formatArticleContent((response as any).content),
        tags: (response as any).tags || [],
        featuredImagePrompt: (response as any).featuredImagePrompt
      };
    } catch (error) {
      console.error("Error generating content structure:", error);
      throw error;
    }
  }

  private formatArticleContent(content: string): string {
    // Ensure proper markdown formatting and structure
    let formatted = content;
    
    // Add proper spacing around headings
    formatted = formatted.replace(/^(#{1,6})/gm, '\n$1');
    formatted = formatted.replace(/(#{1,6}.*$)/gm, '$1\n');
    
    // Ensure paragraphs are properly separated
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Add reading time estimate
    const wordCount = formatted.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    const timeEstimate = `*Reading time: ${readingTime} minute${readingTime !== 1 ? 's' : ''}*\n\n`;
    
    return timeEstimate + formatted.trim();
  }

  private async generateFeaturedImage(prompt: string): Promise<string> {
    try {
      // Use placeholder images for now - can be enhanced with actual AI image generation
      const enhancedPrompt = `${prompt}, professional photography style, high quality, vibrant colors, clean composition, suitable for blog header`;
      
      // Generate a unique placeholder image URL based on prompt
      const hash = prompt.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
      return `https://picsum.photos/800/400?random=${hash}`;
      
    } catch (error) {
      console.error("Error generating featured image:", error);
      return "/images/default-blog-placeholder.jpg";
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Admin control methods
  async updateConfig(config: Partial<DailyBlogConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log("Auto-blog configuration updated:", this.config);
  }

  async generateManualBlog(categorySlug: string): Promise<string> {
    const categories = await storage.getBlogCategories();
    const category = categories.find(cat => cat.slug === categorySlug);
    
    if (!category) {
      throw new Error(`Category not found: ${categorySlug}`);
    }
    
    await this.generateBlogForCategory(category);
    return `Blog generated for ${category.name}`;
  }

  getConfig(): DailyBlogConfig {
    return { ...this.config };
  }
}

export const autoBlogService = new AutoBlogService();