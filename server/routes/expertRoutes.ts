import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { storage } from "../storage";
import { insertExpertApplicationSchema } from "@shared/schema";
import { EmailService } from "../services/emailService";

const router = Router();

// Configure multer for file uploads with memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 51200, // 50KB limit
    files: 10 // Max 10 files (profile photo + up to 9 qualification documents)
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    if (file.mimetype.match(/^(image\/(jpeg|jpg|png)|application\/pdf)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG images and PDF files are allowed'));
    }
  }
});

// Expert application submission endpoint with enhanced security
router.post('/expert-applications', upload.any(), async (req, res) => {
  try {
    // Validate required form data
    if (!req.body.applicationData) {
      return res.status(400).json({
        success: false,
        message: 'Application data is required',
      });
    }

    // Parse and validate the application data
    let applicationData;
    try {
      applicationData = JSON.parse(req.body.applicationData);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application data format',
      });
    }

    // Validate required fields
    const { firstName, lastName, email, phoneNumber, expertise, yearsOfExperience } = applicationData;
    if (!firstName || !lastName || !email || !phoneNumber || !expertise || !yearsOfExperience) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Check if application already exists
    const existingApplication = await storage.getExpertApplicationByEmail(email);
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Application already exists for this email',
      });
    }

    // Validate the application data with schema
    const validatedData = insertExpertApplicationSchema.parse({
      ...applicationData,
      firstName: firstName.trim(),
      lastName: lastName.trim(), 
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      expertise: expertise.trim(),
      termsAcceptedAt: applicationData.termsAccepted ? new Date() : null,
    });

    // Handle file uploads safely
    let profilePhotoPath = null;
    const qualificationDocuments: string[] = [];

    const files = req.files as Express.Multer.File[];
    if (files) {
      files.forEach((file, index) => {
        if (file.fieldname === 'profilePhoto') {
          profilePhotoPath = `/uploads/profiles/${Date.now()}_${file.originalname}`;
        } else if (file.fieldname.startsWith('qualificationDoc_')) {
          qualificationDocuments.push(`/uploads/qualifications/${Date.now()}_${file.originalname}`);
        }
      });
    }

    // Insert the expert application into database
    const application = await storage.createExpertApplication({
      ...validatedData,
      profilePhotoPath,
      qualificationDocuments,
      applicationStatus: 'pending',
    });

    // Send confirmation email to applicant
    try {
      await EmailService.sendExpertApplicationConfirmation(
        application.email,
        application.firstName
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue since application was successful
    }

    // Send notification email to admin team
    try {
      await EmailService.sendExpertApplicationNotificationToAdmin(application);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Continue since application was successful
    }

    res.status(201).json({
      success: true,
      message: 'Expert application submitted successfully',
      applicationId: application.id,
    });

  } catch (error) {
    console.error('Expert application submission error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Handle specific database errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage?.includes('column') && errorMessage?.includes('does not exist')) {
      return res.status(500).json({
        success: false,
        message: "System maintenance required. Please try again in a few minutes.",
      });
    }

    if (errorMessage?.includes('duplicate key') || errorMessage?.includes('unique constraint')) {
      return res.status(400).json({
        success: false,
        message: "Application already exists for this email",
      });
    }

    res.status(500).json({
      success: false,
      message: 'Application submission failed. Please try again.',
    });
  }
});

// Get expert applications (admin only)
router.get('/expert-applications', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const applications = await storage.getExpertApplications(
      status as string,
      Number(limit),
      offset
    );

    res.json({
      success: true,
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: applications.length === Number(limit),
      },
    });

  } catch (error) {
    console.error('Error fetching expert applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expert applications',
    });
  }
});

// Update expert application status (admin only)
router.patch('/expert-applications/:id/status', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const updatedApplication = await storage.updateExpertApplicationStatus(
      id,
      status,
      reviewNotes
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: 'Expert application not found',
      });
    }

    // Send status update email to applicant
    await EmailService.sendExpertApplicationStatusUpdate(
      updatedApplication.email,
      updatedApplication.firstName,
      status,
      reviewNotes
    );

    // TODO: If approved, create expert profile and send onboarding instructions

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication,
    });

  } catch (error) {
    console.error('Error updating expert application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
    });
  }
});

// Get single expert application by ID (admin only)
router.get('/expert-applications/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;

    const application = await storage.getExpertApplication(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Expert application not found',
      });
    }

    res.json({
      success: true,
      application,
    });

  } catch (error) {
    console.error('Error fetching expert application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expert application',
    });
  }
});

export default router;