import { useState, useEffect } from "react";
import { LazyImage } from "@/components/performance/LazyImage";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Search, Filter, Download, BookOpen, DollarSign, Globe, MapPin, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Ebook {
  id: string;
  title: string;
  description: string;
  authorName: string;
  categoryId: string;
  price: number;
  currency: string;
  language: string;
  coverImageUrl?: string;
  pages: number;
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  tags: string[];
  status: string;
}

interface EbookCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface EbookFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  language: string;
  sort: string;
}

export default function ShopPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<EbookFilters>({
    search: "",
    category: "",
    minPrice: 0,
    maxPrice: 100,
    language: "",
    sort: "newest"
  });

  // Debounce search input for performance
  const debouncedSearch = useDebounce(filters.search, 300);

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{countryCode: string} | null>(null);

  // Fetch user location for geographic filtering
  const { data: locationData } = useQuery({
    queryKey: ["/api/geographic/user-location"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/geographic/available-ebooks");
      const data = await response.json();
      return data.userLocation;
    },
    refetchOnWindowFocus: false
  });

  // Update user location when available
  useEffect(() => {
    if (locationData && !userLocation) {
      setUserLocation(locationData);
    }
  }, [locationData, userLocation]);

  // Fetch e-books with geographic filtering and other filters
  const { data: ebooksData, isLoading: ebooksLoading } = useQuery({
    queryKey: ["/api/geographic/available-ebooks", debouncedSearch, filters.category, filters.minPrice, filters.maxPrice, filters.language, filters.sort, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearch,
        category: filters.category,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        language: filters.language,
        sort: filters.sort,
        page: currentPage.toString(),
        limit: "12"
      });
      
      const response = await apiRequest("GET", `/api/geographic/available-ebooks?${params}`);
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/ebook-categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ebook-categories");
      return response.json();
    }
  });

  // Purchase e-book mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ ebookId, email }: { ebookId: string; email: string }) => {
      const response = await apiRequest("POST", `/api/ebooks/${ebookId}/purchase`, { email });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `E-book purchased successfully. Download link has been sent to your email.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong with your purchase.",
        variant: "destructive",
      });
    }
  });

  const handleFilterChange = (key: keyof EbookFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePurchase = (ebookId: string) => {
    const email = prompt("Please enter your email address for purchase confirmation:");
    if (email) {
      purchaseMutation.mutate({ ebookId, email });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  if (ebooksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading e-books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            E-book Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover comprehensive gardening guides, plant care manuals, and botanical references from expert authors worldwide.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                data-testid="search-ebooks"
                placeholder="Search e-books by title, author, or keyword..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger data-testid="select-category" className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((category: EbookCategory) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
              <SelectTrigger data-testid="select-sort" className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="sales">Best Selling</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              data-testid="button-toggle-filters"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      data-testid="input-min-price"
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", parseInt(e.target.value) || 0)}
                    />
                    <Input
                      data-testid="input-max-price"
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", parseInt(e.target.value) || 100)}
                    />
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <Select value={filters.language} onValueChange={(value) => handleFilterChange("language", value)}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    data-testid="button-clear-filters"
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        search: "",
                        category: "",
                        minPrice: 0,
                        maxPrice: 100,
                        language: "",
                        sort: "newest"
                      });
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {ebooksData ? `Showing ${ebooksData.ebooks?.length || 0} of ${ebooksData.totalCount || 0} results` : 'Loading...'}
          </p>
        </div>

        {/* E-books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {ebooksData?.ebooks?.map((ebook: Ebook) => (
            <Card key={ebook.id} data-testid={`card-ebook-${ebook.id}`} className="h-full flex flex-col">
              <CardHeader className="p-4">
                {/* Cover Image */}
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  {ebook.coverImageUrl ? (
                    <LazyImage
                      src={ebook.coverImageUrl}
                      alt={ebook.title}
                      className="w-full h-full object-cover rounded-lg"
                      placeholderClassName="bg-gray-200 dark:bg-gray-700"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {ebook.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  by {ebook.authorName}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0 flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {ebook.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {renderStars(ebook.averageRating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({ebook.totalReviews} reviews)
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>{ebook.pages} pages</span>
                  <span>{ebook.totalSales} sold</span>
                </div>

                {/* Tags */}
                {ebook.tags && ebook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ebook.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <div className="w-full">
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(ebook.price, ebook.currency)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ebook.language.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    data-testid={`button-purchase-${ebook.id}`}
                    onClick={() => handlePurchase(ebook.id)}
                    disabled={purchaseMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {purchaseMutation.isPending ? "Processing..." : "Purchase & Download"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {ebooksData?.ebooks?.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No e-books found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search filters to find more results.
            </p>
            <Button
              data-testid="button-clear-search"
              onClick={() => {
                setFilters({
                  search: "",
                  category: "",
                  minPrice: 0,
                  maxPrice: 100,
                  language: "",
                  sort: "newest"
                });
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {ebooksData?.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              data-testid="button-prev-page"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, ebooksData.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    data-testid={`button-page-${page}`}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              data-testid="button-next-page"
              variant="outline"
              disabled={currentPage === ebooksData.totalPages}
              onClick={() => setCurrentPage(prev => Math.min(ebooksData.totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}