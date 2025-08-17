import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || ""
);

export class GeminiService {
  async generateStructuredContent(prompt: string, schema: Record<string, string>): Promise<any> {
    try {
      const model = this.getModel();
      
      const structuredPrompt = `${prompt}

Please provide your response as a valid JSON object matching this schema:
${JSON.stringify(schema, null, 2)}

Ensure the response is properly formatted JSON that can be parsed.`;

      const result = await model.generateContent(structuredPrompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating structured content:', error);
      throw error;
    }
  }

  async analyzeWithImages(prompt: string, imageBase64Array: string[], options?: { type?: "json_object" }): Promise<string> {
    try {
      const model = this.getModel();
      
      // Convert base64 images to the format Gemini expects
      const imageContents = imageBase64Array.map(base64 => ({
        inlineData: {
          data: base64,
          mimeType: "image/jpeg", // Assuming JPEG, adjust if needed
        },
      }));

      const contents = [
        ...imageContents,
        prompt
      ];

      let config: any = {};
      if (options?.type === "json_object") {
        config.responseMimeType = "application/json";
      }

      const result = await model.generateContent(contents);

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing images with Gemini:', error);
      throw error;
    }
  }

  private getModel() {
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

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

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
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
        });
      const response = await model.generateContent(contents);

      const result = JSON.parse(response.response.text() || "{}");
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

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
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
        }
      });
      const response = await model.generateContent(prompt);

      return JSON.parse(response.response.text() || "{}");

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

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
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
        }
      });
      const response = await model.generateContent(prompt);

      return JSON.parse(response.response.text() || "{}");

    } catch (error) {
      console.error("Gemini disease advice error:", error);
      throw new Error("Failed to generate disease advice");
    }
  }
}

export const geminiService = new GeminiService();
