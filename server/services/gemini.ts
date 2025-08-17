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
      // Convert base64 images to the format Gemini expects
      const imageContents = imageBase64Array.map(base64 => ({
        inlineData: {
          data: base64,
          mimeType: "image/jpeg", // Assuming JPEG, adjust if needed
        },
      }));

      const contents = [
        ...imageContents,
        { text: prompt }
      ];

      let modelConfig: any = { model: "gemini-1.5-flash" };
      if (options?.type === "json_object") {
        modelConfig.generationConfig = {
          responseMimeType: "application/json"
        };
      }

      const model = genAI.getGenerativeModel(modelConfig);
      const result = await model.generateContent(contents);

      const response = result.response;
      const text = response.text();
      
      // If expecting JSON, try to parse and validate it
      if (options?.type === "json_object") {
        try {
          JSON.parse(text); // Validate JSON
          return text;
        } catch (parseError) {
          // Try to extract JSON from the response if it's wrapped in text
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            JSON.parse(jsonMatch[0]); // Validate extracted JSON
            return jsonMatch[0];
          }
          throw new Error(`Invalid JSON response: ${text}`);
        }
      }
      
      return text;
    } catch (error) {
      console.error('Error analyzing images with Gemini:', error);
      throw error;
    }
  }

  private getModel() {
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeText(prompt: string, options?: { type?: "json_object" }): Promise<string> {
    try {
      let modelConfig: any = { model: "gemini-1.5-flash" };
      if (options?.type === "json_object") {
        modelConfig.generationConfig = {
          responseMimeType: "application/json"
        };
      }

      const model = genAI.getGenerativeModel(modelConfig);
      const result = await model.generateContent(prompt);

      const response = result.response;
      const text = response.text();
      
      // If expecting JSON, try to parse and validate it
      if (options?.type === "json_object") {
        try {
          JSON.parse(text); // Validate JSON
          return text;
        } catch (parseError) {
          // Try to extract JSON from the response if it's wrapped in text
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            JSON.parse(jsonMatch[0]); // Validate extracted JSON
            return jsonMatch[0];
          }
          throw new Error(`Invalid JSON response: ${text}`);
        }
      }
      
      return text;
    } catch (error) {
      console.error('Error analyzing text with Gemini:', error);
      throw error;
    }
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
            type: "object" as const,
            properties: {
              suitable: { type: "boolean" as const },
              quality_score: { type: "number" as const },
              issues: { 
                type: "array" as const,
                items: { type: "string" as const }
              },
              suggestions: {
                type: "array" as const, 
                items: { type: "string" as const }
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
            type: "object" as const,
            properties: {
              watering: {
                type: "object" as const,
                properties: {
                  frequency: { type: "string" as const },
                  description: { type: "string" as const },
                  schedule: { type: "string" as const },
                },
              },
              light: {
                type: "object" as const,
                properties: {
                  level: { type: "string" as const },
                  description: { type: "string" as const },
                  placement: { type: "string" as const },
                },
              },
              humidity: {
                type: "object" as const,
                properties: {
                  range: { type: "string" as const },
                  description: { type: "string" as const },
                  tips: { type: "array" as const, items: { type: "string" as const } },
                },
              },
              temperature: {
                type: "object" as const,
                properties: {
                  range: { type: "string" as const },
                  description: { type: "string" as const },
                  seasonal_notes: { type: "string" as const },
                },
              },
              soil: {
                type: "object" as const,
                properties: {
                  type: { type: "string" as const },
                  details: { type: "string" as const },
                  repotting: { type: "string" as const },
                },
              },
              fertilizer: {
                type: "object" as const,
                properties: {
                  type: { type: "string" as const },
                  frequency: { type: "string" as const },
                  details: { type: "string" as const },
                },
              },
              pruning: {
                type: "object" as const,
                properties: {
                  frequency: { type: "string" as const },
                  details: { type: "string" as const },
                  tools: { type: "array" as const, items: { type: "string" as const } },
                },
              },
              common_issues: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    issue: { type: "string" as const },
                    symptoms: { type: "string" as const },
                    solution: { type: "string" as const },
                  },
                },
              },
              seasonal_care: {
                type: "object" as const,
                properties: {
                  spring: { type: "string" as const },
                  summer: { type: "string" as const },
                  fall: { type: "string" as const },
                  winter: { type: "string" as const },
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
            type: "object" as const,
            properties: {
              diseases: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    name: { type: "string" as const },
                    severity: { type: "string" as const },
                    description: { type: "string" as const },
                    symptoms: { type: "array" as const, items: { type: "string" as const } },
                    treatment: {
                      type: "object" as const,
                      properties: {
                        immediate_actions: { type: "array" as const, items: { type: "string" as const } },
                        ongoing_care: { type: "array" as const, items: { type: "string" as const } },
                        products: { type: "array" as const, items: { type: "string" as const } },
                      },
                    },
                    prevention: {
                      type: "array" as const,
                      items: { type: "string" as const },
                    },
                    recovery_timeline: { type: "string" as const },
                  },
                },
              },
              overall_health_status: { type: "string" as const },
              urgent_actions_needed: { type: "boolean" as const },
              general_recommendations: {
                type: "array" as const,
                items: { type: "string" as const },
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
