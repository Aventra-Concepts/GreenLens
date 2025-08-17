import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, BookOpen, Star, Download, Globe, Users, Award } from "lucide-react";
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

  const formatPrice = (basePrice: string) => {
    const price = parseFloat(basePrice);
    if (user?.userType === 'student' && user?.studentStatus === 'verified') {
      const discountedPrice = price * 0.8; // 20% student discount
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
    <Card className="h-full hover:shadow-lg transition-shadow" data-testid={`card-ebook-${ebook.id}`}>
      <CardHeader className="p-4">
        <div className="aspect-[3/4] relative mb-3">
          <img
            src={ebook.coverImageUrl || '/placeholder-book-cover.jpg'}
            alt={ebook.title}
            className="w-full h-full object-cover rounded-md"
            data-testid={`img-cover-${ebook.id}`}
          />
          {ebook.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500">
              <Award className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-semibold line-clamp-2" data-testid={`text-title-${ebook.id}`}>
          {ebook.title}
        </CardTitle>
        <CardDescription className="text-xs text-gray-600" data-testid={`text-author-${ebook.id}`}>
          by {ebook.authorName}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(ebook.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            ({ebook.totalRatings} reviews)
          </span>
        </div>
        <p className="text-xs text-gray-700 line-clamp-2 mb-2" data-testid={`text-description-${ebook.id}`}>
          {ebook.description}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">{ebook.category}</Badge>
          <Badge variant="outline" className="text-xs">{ebook.fileFormat}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Download className="w-3 h-3" />
          <span>{ebook.downloadCount} downloads</span>
          <Globe className="w-3 h-3" />
          <span>{ebook.language}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          {formatPrice(ebook.basePrice)}
          <Link href={`/ebooks/${ebook.id}`}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid={`button-view-${ebook.id}`}>
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Global E-book Marketplace</h1>
            <p className="text-xl mb-8">Discover thousands of gardening and agriculture e-books from expert authors worldwide</p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold">5,000+</div>
                <div className="text-sm opacity-90">E-books Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">200+</div>
                <div className="text-sm opacity-90">Expert Authors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm opacity-90">Countries</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search e-books by title, author, or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 text-lg"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Student Benefits Banner */}
        {user?.userType === 'student' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Student Benefits Active</h3>
                <p className="text-blue-700">
                  {user.studentStatus === 'verified' 
                    ? 'Enjoy 20% discount on all e-books as a verified student!'
                    : 'Complete your student verification to unlock 20% discounts on all e-books.'
                  }
                </p>
              </div>
              {user.studentStatus !== 'verified' && (
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue />
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
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger data-testid="select-price">
                <SelectValue />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEbooks.slice(0, 4).map((ebook: Ebook) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-[400px] animate-pulse">
                  <CardHeader className="p-4">
                    <div className="aspect-[3/4] bg-gray-200 rounded-md mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : ebooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ebooks.map((ebook: Ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No e-books found</h3>
              <p className="text-gray-500">
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
  );
}