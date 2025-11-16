import { Express } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import {
  insertGardenBedSchema,
  insertBedPlantAssignmentSchema,
  insertCropRotationHistorySchema,
  insertPlantingScheduleSchema,
} from "@shared/schema";

export function registerPlanningLayoutRoutes(app: Express) {
  
  // Garden Beds Routes
  app.get("/api/planning/beds", requireAuth, async (req, res) => {
    try {
      const beds = await storage.getGardenBeds(req.user!.id);
      res.json({ success: true, beds });
    } catch (error) {
      console.error('Error fetching garden beds:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch garden beds' });
    }
  });

  app.get("/api/planning/beds/:bedId", requireAuth, async (req, res) => {
    try {
      const { bedId } = req.params;
      const bed = await storage.getGardenBed(bedId, req.user!.id);
      
      if (!bed) {
        return res.status(404).json({ success: false, message: 'Garden bed not found' });
      }
      
      res.json({ success: true, bed });
    } catch (error) {
      console.error('Error fetching garden bed:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch garden bed' });
    }
  });

  app.post("/api/planning/beds", requireAuth, async (req, res) => {
    try {
      const validatedData = insertGardenBedSchema.parse(req.body);
      
      // Calculate area if length and width provided
      let area = validatedData.area;
      if (validatedData.length && validatedData.width && !area) {
        area = String(Number(validatedData.length) * Number(validatedData.width));
      }
      
      const bed = await storage.createGardenBed({
        ...validatedData,
        area,
        userId: req.user!.id
      });
      
      res.json({ success: true, bed });
    } catch (error) {
      console.error('Error creating garden bed:', error);
      res.status(500).json({ success: false, message: 'Failed to create garden bed' });
    }
  });

  app.patch("/api/planning/beds/:bedId", requireAuth, async (req, res) => {
    try {
      const { bedId } = req.params;
      
      // Calculate area if length and width provided
      let updates = req.body;
      if (updates.length && updates.width) {
        updates.area = String(Number(updates.length) * Number(updates.width));
      }
      
      const bed = await storage.updateGardenBed(bedId, req.user!.id, updates);
      
      if (!bed) {
        return res.status(404).json({ success: false, message: 'Garden bed not found' });
      }
      
      res.json({ success: true, bed });
    } catch (error) {
      console.error('Error updating garden bed:', error);
      res.status(500).json({ success: false, message: 'Failed to update garden bed' });
    }
  });

  app.delete("/api/planning/beds/:bedId", requireAuth, async (req, res) => {
    try {
      const { bedId } = req.params;
      await storage.deleteGardenBed(bedId, req.user!.id);
      res.json({ success: true, message: 'Garden bed deleted' });
    } catch (error) {
      console.error('Error deleting garden bed:', error);
      res.status(500).json({ success: false, message: 'Failed to delete garden bed' });
    }
  });

  // Plant Assignments Routes
  app.get("/api/planning/assignments", requireAuth, async (req, res) => {
    try {
      const assignments = await storage.getBedPlantAssignments(req.user!.id);
      res.json({ success: true, assignments });
    } catch (error) {
      console.error('Error fetching plant assignments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch plant assignments' });
    }
  });

  app.get("/api/planning/assignments/bed/:bedId", requireAuth, async (req, res) => {
    try {
      const { bedId } = req.params;
      const assignments = await storage.getBedPlantAssignmentsByBed(bedId);
      res.json({ success: true, assignments });
    } catch (error) {
      console.error('Error fetching bed assignments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch bed assignments' });
    }
  });

  app.post("/api/planning/assignments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBedPlantAssignmentSchema.parse(req.body);
      
      // Check for rotation conflicts if plant family is provided
      if (validatedData.plantFamily) {
        const conflict = await storage.checkRotationConflict(
          validatedData.bedId,
          validatedData.plantFamily
        );
        
        if (conflict.hasConflict) {
          return res.json({ 
            success: true, 
            assignment: null,
            warning: conflict.message,
            conflict: conflict
          });
        }
      }
      
      const assignment = await storage.createBedPlantAssignment({
        ...validatedData,
        userId: req.user!.id
      });
      
      res.json({ success: true, assignment });
    } catch (error) {
      console.error('Error creating plant assignment:', error);
      res.status(500).json({ success: false, message: 'Failed to create plant assignment' });
    }
  });

  app.patch("/api/planning/assignments/:assignmentId", requireAuth, async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const assignment = await storage.updateBedPlantAssignment(
        assignmentId,
        req.user!.id,
        req.body
      );
      
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }
      
      res.json({ success: true, assignment });
    } catch (error) {
      console.error('Error updating plant assignment:', error);
      res.status(500).json({ success: false, message: 'Failed to update plant assignment' });
    }
  });

  app.delete("/api/planning/assignments/:assignmentId", requireAuth, async (req, res) => {
    try {
      const { assignmentId } = req.params;
      await storage.deleteBedPlantAssignment(assignmentId, req.user!.id);
      res.json({ success: true, message: 'Plant assignment deleted' });
    } catch (error) {
      console.error('Error deleting plant assignment:', error);
      res.status(500).json({ success: false, message: 'Failed to delete plant assignment' });
    }
  });

  // Crop Rotation Routes
  app.get("/api/planning/rotation", requireAuth, async (req, res) => {
    try {
      const history = await storage.getCropRotationHistory(req.user!.id);
      res.json({ success: true, history });
    } catch (error) {
      console.error('Error fetching rotation history:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch rotation history' });
    }
  });

  app.get("/api/planning/rotation/bed/:bedId", requireAuth, async (req, res) => {
    try {
      const { bedId } = req.params;
      const history = await storage.getCropRotationHistoryByBed(bedId);
      res.json({ success: true, history });
    } catch (error) {
      console.error('Error fetching bed rotation history:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch bed rotation history' });
    }
  });

  app.post("/api/planning/rotation", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCropRotationHistorySchema.parse(req.body);
      const history = await storage.createCropRotationHistory({
        ...validatedData,
        userId: req.user!.id
      });
      
      res.json({ success: true, history });
    } catch (error) {
      console.error('Error creating rotation history:', error);
      res.status(500).json({ success: false, message: 'Failed to create rotation history' });
    }
  });

  app.post("/api/planning/rotation/check", requireAuth, async (req, res) => {
    try {
      const { bedId, plantFamily } = req.body;
      
      if (!bedId || !plantFamily) {
        return res.status(400).json({ 
          success: false, 
          message: 'bedId and plantFamily are required' 
        });
      }
      
      const conflict = await storage.checkRotationConflict(bedId, plantFamily);
      res.json({ success: true, ...conflict });
    } catch (error) {
      console.error('Error checking rotation conflict:', error);
      res.status(500).json({ success: false, message: 'Failed to check rotation conflict' });
    }
  });

  // Planting Schedules Routes
  app.get("/api/planning/schedules", requireAuth, async (req, res) => {
    try {
      const schedules = await storage.getPlantingSchedules(req.user!.id);
      res.json({ success: true, schedules });
    } catch (error) {
      console.error('Error fetching planting schedules:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch planting schedules' });
    }
  });

  app.get("/api/planning/schedules/:scheduleId", requireAuth, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const schedule = await storage.getPlantingSchedule(scheduleId, req.user!.id);
      
      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
      
      res.json({ success: true, schedule });
    } catch (error) {
      console.error('Error fetching planting schedule:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch planting schedule' });
    }
  });

  app.post("/api/planning/schedules", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPlantingScheduleSchema.parse(req.body);
      const schedule = await storage.createPlantingSchedule({
        ...validatedData,
        userId: req.user!.id
      });
      
      res.json({ success: true, schedule });
    } catch (error) {
      console.error('Error creating planting schedule:', error);
      res.status(500).json({ success: false, message: 'Failed to create planting schedule' });
    }
  });

  app.patch("/api/planning/schedules/:scheduleId", requireAuth, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const schedule = await storage.updatePlantingSchedule(
        scheduleId,
        req.user!.id,
        req.body
      );
      
      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
      
      res.json({ success: true, schedule });
    } catch (error) {
      console.error('Error updating planting schedule:', error);
      res.status(500).json({ success: false, message: 'Failed to update planting schedule' });
    }
  });

  app.delete("/api/planning/schedules/:scheduleId", requireAuth, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      await storage.deletePlantingSchedule(scheduleId, req.user!.id);
      res.json({ success: true, message: 'Planting schedule deleted' });
    } catch (error) {
      console.error('Error deleting planting schedule:', error);
      res.status(500).json({ success: false, message: 'Failed to delete planting schedule' });
    }
  });

  // Planting Schedule Generator
  app.post("/api/planning/schedules/generate", requireAuth, async (req, res) => {
    try {
      const { location, zone, season, year, plants } = req.body;
      
      if (!location || !season || !year) {
        return res.status(400).json({ 
          success: false, 
          message: 'location, season, and year are required' 
        });
      }
      
      // Simple schedule generation based on season and hardiness zone
      // This can be enhanced with more sophisticated logic later
      const scheduleItems = (plants || []).map((plant: any) => {
        const sowDate = calculateSowDate(season, year, plant.name);
        const transplantDate = calculateTransplantDate(sowDate, plant.name);
        const harvestDate = calculateHarvestDate(transplantDate, plant.name);
        
        return {
          plantName: plant.name,
          variety: plant.variety || '',
          sowDate,
          transplantDate,
          harvestDate,
          notes: `Recommended for ${season} ${year} in zone ${zone || 'N/A'}`
        };
      });
      
      const schedule = await storage.createPlantingSchedule({
        name: `${season} ${year} Schedule`,
        season,
        year,
        location,
        zone: zone || null,
        scheduleItems: JSON.stringify(scheduleItems),
        userId: req.user!.id
      });
      
      res.json({ success: true, schedule });
    } catch (error) {
      console.error('Error generating planting schedule:', error);
      res.status(500).json({ success: false, message: 'Failed to generate planting schedule' });
    }
  });
}

// Helper functions for schedule generation
function calculateSowDate(season: string, year: number, plantName: string): string {
  const seasonStartDates: { [key: string]: { month: number, day: number } } = {
    spring: { month: 2, day: 15 },  // Mid-March
    summer: { month: 5, day: 1 },   // June 1
    fall: { month: 7, day: 15 },    // Mid-August
    winter: { month: 10, day: 1 }   // November 1
  };
  
  const start = seasonStartDates[season.toLowerCase()] || { month: 2, day: 15 };
  return new Date(year, start.month, start.day).toISOString().split('T')[0];
}

function calculateTransplantDate(sowDate: string, plantName: string): string {
  const sow = new Date(sowDate);
  // Add 4-6 weeks for transplanting (average 5 weeks)
  const transplant = new Date(sow.getTime() + (35 * 24 * 60 * 60 * 1000));
  return transplant.toISOString().split('T')[0];
}

function calculateHarvestDate(transplantDate: string, plantName: string): string {
  const transplant = new Date(transplantDate);
  // Default to 60-90 days after transplant (average 75 days)
  const harvest = new Date(transplant.getTime() + (75 * 24 * 60 * 60 * 1000));
  return harvest.toISOString().split('T')[0];
}
