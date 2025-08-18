import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, BookOpen, Star, Download, Globe, Users, Award, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";

interface Ebook {
  id: string;
  title: string;
  authorId: string;
  authorName?: string;
  description: string;
  category: string;
  basePrice: string;
  coverImageUrl: string;
  fileFormat: string;
  copyrightStatus: string;
  averageRating: number;
  totalRatings: number;
  downloadCount: number;
  tags: string[];
  language: string;
  publishedAt: Date;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function EbookMarketplace() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Ensure these values are never empty strings to prevent Select component errors
  const safeCategoryValue = selectedCategory || "all";
  const safeSortValue = sortBy || "popularity";
  const safePriceValue = priceFilter || "all";

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const featured = urlParams.get('featured');
    const sort = urlParams.get('sortBy');
    
    if (category) setSelectedCategory(category);
    if (featured === 'true') setSortBy('featured');
    if (sort) setSortBy(sort);
  }, []);

  const { data: ebooks = [], isLoading: ebooksLoading } = useQuery({
    queryKey: ['/api/ebooks', searchTerm, selectedCategory, sortBy, priceFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        priceFilter,
      });
      const response = await fetch(`/api/ebooks?${params}`);
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/ebook-categories'],
    queryFn: async () => {
      const response = await fetch('/api/ebook-categories');
      return response.json();
    },
  });

  const { data: featuredEbooks = [] } = useQuery({
    queryKey: ['/api/ebooks/featured'],
    queryFn: async () => {
      const response = await fetch('/api/ebooks/featured');
      return response.json();
    },
  });

  // Get student discount info
  const { data: studentProfile } = useQuery({
    queryKey: ['/api/student-profile'],
    queryFn: async () => {
      const response = await fetch('/api/student-profile');
      return response.json();
    },
    enabled: !!user,
  });

  const formatPrice = (basePrice: string) => {
    const price = parseFloat(basePrice);
    if (studentProfile?.verificationStatus === 'verified') {
      const discountPercentage = parseFloat(studentProfile.discountPercentage) / 100;
      const discountedPrice = price * (1 - discountPercentage);
      return (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-green-600">${discountedPrice.toFixed(2)}</span>
          <span className="text-sm text-gray-500 line-through">${price.toFixed(2)}</span>
          <Badge variant="secondary" className="text-xs w-fit">Student Discount</Badge>
        </div>
      );
    }
    return <span className="text-lg font-bold">${price.toFixed(2)}</span>;
  };

  const EbookCard = ({ ebook }: { ebook: Ebook }) => (
    <Link href={`/ebooks/${ebook.id}`}>
      <Card className="h-64 group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer" data-testid={`card-ebook-${ebook.id}`}>
        <div className="p-3 h-full flex flex-col">
          <div className="aspect-[3/4] relative mb-2 flex-shrink-0">
            <img
              src={ebook.coverImageUrl || '/placeholder-book-cover.jpg'}
              alt={ebook.title}
              className="w-full h-full object-cover rounded-sm"
              data-testid={`img-cover-${ebook.id}`}
            />
            {ebook.isFeatured && (
              <Badge className="absolute top-1 right-1 bg-yellow-500 text-xs px-1 py-0.5">
                ⭐
              </Badge>
            )}
          </div>
          
          <div className="flex-1 min-h-0 flex flex-col">
            <h3 className="text-xs font-medium line-clamp-2 mb-1 group-hover:text-green-600 transition-colors" data-testid={`text-title-${ebook.id}`}>
              {ebook.title}
            </h3>
            <p className="text-xs text-gray-500 mb-1 truncate" data-testid={`text-author-${ebook.id}`}>
              {ebook.authorName}
            </p>
            
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.floor(ebook.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({ebook.totalRatings})
              </span>
            </div>
            
            <div className="mt-auto">
              <div className="text-xs font-semibold text-green-600">
                {formatPrice(ebook.basePrice)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );

  return (
    <>
      {/* DIRECT NAVIGATION - GUARANTEED TO WORK */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌱</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">GreenLens</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
                Home
              </Link>
              <Link href="/identify" className="text-gray-600 hover:text-green-600 transition-colors">
                Identify Plants
              </Link>
              <Link href="/ebook-marketplace" className="text-green-600 font-medium">
                E-book Marketplace
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                Pricing
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-green-600 transition-colors">
                Blog
              </Link>
            </nav>

            {/* Back Button */}
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="min-h-screen bg-gray-50">

      {/* Hero Section - Compact & Elegant */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-3">📚 E-book Marketplace</h1>
            <p className="text-lg mb-6">Expert gardening & agriculture knowledge from worldwide authors</p>
            
            {/* Quick Stats - Compact */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold">5,000+</div>
                <div className="text-xs opacity-90">E-books</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">200+</div>
                <div className="text-xs opacity-90">Authors</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">50+</div>
                <div className="text-xs opacity-90">Countries</div>
              </div>
            </div>

            {/* Search Bar - Compact */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search e-books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-base"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Student Benefits Banner */}
        {studentProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Student Benefits Active</h3>
                <p className="text-blue-700">
                  {studentProfile.verificationStatus === 'verified' 
                    ? `Enjoy ${studentProfile.discountPercentage}% discount on all e-books as a verified student!`
                    : 'Complete your student verification to unlock discounts on all e-books.'
                  }
                </p>
              </div>
              {studentProfile.verificationStatus !== 'verified' && (
                <Link href="/student-verification">
                  <Button variant="outline" size="sm">Complete Verification</Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white rounded-lg shadow">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={safeCategoryValue} onValueChange={(value) => setSelectedCategory(value || "all")}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter((category: Category) => category && category.slug && category.slug.trim() !== '')
                  .map((category: Category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select value={safeSortValue} onValueChange={(value) => setSortBy(value || "popularity")}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-2">Price Range</label>
            <Select value={safePriceValue} onValueChange={(value) => setPriceFilter(value || "all")}>
              <SelectTrigger data-testid="select-price">
                <SelectValue placeholder="Filter by price..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="under_10">Under $10</SelectItem>
                <SelectItem value="10_25">$10 - $25</SelectItem>
                <SelectItem value="25_50">$25 - $50</SelectItem>
                <SelectItem value="over_50">Over $50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured E-books */}
        {featuredEbooks.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Featured E-books
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {featuredEbooks.slice(0, 6).map((ebook: Ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))}
            </div>
          </div>
        )}

        {/* E-books Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'All E-books'}
            </h2>
            <div className="text-sm text-gray-600" data-testid="text-results-count">
              {ebooks.length} e-books found
            </div>
          </div>

          {ebooksLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="h-64 animate-pulse">
                  <div className="p-3">
                    <div className="aspect-[3/4] bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : ebooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {ebooks.map((ebook: Ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No e-books found</h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search criteria or browse different categories.
              </p>
            </div>
          )}
        </div>

        {/* Author CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Are you an expert author?</h3>
          <p className="text-lg mb-6">
            Share your knowledge with the world and earn from your expertise. Join our global community of agricultural and gardening experts.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/author-registration">
              <Button variant="secondary" size="lg" data-testid="button-become-author">
                Become an Author
              </Button>
            </Link>
            <Link href="/author-guidelines">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                View Guidelines
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}