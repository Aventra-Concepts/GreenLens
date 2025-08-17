import { geminiService } from "./gemini";

interface PlantSpecies {
  scientific: string;
  common: string;
  confidence: number;
}

interface HealthAssessment {
  isHealthy: boolean;
  diseases?: Array<{
    name: string;
    confidence: number;
    description: string;
  }>;
  issues?: string[];
}

interface PlantAnalysisResult {
  species: PlantSpecies;
  healthAssessment: HealthAssessment;
  careInstructions: string;
  recommendations: string[];
}

export class PlantAnalysisService {
  async analyzeImages(imageBase64Array: string[]): Promise<PlantAnalysisResult> {
    try {
      // First, analyze the plant for species identification
      const speciesAnalysis = await this.identifySpecies(imageBase64Array);
      
      // Then, assess plant health
      const healthAnalysis = await this.assessHealth(imageBase64Array, speciesAnalysis.scientific);
      
      // Generate care instructions
      const careInstructions = await this.generateCareInstructions(speciesAnalysis, healthAnalysis);
      
      return {
        species: speciesAnalysis,
        healthAssessment: healthAnalysis,
        careInstructions: careInstructions.instructions,
        recommendations: careInstructions.recommendations,
      };
    } catch (error) {
      console.error("Plant analysis error:", error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async identifySpecies(imageBase64Array: string[]): Promise<PlantSpecies> {
    const prompt = `
      You are a professional botanist and plant identification expert. 
      Analyze the provided plant images and identify the species with high accuracy.
      
      Please respond with a JSON object containing:
      {
        "scientific": "Scientific name (genus species)",
        "common": "Most common name in English",
        "confidence": 0.95 // Your confidence level (0-1)
      }
      
      Focus on distinctive features like leaf shape, flower structure, growth pattern, and overall morphology.
      Be conservative with confidence levels - only use high confidence (>0.9) when you're very certain.
    `;

    const analysisResult = await geminiService.analyzeWithImages(
      prompt,
      imageBase64Array,
      { type: "json_object" }
    );

    let speciesData;
    try {
      speciesData = JSON.parse(analysisResult);
    } catch (e) {
      console.error("Raw Gemini response:", analysisResult);
      console.error("Parse error:", e);
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          speciesData = JSON.parse(jsonMatch[0]);
          console.log("Successfully extracted JSON from response");
        } catch (extractError) {
          throw new Error(`Failed to extract valid JSON from response: ${analysisResult.substring(0, 200)}...`);
        }
      } else {
        // Fallback to a basic response if no JSON found
        console.warn("No JSON found in Gemini response, using fallback");
        speciesData = {
          scientific: "Unknown species",
          common: "Unidentified plant",
          confidence: 0.5
        };
      }
    }

    return {
      scientific: speciesData.scientific || "Unknown species",
      common: speciesData.common || "Unidentified plant",
      confidence: Math.min(Math.max(speciesData.confidence || 0.5, 0), 1),
    };
  }

  private async assessHealth(imageBase64Array: string[], species: string): Promise<HealthAssessment> {
    const prompt = `
      You are a plant pathologist analyzing the health of a ${species}.
      Examine the provided images for signs of disease, pest damage, nutrient deficiencies, or other health issues.
      
      Please respond with a JSON object containing:
      {
        "isHealthy": true/false,
        "diseases": [
          {
            "name": "Disease/issue name",
            "confidence": 0.85,
            "description": "Detailed description of the issue"
          }
        ],
        "issues": ["List of specific problems observed"]
      }
      
      Look for:
      - Leaf discoloration (yellowing, browning, spots)
      - Wilting or drooping
      - Pest damage (holes, chewed edges)
      - Fungal infections (powdery mildew, black spot)
      - Root problems (if visible)
      - Overall plant vigor
    `;

    const healthResult = await geminiService.analyzeWithImages(
      prompt,
      imageBase64Array,
      { type: "json_object" }
    );

    let healthData;
    try {
      healthData = JSON.parse(healthResult);
    } catch (e) {
      console.error("Raw health analysis response:", healthResult);
      console.error("Health parse error:", e);
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = healthResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          healthData = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          // Fallback to healthy status if parsing fails
          healthData = {
            isHealthy: true,
            diseases: [],
            issues: []
          };
        }
      } else {
        // Fallback to healthy status
        healthData = {
          isHealthy: true,
          diseases: [],
          issues: []
        };
      }
    }

    return {
      isHealthy: healthData.isHealthy || false,
      diseases: healthData.diseases || [],
      issues: healthData.issues || [],
    };
  }

  private async generateCareInstructions(
    species: PlantSpecies, 
    health: HealthAssessment
  ): Promise<{ instructions: string; recommendations: string[] }> {
    const healthContext = health.isHealthy 
      ? "The plant appears healthy" 
      : `Health issues detected: ${health.issues?.join(', ') || 'Various concerns'}`;

    const prompt = `
      As a professional horticulturist, provide comprehensive care instructions for ${species.scientific} (${species.common}).
      
      Current plant status: ${healthContext}
      
      Please provide:
      1. Detailed care instructions covering:
         - Light requirements
         - Watering schedule and method
         - Soil preferences
         - Temperature and humidity needs
         - Fertilization schedule
         - Pruning guidance
         - Common problems and prevention
      
      2. Specific recommendations based on current plant condition
      
      Respond with a JSON object:
      {
        "instructions": "Comprehensive care guide (detailed paragraph format)",
        "recommendations": ["Specific actionable recommendations"]
      }
      
      Focus on practical, actionable advice that a home gardener can follow.
    `;

    const careResult = await geminiService.analyzeText(prompt, { type: "json_object" });

    let careData;
    try {
      careData = JSON.parse(careResult);
    } catch (e) {
      console.error("Raw care instructions response:", careResult);
      console.error("Care parse error:", e);
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = careResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          careData = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          // Fallback to basic care instructions
          careData = {
            instructions: "General plant care: provide adequate light, water when soil is dry, ensure good drainage, and maintain consistent temperature.",
            recommendations: ["Monitor plant regularly", "Ensure proper drainage", "Provide adequate sunlight"]
          };
        }
      } else {
        // Fallback to basic care instructions
        careData = {
          instructions: "General plant care: provide adequate light, water when soil is dry, ensure good drainage, and maintain consistent temperature.",
          recommendations: ["Monitor plant regularly", "Ensure proper drainage", "Provide adequate sunlight"]
        };
      }
    }

    return {
      instructions: careData.instructions || "General plant care recommendations unavailable.",
      recommendations: careData.recommendations || ["Monitor plant regularly", "Ensure proper drainage"],
    };
  }
}