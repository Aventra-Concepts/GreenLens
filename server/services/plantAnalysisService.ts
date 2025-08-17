import { geminiService } from "./gemini";

interface PlantSpecies {
  scientific: string;
  common: string;
  family: string;
  genus: string;
  confidence: number;
  alternativeNames: string[];
  nativeRegion: string;
  plantType: string; // herb, shrub, tree, vine, etc.
}

interface HealthAssessment {
  overallHealth: string; // excellent, good, fair, poor, critical
  healthScore: number; // 0-100
  isHealthy: boolean;
  diseases?: Array<{
    name: string;
    confidence: number;
    description: string;
    severity: string; // mild, moderate, severe
    treatment: string;
    prevention: string;
  }>;
  pests?: Array<{
    name: string;
    description: string;
    treatment: string;
  }>;
  nutritionalDeficiencies?: Array<{
    nutrient: string;
    symptoms: string;
    treatment: string;
  }>;
  environmentalStress?: Array<{
    type: string;
    description: string;
    solution: string;
  }>;
  issues?: string[];
}

interface DetailedCareInstructions {
  watering: {
    frequency: string;
    amount: string;
    method: string;
    seasonalAdjustments: string;
    signs: {
      overwatering: string[];
      underwatering: string[];
    };
  };
  lighting: {
    requirement: string;
    intensity: string;
    duration: string;
    positioning: string;
    seasonalNeeds: string;
  };
  temperature: {
    optimal: string;
    minimum: string;
    maximum: string;
    seasonalVariations: string;
  };
  humidity: {
    level: string;
    methods: string[];
  };
  soil: {
    type: string;
    pH: string;
    drainage: string;
    amendments: string[];
  };
  fertilizing: {
    type: string;
    frequency: string;
    seasonalSchedule: string;
    npkRatio: string;
  };
  pruning: {
    timing: string;
    method: string;
    frequency: string;
    purpose: string[];
  };
  repotting: {
    frequency: string;
    timing: string;
    containerSize: string;
    signs: string[];
  };
}

interface PropagationGuide {
  methods: Array<{
    type: string;
    difficulty: string;
    timing: string;
    instructions: string;
    successRate: string;
  }>;
}

interface GrowthCharacteristics {
  matureSize: {
    height: string;
    width: string;
  };
  growthRate: string;
  lifespan: string;
  bloomingPeriod?: string;
  fruitingPeriod?: string;
  dormancyPeriod?: string;
}

interface PlantAnalysisResult {
  species: PlantSpecies;
  healthAssessment: HealthAssessment;
  careInstructions: DetailedCareInstructions;
  propagation: PropagationGuide;
  growthCharacteristics: GrowthCharacteristics;
  seasonalCalendar: Array<{
    season: string;
    tasks: string[];
    expectations: string[];
  }>;
  recommendations: Array<{
    category: string;
    priority: string;
    action: string;
    reason: string;
  }>;
  toxicity?: {
    level: string;
    affectedParties: string[];
    symptoms: string[];
    firstAid: string;
  };
  companionPlants?: string[];
  commonProblems: Array<{
    problem: string;
    causes: string[];
    solutions: string[];
  }>;
}

export class PlantAnalysisService {
  async analyzeImages(imageBase64Array: string[]): Promise<PlantAnalysisResult> {
    try {
      // First, analyze the plant for species identification
      const speciesAnalysis = await this.identifySpecies(imageBase64Array);
      
      // Then, assess plant health
      const healthAnalysis = await this.assessHealth(imageBase64Array, speciesAnalysis.scientific);
      
      // Generate detailed care instructions
      const careInstructions = await this.generateDetailedCareInstructions(speciesAnalysis, healthAnalysis);
      
      // Generate propagation guide
      const propagationGuide = await this.generatePropagationGuide(speciesAnalysis);
      
      // Generate growth characteristics
      const growthCharacteristics = await this.generateGrowthCharacteristics(speciesAnalysis);
      
      // Generate seasonal calendar
      const seasonalCalendar = await this.generateSeasonalCalendar(speciesAnalysis);
      
      // Generate recommendations
      const recommendations = await this.generateDetailedRecommendations(speciesAnalysis, healthAnalysis);
      
      // Check toxicity information
      const toxicity = await this.analyzeToxicity(speciesAnalysis);
      
      // Get companion plants
      const companionPlants = await this.getCompanionPlants(speciesAnalysis);
      
      // Common problems
      const commonProblems = await this.getCommonProblems(speciesAnalysis);
      
      return {
        species: speciesAnalysis,
        healthAssessment: healthAnalysis,
        careInstructions,
        propagation: propagationGuide,
        growthCharacteristics,
        seasonalCalendar,
        recommendations,
        toxicity,
        companionPlants,
        commonProblems,
      };
    } catch (error) {
      console.error("Plant analysis error:", error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async identifySpecies(imageBase64Array: string[]): Promise<PlantSpecies> {
    const prompt = `
      You are a professional botanist and plant identification expert. 
      Analyze the provided plant images and identify the species with comprehensive details.
      
      Please respond with a JSON object containing:
      {
        "scientific": "Scientific name (genus species)",
        "common": "Most common name in English",
        "family": "Plant family name",
        "genus": "Genus name",
        "confidence": 0.95,
        "alternativeNames": ["Common name 2", "Common name 3"],
        "nativeRegion": "Geographic origin/native habitat",
        "plantType": "tree/shrub/herb/vine/grass/fern/etc"
      }
      
      Focus on distinctive features like leaf shape, flower structure, growth pattern, and overall morphology.
      Include alternative common names and detailed taxonomic information.
      Be conservative with confidence levels - only use high confidence (>0.9) when very certain.
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
      family: speciesData.family || "Unknown family",
      genus: speciesData.genus || "Unknown genus",
      confidence: Math.min(Math.max(speciesData.confidence || 0.5, 0), 1),
      alternativeNames: speciesData.alternativeNames || [],
      nativeRegion: speciesData.nativeRegion || "Unknown region",
      plantType: speciesData.plantType || "Unknown type",
    };
  }

  private async assessHealth(imageBase64Array: string[], species: string): Promise<HealthAssessment> {
    const prompt = `
      You are a plant pathologist analyzing the health of a ${species}.
      Examine the provided images comprehensively for health assessment.
      
      Please respond with a JSON object containing:
      {
        "overallHealth": "excellent/good/fair/poor/critical",
        "healthScore": 85,
        "isHealthy": true/false,
        "diseases": [
          {
            "name": "Disease name",
            "confidence": 0.85,
            "description": "Detailed description",
            "severity": "mild/moderate/severe",
            "treatment": "Treatment recommendations",
            "prevention": "Prevention tips"
          }
        ],
        "pests": [
          {
            "name": "Pest name",
            "description": "Signs and symptoms",
            "treatment": "Treatment methods"
          }
        ],
        "nutritionalDeficiencies": [
          {
            "nutrient": "Nitrogen/Phosphorus/etc",
            "symptoms": "Visible symptoms",
            "treatment": "Fertilizer recommendations"
          }
        ],
        "environmentalStress": [
          {
            "type": "Light/Water/Temperature stress",
            "description": "Description of stress",
            "solution": "How to address"
          }
        ],
        "issues": ["List of specific problems observed"]
      }
      
      Analyze thoroughly for all aspects of plant health.
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
      overallHealth: healthData.overallHealth || "good",
      healthScore: healthData.healthScore || 80,
      isHealthy: healthData.isHealthy || false,
      diseases: healthData.diseases || [],
      pests: healthData.pests || [],
      nutritionalDeficiencies: healthData.nutritionalDeficiencies || [],
      environmentalStress: healthData.environmentalStress || [],
      issues: healthData.issues || [],
    };
  }

  private async generateDetailedCareInstructions(
    species: PlantSpecies, 
    health: HealthAssessment
  ): Promise<DetailedCareInstructions> {
    const healthContext = health.isHealthy 
      ? "The plant appears healthy" 
      : `Health issues detected: ${health.issues?.join(', ') || 'Various concerns'}`;

    const prompt = `
      As a professional horticulturist, provide comprehensive detailed care instructions for ${species.scientific} (${species.common}).
      
      Current plant status: ${healthContext}
      
      Respond with a JSON object containing detailed care sections:
      {
        "watering": {
          "frequency": "Every 7-10 days",
          "amount": "Specific amount guidance",
          "method": "How to water properly",
          "seasonalAdjustments": "Seasonal watering changes",
          "signs": {
            "overwatering": ["Sign 1", "Sign 2"],
            "underwatering": ["Sign 1", "Sign 2"]
          }
        },
        "lighting": {
          "requirement": "Bright indirect light",
          "intensity": "Light intensity details",
          "duration": "Hours per day",
          "positioning": "Best placement",
          "seasonalNeeds": "Seasonal light changes"
        },
        "temperature": {
          "optimal": "65-75°F (18-24°C)",
          "minimum": "Minimum temperature",
          "maximum": "Maximum temperature",
          "seasonalVariations": "Temperature changes by season"
        },
        "humidity": {
          "level": "50-60%",
          "methods": ["Method 1", "Method 2"]
        },
        "soil": {
          "type": "Well-draining potting mix",
          "pH": "6.0-7.0",
          "drainage": "Drainage requirements",
          "amendments": ["Amendment 1", "Amendment 2"]
        },
        "fertilizing": {
          "type": "Balanced liquid fertilizer",
          "frequency": "Monthly during growing season",
          "seasonalSchedule": "When and how often",
          "npkRatio": "20-20-20 or specific ratio"
        },
        "pruning": {
          "timing": "Best time to prune",
          "method": "How to prune properly",
          "frequency": "How often",
          "purpose": ["Reason 1", "Reason 2"]
        },
        "repotting": {
          "frequency": "Every 2-3 years",
          "timing": "Best time of year",
          "containerSize": "Size guidance",
          "signs": ["Sign it needs repotting"]
        }
      }
    `;

    const careResult = await geminiService.analyzeText(prompt, { type: "json_object" });

    let careData;
    try {
      careData = JSON.parse(careResult);
    } catch (e) {
      // Provide comprehensive fallback data
      careData = {
        watering: {
          frequency: "Weekly or when top inch of soil is dry",
          amount: "Water thoroughly until drainage occurs",
          method: "Water at soil level, avoid leaves",
          seasonalAdjustments: "Reduce frequency in winter",
          signs: {
            overwatering: ["Yellowing leaves", "Musty soil smell", "Root rot"],
            underwatering: ["Wilting", "Dry crispy leaves", "Soil pulling from pot"]
          }
        },
        lighting: {
          requirement: "Bright, indirect light",
          intensity: "Medium to bright",
          duration: "6-8 hours daily",
          positioning: "Near east or north-facing window",
          seasonalNeeds: "May need grow lights in winter"
        },
        temperature: {
          optimal: "65-75°F (18-24°C)",
          minimum: "60°F (15°C)",
          maximum: "80°F (27°C)",
          seasonalVariations: "Cooler temperatures tolerated in winter"
        },
        humidity: {
          level: "40-60%",
          methods: ["Humidity tray", "Room humidifier", "Grouping plants"]
        },
        soil: {
          type: "Well-draining potting mix",
          pH: "6.0-7.0 (slightly acidic to neutral)",
          drainage: "Must have drainage holes",
          amendments: ["Perlite for drainage", "Organic compost"]
        },
        fertilizing: {
          type: "Balanced liquid fertilizer",
          frequency: "Monthly during spring and summer",
          seasonalSchedule: "Fertilize spring through early fall, none in winter",
          npkRatio: "20-20-20 or 10-10-10"
        },
        pruning: {
          timing: "Spring before new growth",
          method: "Clean cuts with sterilized tools",
          frequency: "As needed for shape and health",
          purpose: ["Remove dead/diseased parts", "Encourage new growth", "Maintain shape"]
        },
        repotting: {
          frequency: "Every 2-3 years or when rootbound",
          timing: "Early spring before growth period",
          containerSize: "1-2 inches larger diameter",
          signs: ["Roots growing through drainage holes", "Water runs straight through", "Top-heavy plant"]
        }
      };
    }

    return careData;
  }

  private async generatePropagationGuide(species: PlantSpecies): Promise<PropagationGuide> {
    const prompt = `
      Provide propagation methods for ${species.scientific} (${species.common}).
      
      Respond with JSON:
      {
        "methods": [
          {
            "type": "Stem cuttings/Leaf cuttings/Seeds/Division/etc",
            "difficulty": "Easy/Medium/Hard",
            "timing": "Best time of year",
            "instructions": "Step-by-step instructions",
            "successRate": "High/Medium/Low"
          }
        ]
      }
    `;

    try {
      const result = await geminiService.analyzeText(prompt, { type: "json_object" });
      const data = JSON.parse(result);
      return data;
    } catch (e) {
      return {
        methods: [
          {
            type: "Stem cuttings",
            difficulty: "Medium",
            timing: "Spring to early summer",
            instructions: "Take 4-6 inch cuttings from healthy stems, remove lower leaves, place in water or moist soil",
            successRate: "Medium"
          }
        ]
      };
    }
  }

  private async generateGrowthCharacteristics(species: PlantSpecies): Promise<GrowthCharacteristics> {
    const prompt = `
      Provide growth characteristics for ${species.scientific} (${species.common}).
      
      Respond with JSON:
      {
        "matureSize": {
          "height": "Expected height",
          "width": "Expected width"
        },
        "growthRate": "Slow/Medium/Fast",
        "lifespan": "Expected lifespan",
        "bloomingPeriod": "When it blooms (if applicable)",
        "fruitingPeriod": "When it fruits (if applicable)",
        "dormancyPeriod": "Dormancy period (if applicable)"
      }
    `;

    try {
      const result = await geminiService.analyzeText(prompt, { type: "json_object" });
      const data = JSON.parse(result);
      return data;
    } catch (e) {
      return {
        matureSize: { height: "Varies", width: "Varies" },
        growthRate: "Medium",
        lifespan: "Perennial"
      };
    }
  }

  private async generateSeasonalCalendar(species: PlantSpecies): Promise<Array<{season: string; tasks: string[]; expectations: string[]}>> {
    const prompt = `
      Create a seasonal care calendar for ${species.scientific} (${species.common}).
      
      Respond with JSON:
      {
        "calendar": [
          {
            "season": "Spring",
            "tasks": ["Task 1", "Task 2"],
            "expectations": ["What to expect 1", "What to expect 2"]
          }
        ]
      }
    `;

    try {
      const result = await geminiService.analyzeText(prompt, { type: "json_object" });
      const data = JSON.parse(result);
      return data.calendar || [];
    } catch (e) {
      return [
        {
          season: "Spring",
          tasks: ["Resume regular watering", "Begin fertilizing", "Repot if needed"],
          expectations: ["New growth appears", "Increased water needs"]
        },
        {
          season: "Summer",
          tasks: ["Regular watering", "Monitor for pests", "Provide adequate light"],
          expectations: ["Active growth period", "May need more frequent watering"]
        },
        {
          season: "Fall", 
          tasks: ["Reduce fertilizing", "Prepare for dormancy", "Check for diseases"],
          expectations: ["Growth slows", "Prepare for winter rest"]
        },
        {
          season: "Winter",
          tasks: ["Reduce watering", "Stop fertilizing", "Monitor humidity"],
          expectations: ["Dormant period", "Minimal growth"]
        }
      ];
    }
  }

  private async generateDetailedRecommendations(species: PlantSpecies, health: HealthAssessment): Promise<Array<{category: string; priority: string; action: string; reason: string}>> {
    const prompt = `
      Generate detailed recommendations for ${species.scientific} based on its health status: ${health.overallHealth}.
      
      Respond with JSON:
      {
        "recommendations": [
          {
            "category": "Watering/Light/Soil/Health/etc",
            "priority": "High/Medium/Low",
            "action": "Specific action to take",
            "reason": "Why this action is needed"
          }
        ]
      }
    `;

    try {
      const result = await geminiService.analyzeText(prompt, { type: "json_object" });
      const data = JSON.parse(result);
      return data.recommendations || [];
    } catch (e) {
      return [
        {
          category: "General Care",
          priority: "Medium",
          action: "Monitor plant regularly for changes",
          reason: "Early detection prevents serious issues"
        }
      ];
    }
  }

  private async analyzeToxicity(species: PlantSpecies): Promise<{level: string; affectedParties: string[]; symptoms: string[]; firstAid: string} | undefined> {
    const prompt = `
      Analyze toxicity information for ${species.scientific} (${species.common}).
      
      Respond with JSON:
      {
        "toxicity": {
          "level": "Non-toxic/Mildly toxic/Moderately toxic/Highly toxic",
          "affectedParties": ["Humans", "Dogs", "Cats", "etc"],
          "symptoms": ["Symptom 1", "Symptom 2"],
          "firstAid": "First aid recommendations"
        }
      }
      
      If plant is non-toxic, respond with: {"toxicity": null}
    `;

    try {
      const result = await geminiService.analyzeText(prompt, { type: "json_object" });
      const data = JSON.parse(result);
      return data.toxicity;
    } catch (e) {
      return undefined;
    }
  }

  private async getCompanionPlants(species: PlantSpecies): Promise<string[]> {
    const prompt = `
      Suggest companion plants that grow well with ${species.scientific} (${species.common}).
      
      Respond with JSON:
      {
        "companions": ["Plant 1", "Plant 2", "Plant 3"]
      }
    `;

    try {
      const result = await geminiService.analyzeText(prompt, { type: "json_object" });
      const data = JSON.parse(result);
      return data.companions || [];
    } catch (e) {
      return [];
    }
  }

  private async getCommonProblems(species: PlantSpecies): Promise<Array<{problem: string; causes: string[]; solutions: string[]}>> {
    const prompt = `
      List common problems for ${species.scientific} (${species.common}).
      
      Respond with JSON:
      {
        "problems": [
          {
            "problem": "Problem name",
            "causes": ["Cause 1", "Cause 2"],
            "solutions": ["Solution 1", "Solution 2"]
          }
        ]
      }
    `;

    try {
      const result = await geminiService.analyzeText(prompt, { type: "json_object" });
      const data = JSON.parse(result);
      return data.problems || [];
    } catch (e) {
      return [
        {
          problem: "Leaf yellowing",
          causes: ["Overwatering", "Natural aging", "Nutrient deficiency"],
          solutions: ["Adjust watering schedule", "Remove old leaves", "Apply fertilizer"]
        }
      ];
    }
  }
}