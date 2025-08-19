export const AFFILIATE_TAGLINE = "Hand-picked essentials for every gardener";

export interface Marketplace {
  region: 'US' | 'IN' | 'UK';
  tld: string;
  tagEnvVar: string;
  currency: string;
  displayName: string;
}

export const MARKETPLACES: Record<string, Marketplace> = {
  US: {
    region: 'US',
    tld: 'com',
    tagEnvVar: 'AMZ_TAG_US',
    currency: 'USD',
    displayName: 'United States'
  },
  IN: {
    region: 'IN',
    tld: 'in',
    tagEnvVar: 'AMZ_TAG_IN',
    currency: 'INR',
    displayName: 'India'
  },
  UK: {
    region: 'UK',
    tld: 'co.uk',
    tagEnvVar: 'AMZ_TAG_UK',
    currency: 'GBP',
    displayName: 'United Kingdom'
  }
};

export const PRODUCT_CATEGORIES = {
  'hand-tools': {
    name: 'Hand Tools',
    keywords: ['pruning shears', 'hand trowel', 'garden fork', 'loppers', 'weeder'],
    description: 'Essential hand tools for precise gardening work'
  },
  'watering': {
    name: 'Watering & Irrigation',
    keywords: ['watering can', 'hose nozzle', 'sprayer', 'drip irrigation', 'soaker hose'],
    description: 'Complete watering solutions for healthy plants'
  },
  'soil-care': {
    name: 'Soil Care',
    keywords: ['soil pH meter', 'compost bin', 'soil tester', 'fertilizer spreader'],
    description: 'Tools to keep your soil healthy and fertile'
  },
  'protective-gear': {
    name: 'Protective Gear',
    keywords: ['gardening gloves', 'knee pads', 'sun hat', 'apron'],
    description: 'Stay safe and comfortable while gardening'
  }
};

export interface Product {
  asin: string;
  title: string;
  image: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  currency?: string;
  badges?: string[];
  lastUpdated: Date;
  usageTip?: string;
}

export const CURATED_ASINS: Record<string, string[]> = {
  'hand-tools': [
    'B000BD0KGC', // Felco F-2 Pruning Shears
    'B00004SD76', // Fiskars Softouch Micro-Tip Pruning Snips
    'B0030CO0JE'  // Radius Garden Root Slayer Shovel
  ],
  'watering': [
    'B01MXDPN6G', // Dramm ColorStorm Premium Watering Can
    'B000A0T2GS', // Gilmour Heavy Duty Hose Nozzle
    'B07PQVJ7VQ'  // Rain Bird Drip Irrigation Kit
  ],
  'soil-care': [
    'B014MJ8J2U', // Sonkir Soil pH Meter
    'B01ADZXCC4', // FCMP Outdoor IM4000 Tumbling Composter
    'B000BYCFU4'  // Rapitest Digital Soil Thermometer
  ],
  'protective-gear': [
    'B00K3D28P0', // Pine Tree Tools Bamboo Working Gloves
    'B01M8LD8FH', // NoCry Cut Resistant Gloves
    'B019PQVVLI'  // Sunday Afternoons Sun Hat
  ]
};