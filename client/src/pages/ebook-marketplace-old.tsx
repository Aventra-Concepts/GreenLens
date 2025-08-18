import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, BookOpen, Star, Download, Globe, Users, Award, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  });

  const { data: featuredEbooks = [], isLoading: featuredLoading } = useQuery({
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
      {/* FIXED DESKTOP NAVIGATION - EXPLICIT AND VISIBLE */}
      <header className="w-full bg-white border-b-2 border-gray-300 shadow-lg" style={{ position: 'sticky', top: '0', zIndex: '9999' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* LEFT: Logo and Brand - BOLD AND VISIBLE */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">🌱</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GreenLens</h1>
                </div>
              </Link>
            </div>
            
            {/* CENTER: Desktop Navigation Menu - ALWAYS VISIBLE */}
            <nav className="flex items-center space-x-8 text-lg font-medium">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-100">
                Home
              </Link>
              <Link href="/identify" className="text-gray-700 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-100">
                Identify Plants
              </Link>
              <Link href="/ebook-marketplace" className="text-green-600 font-bold bg-green-50 px-3 py-2 rounded-md">
                E-book Marketplace
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-100">
                Pricing
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-green-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-100">
                Blog
              </Link>
            </nav>

            {/* RIGHT: Back Button - PROMINENT */}
            <Link href="/">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex items-center gap-3 text-lg font-medium border-2 border-gray-400 hover:border-green-600 hover:bg-green-50"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Compact & Elegant */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                E-book Marketplace
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Discover expert knowledge in gardening, agriculture, and sustainable farming. 
                Learn from professionals worldwide with our curated collection of e-books.
              </p>
              
              {/* Quick Stats */}
              <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span>1000+ E-books</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Expert Authors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span>Global Access</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search e-books by title, author, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2"
                data-testid="input-search"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={safeCategoryValue} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(categories as Category[]).map((category: Category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={safeSortValue} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* E-books Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
            {ebooksLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ))
            ) : ebooks.length > 0 ? (
              ebooks.map((ebook: Ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
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
      </div>
    </>
  );
}