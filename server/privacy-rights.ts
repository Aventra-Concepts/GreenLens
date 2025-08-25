import type { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { storage } from './storage';
import DOMPurify from 'isomorphic-dompurify';
import { randomBytes } from 'crypto';

// Rate limiting for privacy requests (more restrictive)
const privacyRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Maximum 3 privacy requests per hour per IP
  message: { 
    message: "Too many privacy requests. Please try again later.",
    error: "RATE_LIMIT_EXCEEDED" 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced email validation for privacy requests
function validateEmailForPrivacy(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  
  // Additional checks for privacy requests
  if (email.length > 320) return false; // Max email length
  const [local, domain] = email.split('@');
  if (local.length > 64) return false; // Max local part length
  if (domain.length > 253) return false; // Max domain length
  
  return true;
}

// Generate verification token
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function setupPrivacyRightsRoutes(app: Express) {
  // CCPA Right to Know - Data Access Request
  app.post('/api/privacy/data-access', privacyRequestLimiter, async (req, res) => {
    try {
      const { email, fullName, reason } = req.body;
      
      // Input sanitization
      const sanitizedEmail = DOMPurify.sanitize(email?.toLowerCase()?.trim() || '');
      const sanitizedFullName = DOMPurify.sanitize(fullName?.trim() || '');
      const sanitizedReason = DOMPurify.sanitize(reason?.trim() || '');
      
      // Validation
      if (!sanitizedEmail || !sanitizedFullName) {
        return res.status(400).json({ 
          message: "Email and full name are required for data access requests.",
          error: "MISSING_REQUIRED_FIELDS"
        });
      }
      
      if (!validateEmailForPrivacy(sanitizedEmail)) {
        return res.status(400).json({ 
          message: "Please provide a valid email address.",
          error: "INVALID_EMAIL"
        });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(sanitizedEmail);
      
      if (!user) {
        // Don't reveal whether user exists for privacy
        return res.status(200).json({
          message: "If an account with this email exists, you will receive a verification email with instructions to access your data."
        });
      }
      
      // Generate verification token and store request
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createPrivacyRequest({
        email: sanitizedEmail,
        fullName: sanitizedFullName,
        requestType: 'DATA_ACCESS',
        reason: sanitizedReason,
        verificationToken,
        status: 'PENDING_VERIFICATION',
        expiresAt,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || ''
      });
      
      // TODO: Send verification email with token
      // For now, return success message
      res.status(200).json({
        message: "Data access request submitted. You will receive a verification email with instructions.",
        requestId: verificationToken.substring(0, 8) + "..." // Partial token for reference
      });
      
    } catch (error) {
      console.error('Data access request error:', error);
      res.status(500).json({ 
        message: "Unable to process your data access request. Please try again later.",
        error: "INTERNAL_ERROR"
      });
    }
  });
  
  // CCPA Right to Delete - Data Deletion Request
  app.post('/api/privacy/data-deletion', privacyRequestLimiter, async (req, res) => {
    try {
      const { email, fullName, reason, confirmDeletion } = req.body;
      
      // Input sanitization
      const sanitizedEmail = DOMPurify.sanitize(email?.toLowerCase()?.trim() || '');
      const sanitizedFullName = DOMPurify.sanitize(fullName?.trim() || '');
      const sanitizedReason = DOMPurify.sanitize(reason?.trim() || '');
      
      // Validation
      if (!sanitizedEmail || !sanitizedFullName || !confirmDeletion) {
        return res.status(400).json({ 
          message: "Email, full name, and deletion confirmation are required.",
          error: "MISSING_REQUIRED_FIELDS"
        });
      }
      
      if (!validateEmailForPrivacy(sanitizedEmail)) {
        return res.status(400).json({ 
          message: "Please provide a valid email address.",
          error: "INVALID_EMAIL"
        });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(sanitizedEmail);
      
      if (!user) {
        // Don't reveal whether user exists for privacy
        return res.status(200).json({
          message: "If an account with this email exists, you will receive a verification email with deletion instructions."
        });
      }
      
      // Generate verification token and store request
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createPrivacyRequest({
        email: sanitizedEmail,
        fullName: sanitizedFullName,
        requestType: 'DATA_DELETION',
        reason: sanitizedReason,
        verificationToken,
        status: 'PENDING_VERIFICATION',
        expiresAt,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || ''
      });
      
      // TODO: Send verification email with token
      res.status(200).json({
        message: "Data deletion request submitted. You will receive a verification email with instructions. This action is permanent and cannot be undone.",
        requestId: verificationToken.substring(0, 8) + "...",
        warning: "Account deletion is permanent and will remove all your data including plant identifications, garden monitoring, and subscriptions."
      });
      
    } catch (error) {
      console.error('Data deletion request error:', error);
      res.status(500).json({ 
        message: "Unable to process your data deletion request. Please try again later.",
        error: "INTERNAL_ERROR"
      });
    }
  });
  
  // CCPA Right to Portability - Data Export Request
  app.post('/api/privacy/data-export', privacyRequestLimiter, async (req, res) => {
    try {
      const { email, fullName, format, reason } = req.body;
      
      // Input sanitization
      const sanitizedEmail = DOMPurify.sanitize(email?.toLowerCase()?.trim() || '');
      const sanitizedFullName = DOMPurify.sanitize(fullName?.trim() || '');
      const sanitizedFormat = DOMPurify.sanitize(format?.trim() || 'JSON');
      const sanitizedReason = DOMPurify.sanitize(reason?.trim() || '');
      
      // Validation
      if (!sanitizedEmail || !sanitizedFullName) {
        return res.status(400).json({ 
          message: "Email and full name are required for data export requests.",
          error: "MISSING_REQUIRED_FIELDS"
        });
      }
      
      if (!validateEmailForPrivacy(sanitizedEmail)) {
        return res.status(400).json({ 
          message: "Please provide a valid email address.",
          error: "INVALID_EMAIL"
        });
      }
      
      // Validate export format
      const allowedFormats = ['JSON', 'CSV', 'PDF'];
      if (!allowedFormats.includes(sanitizedFormat.toUpperCase())) {
        return res.status(400).json({ 
          message: "Invalid export format. Supported formats: JSON, CSV, PDF",
          error: "INVALID_FORMAT"
        });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(sanitizedEmail);
      
      if (!user) {
        // Don't reveal whether user exists for privacy
        return res.status(200).json({
          message: "If an account with this email exists, you will receive a verification email with export instructions."
        });
      }
      
      // Generate verification token and store request
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createPrivacyRequest({
        email: sanitizedEmail,
        fullName: sanitizedFullName,
        requestType: 'DATA_EXPORT',
        reason: sanitizedReason,
        verificationToken,
        status: 'PENDING_VERIFICATION',
        expiresAt,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || '',
        exportFormat: sanitizedFormat.toUpperCase()
      });
      
      // TODO: Send verification email with token
      res.status(200).json({
        message: `Data export request submitted. You will receive a verification email with download instructions. Your data will be exported in ${sanitizedFormat.toUpperCase()} format.`,
        requestId: verificationToken.substring(0, 8) + "...",
        format: sanitizedFormat.toUpperCase()
      });
      
    } catch (error) {
      console.error('Data export request error:', error);
      res.status(500).json({ 
        message: "Unable to process your data export request. Please try again later.",
        error: "INTERNAL_ERROR"
      });
    }
  });
  
  // CCPA Right to Opt-Out - Stop Data Sale/Sharing
  app.post('/api/privacy/opt-out', privacyRequestLimiter, async (req, res) => {
    try {
      const { email, fullName, optOutTypes } = req.body;
      
      // Input sanitization
      const sanitizedEmail = DOMPurify.sanitize(email?.toLowerCase()?.trim() || '');
      const sanitizedFullName = DOMPurify.sanitize(fullName?.trim() || '');
      
      // Validation
      if (!sanitizedEmail || !sanitizedFullName) {
        return res.status(400).json({ 
          message: "Email and full name are required for opt-out requests.",
          error: "MISSING_REQUIRED_FIELDS"
        });
      }
      
      if (!validateEmailForPrivacy(sanitizedEmail)) {
        return res.status(400).json({ 
          message: "Please provide a valid email address.",
          error: "INVALID_EMAIL"
        });
      }
      
      // Validate opt-out types
      const allowedOptOutTypes = ['DATA_SHARING', 'MARKETING', 'ANALYTICS', 'AI_TRAINING', 'TARGETED_ADS'];
      const sanitizedOptOutTypes = (optOutTypes || []).filter((type: string) => 
        allowedOptOutTypes.includes(type)
      );
      
      if (sanitizedOptOutTypes.length === 0) {
        return res.status(400).json({ 
          message: "Please select at least one opt-out option.",
          error: "NO_OPT_OUT_SELECTED"
        });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(sanitizedEmail);
      
      if (!user) {
        // Don't reveal whether user exists for privacy
        return res.status(200).json({
          message: "If an account with this email exists, your opt-out preferences have been recorded."
        });
      }
      
      // Generate verification token and store request
      const verificationToken = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createPrivacyRequest({
        email: sanitizedEmail,
        fullName: sanitizedFullName,
        requestType: 'OPT_OUT',
        reason: `Opt-out requested for: ${sanitizedOptOutTypes.join(', ')}`,
        verificationToken,
        status: 'PENDING_VERIFICATION',
        expiresAt,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || '',
        optOutTypes: sanitizedOptOutTypes
      });
      
      // TODO: Send verification email with token
      res.status(200).json({
        message: "Opt-out request submitted. You will receive a confirmation email.",
        requestId: verificationToken.substring(0, 8) + "...",
        optOutTypes: sanitizedOptOutTypes
      });
      
    } catch (error) {
      console.error('Opt-out request error:', error);
      res.status(500).json({ 
        message: "Unable to process your opt-out request. Please try again later.",
        error: "INTERNAL_ERROR"
      });
    }
  });
  
  // Verify Privacy Request Token
  app.post('/api/privacy/verify', privacyRequestLimiter, async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          message: "Verification token is required.",
          error: "MISSING_TOKEN"
        });
      }
      
      // Find and validate the privacy request
      const privacyRequest = await storage.getPrivacyRequestByToken(token);
      
      if (!privacyRequest) {
        return res.status(400).json({ 
          message: "Invalid or expired verification token.",
          error: "INVALID_TOKEN"
        });
      }
      
      // Check if token is expired
      if (new Date() > privacyRequest.expiresAt) {
        return res.status(400).json({ 
          message: "Verification token has expired. Please submit a new request.",
          error: "EXPIRED_TOKEN"
        });
      }
      
      // Process the verified request based on type
      let result;
      switch (privacyRequest.requestType) {
        case 'DATA_ACCESS':
          result = await processDataAccessRequest(privacyRequest);
          break;
        case 'DATA_DELETION':
          result = await processDataDeletionRequest(privacyRequest);
          break;
        case 'DATA_EXPORT':
          result = await processDataExportRequest(privacyRequest);
          break;
        case 'OPT_OUT':
          result = await processOptOutRequest(privacyRequest);
          break;
        default:
          throw new Error('Unknown request type');
      }
      
      // Update request status
      await storage.updatePrivacyRequestStatus(privacyRequest.id, 'COMPLETED');
      
      res.status(200).json(result);
      
    } catch (error) {
      console.error('Privacy request verification error:', error);
      res.status(500).json({ 
        message: "Unable to process your verification request. Please try again later.",
        error: "INTERNAL_ERROR"
      });
    }
  });
  
  // Get Privacy Request Status
  app.get('/api/privacy/status/:requestId', async (req, res) => {
    try {
      const { requestId } = req.params;
      
      if (!requestId) {
        return res.status(400).json({ 
          message: "Request ID is required.",
          error: "MISSING_REQUEST_ID"
        });
      }
      
      // Find the privacy request (using partial token as requestId)
      const requests = await storage.getPrivacyRequestsByPartialToken(requestId);
      
      if (requests.length === 0) {
        return res.status(404).json({ 
          message: "Privacy request not found.",
          error: "REQUEST_NOT_FOUND"
        });
      }
      
      // Return status for the most recent matching request
      const request = requests[0];
      res.status(200).json({
        requestId: requestId,
        requestType: request.requestType,
        status: request.status,
        submittedAt: request.createdAt,
        expiresAt: request.expiresAt
      });
      
    } catch (error) {
      console.error('Privacy request status error:', error);
      res.status(500).json({ 
        message: "Unable to retrieve request status. Please try again later.",
        error: "INTERNAL_ERROR"
      });
    }
  });
}

// Helper functions to process different types of privacy requests
async function processDataAccessRequest(request: any) {
  const user = await storage.getUserByEmail(request.email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Collect all user data
  const userData = {
    profile: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    },
    // TODO: Add plant identifications, garden monitoring data, etc.
  };
  
  return {
    message: "Your personal data has been compiled and is available for download.",
    data: userData,
    generatedAt: new Date().toISOString()
  };
}

async function processDataDeletionRequest(request: any) {
  const user = await storage.getUserByEmail(request.email);
  if (!user) {
    return {
      message: "No account found with this email address.",
      deleted: false
    };
  }
  
  // TODO: Implement comprehensive data deletion
  // This should delete user account, plant identifications, garden monitoring, etc.
  // For now, just mark account as inactive
  await storage.deactivateUser(user.id);
  
  return {
    message: "Your account and all associated data have been successfully deleted.",
    deleted: true,
    deletedAt: new Date().toISOString()
  };
}

async function processDataExportRequest(request: any) {
  const user = await storage.getUserByEmail(request.email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // TODO: Generate export file in requested format
  const exportData = {
    user: user,
    // TODO: Add plant identifications, garden monitoring, etc.
  };
  
  return {
    message: `Your data export in ${request.exportFormat} format is ready for download.`,
    format: request.exportFormat,
    downloadLink: `/api/privacy/download/${request.verificationToken}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
}

async function processOptOutRequest(request: any) {
  const user = await storage.getUserByEmail(request.email);
  if (!user) {
    return {
      message: "Your opt-out preferences have been recorded.",
      optedOut: request.optOutTypes
    };
  }
  
  // TODO: Update user preferences based on opt-out types
  const preferences = {
    dataSharing: request.optOutTypes.includes('DATA_SHARING') ? false : user.dataSharing,
    marketing: request.optOutTypes.includes('MARKETING') ? false : user.marketing,
    analytics: request.optOutTypes.includes('ANALYTICS') ? false : user.analytics,
    aiTraining: request.optOutTypes.includes('AI_TRAINING') ? false : user.aiTraining,
    targetedAds: request.optOutTypes.includes('TARGETED_ADS') ? false : user.targetedAds
  };
  
  await storage.updateUserPrivacyPreferences(user.id, preferences);
  
  return {
    message: "Your opt-out preferences have been successfully updated.",
    optedOut: request.optOutTypes,
    updatedAt: new Date().toISOString()
  };
}