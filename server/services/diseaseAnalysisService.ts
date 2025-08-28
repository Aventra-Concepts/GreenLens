import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DiagnosisRequest {
  imageBuffer?: Buffer;
  symptoms?: string;
  plantType?: string;
  location?: string;
}

interface DiagnosisResult {
  diagnosis: string;
  diseaseIdentified: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  treatmentPlan: string;
  preventiveMeasures: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  needsExpertReview: boolean;
}

export class DiseaseAnalysisService {
  async analyzePlantDisease(request: DiagnosisRequest): Promise<DiagnosisResult> {
    const startTime = Date.now();

    try {
      // Prepare messages for OpenAI
      const messages: any[] = [
        {
          role: 'system',
          content: `You are a professional plant pathologist and disease diagnostic expert. Analyze plant diseases based on images and/or symptom descriptions and provide detailed treatment recommendations.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "diagnosis": "Detailed explanation of what you observe and conclude",
  "diseaseIdentified": "Specific disease/condition name (e.g., 'Powdery Mildew', 'Bacterial Leaf Spot')",
  "confidence": 85,
  "severity": "medium",
  "treatmentPlan": "Detailed step-by-step treatment instructions",
  "preventiveMeasures": "Prevention tips for the future",
  "urgencyLevel": "medium",
  "needsExpertReview": false
}

Severity levels: "low" (minor cosmetic issues), "medium" (affects plant health), "high" (serious threat to plant), "critical" (immediate action needed)
Urgency levels: "low" (can wait weeks), "medium" (treat within days), "high" (treat immediately), "emergency" (plant may die without immediate care)
Set needsExpertReview to true for complex cases, rare diseases, or when confidence is below 70%.`
        }
      ];

      // Build user message content
      let userContent = [];

      // Add image if provided
      if (request.imageBuffer) {
        const base64Image = request.imageBuffer.toString('base64');
        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
            detail: "high"
          }
        });
      }

      // Add text description
      let textContent = "Please analyze this plant for diseases and health issues.";
      
      if (request.symptoms) {
        textContent += `\n\nSymptoms described: ${request.symptoms}`;
      }
      
      if (request.plantType) {
        textContent += `\n\nPlant type: ${request.plantType}`;
      }
      
      if (request.location) {
        textContent += `\n\nLocation: ${request.location} (consider regional diseases and climate factors)`;
      }

      userContent.push({
        type: "text",
        text: textContent
      });

      messages.push({
        role: 'user',
        content: userContent
      });

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Use GPT-4 Vision for image analysis
        messages,
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent medical advice
      });

      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('No response from AI service');
      }

      // Parse JSON response
      let parsedResult: DiagnosisResult;
      try {
        // Clean the response to ensure it's valid JSON
        const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedResult = JSON.parse(cleanedResult);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        parsedResult = {
          diagnosis: result,
          diseaseIdentified: "General Plant Health Assessment",
          confidence: 60,
          severity: "medium" as const,
          treatmentPlan: "Please consult with a plant expert for specific treatment recommendations based on the detailed analysis provided.",
          preventiveMeasures: "Maintain proper plant care including adequate watering, lighting, and nutrition.",
          urgencyLevel: "medium" as const,
          needsExpertReview: true
        };
      }

      // Validate and clean the response
      parsedResult = this.validateAndCleanResult(parsedResult);

      return parsedResult;

    } catch (error) {
      console.error('Disease analysis error:', error);
      
      // Return a safe fallback response
      return {
        diagnosis: "Unable to complete automated analysis. Please consult with a plant care expert for proper diagnosis.",
        diseaseIdentified: "Analysis Failed",
        confidence: 0,
        severity: "medium" as const,
        treatmentPlan: "Please provide more information or consult with a professional horticulturist for accurate diagnosis and treatment recommendations.",
        preventiveMeasures: "Maintain proper plant care practices including appropriate watering, lighting, and nutrition.",
        urgencyLevel: "medium" as const,
        needsExpertReview: true
      };
    }
  }

  private validateAndCleanResult(result: any): DiagnosisResult {
    // Ensure all required fields exist with proper types and defaults
    return {
      diagnosis: typeof result.diagnosis === 'string' ? result.diagnosis : 'Analysis completed',
      diseaseIdentified: typeof result.diseaseIdentified === 'string' ? result.diseaseIdentified : 'Unknown Condition',
      confidence: typeof result.confidence === 'number' ? Math.min(100, Math.max(0, result.confidence)) : 50,
      severity: ['low', 'medium', 'high', 'critical'].includes(result.severity) ? result.severity : 'medium',
      treatmentPlan: typeof result.treatmentPlan === 'string' ? result.treatmentPlan : 'Consult with a plant care expert',
      preventiveMeasures: typeof result.preventiveMeasures === 'string' ? result.preventiveMeasures : 'Follow general plant care best practices',
      urgencyLevel: ['low', 'medium', 'high', 'emergency'].includes(result.urgencyLevel) ? result.urgencyLevel : 'medium',
      needsExpertReview: typeof result.needsExpertReview === 'boolean' ? result.needsExpertReview : true
    };
  }

  async getImageQualityScore(imageBuffer: Buffer): Promise<number> {
    try {
      // Simple image quality check based on file size and basic validation
      const sizeKB = imageBuffer.length / 1024;
      
      // Basic quality scoring
      if (sizeKB < 10) return 20; // Too small
      if (sizeKB < 50) return 60; // Small but usable
      if (sizeKB < 200) return 80; // Good quality
      if (sizeKB < 500) return 90; // Very good
      if (sizeKB < 2000) return 95; // Excellent
      
      return 85; // Large files might be over-compressed
    } catch (error) {
      return 50; // Default moderate quality if check fails
    }
  }
}

export const diseaseAnalysisService = new DiseaseAnalysisService();