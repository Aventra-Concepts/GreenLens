import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "" 
});

export class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error('GEMINI_API_KEY or GOOGLE_GENAI_API_KEY environment variable is required');
    }
  }

  async assessImageQuality(images: Array<{ data: string; mimeType: string }>) {
    try {
      const contents = [
        ...images.map(img => ({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType,
          },
        })),
        "Assess the quality of these plant images for identification purposes. Are they clear, well-lit, and showing sufficient plant details? Respond with JSON indicating if they're suitable and any suggestions for improvement.",
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              suitable: { type: "boolean" },
              quality_score: { type: "number" },
              issues: { 
                type: "array",
                items: { type: "string" }
              },
              suggestions: {
                type: "array", 
                items: { type: "string" }
              },
            },
            required: ["suitable", "quality_score"],
          },
        },
        contents,
      });

      const result = JSON.parse(response.text || "{}");
      return {
        suitable: result.suitable || false,
        qualityScore: result.quality_score || 0,
        issues: result.issues || [],
        suggestions: result.suggestions || [],
      };

    } catch (error) {
      console.error("Gemini image quality assessment error:", error);
      // Return permissive response on error
      return {
        suitable: true,
        qualityScore: 0.7,
        issues: [],
        suggestions: [],
      };
    }
  }

  async synthesizeCarePlan({ identification, catalog }: any) {
    try {
      const prompt = `Based on the plant identification and catalog information below, create a comprehensive care plan.

Plant Identification:
${JSON.stringify(identification, null, 2)}

Catalog Information:
${JSON.stringify(catalog, null, 2)}

Generate a detailed care plan with specific, actionable advice for this plant.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              watering: {
                type: "object",
                properties: {
                  frequency: { type: "string" },
                  description: { type: "string" },
                  schedule: { type: "string" },
                },
              },
              light: {
                type: "object",
                properties: {
                  level: { type: "string" },
                  description: { type: "string" },
                  placement: { type: "string" },
                },
              },
              humidity: {
                type: "object",
                properties: {
                  range: { type: "string" },
                  description: { type: "string" },
                  tips: { type: "array", items: { type: "string" } },
                },
              },
              temperature: {
                type: "object",
                properties: {
                  range: { type: "string" },
                  description: { type: "string" },
                  seasonal_notes: { type: "string" },
                },
              },
              soil: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  details: { type: "string" },
                  repotting: { type: "string" },
                },
              },
              fertilizer: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  frequency: { type: "string" },
                  details: { type: "string" },
                },
              },
              pruning: {
                type: "object",
                properties: {
                  frequency: { type: "string" },
                  details: { type: "string" },
                  tools: { type: "array", items: { type: "string" } },
                },
              },
              common_issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    issue: { type: "string" },
                    symptoms: { type: "string" },
                    solution: { type: "string" },
                  },
                },
              },
              seasonal_care: {
                type: "object",
                properties: {
                  spring: { type: "string" },
                  summer: { type: "string" },
                  fall: { type: "string" },
                  winter: { type: "string" },
                },
              },
            },
            required: ["watering", "light", "humidity", "temperature"],
          },
        },
        contents: prompt,
      });

      return JSON.parse(response.text || "{}");

    } catch (error) {
      console.error("Gemini care plan synthesis error:", error);
      throw new Error("Failed to generate care plan");
    }
  }

  async diseaseAdvice({ diseaseFindings }: any) {
    try {
      const prompt = `Based on these plant disease findings, provide detailed treatment advice and prevention tips:

Disease Findings:
${JSON.stringify(diseaseFindings, null, 2)}

Provide comprehensive advice for treating and preventing these plant diseases.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              diseases: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    severity: { type: "string" },
                    description: { type: "string" },
                    symptoms: { type: "array", items: { type: "string" } },
                    treatment: {
                      type: "object",
                      properties: {
                        immediate_actions: { type: "array", items: { type: "string" } },
                        ongoing_care: { type: "array", items: { type: "string" } },
                        products: { type: "array", items: { type: "string" } },
                      },
                    },
                    prevention: {
                      type: "array",
                      items: { type: "string" },
                    },
                    recovery_timeline: { type: "string" },
                  },
                },
              },
              overall_health_status: { type: "string" },
              urgent_actions_needed: { type: "boolean" },
              general_recommendations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["diseases", "overall_health_status"],
          },
        },
        contents: prompt,
      });

      return JSON.parse(response.text || "{}");

    } catch (error) {
      console.error("Gemini disease advice error:", error);
      throw new Error("Failed to generate disease advice");
    }
  }
}

export const geminiService = new GeminiService();
