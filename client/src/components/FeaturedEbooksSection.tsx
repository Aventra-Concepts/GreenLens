import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Award, ArrowRight } from "lucide-react";

interface Ebook {
  id: string;
  title: string;
  authorName: string;
  description: string;
  category: string;
  basePrice: string;
  coverImageUrl: string;
  averageRating: number;
  totalRatings: number;
  downloadCount: number;
  isFeatured: boolean;
}

export function FeaturedEbooksSection() {
  const { data: featuredEbooks = [], isLoading } = useQuery({
    queryKey: ['/api/ebooks/featured'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/ebooks/featured?limit=6');
        if (!response.ok) {
          console.error('Failed to fetch featured ebooks:', response.status);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching featured ebooks:', error);
        return [];
      }
    },
  });

  const EbookCard = ({ ebook }: { ebook: Ebook }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1" data-testid={`card-featured-ebook-${ebook.id}`}>
      <CardHeader className="p-4">
        <div className="aspect-[3/4] relative mb-3">
          <img
            src={ebook.coverImageUrl || '/placeholder-book-cover.jpg'}
            alt={ebook.title}
            className="w-full h-full object-cover rounded-md"
            data-testid={`img-featured-cover-${ebook.id}`}
          />
          <Badge className="absolute top-2 right-2 bg-yellow-500">
            <Award className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
        <CardTitle className="text-sm font-semibold line-clamp-2" data-testid={`text-featured-title-${ebook.id}`}>
          {ebook.title}
        </CardTitle>
        <CardDescription className="text-xs text-gray-600">
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
            ({ebook.totalRatings})
          </span>
        </div>
        <p className="text-xs text-gray-700 line-clamp-2 mb-2">
          {ebook.description}
        </p>
        <Badge variant="outline" className="text-xs">{ebook.category}</Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold text-green-600">${parseFloat(ebook.basePrice).toFixed(2)}</span>
          <Link href={`/ebooks/${ebook.id}`}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid={`button-view-featured-${ebook.id}`}>
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <section className="py-16 bg-white" data-testid="section-featured-ebooks-loading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-[400px] animate-pulse">
                <CardHeader className="p-4">
                  <div className="aspect-[3/4] bg-gray-200 rounded-md mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Ensure featuredEbooks is an array before processing
  const ebooksArray = Array.isArray(featuredEbooks) ? featuredEbooks : [];
  
  if (ebooksArray.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white" data-testid="section-featured-ebooks">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-green-600" />
            Featured E-books
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked collection of premium gardening and agriculture e-books from expert authors worldwide
          </p>
        </div>

        {/* E-books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {ebooksArray.slice(0, 6).map((ebook: Ebook) => (
            <EbookCard key={ebook.id} ebook={ebook} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/ebook-marketplace">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-browse-all-ebooks">
              Browse All E-books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">5,000+</div>
              <div className="text-sm text-gray-600">E-books Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">200+</div>
              <div className="text-sm text-gray-600">Expert Authors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Countries Served</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Global Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}