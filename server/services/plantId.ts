interface PlantIdResponse {
  id: number;
  suggestions: Array<{
    id: number;
    plant_name: string;
    plant_details: {
      common_names: string[];
      structured_name: {
        genus: string;
        species: string;
      };
    };
    probability: number;
  }>;
}

interface HealthAssessmentResponse {
  id: number;
  suggestions: Array<{
    id: number;
    name: string;
    probability: number;
    description: string;
    treatment: {
      chemical: string[];
      biological: string[];
      prevention: string[];
    };
  }>;
}

export class PlantIdService {
  private apiKey: string;
  private baseUrl = 'https://api.plant.id/v3';

  constructor() {
    this.apiKey = process.env.PLANTID_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('PLANTID_API_KEY environment variable is required');
    }
  }

  async identifyPlant(images: Array<{ data: string; mimeType: string }>) {
    try {
      const response = await fetch(`${this.baseUrl}/identification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          images: images.map(img => `data:${img.mimeType};base64,${img.data}`),
          modifiers: ['crops_fast', 'similar_images'],
          plant_details: ['common_names', 'structured_name'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Plant.id API error: ${response.status}`);
      }

      const data: PlantIdResponse = await response.json();
      
      if (!data.suggestions || data.suggestions.length === 0) {
        throw new Error('No plant identification results');
      }

      const bestMatch = data.suggestions[0];
      
      return {
        species: {
          commonName: bestMatch.plant_details.common_names[0] || bestMatch.plant_name,
          scientificName: `${bestMatch.plant_details.structured_name.genus} ${bestMatch.plant_details.structured_name.species}`,
          genus: bestMatch.plant_details.structured_name.genus,
          species: bestMatch.plant_details.structured_name.species,
        },
        confidence: bestMatch.probability,
        alternatives: data.suggestions.slice(1, 5).map(suggestion => ({
          commonName: suggestion.plant_details.common_names[0] || suggestion.plant_name,
          scientificName: `${suggestion.plant_details.structured_name.genus} ${suggestion.plant_details.structured_name.species}`,
          confidence: suggestion.probability,
        })),
      };

    } catch (error) {
      console.error('Plant identification error:', error);
      throw new Error('Failed to identify plant');
    }
  }

  async assessPlantHealth(images: Array<{ data: string; mimeType: string }>) {
    try {
      const response = await fetch(`${this.baseUrl}/health_assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          images: images.map(img => `data:${img.mimeType};base64,${img.data}`),
          modifiers: ['crops_fast', 'similar_images'],
          disease_details: ['description', 'treatment'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Plant.id health API error: ${response.status}`);
      }

      const data: HealthAssessmentResponse = await response.json();
      
      return {
        isHealthy: !data.suggestions || data.suggestions.length === 0,
        diseases: data.suggestions?.map(disease => ({
          name: disease.name,
          probability: disease.probability,
          description: disease.description,
          treatment: disease.treatment,
        })) || [],
      };

    } catch (error) {
      console.error('Plant health assessment error:', error);
      throw new Error('Failed to assess plant health');
    }
  }
}

export const plantIdService = new PlantIdService();
