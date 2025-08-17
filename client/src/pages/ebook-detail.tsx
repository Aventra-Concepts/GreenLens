import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Star, 
  Download, 
  Globe, 
  Calendar, 
  FileText, 
  Shield, 
  Users, 
  Heart, 
  Share2,
  ShoppingCart,
  BookOpen,
  Award,
  MessageSquare,
  ThumbsUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EbookDetail {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorBio?: string;
  authorProfileImageUrl?: string;
  description: string;
  category: string;
  basePrice: string;
  coverImageUrl: string;
  previewFileUrl?: string;
  fileFormat: string;
  fileSize: string;
  pageCount: number;
  language: string;
  isbn?: string;
  copyrightStatus: string;
  publicationDate: string;
  lastUpdated: string;
  averageRating: number;
  totalRatings: number;
  downloadCount: number;
  tags: string[];
  tableOfContents?: string[];
  publishedAt: Date;
  isFeatured: boolean;
  isActive: boolean;
  targetAudience: string;
  prerequisites?: string[];
}

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  reviewTitle: string;
  reviewContent: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
}

interface StudentDiscount {
  hasDiscount: boolean;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
}

interface EbookDetailProps {
  id: string;
}

export default function EbookDetail({ id }: EbookDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: ebook, isLoading } = useQuery({
    queryKey: ['/api/ebooks', id],
    queryFn: async () => {
      const response = await fetch(`/api/ebooks/${id}`);
      if (!response.ok) throw new Error('E-book not found');
      return response.json();
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['/api/ebooks', id, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/ebooks/${id}/reviews`);
      return response.json();
    },
    enabled: !!id,
  });

  const { data: studentDiscount } = useQuery({
    queryKey: ['/api/student-discount', id],
    queryFn: async () => {
      const response = await fetch(`/api/student-discount/${id}`);
      return response.json();
    },
    enabled: !!user && !!id,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/ebooks/${id}/purchase`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.downloadUrl) {
        // Direct download
        window.open(data.downloadUrl, '_blank');
        toast({
          title: "Purchase successful!",
          description: "Your e-book download has started.",
        });
      } else if (data.paymentUrl) {
        // Redirect to payment
        window.location.href = data.paymentUrl;
      }
      queryClient.invalidateQueries({ queryKey: ['/api/ebooks', id] });
    },
    onError: (error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/ebooks/${id}/wishlist`);
    },
    onSuccess: () => {
      toast({
        title: "Added to wishlist",
        description: "This e-book has been added to your wishlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add to wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="md:col-span-2">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-2">E-book not found</h1>
          <p className="text-gray-500 mb-4">The e-book you're looking for doesn't exist or has been removed.</p>
          <Link href="/ebook-marketplace">
            <Button className="bg-green-600 hover:bg-green-700">
              Browse E-books
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = () => {
    const price = parseFloat(ebook.basePrice);
    if (studentDiscount?.hasDiscount) {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-green-600">
            ${studentDiscount.discountedPrice.toFixed(2)}
          </span>
          <span className="text-lg text-gray-500 line-through">
            ${studentDiscount.originalPrice.toFixed(2)}
          </span>
          <Badge variant="secondary" className="text-sm w-fit">
            {studentDiscount.discountPercentage}% Student Discount
          </Badge>
        </div>
      );
    }
    return <span className="text-2xl font-bold">${price.toFixed(2)}</span>;
  };

  const renderStars = (rating: number, size: string = "w-4 h-4") => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/ebook-marketplace" className="hover:text-green-600">E-books</Link>
          <span>/</span>
          <span className="text-gray-900">{ebook.title}</span>
        </nav>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Book Cover & Purchase */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="aspect-[3/4] relative mb-6">
                  <img
                    src={ebook.coverImageUrl || '/placeholder-book-cover.jpg'}
                    alt={ebook.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    data-testid={`img-cover-${ebook.id}`}
                  />
                  {ebook.isFeatured && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500">
                      <Award className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {formatPrice()}
                </div>

                {/* Purchase Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    onClick={() => purchaseMutation.mutate()}
                    disabled={purchaseMutation.isPending || !user}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    data-testid="button-purchase"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {purchaseMutation.isPending ? 'Processing...' : 'Buy Now'}
                  </Button>

                  {ebook.previewFileUrl && (
                    <Button variant="outline" className="w-full" size="lg">
                      <FileText className="w-4 h-4 mr-2" />
                      Preview Sample
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => addToWishlistMutation.mutate()}
                    disabled={addToWishlistMutation.isPending || !user}
                    className="w-full"
                    data-testid="button-wishlist"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>

                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 mb-2">
                      <Link href="/auth" className="text-blue-600 hover:underline">
                        Sign in
                      </Link> to purchase this e-book
                    </p>
                  </div>
                )}

                {/* Book Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{ebook.fileFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-medium">{ebook.pageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium">{ebook.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{ebook.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="font-medium">
                      {new Date(ebook.publicationDate).toLocaleDateString()}
                    </span>
                  </div>
                  {ebook.isbn && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ISBN:</span>
                      <span className="font-medium">{ebook.isbn}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Share & Actions */}
                <div className="flex justify-center gap-4">
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Book Information */}
          <div className="md:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3" data-testid="text-title">
                {ebook.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <Link href={`/authors/${ebook.authorId}`} className="flex items-center gap-3 hover:opacity-80">
                  {ebook.authorProfileImageUrl && (
                    <img
                      src={ebook.authorProfileImageUrl}
                      alt={ebook.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{ebook.authorName}</p>
                    <p className="text-sm text-gray-600">Author</p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(ebook.averageRating)}
                  <span className="font-semibold">{ebook.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">({ebook.totalRatings} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Download className="w-4 h-4" />
                  <span>{ebook.downloadCount.toLocaleString()} downloads</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{ebook.category}</Badge>
                <Badge variant="outline">{ebook.targetAudience}</Badge>
                {ebook.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contents">Contents</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="author">Author</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6" data-testid="text-description">
                      {ebook.description}
                    </p>

                    {ebook.prerequisites && ebook.prerequisites.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Prerequisites</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {ebook.prerequisites.map((prereq: string, index: number) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                      <div>
                        <h4 className="font-semibold mb-3">Publication Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Copyright:</span>
                            <span>{ebook.copyrightStatus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated:</span>
                            <span>{new Date(ebook.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Table of Contents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ebook.tableOfContents && ebook.tableOfContents.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2">
                        {ebook.tableOfContents.map((chapter: string, index: number) => (
                          <li key={index} className="text-gray-700">{chapter}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-gray-500">Table of contents not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Reviews ({reviews.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review: Review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold">{review.reviewerName}</span>
                                  {review.isVerifiedPurchase && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-gray-600">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.reviewTitle && (
                              <h4 className="font-semibold mb-2">{review.reviewTitle}</h4>
                            )}
                            <p className="text-gray-700 mb-3">{review.reviewContent}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <button className="flex items-center gap-1 hover:text-green-600">
                                <ThumbsUp className="w-3 h-3" />
                                Helpful ({review.helpfulVotes})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet. Be the first to review this e-book!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="author" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Author</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4 mb-6">
                      {ebook.authorProfileImageUrl && (
                        <img
                          src={ebook.authorProfileImageUrl}
                          alt={ebook.authorName}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{ebook.authorName}</h3>
                        <Link href={`/authors/${ebook.authorId}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {ebook.authorBio ? (
                      <p className="text-gray-700 leading-relaxed">{ebook.authorBio}</p>
                    ) : (
                      <p className="text-gray-500">Author biography not available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related E-books */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">More books in {ebook.category}</h2>
          {/* This would be populated by a separate query for related books */}
          <div className="text-center py-8 text-gray-500">
            Related e-books coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}