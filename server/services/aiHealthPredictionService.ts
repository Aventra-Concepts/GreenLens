import { db } from '../db';
import { 
  plantHealthPredictions, 
  gardenPlants, 
  plantMeasurements, 
  careActivities,
  type InsertPlantHealthPrediction,
  type PlantHealthPrediction 
} from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { weatherService } from './weatherService';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIHealthPredictionService {
  async generateHealthPrediction(plantId: string, userId: string): Promise<PlantHealthPrediction> {
    try {
      // Get plant information
      const [plant] = await db
        .select()
        .from(gardenPlants)
        .where(and(
          eq(gardenPlants.id, plantId),
          eq(gardenPlants.userId, userId)
        ))
        .limit(1);

      if (!plant) {
        throw new Error('Plant not found');
      }

      // Get recent measurements (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentMeasurements = await db
        .select()
        .from(plantMeasurements)
        .where(and(
          eq(plantMeasurements.plantId, plantId),
          gte(plantMeasurements.measurementDate, thirtyDaysAgo)
        ))
        .orderBy(desc(plantMeasurements.measurementDate))
        .limit(10);

      // Get recent care activities
      const recentCareActivities = await db
        .select()
        .from(careActivities)
        .where(and(
          eq(careActivities.plantId, plantId),
          gte(careActivities.scheduledDate, thirtyDaysAgo)
        ))
        .orderBy(desc(careActivities.scheduledDate))
        .limit(20);

      // Get weather data for the plant's location
      const weather = await weatherService.getCurrentWeather(plant.location || 'general');
      const weatherForecast = await weatherService.getWeatherForecast(plant.location || 'general', 7);

      // Analyze data with AI
      const prediction = await this.analyzeWithAI(plant, recentMeasurements, recentCareActivities, weather, weatherForecast);

      // Save prediction to database
      const [savedPrediction] = await db
        .insert(plantHealthPredictions)
        .values({
          plantId,
          userId,
          predictionDate: new Date().toISOString().split('T')[0],
          healthScore: prediction.healthScore,
          riskFactors: prediction.riskFactors,
          recommendations: prediction.recommendations,
          weatherImpact: prediction.weatherImpact,
          confidenceLevel: prediction.confidenceLevel,
        })
        .returning();

      return savedPrediction;
    } catch (error) {
      console.error('Error generating health prediction:', error);
      throw error;
    }
  }

  private async analyzeWithAI(plant: any, measurements: any[], careActivities: any[], weather: any, forecast: any[]) {
    try {
      const prompt = `
        Analyze the health of a ${plant.species || plant.name} plant and provide predictions.
        
        Plant Details:
        - Name: ${plant.name}
        - Species: ${plant.species || 'Unknown'}
        - Location: ${plant.location}
        - Current Status: ${plant.status}
        - Date Added: ${plant.dateAdded}
        
        Recent Measurements (last 30 days):
        ${measurements.map(m => `
          - Date: ${m.measurementDate}
          - Height: ${m.height}cm
          - Health Score: ${m.healthScore}/100
          - Leaf Count: ${m.leafCount}
          - Notes: ${m.notes}
        `).join('')}
        
        Recent Care Activities:
        ${careActivities.map(a => `
          - ${a.activityType} on ${a.scheduledDate}
          - Completed: ${a.isCompleted}
          - Notes: ${a.notes}
        `).join('')}
        
        Current Weather:
        - Temperature: ${weather.temperature}°C
        - Humidity: ${weather.humidity}%
        - UV Index: ${weather.uvIndex}
        - Condition: ${weather.condition}
        
        7-Day Forecast:
        ${forecast.map(f => `
          - ${f.forecastDate}: ${f.temperature}°C, ${f.condition}, ${f.humidity}% humidity
        `).join('')}
        
        Please provide a comprehensive health analysis and return ONLY a valid JSON object with this exact structure:
        {
          "healthScore": number (1-100),
          "confidenceLevel": number (0-100),
          "riskFactors": [
            {
              "type": "string",
              "severity": "low|medium|high",
              "description": "string",
              "likelihood": number (0-100)
            }
          ],
          "recommendations": [
            {
              "category": "watering|fertilizing|environment|care|monitoring",
              "action": "string",
              "priority": "low|medium|high",
              "timeframe": "immediate|daily|weekly|monthly"
            }
          ],
          "weatherImpact": {
            "nextWeekOutlook": "positive|neutral|negative",
            "specificConcerns": ["string"],
            "adaptations": ["string"]
          }
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert plant health analyst. Analyze plant data and provide predictions in JSON format only. Be specific and actionable in your recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        healthScore: Math.max(1, Math.min(100, analysis.healthScore || 70)),
        confidenceLevel: (analysis.confidenceLevel || 75).toFixed(1),
        riskFactors: analysis.riskFactors || [],
        recommendations: analysis.recommendations || [],
        weatherImpact: analysis.weatherImpact || { nextWeekOutlook: 'neutral', specificConcerns: [], adaptations: [] }
      };

    } catch (error) {
      console.error('Error in AI analysis:', error);
      // Fallback analysis if AI fails
      return {
        healthScore: 75,
        confidenceLevel: '60.0',
        riskFactors: [{
          type: 'analysis_unavailable',
          severity: 'low',
          description: 'AI analysis temporarily unavailable, showing estimated health',
          likelihood: 50
        }],
        recommendations: [{
          category: 'monitoring',
          action: 'Continue regular care routine and monitor plant closely',
          priority: 'medium',
          timeframe: 'daily'
        }],
        weatherImpact: {
          nextWeekOutlook: 'neutral',
          specificConcerns: ['Monitor weather conditions'],
          adaptations: ['Adjust watering based on weather']
        }
      };
    }
  }

  async getPlantPredictions(plantId: string, userId: string, limit: number = 10): Promise<PlantHealthPrediction[]> {
    try {
      const predictions = await db
        .select()
        .from(plantHealthPredictions)
        .where(and(
          eq(plantHealthPredictions.plantId, plantId),
          eq(plantHealthPredictions.userId, userId)
        ))
        .orderBy(desc(plantHealthPredictions.createdAt))
        .limit(limit);

      return predictions;
    } catch (error) {
      console.error('Error getting plant predictions:', error);
      throw error;
    }
  }

  async updatePredictionAccuracy(predictionId: string, actualOutcome: number): Promise<void> {
    try {
      await db
        .update(plantHealthPredictions)
        .set({ actualOutcome })
        .where(eq(plantHealthPredictions.id, predictionId));
    } catch (error) {
      console.error('Error updating prediction accuracy:', error);
      throw error;
    }
  }

  async generateBatchPredictions(userId: string): Promise<PlantHealthPrediction[]> {
    try {
      // Get all active plants for user
      const userPlants = await db
        .select()
        .from(gardenPlants)
        .where(and(
          eq(gardenPlants.userId, userId),
          eq(gardenPlants.isActive, true)
        ));

      const predictions: PlantHealthPrediction[] = [];

      for (const plant of userPlants) {
        try {
          const prediction = await this.generateHealthPrediction(plant.id, userId);
          predictions.push(prediction);
        } catch (error) {
          console.error(`Error generating prediction for plant ${plant.id}:`, error);
        }
      }

      return predictions;
    } catch (error) {
      console.error('Error generating batch predictions:', error);
      throw error;
    }
  }
}

export const aiHealthPredictionService = new AIHealthPredictionService();