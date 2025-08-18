import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertConsultationRequestSchema } from "@shared/schema";
import { EmailService } from "../services/emailService";
import { requireAuth } from "../auth";

const router = Router();

// Validation schema for consultation requests
const consultationRequestValidationSchema = insertConsultationRequestSchema.extend({
  problemDescription: z.string()
    .min(10, "Problem description must be at least 10 characters")
    .max(300, "Problem description must be maximum 300 characters (approximately 60 words)"),
  preferredDate: z.string().transform((str) => new Date(str)),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[0-9\s\-\(\)]+$/, "Please enter a valid phone number"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  pinZip: z.string().min(3, "PIN/ZIP code is required"),
});

// Create a new consultation request
router.post('/consultation-requests', requireAuth, async (req, res) => {
  try {
    const validatedData = consultationRequestValidationSchema.parse(req.body);
    
    // Add user ID from authenticated session
    const consultationData = {
      ...validatedData,
      userId: req.user?.id,
    };

    // Create consultation request in database
    const consultationRequest = await storage.createConsultationRequest(consultationData);

    // Send confirmation email to user
    await EmailService.sendConsultationRequestConfirmation(
      consultationRequest.email,
      consultationRequest.name,
      consultationRequest.id
    );

    // Send notification to admin team
    await EmailService.sendConsultationRequestNotificationToAdmin(consultationRequest);

    res.status(201).json({
      success: true,
      message: 'Consultation request created successfully',
      data: consultationRequest,
    });
  } catch (error) {
    console.error('Error creating consultation request:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get consultation requests for authenticated user
router.get('/consultation-requests', requireAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const userId = req.user?.id;

    const consultationRequests = await storage.getConsultationRequests(
      userId,
      status as string,
      Number(limit),
      offset
    );

    res.status(200).json({
      success: true,
      data: consultationRequests,
    });
  } catch (error) {
    console.error('Error fetching consultation requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get specific consultation request by ID
router.get('/consultation-requests/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const consultationRequest = await storage.getConsultationRequest(id);

    if (!consultationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    // Check if user owns this consultation request or is admin
    if (consultationRequest.userId !== userId && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: consultationRequest,
    });
  } catch (error) {
    console.error('Error fetching consultation request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update consultation request payment status (used by payment webhook)
router.put('/consultation-requests/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentIntentId } = req.body;

    const updatedRequest = await storage.updateConsultationRequest(id, {
      paymentStatus,
      paymentIntentId,
      status: paymentStatus === 'paid' ? 'payment_pending' : 'pending',
    });

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    // If payment is successful, send confirmation and assign expert
    if (paymentStatus === 'paid') {
      await EmailService.sendConsultationPaymentConfirmation(
        updatedRequest.email,
        updatedRequest.name,
        updatedRequest.id
      );

      // TODO: Assign expert and schedule consultation
      // This would involve finding an available expert and updating the request
    }

    res.status(200).json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating consultation payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Admin routes for managing consultation requests
router.get('/admin/consultation-requests', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const consultationRequests = await storage.getConsultationRequests(
      undefined, // No user filter for admin
      status as string,
      Number(limit),
      offset
    );

    res.status(200).json({
      success: true,
      data: consultationRequests,
    });
  } catch (error) {
    console.error('Error fetching consultation requests for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Admin route to update consultation request status
router.put('/admin/consultation-requests/:id/status', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const { status, assignedExpertId, consultationNotes } = req.body;

    const validStatuses = ['pending', 'payment_pending', 'paid', 'assigned', 'scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const updatedRequest = await storage.updateConsultationRequest(id, {
      status,
      assignedExpertId,
      consultationNotes,
    });

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Consultation request not found',
      });
    }

    // Send status update email to user
    await EmailService.sendConsultationStatusUpdate(
      updatedRequest.email,
      updatedRequest.name,
      status,
      consultationNotes
    );

    res.status(200).json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating consultation status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;