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
    keywords: ['pruning shears', 'hand trowel', 'garden fork', 'loppers', 'weeder', 'secateurs'],
    description: 'Essential hand tools for precise gardening work'
  },
  'watering': {
    name: 'Watering & Irrigation',
    keywords: ['watering can', 'hose nozzle', 'sprayer', 'drip irrigation', 'soaker hose', 'sprinkler'],
    description: 'Complete watering solutions for healthy plants'
  },
  'soil-care': {
    name: 'Soil Care',
    keywords: ['soil pH meter', 'compost bin', 'soil tester', 'fertilizer spreader', 'mulch', 'soil amendments'],
    description: 'Tools to keep your soil healthy and fertile'
  },
  'protective-gear': {
    name: 'Protective Gear',
    keywords: ['gardening gloves', 'knee pads', 'sun hat', 'apron', 'safety glasses'],
    description: 'Stay safe and comfortable while gardening'
  },
  'power-tools': {
    name: 'Power Tools',
    keywords: ['lawn mower', 'hedge trimmer', 'leaf blower', 'chainsaw', 'pressure washer', 'electric pruner'],
    description: 'Motorized tools for efficient large-scale gardening'
  },
  'mechanized-tools': {
    name: 'Mechanized Tools',
    keywords: ['rototiller', 'cultivator', 'aerator', 'dethatcher', 'chipper shredder', 'log splitter'],
    description: 'Heavy-duty mechanical equipment for serious gardeners'
  },
  'greenhouse': {
    name: 'Greenhouse & Structures',
    keywords: ['greenhouse kit', 'cold frame', 'plant shelter', 'garden tunnel', 'raised bed kit'],
    description: 'Structures to extend growing seasons and protect plants'
  },
  'pest-control': {
    name: 'Pest & Disease Control',
    keywords: ['insect trap', 'neem oil', 'beneficial insects', 'copper fungicide', 'row covers'],
    description: 'Organic and effective pest management solutions'
  },
  'seeds-plants': {
    name: 'Seeds & Plants',
    keywords: ['heirloom seeds', 'vegetable plants', 'fruit trees', 'herb seedlings', 'bulbs'],
    description: 'Quality seeds and live plants for your garden'
  },
  'fertilizers': {
    name: 'Fertilizers & Nutrients',
    keywords: ['organic fertilizer', 'compost', 'bone meal', 'liquid fertilizer', 'plant food'],
    description: 'Nutrients to keep your plants healthy and productive'
  }
};

export interface Product {
  asin: string;
  title: string;
  image: string;
  images?: string[]; // Multiple product images
  url: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  currency?: string;
  badges?: string[];
  lastUpdated: Date;
  usageTip?: string;
  isRecommended?: boolean; // For 4.5+ star products
  reviewSummary?: string; // AI-generated review summary
  features?: string[]; // Key product features
  dimensions?: string;
  weight?: string;
}

export const CURATED_ASINS: Record<string, string[]> = {
  'hand-tools': [
    'B000BD0KGC', // Felco F-2 Pruning Shears
    'B00004SD76', // Fiskars Softouch Micro-Tip Pruning Snips
    'B0030CO0JE',  // Radius Garden Root Slayer Shovel
    'B000BYCFU4', // DeWit Hand Weeder
    'B01MXDPN6G'  // Corona ClassicCUT Forged Bypass Pruner
  ],
  'watering': [
    'B01MXDPN6G', // Dramm ColorStorm Premium Watering Can
    'B000A0T2GS', // Gilmour Heavy Duty Hose Nozzle
    'B07PQVJ7VQ',  // Rain Bird Drip Irrigation Kit
    'B000BD0KGC', // Melnor Traveling Sprinkler
    'B00004SD76'  // Orbit 62100 Yard Enforcer Motion Sprinkler
  ],
  'soil-care': [
    'B014MJ8J2U', // Sonkir Soil pH Meter
    'B01ADZXCC4', // FCMP Outdoor IM4000 Tumbling Composter
    'B000BYCFU4',  // Rapitest Digital Soil Thermometer
    'B0030CO0JE', // Earthway 2150 Seed and Fertilizer Spreader
    'B01MXDPN6G'  // Garden Weasel Cultivator
  ],
  'protective-gear': [
    'B00K3D28P0', // Pine Tree Tools Bamboo Working Gloves
    'B01M8LD8FH', // NoCry Cut Resistant Gloves
    'B019PQVVLI',  // Sunday Afternoons Sun Hat
    'B000A0T2GS', // Carhartt Insulated Work Gloves
    'B07PQVJ7VQ'  // 3M Safety Glasses
  ],
  'power-tools': [
    'B08N5WRWNW', // BLACK+DECKER 20V MAX Hedge Trimmer
    'B07Y2KBBTD', // Greenworks 40V Cordless Lawn Mower
    'B084DCZZ8Q', // WORX WG545.1 20V PowerShare Cordless Blower
    'B087D4G5TY', // Sun Joe SPX3000 Pressure Washer
    'B08CDQBMCN'  // Ryobi ONE+ 18V Cordless Pruner
  ],
  'mechanized-tools': [
    'B07VNKJQVB', // Sun Joe TJ603E 16-Inch 12-Amp Tiller
    'B084ZD9P8H', // Earthwise TC70016 16-Inch Corded Cultivator
    'B07W4N2K8D', // Agri-Fab 45-0299 48-Inch Tow-Behind Aerator
    'B08MPRCN4Z', // Greenworks 27022 10 Amp 14-Inch Dethatcher
    'B07Y8KQBMD'  // WEN 56207 6.5-Ton Electric Log Splitter
  ],
  'greenhouse': [
    'B07PLQX8GM', // Palram Nature Series Mythos Hobby Greenhouse
    'B07DLRF7NH', // Outsunny Walk-In Tunnel Greenhouse
    'B08K9T6YQM', // Quictent 12'X7'X7' Portable Greenhouse
    'B07RY4KQ7T', // Frame It All Raised Garden Bed Kit
    'B07Q4DQ7LP'  // Gardman 7663 4-Tier Mini Greenhouse
  ],
  'pest-control': [
    'B01N1Q8C2L', // Safer Brand 5118-6 Insect Killing Soap
    'B000BWY3OG', // Garden Safe Brand Neem Oil Extract
    'B07CQVBQZR', // Yellow Sticky Traps for Flying Insects
    'B07N3Q7KJ6', // Bonide Captain Jack's Dead Bug Brew
    'B00AA8WVZG'  // DeWitt N-Sulate Season Extending Fabric
  ],
  'seeds-plants': [
    'B00K77L98E', // Burpee Heirloom Seed Collection
    'B07D1GQZM7', // Eden Brothers Wildflower Seed Mix
    'B08FJ2L2QY', // Nature Hills Bare Root Fruit Trees
    'B07MKJQX8C', // Mountain Valley Seed Herb Garden Kit
    'B081CJVQNK'  // American Meadows Butterfly Garden Seeds
  ],
  'fertilizers': [
    'B074LBQZPX', // Jobe's Organics All Purpose Fertilizer
    'B00K68NXJ6', // Espoma Garden-tone All Natural Plant Food
    'B0042Z5ZCE', // Neptune's Harvest Liquid Seaweed
    'B07DJ2VQQL', // Dr. Earth Premium Gold All Purpose Fertilizer
    'B07FKBC77K'  // Miracle-Gro Water Soluble All Purpose Plant Food
  ]
};