import type { Express } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import { z } from "zod";
import { insertMicroclimateLogSchema } from "@shared/schema";

export function registerEnvironmentAutomationRoutes(app: Express) {
  
  // Get weather data for a location
  app.get("/api/environment/weather", requireAuth, async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      // Fetch weather data from Open-Meteo API (no API key required)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7`;
      
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      const weatherData = await weatherResponse.json();
      
      res.json({
        current: {
          temperature: weatherData.current?.temperature_2m || null,
          humidity: weatherData.current?.relative_humidity_2m || null,
          windSpeed: weatherData.current?.wind_speed_10m || null,
          precipitation: weatherData.current?.precipitation || null,
        },
        daily: weatherData.daily || [],
        hourly: weatherData.hourly || [],
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Get weather alerts (NWS for USA)
  app.get("/api/environment/weather-alerts", requireAuth, async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      // Fetch weather alerts from National Weather Service (USA only)
      try {
        const pointResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
        
        if (!pointResponse.ok) {
          return res.json({ alerts: [] });
        }
        
        const pointData = await pointResponse.json();
        const forecastZone = pointData.properties?.forecastZone;
        
        if (!forecastZone) {
          return res.json({ alerts: [] });
        }
        
        const alertsUrl = `https://api.weather.gov/alerts/active/zone/${forecastZone.split('/').pop()}`;
        const alertsResponse = await fetch(alertsUrl);
        
        if (!alertsResponse.ok) {
          return res.json({ alerts: [] });
        }
        
        const alertsData = await alertsResponse.json();
        
        res.json({
          alerts: alertsData.features?.map((alert: any) => ({
            event: alert.properties?.event || "Weather Alert",
            headline: alert.properties?.headline || "",
            description: alert.properties?.description || "",
            severity: alert.properties?.severity || "Unknown",
            urgency: alert.properties?.urgency || "Unknown",
            onset: alert.properties?.onset || null,
            expires: alert.properties?.expires || null,
          })) || []
        });
      } catch (error) {
        res.json({ alerts: [] });
      }
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      res.status(500).json({ error: "Failed to fetch weather alerts" });
    }
  });

  // Get microclimate logs for user
  app.get("/api/environment/microclimate-logs", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const logs = await storage.getMicroclimateLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching microclimate logs:", error);
      res.status(500).json({ error: "Failed to fetch microclimate logs" });
    }
  });

  // Create microclimate log
  app.post("/api/environment/microclimate-logs", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertMicroclimateLogSchema.parse(req.body);
      
      const newLog = await storage.createMicroclimateLog({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error creating microclimate log:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create microclimate log" });
    }
  });

  // Calculate irrigation needs
  app.post("/api/environment/calculate-irrigation", requireAuth, async (req, res) => {
    try {
      const { avgTemp, rainfall, plantType, soilType } = req.body;
      
      if (!avgTemp || !rainfall || !plantType || !soilType) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Simple ET-based calculation
      // Base ET formula (simplified Hargreaves): ET = 0.0023 * (Tavg + 17.8) * TD^0.5
      // Where TD = Tmax - Tmin (we'll use a simplified version)
      
      const baseET = 0.0023 * (parseFloat(avgTemp) + 17.8) * Math.sqrt(15); // Simplified
      
      // Plant coefficient (Kc) - varies by plant type
      const plantCoefficients: Record<string, number> = {
        vegetables: 1.0,
        flowers: 0.8,
        trees: 0.6,
        lawn: 1.2,
      };
      
      const kc = plantCoefficients[plantType] || 0.8;
      
      // Soil water holding capacity
      const soilFactors: Record<string, number> = {
        clay: 0.8,    // Holds water well, needs less frequent watering
        loam: 1.0,    // Ideal
        sandy: 1.3,   // Drains fast, needs more frequent watering
      };
      
      const soilFactor = soilFactors[soilType] || 1.0;
      
      // Calculate water needs (inches/week)
      const cropET = baseET * kc * 7; // Weekly ET
      const effectiveRainfall = parseFloat(rainfall);
      const waterNeed = Math.max(0, (cropET - effectiveRainfall) * soilFactor);
      
      // Calculate frequency and duration
      const frequency = waterNeed > 1.5 ? 3 : waterNeed > 0.8 ? 2 : 1;
      const durationPerSession = Math.round((waterNeed / frequency) * 30); // Approximate minutes
      
      res.json({
        waterAmountPerWeek: waterNeed.toFixed(2),
        frequency,
        durationPerSession,
        recommendation: waterNeed < 0.5 
          ? "Minimal watering needed due to recent rainfall" 
          : waterNeed < 1.0 
          ? "Light watering recommended" 
          : "Regular watering schedule recommended",
      });
    } catch (error) {
      console.error("Error calculating irrigation:", error);
      res.status(500).json({ error: "Failed to calculate irrigation needs" });
    }
  });

  // Get current moon phase
  app.get("/api/environment/moon-phase", requireAuth, async (req, res) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // Simple moon phase calculation (Simplified algorithm)
      const jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
                 Math.floor(275 * month / 9) + day + 1721013.5;
      const daysSinceNew = (jd - 2451549.5) / 29.53;
      const phase = daysSinceNew - Math.floor(daysSinceNew);
      
      let phaseName = "";
      let phaseEmoji = "";
      let plantingAdvice = "";
      
      if (phase < 0.125) {
        phaseName = "New Moon";
        phaseEmoji = "🌑";
        plantingAdvice = "Best time to plant leafy annuals (lettuce, spinach, celery)";
      } else if (phase < 0.25) {
        phaseName = "Waxing Crescent";
        phaseEmoji = "🌒";
        plantingAdvice = "Good for planting above-ground crops with external seeds";
      } else if (phase < 0.375) {
        phaseName = "First Quarter";
        phaseEmoji = "🌓";
        plantingAdvice = "Plant fruiting annuals (tomatoes, peppers, beans)";
      } else if (phase < 0.5) {
        phaseName = "Waxing Gibbous";
        phaseEmoji = "🌔";
        plantingAdvice = "Continue planting fruiting and flowering plants";
      } else if (phase < 0.625) {
        phaseName = "Full Moon";
        phaseEmoji = "🌕";
        plantingAdvice = "Best for planting root crops and perennials (carrots, potatoes)";
      } else if (phase < 0.75) {
        phaseName = "Waning Gibbous";
        phaseEmoji = "🌖";
        plantingAdvice = "Good for planting bulbs and transplanting";
      } else if (phase < 0.875) {
        phaseName = "Last Quarter";
        phaseEmoji = "🌗";
        plantingAdvice = "Avoid planting; focus on pruning, weeding, and maintenance";
      } else {
        phaseName = "Waning Crescent";
        phaseEmoji = "🌘";
        plantingAdvice = "Rest period; prepare soil and plan next plantings";
      }
      
      res.json({
        phaseName,
        phaseEmoji,
        phasePercentage: (phase * 100).toFixed(1),
        plantingAdvice,
        date: now.toISOString(),
      });
    } catch (error) {
      console.error("Error calculating moon phase:", error);
      res.status(500).json({ error: "Failed to calculate moon phase" });
    }
  });

  // Geocode location (city/ZIP to lat/lon)
  app.get("/api/environment/geocode", requireAuth, async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      // Use Open-Meteo's geocoding API (free, no key required)
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location as string)}&count=1&language=en&format=json`;
      
      const response = await fetch(geocodeUrl);
      
      if (!response.ok) {
        throw new Error("Failed to geocode location");
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      const result = data.results[0];
      
      res.json({
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country,
        admin1: result.admin1, // State/Province
      });
    } catch (error) {
      console.error("Error geocoding location:", error);
      res.status(500).json({ error: "Failed to geocode location" });
    }
  });
}
