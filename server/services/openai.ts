import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting for OpenAI API
interface RateLimitData {
  requestCount: number;
  lastReset: Date;
}

const rateLimitStore = new Map<string, RateLimitData>();
const DAILY_LIMIT = 45; // Conservative limit under free tier

function checkRateLimit(userId: string = 'anonymous'): boolean {
  const now = new Date();
  const today = now.toDateString();
  const key = `${userId}-${today}`;
  
  const data = rateLimitStore.get(key);
  
  if (!data) {
    rateLimitStore.set(key, { requestCount: 1, lastReset: now });
    return true;
  }
  
  // Reset if it's a new day
  if (data.lastReset.toDateString() !== today) {
    rateLimitStore.set(key, { requestCount: 1, lastReset: now });
    return true;
  }
  
  if (data.requestCount >= DAILY_LIMIT) {
    return false;
  }
  
  data.requestCount++;
  return true;
}

// Add delay between requests to respect rate limits
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let lastRequestTime = 0;
const MIN_INTERVAL = 2000; // 2 seconds between requests

async function throttleRequest(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_INTERVAL) {
    await delay(MIN_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
}

export async function analyzeText(prompt: string, userId?: string): Promise<string> {
  try {
    // Check rate limits
    if (!checkRateLimit(userId)) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }
    
    // Throttle requests
    await throttleRequest();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  } catch (error) {
    // Log detailed error for admin debugging only
    console.error('OpenAI API error (ADMIN LOG):', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      method: 'analyzeText'
    });

    // Throw sanitized error messages for users
    if (error instanceof Error && error.message.includes('quota')) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }
    
    if (error instanceof Error && error.message.includes('rate_limit')) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }

    // Generic service error
    throw new Error('AI_SERVICE_ERROR');
  }
}

export async function analyzeWithImages(prompt: string, imageBase64Array: string[], userId?: string): Promise<string> {
  try {
    // Check rate limits
    if (!checkRateLimit(userId)) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }
    
    // Throttle requests
    await throttleRequest();

    const content = [
      {
        type: "text" as const,
        text: prompt
      },
      ...imageBase64Array.map(base64 => ({
        type: "image_url" as const,
        image_url: {
          url: `data:image/jpeg;base64,${base64}`
        }
      }))
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model with vision
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error('No response from OpenAI');
    }

    return text;
  } catch (error) {
    // Log detailed error for admin debugging only
    console.error('OpenAI API error (ADMIN LOG):', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      method: 'analyzeWithImages'
    });

    // Throw sanitized error messages for users
    if (error instanceof Error && error.message.includes('quota')) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }
    
    if (error instanceof Error && error.message.includes('rate_limit')) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }

    // Generic service error
    throw new Error('AI_SERVICE_ERROR');
  }
}

export async function generateStructuredContent<T>(prompt: string, userId?: string): Promise<T> {
  try {
    // Check rate limits
    if (!checkRateLimit(userId)) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }
    
    // Throttle requests
    await throttleRequest();

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that responds with valid JSON format. Always ensure your response is properly formatted JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', content);
      throw new Error('Invalid JSON response from AI service');
    }
  } catch (error) {
    // Log detailed error for admin debugging only
    console.error('OpenAI API error (ADMIN LOG):', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      method: 'generateStructuredContent'
    });

    // Throw sanitized error messages for users
    if (error instanceof Error && error.message.includes('quota')) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }
    
    if (error instanceof Error && error.message.includes('rate_limit')) {
      throw new Error('SERVICE_QUOTA_EXCEEDED');
    }

    // Generic service error
    throw new Error('AI_SERVICE_ERROR');
  }
}

export default {
  analyzeText,
  analyzeWithImages,
  generateStructuredContent,
};