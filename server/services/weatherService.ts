import { db } from '../db';
import { weatherData, type InsertWeatherData } from '@shared/schema';
import { eq, and, gte } from 'drizzle-orm';

export class WeatherService {
  // Note: In production, you'd integrate with a real weather API like OpenWeatherMap
  // For demo purposes, we'll simulate weather data
  
  async getCurrentWeather(location: string) {
    try {
      // Check if we have recent weather data (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [existingWeather] = await db
        .select()
        .from(weatherData)
        .where(
          and(
            eq(weatherData.location, location),
            eq(weatherData.isActual, true),
            gte(weatherData.createdAt, oneHourAgo)
          )
        )
        .limit(1);

      if (existingWeather) {
        return existingWeather;
      }

      // Simulate fetching from weather API
      const mockWeatherData = this.generateMockWeather(location);
      
      const [newWeather] = await db
        .insert(weatherData)
        .values(mockWeatherData)
        .returning();

      return newWeather;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getWeatherForecast(location: string, days: number = 7) {
    try {
      const today = new Date();
      const forecasts = [];

      for (let i = 1; i <= days; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        
        const mockForecast = {
          ...this.generateMockWeather(location),
          forecastDate: forecastDate.toISOString().split('T')[0],
          isActual: false,
        };

        forecasts.push(mockForecast);
      }

      const insertedForecasts = await db
        .insert(weatherData)
        .values(forecasts)
        .returning();

      return insertedForecasts;
    } catch (error) {
      console.error('Error generating weather forecast:', error);
      throw error;
    }
  }

  private generateMockWeather(location: string): InsertWeatherData {
    // Generate realistic weather data based on location
    const baseTemp = location.toLowerCase().includes('tropical') ? 28 : 22;
    const variation = Math.random() * 10 - 5; // ±5 degrees
    
    const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'overcast'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      location,
      temperature: (baseTemp + variation).toFixed(1),
      humidity: (60 + Math.random() * 30).toFixed(1), // 60-90%
      uvIndex: (Math.random() * 11).toFixed(1), // 0-11
      precipitation: condition === 'rainy' ? (Math.random() * 10).toFixed(1) : '0',
      windSpeed: (5 + Math.random() * 15).toFixed(1), // 5-20 km/h
      condition,
      forecastDate: new Date().toISOString().split('T')[0],
      isActual: true,
    };
  }

  async getWeatherImpactForPlant(plantSpecies: string, weather: any) {
    // Analyze how weather conditions affect specific plant species
    const impacts = [];
    
    if (parseFloat(weather.temperature) > 30) {
      impacts.push({
        type: 'heat_stress',
        severity: 'medium',
        recommendation: 'Provide shade and increase watering frequency'
      });
    }
    
    if (parseFloat(weather.temperature) < 10) {
      impacts.push({
        type: 'cold_stress',
        severity: 'high',
        recommendation: 'Move indoors or provide frost protection'
      });
    }
    
    if (parseFloat(weather.humidity) > 80) {
      impacts.push({
        type: 'high_humidity',
        severity: 'low',
        recommendation: 'Ensure good air circulation to prevent fungal issues'
      });
    }
    
    if (parseFloat(weather.precipitation) > 5) {
      impacts.push({
        type: 'heavy_rain',
        severity: 'medium',
        recommendation: 'Ensure proper drainage to prevent root rot'
      });
    }

    return impacts;
  }
}

export const weatherService = new WeatherService();