import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Download, Globe, Award, Home, ArrowLeft, Flower } from "lucide-react";
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

export default function FlowerGardeningPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [priceFilter, setPriceFilter] = useState("all");

  const { data: ebooks = [], isLoading: ebooksLoading } = useQuery({
    queryKey: ['/api/ebooks', searchTerm, 'flower-gardening', sortBy, priceFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        category: 'flower-gardening',
        sortBy,
        priceFilter,
      });
      const response = await fetch(`/api/ebooks?${params}`);
      return response.json();
    },
  });

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) {
      return <span className="text-green-600 font-semibold">Free</span>;
    }
    return <span className="text-lg font-semibold">${numPrice.toFixed(2)}</span>;
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
      {/* Navigation Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link 
                href="/" 
                className="hover:text-green-600 transition-colors"
                data-testid="link-home"
              >
                <span>Home</span>
              </Link>
              <span>/</span>
              <Link 
                href="/ebook-marketplace" 
                className="hover:text-green-600 transition-colors"
                data-testid="link-marketplace"
              >
                <span>E-Book Marketplace</span>
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Flower Gardening</span>
            </nav>
            
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-back-home">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/ebook-marketplace">
                <Button variant="ghost" size="sm" data-testid="button-back-marketplace">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Flower className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Flower Gardening</h1>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Ornamental and flower garden design. Create stunning floral displays and beautiful garden landscapes.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search flower gardening e-books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="under-10">Under $10</SelectItem>
                  <SelectItem value="10-25">$10 - $25</SelectItem>
                  <SelectItem value="over-25">Over $25</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {ebooksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                  <div className="bg-gray-200 h-3 rounded w-full"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : ebooks.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Found {ebooks.length} e-book{ebooks.length !== 1 ? 's' : ''} in Flower Gardening
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ebooks.map((ebook) => (
                <EbookCard key={ebook.id} ebook={ebook} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Flower className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No e-books found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Link href="/ebook-marketplace">
              <Button variant="outline">
                Browse All Categories
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}