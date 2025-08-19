import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Filter, Star, ExternalLink, Clock, Globe, Info } from "lucide-react";
import { useLocation } from "wouter";
// Import affiliate constants
const AFFILIATE_TAGLINE = "Hand-picked essentials for every gardener";

interface Product {
  asin: string;
  title: string;
  image: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  currency?: string;
  badges?: string[];
  lastUpdated: string;
  usageTip?: string;
}

interface Marketplace {
  region: 'US' | 'IN' | 'UK';
  tld: string;
  tagEnvVar: string;
  currency: string;
  displayName: string;
}

export default function Tools() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State management
  const [selectedMarket, setSelectedMarket] = useState<string>('US');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [minRating, setMinRating] = useState<number | undefined>();
  const [primeOnly, setPrimeOnly] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Cookie management for marketplace persistence
  useEffect(() => {
    const savedMarket = getCookie('amz_market');
    if (savedMarket && ['US', 'IN', 'UK'].includes(savedMarket)) {
      setSelectedMarket(savedMarket);
    }
  }, []);

  useEffect(() => {
    setCookie('amz_market', selectedMarket, 30);
  }, [selectedMarket]);

  // Fetch marketplaces
  const { data: marketplaceData } = useQuery({
    queryKey: ['/api/affiliate/marketplaces'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/affiliate/marketplaces');
      return response.json();
    }
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/affiliate/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/affiliate/categories');
      return response.json();
    }
  });

  // Fetch products
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/affiliate/products', selectedMarket, selectedCategory, searchQuery, sortBy, minRating],
    queryFn: async () => {
      const params = new URLSearchParams({
        market: selectedMarket,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { q: searchQuery }),
        ...(sortBy && { sort: sortBy }),
        ...(minRating && { minRating: minRating.toString() })
      });
      
      const response = await apiRequest('GET', `/api/affiliate/products?${params}`);
      return response.json();
    }
  });

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/');
    }
  };

  const handleProductClick = (product: Product) => {
    // Track click event
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'affiliate_click', {
        asin: product.asin,
        market: selectedMarket,
        category: selectedCategory
      });
    }
    
    console.log('Product clicked:', {
      asin: product.asin,
      market: selectedMarket,
      position: productsData?.products?.indexOf(product) + 1
    });
    
    window.open(product.url, '_blank');
  };

  const filteredProducts = productsData?.products?.filter((product: Product) => {
    if (primeOnly && !product.badges?.includes('Prime')) return false;
    return true;
  }) || [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="mb-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                data-testid="button-go-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Buy The Best Gardening Tools
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {AFFILIATE_TAGLINE}
              </p>

              {/* Marketplace Switcher */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <Label htmlFor="marketplace" className="text-sm font-medium">
                    Marketplace:
                  </Label>
                </div>
                <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                  <SelectTrigger className="w-48" data-testid="select-marketplace">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketplaceData?.marketplaces?.map((marketplace: Marketplace) => (
                      <SelectItem key={marketplace.region} value={marketplace.region}>
                        {marketplace.displayName} ({marketplace.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search & Filter Tools
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for specific tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                      Category
                    </Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categoriesData && Object.entries(categoriesData.categories).map(([key, category]: [string, any]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <Label htmlFor="sort" className="text-sm font-medium mb-2 block">
                      Sort By
                    </Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger data-testid="select-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="rating">Customer Rating</SelectItem>
                        {productsData?.hasApiAccess && (
                          <>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating Filter */}
                  {productsData?.hasApiAccess && (
                    <div>
                      <Label htmlFor="rating" className="text-sm font-medium mb-2 block">
                        Minimum Rating
                      </Label>
                      <Select value={minRating?.toString() || ''} onValueChange={(value) => setMinRating(value ? Number(value) : undefined)}>
                        <SelectTrigger data-testid="select-rating">
                          <SelectValue placeholder="Any Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Rating</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Prime Filter */}
                  {productsData?.hasApiAccess && (
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="prime"
                        checked={primeOnly}
                        onCheckedChange={(checked) => setPrimeOnly(checked as boolean)}
                        data-testid="checkbox-prime"
                      />
                      <Label htmlFor="prime" className="text-sm">
                        Prime Eligible Only
                      </Label>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Status Alert */}
          {!productsData?.hasApiAccess && (
            <Alert className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Some details are omitted because live Amazon data isn't available. Links still support our site at no extra cost.
              </AlertDescription>
            </Alert>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product: Product) => (
                  <Card 
                    key={product.asin} 
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    data-testid={`product-card-${product.asin}`}
                  >
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        data-testid={`product-image-${product.asin}`}
                      />
                      
                      {/* Badges */}
                      {product.badges && product.badges.length > 0 && (
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.badges.map((badge) => (
                            <Badge key={badge} className={
                              badge === 'Prime' ? 'bg-blue-500 text-white' :
                              badge === 'Bestseller' ? 'bg-yellow-500 text-yellow-900' :
                              'bg-gray-500 text-white'
                            }>
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 flex-grow">
                        {product.title}
                      </h3>
                      
                      {/* Rating and Reviews */}
                      {productsData?.hasApiAccess && product.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {product.rating?.toFixed(1)}
                            {product.reviewCount && ` (${product.reviewCount})`}
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      {productsData?.hasApiAccess && product.price && (
                        <div className="mb-2">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {product.price}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Price and availability are accurate as of the indicated date/time and are subject to change.
                          </p>
                        </div>
                      )}

                      {/* Usage Tip */}
                      {product.usageTip && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
                          {product.usageTip}
                        </p>
                      )}

                      {/* Buy Button */}
                      <Button
                        onClick={() => handleProductClick(product)}
                        className="w-full mt-auto"
                        data-testid={`button-buy-${product.asin}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Buy on Amazon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Last Updated Timestamp */}
              {productsData?.lastUpdated && (
                <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Updated: {new Date(productsData.lastUpdated).toLocaleString()}
                </div>
              )}

              {/* No Results */}
              {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    No products found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setMinRating(undefined);
                      setPrimeOnly(false);
                      refetch();
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Disclosure */}
          <div className="mt-12 text-center">
            <Alert className="max-w-2xl mx-auto">
              <AlertDescription>
                <strong>Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases.
                This helps support our site at no extra cost to you.{' '}
                <button
                  onClick={() => setLocation('/disclosure')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  data-testid="link-disclosure"
                >
                  Learn more about our affiliate program
                </button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Cookie utilities
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}