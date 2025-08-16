import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export default function BlogPreviewSection() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog'],
    select: (data) => data?.slice(0, 3), // Only show first 3 posts
  });

  const samplePosts = [
    {
      id: 'sample-1',
      title: 'The Complete Guide to Watering Your Houseplants',
      excerpt: 'Learn the essential watering techniques that will keep your indoor plants healthy and thriving. From soil moisture testing to seasonal adjustments...',
      category: 'Care Tips',
      createdAt: new Date().toISOString(),
      slug: 'watering-houseplants-guide'
    },
    {
      id: 'sample-2', 
      title: 'Common Houseplant Diseases and How to Treat Them',
      excerpt: 'Identify early warning signs of plant diseases and discover effective treatment methods to save your precious plants from common ailments...',
      category: 'Disease Guide',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      slug: 'houseplant-diseases-treatment'
    },
    {
      id: 'sample-3',
      title: 'Understanding Light Requirements for Indoor Plants', 
      excerpt: 'Master the art of providing optimal lighting conditions for your houseplants. Learn about different light types and how to position plants...',
      category: 'Light Guide',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      slug: 'indoor-plant-lighting-guide'
    }
  ];

  const displayPosts = posts && posts.length > 0 ? posts : samplePosts;

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'care tips': return 'bg-green-100 text-green-800';
      case 'disease guide': return 'bg-red-100 text-red-800';
      case 'light guide': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="blog" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Plant Care Insights</h2>
          <p className="text-lg text-gray-600">Expert tips and guides to help your plants thrive</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post: any) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <div className="text-4xl">
                    {post.category?.toLowerCase().includes('disease') ? '🦠' : 
                     post.category?.toLowerCase().includes('light') ? '☀️' : '🌱'}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <Badge 
                      variant="secondary" 
                      className={getCategoryColor(post.category)}
                    >
                      {post.category || 'General'}
                    </Badge>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  )}
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center transition-colors"
                    data-testid={`read-more-${post.slug}`}
                  >
                    Read More
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button 
              className="bg-green-500 hover:bg-green-600 px-8 py-3"
              data-testid="view-all-articles-button"
            >
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
