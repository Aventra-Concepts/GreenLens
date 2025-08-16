import { storage } from "../storage";

interface PerenualPlant {
  id: number;
  common_name: string;
  scientific_name: string[];
  family: string;
  care_level: string;
  growth_rate: string;
  watering: string;
  sunlight: string[];
  type: string;
  cycle: string;
  hardiness: {
    min: string;
    max: string;
  };
}

interface TreflePlant {
  id: number;
  common_name: string;
  scientific_name: string;
  family_common_name: string;
  genus: string;
  observations: string;
}

export class PlantsCatalogService {
  private perenualApiKey: string;
  private trefleApiKey: string;

  constructor() {
    this.perenualApiKey = process.env.PERENUAL_API_KEY || '';
    this.trefleApiKey = process.env.TREFLE_API_KEY || '';
  }

  async getPlantInfo(scientificName: string) {
    const cacheKey = `plant_catalog_${scientificName.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Check cache first
    const cached = await storage.getCacheItem(cacheKey);
    if (cached) {
      return cached.json;
    }

    let plantInfo = null;

    try {
      // Try Perenual first (primary source)
      plantInfo = await this.getFromPerenual(scientificName);
    } catch (error) {
      console.error('Perenual API error:', error);
      
      try {
        // Fallback to Trefle
        plantInfo = await this.getFromTrefle(scientificName);
      } catch (fallbackError) {
        console.error('Trefle API error:', fallbackError);
        // Return basic info if both APIs fail
        plantInfo = {
          source: 'basic',
          commonName: scientificName,
          scientificName,
          family: 'Unknown',
          careLevel: 'Unknown',
          watering: 'Unknown',
          sunlight: 'Unknown',
          error: 'External plant databases unavailable',
        };
      }
    }

    // Cache for 24 hours
    if (plantInfo) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      await storage.setCacheItem({
        key: cacheKey,
        json: plantInfo,
        expiresAt,
      });
    }

    return plantInfo;
  }

  private async getFromPerenual(scientificName: string) {
    if (!this.perenualApiKey) {
      throw new Error('PERENUAL_API_KEY not configured');
    }

    const searchUrl = `https://perenual.com/api/species-list?key=${this.perenualApiKey}&q=${encodeURIComponent(scientificName)}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Perenual API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No plant found in Perenual database');
    }

    const plant: PerenualPlant = data.data[0];
    
    return {
      source: 'perenual',
      id: plant.id,
      commonName: plant.common_name,
      scientificName: plant.scientific_name[0] || scientificName,
      family: plant.family,
      careLevel: plant.care_level,
      growthRate: plant.growth_rate,
      watering: plant.watering,
      sunlight: plant.sunlight,
      type: plant.type,
      cycle: plant.cycle,
      hardiness: plant.hardiness,
    };
  }

  private async getFromTrefle(scientificName: string) {
    if (!this.trefleApiKey) {
      throw new Error('TREFLE_API_KEY not configured');
    }

    const searchUrl = `https://trefle.io/api/v1/plants/search?token=${this.trefleApiKey}&q=${encodeURIComponent(scientificName)}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Trefle API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No plant found in Trefle database');
    }

    const plant: TreflePlant = data.data[0];
    
    return {
      source: 'trefle',
      id: plant.id,
      commonName: plant.common_name,
      scientificName: plant.scientific_name,
      family: plant.family_common_name,
      genus: plant.genus,
      observations: plant.observations,
      careLevel: 'Unknown', // Trefle doesn't provide care level
      watering: 'Unknown',
      sunlight: 'Unknown',
    };
  }
}

export const plantsCatalogService = new PlantsCatalogService();
