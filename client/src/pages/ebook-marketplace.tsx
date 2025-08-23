import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, BookOpen, Star, Download, Globe, Users, Award, Home, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const sort = urlParams.get('sortBy');
    
    if (category) setSelectedCategory(category);
    if (sort) setSortBy(sort);
  }, []);

  // Fetch ebooks with proper error handling
  const { data: ebooks = [], isLoading: ebooksLoading, error: ebooksError } = useQuery({
    queryKey: ['/api/ebooks', searchTerm, selectedCategory, sortBy, priceFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm || '',
        category: selectedCategory || 'all',
        sortBy: sortBy || 'popularity',
        priceFilter: priceFilter || 'all',
      });
      const response = await fetch(`/api/ebooks?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ebooks');
      }
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/ebook-categories'],
    queryFn: async () => {
      const response = await fetch('/api/ebook-categories');
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Get student discount info
  const { data: studentProfile } = useQuery({
    queryKey: ['/api/student-profile'],
    queryFn: async () => {
      const response = await fetch('/api/student-profile');
      if (!response.ok) return null;
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
        <div className="space-y-1">
          <div className="text-sm font-bold text-green-600">${discountedPrice.toFixed(2)}</div>
          <div className="text-xs text-gray-500 line-through">${price.toFixed(2)}</div>
          <Badge variant="secondary" className="text-xs">Student</Badge>
        </div>
      );
    }
    return <div className="text-sm font-bold text-gray-900">${price.toFixed(2)}</div>;
  };

  const EbookCard = ({ ebook }: { ebook: Ebook }) => (
    <Link href={`/ebooks/${ebook.id}`}>
      <Card className="h-80 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-sm" data-testid={`card-ebook-${ebook.id}`}>
        <CardContent className="p-3 h-full flex flex-col">
          {/* Book Cover */}
          <div className="aspect-[3/4] relative mb-3 overflow-hidden rounded-md bg-gray-100">
            <img
              src={ebook.coverImageUrl || '/placeholder-book-cover.jpg'}
              alt={ebook.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-testid={`img-cover-${ebook.id}`}
            />
            {ebook.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1">
                Featured
              </Badge>
            )}
          </div>
          
          {/* Book Info */}
          <div className="flex-1 flex flex-col space-y-2">
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-green-600 transition-colors leading-tight" data-testid={`text-title-${ebook.id}`}>
              {ebook.title}
            </h3>
            
            <p className="text-xs text-gray-600 truncate" data-testid={`text-author-${ebook.id}`}>
              by {ebook.authorName}
            </p>
            
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(ebook.averageRating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({ebook.totalRatings})</span>
            </div>
            
            {/* Price */}
            <div className="mt-auto pt-2">
              {formatPrice(ebook.basePrice)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <Layout showSidebarAds={false}>

      {/* HERO SECTION - COMPACT */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            E-Books
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover expert knowledge in gardening, agriculture, and sustainable farming. 
            Learn from professionals worldwide with our curated collection of e-books.
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span>1000+ E-books</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span>Expert Authors</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span>Global Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search e-books by title, author, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Category Filter */}
            <Select value={selectedCategory || "all"} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories as Category[]).map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort Filter */}
            <Select value={sortBy || "popularity"} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-sort">
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
          </div>
        </div>

        {/* ERROR HANDLING */}
        {ebooksError && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">Error loading e-books</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* EBOOKS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-12">
          {ebooksLoading ? (
            // Loading Skeletons
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
            ))
          ) : ebooks.length > 0 ? (
            // Ebook Cards
            ebooks.map((ebook: Ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} />
            ))
          ) : (
            // Empty State
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No e-books found</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse different categories.
              </p>
            </div>
          )}
        </div>

        {/* AUTHOR CTA SECTION */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Are you an expert author?</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Share your knowledge with the world and earn from your expertise. Join our global community of agricultural and gardening experts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
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
    </Layout>
  );
}