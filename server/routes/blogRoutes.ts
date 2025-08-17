import { Router } from "express";
import { storage } from "../storage";
import { insertBlogCategorySchema, insertBlogPostSchema } from "@shared/schema";
import { autoBlogService } from "../services/autoBlogService";
import { requireAdmin } from "../auth";

const router = Router();

// Get all blog categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await storage.getBlogCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    res.status(500).json({ error: "Failed to fetch blog categories" });
  }
});

// Get posts by category
router.get("/categories/:categorySlug/posts", async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const posts = await storage.getBlogPostsByCategory(categorySlug);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts by category:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// Get all blog posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await storage.getAllBlogPosts();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// Get single blog post by slug
router.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await storage.getBlogPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Create blog category (admin only)
router.post("/categories", async (req, res) => {
  try {
    const categoryData = insertBlogCategorySchema.parse(req.body);
    const category = await storage.createBlogCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating blog category:", error);
    res.status(500).json({ error: "Failed to create blog category" });
  }
});

// Create blog post (admin only)
router.post("/posts", requireAdmin, async (req, res) => {
  try {
    const postData = insertBlogPostSchema.parse(req.body);
    const post = await storage.createBlogPost(postData);
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

// Update blog post (admin only)
router.put("/posts/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertBlogPostSchema.partial().parse(req.body);
    const post = await storage.updateBlogPost(id, updates);
    res.json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

// Delete blog post (admin only)
router.delete("/posts/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteBlogPost(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

// Auto-blog management routes (admin only)
router.get("/auto-config", requireAdmin, async (req, res) => {
  try {
    const config = autoBlogService.getConfig();
    res.json(config);
  } catch (error) {
    console.error("Error fetching auto-blog config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

router.put("/auto-config", requireAdmin, async (req, res) => {
  try {
    await autoBlogService.updateConfig(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating auto-blog config:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

router.post("/generate-manual/:categorySlug", requireAdmin, async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const result = await autoBlogService.generateManualBlog(categorySlug);
    res.json({ message: result });
  } catch (error) {
    console.error("Error generating manual blog:", error);
    res.status(500).json({ error: "Failed to generate blog post" });
  }
});

export default router;