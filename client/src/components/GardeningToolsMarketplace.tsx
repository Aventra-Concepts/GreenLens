import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ExternalLink, Star, ShoppingCart, Search, Filter, Package, Droplets, Wrench, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  asin: string;
  title: string;
  image: string;
  images?: string[];
  url: string;
  price?: string;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  usageTip?: string;
  lastUpdated: Date;
  isRecommended?: boolean;
  reviewSummary?: string;
  features?: string[];
  dimensions?: string;
  weight?: string;
}

interface ProductSearchParams {
  market: 'US' | 'IN' | 'UK';
  category?: string;
  q?: string;
  sort?: string;
  minRating?: number;
}

const categories = [
  { id: 'hand-tools', name: 'Hand Tools', icon: Wrench, description: 'Essential hand tools for precise gardening work' },
  { id: 'watering', name: 'Watering & Irrigation', icon: Droplets, description: 'Complete watering solutions for healthy plants' },
  { id: 'soil-care', name: 'Soil Care', icon: Package, description: 'Tools to keep your soil healthy and fertile' },
  { id: 'protective-gear', name: 'Protective Gear', icon: Shield, description: 'Stay safe and comfortable while gardening' },
  { id: 'power-tools', name: 'Power Tools', icon: '🔋', description: 'Motorized tools for efficient large-scale gardening' },
  { id: 'mechanized-tools', name: 'Mechanized Tools', icon: '🚜', description: 'Heavy-duty mechanical equipment for serious gardeners' },
  { id: 'greenhouse', name: 'Greenhouse & Structures', icon: '🏠', description: 'Structures to extend growing seasons and protect plants' },
  { id: 'pest-control', name: 'Pest & Disease Control', icon: '🐛', description: 'Organic and effective pest management solutions' },
  { id: 'seeds-plants', name: 'Seeds & Plants', icon: '🌿', description: 'Quality seeds and live plants for your garden' },
  { id: 'fertilizers', name: 'Fertilizers & Nutrients', icon: '🌾', description: 'Nutrients to keep your plants healthy and productive' },
];

export function GardeningToolsMarketplace({ plantResults }: { plantResults?: any[] }) {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    market: 'US',
    category: 'hand-tools',
    sort: 'rating'
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['/api/affiliate/products', searchParams, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        market: searchParams.market,
        ...(searchParams.category && { category: searchParams.category }),
        ...(searchQuery && { q: searchQuery }),
        ...(searchParams.sort && { sort: searchParams.sort }),
        ...(searchParams.minRating && { minRating: searchParams.minRating.toString() })
      });
      
      const response = await fetch(`/api/affiliate/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    retry: false,
  });

  const { data: marketplacesData } = useQuery({
    queryKey: ['/api/affiliate/marketplaces'],
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search query is already tracked in state, query will refetch automatically
  };

  const getRecommendedTools = () => {
    if (!plantResults || plantResults.length === 0) return [];
    
    const recommendations = [];
    
    // Analyze plant types to suggest appropriate tools
    const hasFlowers = plantResults.some(plant => 
      plant.species?.toLowerCase().includes('flower') || 
      plant.commonName?.toLowerCase().includes('flower')
    );
    
    const hasTrees = plantResults.some(plant =>
      plant.species?.toLowerCase().includes('tree') ||
      plant.commonName?.toLowerCase().includes('tree')
    );
    
    const hasVegetables = plantResults.some(plant =>
      plant.commonName?.toLowerCase().includes('tomato') ||
      plant.commonName?.toLowerCase().includes('pepper') ||
      plant.commonName?.toLowerCase().includes('lettuce')
    );

    if (hasFlowers) {
      recommendations.push({
        category: 'hand-tools',
        reason: 'Perfect for maintaining your flowering plants',
        tools: ['Pruning shears', 'Hand trowel', 'Deadheading scissors']
      });
    }

    if (hasTrees) {
      recommendations.push({
        category: 'hand-tools',
        reason: 'Essential for tree care and maintenance',
        tools: ['Loppers', 'Pruning saw', 'Tree stakes']
      });
    }

    if (hasVegetables) {
      recommendations.push({
        category: 'watering',
        reason: 'Vegetables need consistent watering',
        tools: ['Drip irrigation system', 'Watering can', 'Soaker hose']
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendedTools();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Gardening Tools Marketplace</h3>
        <p className="text-gray-600">Hand-picked essentials for every gardener</p>
        {!(marketplacesData as any)?.hasApiAccess && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              🔧 Demo Mode: Real products require Amazon Associate credentials
            </p>
          </div>
        )}
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h4 className="text-lg font-semibold text-green-800 mb-3">
            🌱 Recommended for Your Garden
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-green-700 font-medium">{rec.reason}</p>
                  <p className="text-green-600 text-sm">{rec.tools.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>

          {/* Category Filter */}
          <Select
            value={searchParams.category || "all"}
            onValueChange={(value) => setSearchParams(prev => ({ ...prev, category: value === "all" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={searchParams.sort}
            onValueChange={(value) => setSearchParams(prev => ({ ...prev, sort: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Market Selection */}
          <Select
            value={searchParams.market}
            onValueChange={(value: 'US' | 'IN' | 'UK') => setSearchParams(prev => ({ ...prev, market: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Market" />
            </SelectTrigger>
            <SelectContent>
              {(marketplacesData as any)?.marketplaces?.map((market: any) => (
                <SelectItem key={market.region} value={market.region}>
                  {market.displayName} ({market.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {categories.map((category) => {
            const isActive = searchParams.category === category.id;
            
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSearchParams(prev => ({ ...prev, category: category.id }))}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-green-600' : 'text-gray-600'} flex items-center justify-center`}>
                    {typeof category.icon === 'string' ? (
                      <span className="text-2xl">{category.icon}</span>
                    ) : (
                      <category.icon className="w-8 h-8" />
                    )}
                  </div>
                  <h4 className={`font-medium text-sm ${isActive ? 'text-green-800' : 'text-gray-800'}`}>
                    {category.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load products</h3>
            <p className="text-gray-500 mb-4">Please check your internet connection and try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : productsData?.products?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsData.products.map((product: Product) => (
              <Card key={product.asin} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                    }}
                  />
                  {product.badges && product.badges.length > 0 && (
                    <div className="absolute top-2 left-2 space-y-1">
                      {product.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm text-gray-900 mb-2 group-hover:text-green-600 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                    {product.title}
                  </h4>
                  
                  <div className="flex items-center justify-between mb-3">
                    {product.price && (
                      <span className="text-lg font-bold text-green-600">
                        {product.price}
                      </span>
                    )}
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {product.rating}
                          {product.reviewCount && (
                            <span className="text-gray-400">
                              ({product.reviewCount})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {product.usageTip && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">
                      💡 {product.usageTip}
                    </div>
                  )}

                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>View on Amazon</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or category selection.</p>
          </div>
        )}

        {/* Affiliate Disclosure */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-xs text-gray-600">
            🔗 <strong>Affiliate Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases. 
            Prices and availability are subject to change. Product recommendations are based on your plant analysis results.
          </p>
        </div>
      </div>
    </div>
  );
}