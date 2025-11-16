import { Router } from 'express';
import { storage } from '../storage';
import { nanoid } from 'nanoid';
import multer from 'multer';
import { whatsappService } from '../services/whatsappService';

const upload = multer({ storage: multer.memoryStorage() });

export function createSocialSharingRouter() {
  const router = Router();

  // Expert Ticket Routes
  // Create new expert ticket
  router.post('/expert-tickets', upload.array('photos', 5), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { plantId, subject, question, urgencyLevel } = req.body;
      
      // Calculate priority based on subscription tier
      const user = req.user;
      let priority = 0;
      let subscriptionTier = user.subscriptionPlanId || 'free';
      
      if (subscriptionTier === 'premium') {
        priority = 2; // Highest priority
      } else if (subscriptionTier === 'pro') {
        priority = 1; // Medium priority
      }

      const ticket = await storage.createPlantExpertTicket({
        userId: user.id,
        plantId: plantId || null,
        subject,
        question,
        photoUrls: [], // Photo upload will be handled separately with object storage
        urgencyLevel: urgencyLevel || 'medium',
        priority,
        subscriptionTier,
      });

      res.json(ticket);
    } catch (error) {
      console.error('Error creating expert ticket:', error);
      res.status(500).json({ message: 'Failed to create expert ticket' });
    }
  });

  // Get user's expert tickets
  router.get('/expert-tickets', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { status } = req.query;
      const tickets = await storage.getPlantExpertTickets(req.user.id, status as string);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching expert tickets:', error);
      res.status(500).json({ message: 'Failed to fetch expert tickets' });
    }
  });

  // Get tickets for a specific plant
  router.get('/expert-tickets/plant/:plantId', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { plantId } = req.params;
      const tickets = await storage.getPlantExpertTicketsByPlant(plantId, req.user.id);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching plant tickets:', error);
      res.status(500).json({ message: 'Failed to fetch plant tickets' });
    }
  });

  // Get single ticket
  router.get('/expert-tickets/:ticketId', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { ticketId } = req.params;
      const ticket = await storage.getPlantExpertTicket(ticketId, req.user.id);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      console.error('Error fetching expert ticket:', error);
      res.status(500).json({ message: 'Failed to fetch expert ticket' });
    }
  });

  // Update ticket
  router.patch('/expert-tickets/:ticketId', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { ticketId } = req.params;
      const updates = req.body;

      const ticket = await storage.updatePlantExpertTicket(ticketId, req.user.id, updates);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      console.error('Error updating expert ticket:', error);
      res.status(500).json({ message: 'Failed to update expert ticket' });
    }
  });

  // Shared Plant Link Routes
  // Create shareable link
  router.post('/shared-links', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { plantId, title, description, isPublic, allowComments, expiresAt } = req.body;

      if (!plantId || !title) {
        return res.status(400).json({ message: 'Plant ID and title are required' });
      }

      const shareToken = nanoid(12); // Generate unique token

      const link = await storage.createSharedPlantLink({
        userId: req.user.id,
        plantId,
        shareToken,
        title,
        description,
        isPublic: isPublic !== undefined ? isPublic : true,
        allowComments: allowComments || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      res.json(link);
    } catch (error) {
      console.error('Error creating shared link:', error);
      res.status(500).json({ message: 'Failed to create shared link' });
    }
  });

  // Get user's shared links
  router.get('/shared-links', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const links = await storage.getSharedPlantLinks(req.user.id);
      res.json(links);
    } catch (error) {
      console.error('Error fetching shared links:', error);
      res.status(500).json({ message: 'Failed to fetch shared links' });
    }
  });

  // Get shared link by token (public access)
  router.get('/shared/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const link = await storage.getSharedPlantLinkByToken(token);

      if (!link) {
        return res.status(404).json({ message: 'Shared link not found' });
      }

      // Check if link is expired
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return res.status(410).json({ message: 'Shared link has expired' });
      }

      // Increment view count
      await storage.incrementShareLinkView(token);

      res.json(link);
    } catch (error) {
      console.error('Error fetching shared link:', error);
      res.status(500).json({ message: 'Failed to fetch shared link' });
    }
  });

  // Update shared link
  router.patch('/shared-links/:linkId', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { linkId } = req.params;
      const updates = req.body;

      const link = await storage.updateSharedPlantLink(linkId, req.user.id, updates);

      if (!link) {
        return res.status(404).json({ message: 'Shared link not found' });
      }

      res.json(link);
    } catch (error) {
      console.error('Error updating shared link:', error);
      res.status(500).json({ message: 'Failed to update shared link' });
    }
  });

  // Delete shared link
  router.delete('/shared-links/:linkId', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { linkId } = req.params;
      await storage.deleteSharedPlantLink(linkId, req.user.id);

      res.json({ message: 'Shared link deleted successfully' });
    } catch (error) {
      console.error('Error deleting shared link:', error);
      res.status(500).json({ message: 'Failed to delete shared link' });
    }
  });

  // Increment share count
  router.post('/shared-links/:linkId/share', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { linkId } = req.params;
      await storage.incrementShareLinkShare(linkId, req.user.id);

      res.json({ message: 'Share count incremented' });
    } catch (error) {
      console.error('Error incrementing share count:', error);
      res.status(500).json({ message: 'Failed to increment share count' });
    }
  });

  // Email Digest Preferences Routes
  // Get preferences
  router.get('/digest-preferences', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const prefs = await storage.getEmailDigestPreferences(req.user.id);
      res.json(prefs || {
        weeklyDigestEnabled: false,
        digestDay: 'monday',
        digestTime: '09:00',
        includePlantHealth: true,
        includeTasks: true,
        includeHarvests: true,
        includeTips: true,
        includeWeather: true,
      });
    } catch (error) {
      console.error('Error fetching digest preferences:', error);
      res.status(500).json({ message: 'Failed to fetch digest preferences' });
    }
  });

  // Update preferences
  router.post('/digest-preferences', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const prefs = await storage.upsertEmailDigestPreferences(req.user.id, req.body);
      res.json(prefs);
    } catch (error) {
      console.error('Error updating digest preferences:', error);
      res.status(500).json({ message: 'Failed to update digest preferences' });
    }
  });

  // Care Sheet Export Route
  router.get('/care-sheet/:plantId', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { plantId } = req.params;
      const plant = await storage.getGardenPlant(plantId, req.user.id);

      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      // Get related data
      const [careActivities, diseaseLogs, measurements, photos] = await Promise.all([
        storage.getCareActivities(req.user.id, plantId),
        storage.getPlantDiseaseLogs(plantId, req.user.id),
        storage.getPlantMeasurements(plantId, req.user.id),
        storage.getPlantPhotos(plantId, req.user.id),
      ]);

      const careSheet = {
        plant,
        careActivities,
        diseaseLogs,
        measurements,
        photos,
        generatedAt: new Date().toISOString(),
      };

      res.json(careSheet);
    } catch (error) {
      console.error('Error generating care sheet:', error);
      res.status(500).json({ message: 'Failed to generate care sheet' });
    }
  });

  // WhatsApp Sharing Routes (Pro plan only)
  // Check WhatsApp eligibility
  router.get('/whatsapp/eligibility', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const eligibility = whatsappService.canUserAccessWhatsApp(req.user);
      const isConfigured = whatsappService.isConfigured();

      res.json({
        eligible: eligibility.allowed && isConfigured,
        reason: !isConfigured ? 'WhatsApp service not configured' : eligibility.reason,
        hasProPlan: req.user.subscriptionPlanId === 'pro' || req.user.subscriptionPlanId === 'premium',
        hasVerifiedPhone: !!req.user.phoneVerifiedAt,
      });
    } catch (error) {
      console.error('Error checking WhatsApp eligibility:', error);
      res.status(500).json({ message: 'Failed to check eligibility' });
    }
  });

  // Share plant profile via WhatsApp
  router.post('/whatsapp/share-plant', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { plantId, shareToken } = req.body;

      if (!plantId || !shareToken) {
        return res.status(400).json({ message: 'Plant ID and share token required' });
      }

      // Get plant info
      const plant = await storage.getGardenPlant(plantId, req.user.id);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      // Generate share URL
      const shareUrl = `${req.protocol}://${req.get('host')}/shared/${shareToken}`;

      // Send via WhatsApp to registered number only
      const result = await whatsappService.sharePlantProfile(req.user, plant.name, shareUrl);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({
        success: true,
        message: result.message,
        sentTo: req.user.phoneNumber, // Show user which number it was sent to
      });
    } catch (error) {
      console.error('Error sharing plant via WhatsApp:', error);
      res.status(500).json({ message: 'Failed to share via WhatsApp' });
    }
  });

  // Share care sheet via WhatsApp
  router.post('/whatsapp/share-care-sheet', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { plantId, careSheetUrl } = req.body;

      if (!plantId || !careSheetUrl) {
        return res.status(400).json({ message: 'Plant ID and care sheet URL required' });
      }

      // Get plant info
      const plant = await storage.getGardenPlant(plantId, req.user.id);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }

      // Send via WhatsApp to registered number only
      const result = await whatsappService.sharePlantCareSheet(req.user, plant.name, careSheetUrl);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({
        success: true,
        message: result.message,
        sentTo: req.user.phoneNumber,
      });
    } catch (error) {
      console.error('Error sharing care sheet via WhatsApp:', error);
      res.status(500).json({ message: 'Failed to share care sheet via WhatsApp' });
    }
  });

  return router;
}
