import { Router } from "express";
import { ebookService } from "../services/ebookService";
import { paymentService } from "../services/paymentService";
import { emailService } from "../services/emailService";
import { isAuthenticated } from "../middleware/auth";
import { insertEbookSchema, insertAuthorProfileSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'ebooks');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.epub', '.mobi'];
    const allowedImageTypes = ['.jpg', '.jpeg', '.png'];
    
    if (file.fieldname === 'coverImage') {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedImageTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG, JPEG, and PNG images are allowed for cover images'));
      }
    } else if (file.fieldname === 'manuscript') {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, EPUB, and MOBI files are allowed for manuscripts'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

// Author registration route
router.post('/author/register', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate request body
    const profileData = insertAuthorProfileSchema.parse(req.body);
    
    const profile = await ebookService.registerAuthor(userId, profileData);
    
    res.status(201).json({
      success: true,
      message: 'Author application submitted successfully',
      profile,
    });
  } catch (error) {
    console.error('Author registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit author application',
    });
  }
});

// Start e-book upload session
router.post('/upload/start', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is an approved author
    // This would be validated in the middleware or service
    
    const uploadSession = await ebookService.startUploadSession(userId);
    
    res.json({
      success: true,
      uploadSessionId: uploadSession.uploadSessionId,
      currentStep: uploadSession.currentStep,
    });
  } catch (error) {
    console.error('Upload session start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start upload session',
    });
  }
});

// Update upload step
router.put('/upload/:sessionId/step', isAuthenticated, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { step, data } = req.body;
    
    const upload = await ebookService.updateUploadStep(sessionId, step, data);
    
    res.json({
      success: true,
      upload,
    });
  } catch (error) {
    console.error('Upload step update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update upload step',
    });
  }
});

// Upload files (cover image and manuscript)
router.post('/upload/:sessionId/files', 
  isAuthenticated,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'manuscript', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const coverImage = files.coverImage?.[0];
      const manuscript = files.manuscript?.[0];
      
      if (!coverImage || !manuscript) {
        return res.status(400).json({
          success: false,
          message: 'Both cover image and manuscript files are required',
        });
      }
      
      // Update upload session with file paths
      const fileData = {
        coverImageUrl: `/uploads/ebooks/${coverImage.filename}`,
        fullFileUrl: `/uploads/ebooks/${manuscript.filename}`,
        fileSize: manuscript.size,
        fileFormat: path.extname(manuscript.originalname).toLowerCase().substring(1),
      };
      
      await ebookService.updateUploadStep(sessionId, 'files', fileData);
      
      res.json({
        success: true,
        message: 'Files uploaded successfully',
        files: fileData,
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
      });
    }
  }
);

// Complete e-book upload and submit for review
router.post('/upload/:sessionId/complete', isAuthenticated, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const ebookData = insertEbookSchema.parse(req.body);
    
    const ebook = await ebookService.completeUpload(sessionId, {
      ...ebookData,
      authorId: req.user.id,
    });
    
    res.status(201).json({
      success: true,
      message: 'E-book submitted for review successfully',
      ebook,
    });
  } catch (error) {
    console.error('Upload completion error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to complete upload',
    });
  }
});

// Get published e-books (public)
router.get('/published', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const ebooks = await ebookService.getPublishedEbooks(limit, offset);
    
    res.json({
      success: true,
      ebooks,
      pagination: {
        limit,
        offset,
        hasMore: ebooks.length === limit,
      },
    });
  } catch (error) {
    console.error('Get published ebooks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-books',
    });
  }
});

// Get e-book details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ebook = await ebookService.getEbookById(id);
    
    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: 'E-book not found',
      });
    }
    
    res.json({
      success: true,
      ebook,
    });
  } catch (error) {
    console.error('Get ebook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-book',
    });
  }
});

// Create payment intent for e-book purchase
router.post('/:id/purchase', isAuthenticated, async (req, res) => {
  try {
    const { id: ebookId } = req.params;
    const userId = req.user.id;
    const { currency = 'USD' } = req.body;
    
    const paymentData = await paymentService.createEbookPaymentIntent(
      userId,
      ebookId,
      currency
    );
    
    res.json({
      success: true,
      ...paymentData,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
    });
  }
});

// Webhook for Stripe payment events
router.post('/webhook/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    // Verify webhook signature (implement proper verification)
    // const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    // For now, accept the event (in production, always verify)
    const event = req.body;
    
    await paymentService.handleStripeWebhook(event);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook error',
    });
  }
});

// Get author's e-books
router.get('/author/my-books', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const ebooks = await ebookService.getAuthorEbooks(userId);
    
    res.json({
      success: true,
      ebooks,
    });
  } catch (error) {
    console.error('Get author ebooks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch author e-books',
    });
  }
});

// Admin routes for e-book management
router.put('/:id/approve', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin (implement admin middleware)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    
    const { id } = req.params;
    const adminId = req.user.id;
    
    const ebook = await ebookService.publishEbook(id, adminId);
    
    res.json({
      success: true,
      message: 'E-book approved and published successfully',
      ebook,
    });
  } catch (error) {
    console.error('Approve ebook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve e-book',
    });
  }
});

router.put('/:id/reject', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }
    
    const ebook = await ebookService.rejectEbook(id, adminId, reason);
    
    res.json({
      success: true,
      message: 'E-book rejected successfully',
      ebook,
    });
  } catch (error) {
    console.error('Reject ebook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject e-book',
    });
  }
});

export default router;