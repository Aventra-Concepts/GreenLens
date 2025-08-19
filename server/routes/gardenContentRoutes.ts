import { Router } from 'express';
import { storage } from '../storage';
import { insertGardenContentSchema } from '@shared/schema';
import { requireAuth, requireAdmin } from '../middleware/auth';
import OpenAI from 'openai';

const router = Router();

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not configured - AI content generation will be disabled');
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Get all garden content sections
router.get('/', async (req, res) => {
  try {
    const content = await storage.getGardenContent();
    res.json(content);
  } catch (error) {
    console.error('Error fetching garden content:', error);
    res.status(500).json({ error: 'Failed to fetch garden content' });
  }
});

// Create new garden content section (Admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validatedData = insertGardenContentSchema.parse(req.body);
    const content = await storage.createGardenContent({
      ...validatedData,
      lastEditedBy: req.user.id,
    });
    res.status(201).json(content);
  } catch (error) {
    console.error('Error creating garden content:', error);
    res.status(500).json({ error: 'Failed to create garden content' });
  }
});

// Update garden content section (Admin only)
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const updatedContent = await storage.updateGardenContent(id, {
      title,
      content,
      lastEditedBy: req.user.id,
      updatedAt: new Date(),
    });
    
    if (!updatedContent) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating garden content:', error);
    res.status(500).json({ error: 'Failed to update garden content' });
  }
});

// Delete garden content section (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteGardenContent(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting garden content:', error);
    res.status(500).json({ error: 'Failed to delete garden content' });
  }
});

// AI Content Generation endpoint (Admin only)
router.post('/ai/generate', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI content generation is not available. Please configure OPENAI_API_KEY.' 
      });
    }

    const { prompt, contentType } = req.body;
    
    if (!prompt || !contentType) {
      return res.status(400).json({ 
        error: 'Both prompt and contentType are required' 
      });
    }

    // Create an enhanced prompt based on content type
    const enhancedPrompts = {
      hero: `Create engaging hero section content for a garden management dashboard. The content should be inspiring and focus on the benefits of tracking plants scientifically. Original content only, no copyrighted material. Based on: ${prompt}`,
      features: `Write clear, compelling feature descriptions for a plant tracking application. Focus on scientific accuracy and user benefits. Original content only. Based on: ${prompt}`,
      tips: `Generate practical, scientifically-accurate gardening tips that help users improve their plant care. Original educational content only. Based on: ${prompt}`,
      statistics: `Create informative text about plant tracking statistics and metrics. Focus on educational value and scientific accuracy. Original content only. Based on: ${prompt}`
    };

    const systemPrompt = `You are a professional content writer specializing in gardening and plant care. Create original, engaging, and scientifically accurate content. 

    Requirements:
    - All content must be completely original (no copyrighted material)
    - Focus on scientific accuracy and educational value
    - Write in a friendly but professional tone
    - Keep content concise but informative
    - Ensure content is suitable for a plant tracking application
    
    Return your response as JSON with "title" and "content" fields.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: enhancedPrompts[contentType as keyof typeof enhancedPrompts] || prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Log the AI generation for tracking
    await storage.createAiContentLog({
      contentType,
      prompt,
      generatedContent: completion.choices[0].message.content || '',
      status: 'generated',
      metadata: {
        model: 'gpt-4o',
        usage: completion.usage,
      }
    });

    // Create the garden content entry
    const content = await storage.createGardenContent({
      sectionType: contentType,
      title: generatedContent.title || 'AI Generated Content',
      content: generatedContent.content || 'Content generated successfully',
      metadata: { 
        generatedByAI: true, 
        prompt,
        generatedAt: new Date().toISOString() 
      },
      lastEditedBy: req.user.id,
    });

    res.json({
      success: true,
      content,
      generated: generatedContent
    });

  } catch (error) {
    console.error('Error generating AI content:', error);
    
    // Log the error for admin debugging while providing user-friendly message
    await storage.createAiContentLog({
      contentType: req.body.contentType || 'unknown',
      prompt: req.body.prompt || '',
      generatedContent: '',
      status: 'failed',
      metadata: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }).catch(console.error);

    res.status(500).json({ 
      error: 'Failed to generate AI content. Please try again or contact support.' 
    });
  }
});

export default router;