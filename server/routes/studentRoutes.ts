import { Router } from "express";
import { storage } from "../storage";
import { insertStudentProfileSchema } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated } from "../auth";

const router = Router();

// Student verification form submission
router.post("/api/student-verification", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Check if student profile already exists
    const existingProfile = await storage.getStudentProfileByUserId(userId);
    if (existingProfile) {
      return res.status(400).json({
        error: "Student verification application already exists",
        status: existingProfile.verificationStatus
      });
    }

    // Validate input data
    const validatedData = insertStudentProfileSchema.parse({
      ...req.body,
      userId,
    });

    // Create student profile
    const profile = await storage.createStudentProfile(validatedData);

    res.status(201).json({
      success: true,
      profile: {
        id: profile.id,
        verificationStatus: profile.verificationStatus,
        submittedAt: profile.submittedAt,
      },
    });
  } catch (error) {
    console.error("Student verification error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({ error: "Failed to submit student verification" });
  }
});

// Get student verification status
router.get("/api/student-verification/status", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getStudentProfileByUserId(userId);
    
    if (!profile) {
      return res.json({ hasApplication: false });
    }

    res.json({
      hasApplication: true,
      status: profile.verificationStatus,
      submittedAt: profile.submittedAt,
      verifiedAt: profile.verifiedAt,
      expiresAt: profile.expiresAt,
      discountPercentage: profile.discountPercentage,
      adminNotes: profile.adminNotes,
    });
  } catch (error) {
    console.error("Error fetching student status:", error);
    res.status(500).json({ error: "Failed to fetch verification status" });
  }
});

// Update student profile
router.put("/api/student-verification", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getStudentProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    if (profile.verificationStatus !== 'pending' && profile.verificationStatus !== 'rejected') {
      return res.status(400).json({ 
        error: "Cannot update application in current status",
        status: profile.verificationStatus 
      });
    }

    // Validate update data
    const updateData = insertStudentProfileSchema.partial().parse(req.body);
    
    const updatedProfile = await storage.updateStudentProfile(profile.id, {
      ...updateData,
      verificationStatus: 'pending', // Reset to pending on update
    });

    res.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        verificationStatus: updatedProfile.verificationStatus,
        submittedAt: updatedProfile.submittedAt,
      },
    });
  } catch (error) {
    console.error("Student profile update error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({ error: "Failed to update student verification" });
  }
});

// Admin: Get all student applications
router.get("/api/admin/student-applications", isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const applications = await storage.getStudentProfiles(
      status as string, 
      Number(limit), 
      offset
    );

    res.json({ applications });
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Admin: Update student verification status
router.put("/api/admin/student-applications/:id/status", isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['pending', 'under_review', 'verified', 'rejected', 'expired'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const profile = await storage.getStudentProfile(id);
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const updatedProfile = await storage.updateStudentVerificationStatus(
      id,
      status,
      adminNotes,
      req.user!.id
    );

    // If verified, update user record to enable student benefits
    if (status === 'verified') {
      await storage.updateUser(profile.userId, {
        isAuthor: true, // Using existing field for student verification
      });
    }

    res.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    res.status(500).json({ error: "Failed to update verification status" });
  }
});

// Admin: Get detailed student profile
router.get("/api/admin/student-applications/:id", isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const profile = await storage.getStudentProfile(id);
    
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    res.json({ profile });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ error: "Failed to fetch student profile" });
  }
});

// Utility: Convert expired students (runs via cron job or manual trigger)
router.post("/api/admin/convert-expired-students", isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const convertedCount = await storage.convertExpiredStudentsToRegular();

    res.json({
      success: true,
      message: `Converted ${convertedCount} expired student accounts`,
      convertedCount,
    });
  } catch (error) {
    console.error("Error converting expired students:", error);
    res.status(500).json({ error: "Failed to convert expired students" });
  }
});

// Get student profile for marketplace discount
router.get("/api/student-profile", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getStudentProfileByUserId(userId);
    
    if (!profile) {
      return res.json(null);
    }

    // Return only necessary fields for marketplace
    res.json({
      id: profile.id,
      verificationStatus: profile.verificationStatus,
      discountPercentage: profile.discountPercentage,
      accessLevel: profile.accessLevel,
      expiresAt: profile.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ error: "Failed to fetch student profile" });
  }
});

export default router;