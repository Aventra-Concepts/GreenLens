import express from 'express';
import { isAuthenticated } from '../auth';
import { premiumFeaturesService } from '../services/premiumFeaturesService';
import { z } from 'zod';

const router = express.Router();

// Microclimate Zones Endpoints
router.post('/api/premium/microclimate-zones', isAuthenticated, async (req: any, res) => {
  try {
    const zoneSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
        radius: z.number()
      }).optional(),
      soilType: z.string().optional(),
      sunlightHours: z.number().optional(),
      moistureLevel: z.string().optional(),
      temperatureRange: z.object({
        min: z.number(),
        max: z.number()
      }).optional()
    });

    const validatedData = zoneSchema.parse(req.body);
    const zone = await premiumFeaturesService.createMicroclimatezone(req.user.id, validatedData);
    
    res.json(zone);
  } catch (error) {
    console.error('Create microclimate zone error:', error);
    res.status(500).json({ error: 'Failed to create microclimate zone' });
  }
});

router.get('/api/premium/microclimate-zones', isAuthenticated, async (req: any, res) => {
  try {
    const zones = await premiumFeaturesService.getUserMicroclimatezones(req.user.id);
    res.json(zones);
  } catch (error) {
    console.error('Get microclimate zones error:', error);
    res.status(500).json({ error: 'Failed to fetch microclimate zones' });
  }
});

// Plant Social Network Endpoints
router.post('/api/premium/plant-connections', isAuthenticated, async (req: any, res) => {
  try {
    const connectionSchema = z.object({
      plantIdA: z.string(),
      plantIdB: z.string(),
      connectionType: z.enum(['companion', 'antagonist', 'neutral']),
      benefitDescription: z.string().optional(),
      distanceRecommended: z.number().optional(),
      seasonalEffectiveness: z.object({
        spring: z.number(),
        summer: z.number(),
        fall: z.number(),
        winter: z.number()
      }).optional(),
      userRating: z.number().min(1).max(5).optional()
    });

    const validatedData = connectionSchema.parse(req.body);
    const connection = await premiumFeaturesService.createPlantConnection(req.user.id, validatedData);
    
    res.json(connection);
  } catch (error) {
    console.error('Create plant connection error:', error);
    res.status(500).json({ error: 'Failed to create plant connection' });
  }
});

router.get('/api/premium/plant-connections/:plantId?', isAuthenticated, async (req: any, res) => {
  try {
    const { plantId } = req.params;
    const connections = await premiumFeaturesService.getPlantConnections(req.user.id, plantId);
    res.json(connections);
  } catch (error) {
    console.error('Get plant connections error:', error);
    res.status(500).json({ error: 'Failed to fetch plant connections' });
  }
});

router.get('/api/premium/companion-recommendations/:species', isAuthenticated, async (req: any, res) => {
  try {
    const { species } = req.params;
    const recommendations = await premiumFeaturesService.getCompanionPlantRecommendations(req.user.id, species);
    res.json(recommendations);
  } catch (error) {
    console.error('Get companion recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch companion recommendations' });
  }
});

// AI-Powered Intelligence Endpoints
router.get('/api/premium/ai-insights', isAuthenticated, async (req: any, res) => {
  try {
    const { urgency } = req.query;
    const insights = await premiumFeaturesService.getUserAIInsights(req.user.id, urgency as string);
    res.json(insights);
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

router.get('/api/premium/plant-health-prediction/:plantId', isAuthenticated, async (req: any, res) => {
  try {
    const { plantId } = req.params;
    const prediction = await premiumFeaturesService.predictPlantHealth(req.user.id, plantId);
    
    if (!prediction) {
      return res.status(404).json({ error: 'No data available for prediction' });
    }
    
    res.json(prediction);
  } catch (error) {
    console.error('Plant health prediction error:', error);
    res.status(500).json({ error: 'Failed to predict plant health' });
  }
});

// Professional Garden Management Endpoints
router.post('/api/premium/garden-blueprints', isAuthenticated, async (req: any, res) => {
  try {
    const blueprintSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      gardenSize: z.object({
        width: z.number(),
        height: z.number(),
        units: z.string()
      }).optional(),
      plantPlacements: z.array(z.any()).optional(),
      estimatedCost: z.number().optional()
    });

    const validatedData = blueprintSchema.parse(req.body);
    const blueprint = await premiumFeaturesService.createGardenBlueprint(req.user.id, validatedData);
    
    res.json(blueprint);
  } catch (error) {
    console.error('Create garden blueprint error:', error);
    res.status(500).json({ error: 'Failed to create garden blueprint' });
  }
});

router.get('/api/premium/garden-blueprints', isAuthenticated, async (req: any, res) => {
  try {
    const blueprints = await premiumFeaturesService.getUserBlueprints(req.user.id);
    res.json(blueprints);
  } catch (error) {
    console.error('Get garden blueprints error:', error);
    res.status(500).json({ error: 'Failed to fetch garden blueprints' });
  }
});

router.get('/api/premium/garden-valuation/:blueprintId', isAuthenticated, async (req: any, res) => {
  try {
    const { blueprintId } = req.params;
    const valuation = await premiumFeaturesService.calculateGardenValue(req.user.id, blueprintId);
    
    if (!valuation) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }
    
    res.json(valuation);
  } catch (error) {
    console.error('Garden valuation error:', error);
    res.status(500).json({ error: 'Failed to calculate garden valuation' });
  }
});

// Community & Social Features Endpoints
router.post('/api/premium/community-posts', isAuthenticated, async (req: any, res) => {
  try {
    const postSchema = z.object({
      postType: z.enum(['photo', 'tip', 'question', 'achievement', 'trade']),
      title: z.string().optional(),
      content: z.string().optional(),
      images: z.array(z.string()).optional(),
      plantTags: z.array(z.string()).optional(),
      location: z.string().optional(),
      privacy: z.enum(['public', 'friends', 'private']).optional()
    });

    const validatedData = postSchema.parse(req.body);
    const post = await premiumFeaturesService.createCommunityPost(req.user.id, validatedData);
    
    res.json(post);
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({ error: 'Failed to create community post' });
  }
});

router.get('/api/premium/community-feed', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const posts = await premiumFeaturesService.getCommunityPosts(
      parseInt(limit as string), 
      parseInt(offset as string)
    );
    res.json(posts);
  } catch (error) {
    console.error('Get community feed error:', error);
    res.status(500).json({ error: 'Failed to fetch community feed' });
  }
});

// Advanced Analytics & Insights Endpoints
router.get('/api/premium/garden-analytics', isAuthenticated, async (req: any, res) => {
  try {
    const analytics = await premiumFeaturesService.generateGardenAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    console.error('Garden analytics error:', error);
    res.status(500).json({ error: 'Failed to generate garden analytics' });
  }
});

// Smart Technology Integration Endpoints
router.post('/api/premium/iot-devices', isAuthenticated, async (req: any, res) => {
  try {
    const deviceSchema = z.object({
      deviceName: z.string().min(1),
      deviceType: z.enum(['sensor', 'irrigation', 'camera', 'weather_station']),
      macAddress: z.string().optional(),
      location: z.object({
        lat: z.number(),
        lng: z.number()
      }).optional(),
      configurations: z.any().optional()
    });

    const validatedData = deviceSchema.parse(req.body);
    const device = await premiumFeaturesService.registerIoTDevice(req.user.id, validatedData);
    
    res.json(device);
  } catch (error) {
    console.error('Register IoT device error:', error);
    res.status(500).json({ error: 'Failed to register IoT device' });
  }
});

router.get('/api/premium/iot-devices', isAuthenticated, async (req: any, res) => {
  try {
    const devices = await premiumFeaturesService.getUserIoTDevices(req.user.id);
    res.json(devices);
  } catch (error) {
    console.error('Get IoT devices error:', error);
    res.status(500).json({ error: 'Failed to fetch IoT devices' });
  }
});

router.post('/api/premium/sensor-data/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const dataSchema = z.object({
      sensorType: z.string(),
      value: z.number(),
      unit: z.string().optional(),
      quality: z.enum(['good', 'warning', 'error']).optional(),
      rawData: z.any().optional()
    });

    const validatedData = dataSchema.parse(req.body);
    const sensorData = await premiumFeaturesService.recordSensorData(deviceId, validatedData);
    
    res.json(sensorData);
  } catch (error) {
    console.error('Record sensor data error:', error);
    res.status(500).json({ error: 'Failed to record sensor data' });
  }
});

router.get('/api/premium/sensor-data/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sensorType, hours = 24 } = req.query;
    
    const data = await premiumFeaturesService.getSensorData(
      deviceId, 
      sensorType as string, 
      parseInt(hours as string)
    );
    
    res.json(data);
  } catch (error) {
    console.error('Get sensor data error:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

// Premium Dashboard Data Endpoint
router.get('/api/premium/dashboard-data', isAuthenticated, async (req: any, res) => {
  try {
    const dashboardData = await premiumFeaturesService.getPremiumDashboardData(req.user.id);
    res.json(dashboardData);
  } catch (error) {
    console.error('Premium dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch premium dashboard data' });
  }
});

export default router;