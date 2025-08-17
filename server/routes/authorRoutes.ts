import type { Express } from "express";
import { storage } from "../storage";
import { insertAuthorProfileSchema } from "@shared/schema";
import { requireAuth } from "../auth";

export function registerAuthorRoutes(app: Express) {
  // Create author profile application
  app.post("/api/author/apply", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user already has an author profile
      const existingProfile = await storage.getAuthorProfileByUserId(userId);
      if (existingProfile) {
        return res.status(400).json({ 
          error: "Author profile already exists",
          profileId: existingProfile.id,
          status: existingProfile.applicationStatus
        });
      }

      // Validate request body
      const validatedData = insertAuthorProfileSchema.parse({
        ...req.body,
        userId
      });

      // Create author profile
      const authorProfile = await storage.createAuthorProfile(validatedData);

      // Update user's author flag
      await storage.updateUser(userId, { isAuthor: true });

      res.status(201).json({
        success: true,
        profileId: authorProfile.id,
        status: authorProfile.applicationStatus,
        message: "Author application submitted successfully"
      });

    } catch (error) {
      console.error("Error creating author profile:", error);
      res.status(500).json({ 
        error: "Failed to submit author application",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get current user's author profile
  app.get("/api/author/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const authorProfile = await storage.getAuthorProfileByUserId(userId);
      if (!authorProfile) {
        return res.status(404).json({ error: "Author profile not found" });
      }

      res.json(authorProfile);
    } catch (error) {
      console.error("Error fetching author profile:", error);
      res.status(500).json({ error: "Failed to fetch author profile" });
    }
  });

  // Update author profile
  app.put("/api/author/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const authorProfile = await storage.getAuthorProfileByUserId(userId);
      if (!authorProfile) {
        return res.status(404).json({ error: "Author profile not found" });
      }

      // Only allow updates if profile is pending or rejected
      if (authorProfile.applicationStatus !== 'pending' && authorProfile.applicationStatus !== 'rejected') {
        return res.status(400).json({ 
          error: "Profile cannot be updated",
          reason: `Profile status is ${authorProfile.applicationStatus}`
        });
      }

      const updatedProfile = await storage.updateAuthorProfile(authorProfile.id, req.body);
      res.json(updatedProfile);

    } catch (error) {
      console.error("Error updating author profile:", error);
      res.status(500).json({ error: "Failed to update author profile" });
    }
  });

  // Admin: Get all author applications
  app.get("/api/admin/author-applications", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const applications = await storage.getAuthorProfiles(status, limit, offset);
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching author applications:", error);
      res.status(500).json({ error: "Failed to fetch author applications" });
    }
  });

  // Admin: Update application status
  app.put("/api/admin/author-applications/:id/status", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!['pending', 'under_review', 'approved', 'rejected', 'suspended'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedProfile = await storage.updateAuthorApplicationStatus(
        id, 
        status, 
        adminNotes,
        user.id
      );

      // If approved, update user's author verification
      if (status === 'approved') {
        await storage.updateUser(updatedProfile.userId, { 
          authorVerified: true,
          isAuthor: true 
        });
      }

      res.json({
        success: true,
        profile: updatedProfile,
        message: `Author application ${status} successfully`
      });

    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  // Get author profile by ID (for public viewing)
  app.get("/api/author/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const authorProfile = await storage.getAuthorProfile(id);
      
      if (!authorProfile || !authorProfile.isVerified || !authorProfile.isActive) {
        return res.status(404).json({ error: "Author not found" });
      }

      // Return only public information
      const publicProfile = {
        id: authorProfile.id,
        displayName: authorProfile.displayName,
        bio: authorProfile.bio,
        profileImageUrl: authorProfile.profileImageUrl,
        websiteUrl: authorProfile.websiteUrl,
        socialLinks: authorProfile.socialLinks,
        expertise: authorProfile.expertise,
        publications: authorProfile.publications,
        averageRating: authorProfile.averageRating,
        totalEbooks: authorProfile.totalEbooks,
        totalSales: authorProfile.totalSales,
        createdAt: authorProfile.createdAt
      };

      res.json(publicProfile);
    } catch (error) {
      console.error("Error fetching author:", error);
      res.status(500).json({ error: "Failed to fetch author" });
    }
  });
}