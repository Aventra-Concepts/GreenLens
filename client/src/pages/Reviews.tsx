import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Calendar, Smartphone, Monitor } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Review must be at least 20 characters"),
  location: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review {
  id: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  location?: string;
  platform: string;
  isPublished: boolean;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

function StarRating({ rating, onRatingChange, readonly = false }: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            star <= rating 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-300 hover:text-yellow-400'
          } ${readonly ? 'cursor-default' : ''}`}
          onClick={() => !readonly && onRatingChange?.(star)}
          data-testid={`star-${star}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'web':
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{review.title}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={review.rating} readonly />
              <span className="text-sm text-gray-600">
                by {review.user?.firstName || 'Anonymous'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-3">{review.content}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {review.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{review.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              {getPlatformIcon(review.platform)}
              <span className="capitalize">{review.platform}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reviews() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: "",
      content: "",
      location: "",
    },
  });

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      // Get user's location from browser
      let detectedLocation = data.location;
      if (!detectedLocation && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          // Use reverse geocoding API or just coordinates
          detectedLocation = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
        } catch (error) {
          // Fallback to IP-based location detection or user input
          detectedLocation = data.location || 'Unknown Location';
        }
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          location: detectedLocation,
          platform: 'web',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. Your review will be published after moderation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      form.reset();
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User Reviews</h1>
          <p className="text-gray-600">
            Read what our users have to say about GreenLens and share your own experience.
          </p>
        </div>

        {/* Write Review Section */}
        {isAuthenticated && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Share Your Experience</CardTitle>
              <CardDescription>
                Help other plant lovers by sharing your experience with GreenLens
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showForm ? (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="write-review-button"
                >
                  Write a Review
                </Button>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <StarRating 
                              rating={field.value} 
                              onRatingChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Rate your overall experience with GreenLens
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Great plant identification app!"
                              {...field}
                              data-testid="review-title-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your experience with GreenLens..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="review-content-textarea"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., New York, USA"
                              {...field}
                              data-testid="review-location-input"
                            />
                          </FormControl>
                          <FormDescription>
                            Help others know where you're writing from
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        disabled={createReviewMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="submit-review-button"
                      >
                        {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowForm(false)}
                        data-testid="cancel-review-button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">All Reviews</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">
                  No reviews yet. Be the first to share your experience!
                </p>
                {isAuthenticated && !showForm && (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="mt-4 bg-green-600 hover:bg-green-700"
                  >
                    Write the First Review
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}