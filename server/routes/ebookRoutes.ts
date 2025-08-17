import type { Express } from "express";
import { storage } from "../storage";
import { GeolocationService } from "../services/geolocationService";
import { EbookService } from "../services/ebookService";
import { StudentVerificationService } from "../services/studentVerificationService";
import { isAuthenticated } from "../auth";
import { insertEbookSchema, insertStudentUserSchema, insertEbookPurchaseSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.epub', '.mobi'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, EPUB, and MOBI files are allowed.'));
    }
  }
});

export function registerEbookRoutes(app: Express) {
  // Initialize platform settings on startup
  EbookService.initializePlatformSettings().catch(console.error);

  // Geographic detection endpoint
  app.get("/api/location", async (req, res) => {
    try {
      const userIP = req.ip || req.connection.remoteAddress;
      const country = await GeolocationService.detectUserCountry(userIP);
      const availability = GeolocationService.getAvailableProducts(country);
      
      res.json(availability);
    } catch (error) {
      console.error('Location detection error:', error);
      res.status(500).json({ error: 'Failed to detect location' });
    }
  });

  // Student registration endpoint
  app.post("/api/register/student", upload.single('studentDocument'), async (req, res) => {
    try {
      const validatedData = insertStudentUserSchema.parse(req.body);
      
      if (!req.file) {
        return res.status(400).json({ error: 'Student document is required' });
      }

      // Hash password before storing
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const student = await storage.createStudentUser({
        ...validatedData,
        password: hashedPassword,
        studentDocumentUrl: req.file.path,
        documentType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image'
      });

      // Send verification email
      await StudentVerificationService.sendVerificationEmail(
        student.email, 
        student.firstName
      );

      res.status(201).json({
        message: 'Student registration successful. Verification pending.',
        studentId: student.id
      });
    } catch (error) {
      console.error('Student registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Student login endpoint
  app.post("/api/login/student", async (req, res) => {
    try {
      const { email, password } = req.body;
      const student = await storage.getStudentUserByEmail(email);
      
      if (!student) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const bcrypt = require('bcrypt');
      const validPassword = await bcrypt.compare(password, student.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (student.verificationStatus !== 'approved') {
        return res.status(403).json({ 
          error: 'Account pending verification',
          status: student.verificationStatus 
        });
      }

      req.session.studentId = student.id;
      req.session.userType = 'student';
      
      res.json({
        student: {
          id: student.id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          verificationStatus: student.verificationStatus
        }
      });
    } catch (error) {
      console.error('Student login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get published e-books with pricing
  app.get("/api/ebooks", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;
      
      let ebooks = await storage.getPublishedEbooks(limit, offset);
      
      // Filter by category if specified
      if (category) {
        ebooks = ebooks.filter(book => book.category === category);
      }

      // Add pricing information for each book
      const ebooksWithPricing = await Promise.all(
        ebooks.map(async (book) => {
          const studentPricing = await EbookService.calculatePricing(
            parseFloat(book.basePrice), 
            true
          );
          const regularPricing = await EbookService.calculatePricing(
            parseFloat(book.basePrice), 
            false
          );

          return {
            ...book,
            pricing: {
              student: studentPricing,
              regular: regularPricing
            }
          };
        })
      );

      res.json(ebooksWithPricing);
    } catch (error) {
      console.error('Get e-books error:', error);
      res.status(500).json({ error: 'Failed to fetch e-books' });
    }
  });

  // Author e-book upload endpoint
  app.post("/api/ebooks", isAuthenticated, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'previewFile', maxCount: 1 },
    { name: 'fullFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const validatedData = insertEbookSchema.parse(req.body);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.coverImage || !files.fullFile) {
        return res.status(400).json({ 
          error: 'Cover image and full e-book file are required' 
        });
      }

      const ebook = await storage.createEbook({
        ...validatedData,
        authorId: req.user.id,
        authorName: `${req.user.firstName} ${req.user.lastName}`,
        coverImageUrl: files.coverImage[0].path,
        previewFileUrl: files.previewFile?.[0]?.path || null,
        fullFileUrl: files.fullFile[0].path,
        fileSize: files.fullFile[0].size,
        fileFormat: path.extname(files.fullFile[0].originalname).substring(1)
      });

      res.status(201).json({
        message: 'E-book uploaded successfully. Pending admin approval.',
        ebookId: ebook.id
      });
    } catch (error) {
      console.error('E-book upload error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Purchase e-book endpoint
  app.post("/api/ebooks/:id/purchase", async (req, res) => {
    try {
      const ebookId = req.params.id;
      const { email } = req.body;
      
      const ebook = await storage.getEbook(ebookId);
      if (!ebook || ebook.status !== 'published') {
        return res.status(404).json({ error: 'E-book not found' });
      }

      // Check if user is verified student
      const isStudent = await EbookService.isVerifiedStudent(email);
      
      // Calculate pricing
      const pricing = await EbookService.calculatePricing(
        parseFloat(ebook.basePrice), 
        isStudent
      );

      // Generate download password
      const downloadPassword = EbookService.generateDownloadPassword(email, ebookId);

      const purchase = await storage.createEbookPurchase({
        ebookId,
        buyerEmail: email,
        originalPrice: pricing.originalPrice,
        studentDiscount: pricing.studentDiscount,
        platformFee: pricing.platformFee,
        authorEarnings: pricing.authorEarnings,
        finalPrice: pricing.finalPrice,
        currency: ebook.currency,
        downloadPassword
      });

      // In a real implementation, integrate with payment gateway here
      // For now, mark as completed for development
      await storage.updateEbookPurchase(purchase.id, {
        paymentStatus: 'completed'
      });

      res.json({
        message: 'Purchase successful',
        purchaseId: purchase.id,
        downloadInfo: {
          email: email,
          password: downloadPassword,
          downloadUrl: `/api/ebooks/${ebookId}/download`
        }
      });
    } catch (error) {
      console.error('Purchase error:', error);
      res.status(500).json({ error: 'Purchase failed' });
    }
  });

  // Download e-book endpoint (password protected)
  app.get("/api/ebooks/:id/download", async (req, res) => {
    try {
      const ebookId = req.params.id;
      const { email, password } = req.query;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password required for download' 
        });
      }

      // Verify download access
      const hasAccess = await EbookService.verifyDownloadAccess(
        ebookId, 
        email as string, 
        password as string
      );

      if (!hasAccess) {
        return res.status(403).json({ error: 'Invalid download credentials' });
      }

      const ebook = await storage.getEbook(ebookId);
      if (!ebook) {
        return res.status(404).json({ error: 'E-book not found' });
      }

      // Serve the file
      res.download(ebook.fullFileUrl, `${ebook.title}.${ebook.fileFormat}`);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  });

  // Admin: Get pending student verifications
  app.get("/api/admin/students/pending", isAuthenticated, async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const pendingStudents = await storage.getPendingStudentVerifications();
      res.json(pendingStudents);
    } catch (error) {
      console.error('Get pending students error:', error);
      res.status(500).json({ error: 'Failed to fetch pending students' });
    }
  });

  // Admin: Approve/reject student verification
  app.put("/api/admin/students/:id/verify", isAuthenticated, async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { status, adminNotes } = req.body;
      const studentId = req.params.id;

      const student = await storage.updateStudentUser(studentId, {
        verificationStatus: status,
        adminNotes,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      });

      // Send appropriate email
      if (status === 'approved') {
        await StudentVerificationService.sendApprovalEmail(
          student.email, 
          student.firstName
        );
      } else if (status === 'rejected') {
        await StudentVerificationService.sendRejectionEmail(
          student.email, 
          student.firstName, 
          adminNotes || 'Application does not meet requirements'
        );
      }

      res.json({ message: `Student ${status}`, student });
    } catch (error) {
      console.error('Student verification error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Admin: Get platform settings
  app.get("/api/admin/settings", isAuthenticated, async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const settings = await storage.getAllPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Admin: Update platform setting
  app.put("/api/admin/settings/:key", isAuthenticated, async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { value } = req.body;
      const setting = await storage.updatePlatformSetting(req.params.key, value);
      
      res.json({ message: 'Setting updated', setting });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  // Get e-book categories
  app.get("/api/ebook-categories", async (req, res) => {
    try {
      const categories = await storage.getEbookCategories();
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
}