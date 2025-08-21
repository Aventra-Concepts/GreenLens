import { Request } from 'express';

interface USRegion {
  code: string;
  name: string;
  timezone: string;
  popularPlants: string[];
  growingZone: string;
}

export class USOptimizationService {
  private static instance: USOptimizationService;

  public static getInstance(): USOptimizationService {
    if (!USOptimizationService.instance) {
      USOptimizationService.instance = new USOptimizationService();
    }
    return USOptimizationService.instance;
  }

  private readonly usRegions: Record<string, USRegion> = {
    'northeast': {
      code: 'NE',
      name: 'Northeast',
      timezone: 'America/New_York',
      popularPlants: ['maple', 'oak', 'pine', 'rhododendron', 'hosta'],
      growingZone: 'Zones 3-6',
    },
    'southeast': {
      code: 'SE', 
      name: 'Southeast',
      timezone: 'America/New_York',
      popularPlants: ['magnolia', 'azalea', 'palm', 'crepe myrtle', 'camellia'],
      growingZone: 'Zones 6-10',
    },
    'midwest': {
      code: 'MW',
      name: 'Midwest',
      timezone: 'America/Chicago',
      popularPlants: ['corn', 'soybean', 'wheat', 'sunflower', 'prairie grass'],
      growingZone: 'Zones 3-6',
    },
    'southwest': {
      code: 'SW',
      name: 'Southwest', 
      timezone: 'America/Phoenix',
      popularPlants: ['cactus', 'agave', 'desert willow', 'palo verde', 'ocotillo'],
      growingZone: 'Zones 7-10',
    },
    'west': {
      code: 'W',
      name: 'West',
      timezone: 'America/Los_Angeles', 
      popularPlants: ['redwood', 'eucalyptus', 'manzanita', 'lavender', 'rosemary'],
      growingZone: 'Zones 5-10',
    },
  };

  public detectUSRegion(req: Request): USRegion {
    // Try to detect from IP geolocation headers (common in hosting platforms)
    const state = req.headers['cf-ipcountry-subdivision'] as string || 
                  req.headers['x-vercel-ip-country-region'] as string ||
                  req.headers['x-forwarded-for-region'] as string;

    // Map US states to regions
    const stateToRegion: Record<string, string> = {
      'ME': 'northeast', 'NH': 'northeast', 'VT': 'northeast', 'MA': 'northeast',
      'RI': 'northeast', 'CT': 'northeast', 'NY': 'northeast', 'NJ': 'northeast', 'PA': 'northeast',
      'DE': 'southeast', 'MD': 'southeast', 'VA': 'southeast', 'WV': 'southeast',
      'KY': 'southeast', 'TN': 'southeast', 'NC': 'southeast', 'SC': 'southeast',
      'GA': 'southeast', 'FL': 'southeast', 'AL': 'southeast', 'MS': 'southeast', 'LA': 'southeast',
      'OH': 'midwest', 'IN': 'midwest', 'IL': 'midwest', 'MI': 'midwest', 'WI': 'midwest',
      'MN': 'midwest', 'IA': 'midwest', 'MO': 'midwest', 'ND': 'midwest', 'SD': 'midwest', 'NE': 'midwest', 'KS': 'midwest',
      'TX': 'southwest', 'OK': 'southwest', 'AR': 'southwest', 'NM': 'southwest', 'AZ': 'southwest', 'NV': 'southwest',
      'CO': 'southwest', 'UT': 'southwest',
      'WA': 'west', 'OR': 'west', 'CA': 'west', 'ID': 'west', 'MT': 'west', 'WY': 'west',
      'AK': 'west', 'HI': 'west',
    };

    const region = state ? stateToRegion[state.toUpperCase()] || 'northeast' : 'northeast';
    return this.usRegions[region];
  }

  public getUSLocalizedContent(region: USRegion): {
    welcomeMessage: string;
    gardeningTips: string[];
    seasonalAdvice: string;
  } {
    const currentMonth = new Date().getMonth();
    const isSpring = currentMonth >= 2 && currentMonth <= 4;
    const isSummer = currentMonth >= 5 && currentMonth <= 7;
    const isFall = currentMonth >= 8 && currentMonth <= 10;
    const isWinter = currentMonth >= 11 || currentMonth <= 1;

    let seasonalAdvice = '';
    if (isSpring) {
      seasonalAdvice = `Spring is perfect for planting in ${region.name}. Popular choices include ${region.popularPlants.slice(0, 3).join(', ')}.`;
    } else if (isSummer) {
      seasonalAdvice = `Summer care is crucial in ${region.name}. Focus on watering and protecting plants from heat stress.`;
    } else if (isFall) {
      seasonalAdvice = `Fall preparation time in ${region.name}. Consider planting hardy perennials and preparing for winter.`;
    } else {
      seasonalAdvice = `Winter planning in ${region.name}. Review your garden and plan for next season.`;
    }

    return {
      welcomeMessage: `Welcome to GreenLens! Discover plants perfect for ${region.name} (${region.growingZone}).`,
      gardeningTips: [
        `Best plants for ${region.name}: ${region.popularPlants.join(', ')}`,
        `Growing zone: ${region.growingZone}`,
        `Optimal planting season varies by your specific location`,
      ],
      seasonalAdvice,
    };
  }

  public getUSPlantRecommendations(region: USRegion): Array<{
    name: string;
    difficulty: string;
    growingZone: string;
    nativeToRegion: boolean;
  }> {
    const baseRecommendations = [
      { name: 'Tomato', difficulty: 'Easy', growingZone: 'Zones 3-10', nativeToRegion: false },
      { name: 'Basil', difficulty: 'Easy', growingZone: 'Zones 4-10', nativeToRegion: false },
      { name: 'Marigold', difficulty: 'Easy', growingZone: 'Zones 2-11', nativeToRegion: false },
    ];

    // Add region-specific plants
    const regionSpecific = region.popularPlants.slice(0, 2).map(plant => ({
      name: plant.charAt(0).toUpperCase() + plant.slice(1),
      difficulty: 'Moderate',
      growingZone: region.growingZone,
      nativeToRegion: true,
    }));

    return [...baseRecommendations, ...regionSpecific];
  }

  public formatUSDateTime(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  }

  public getUSLocalizedDefaults(): {
    currency: string;
    locale: string;
    timezone: string;
    region: string;
    units: 'imperial' | 'metric';
  } {
    return {
      currency: 'USD',
      locale: 'en-US',
      timezone: 'America/New_York',
      region: 'US',
      units: 'imperial', // Fahrenheit, inches, feet
    };
  }
}

export const usOptimizationService = USOptimizationService.getInstance();