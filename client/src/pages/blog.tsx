import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog'],
  });

  return (
    <Layout>
      
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">🌱 Plant Care Blog</h1>
            <p className="text-base text-gray-600">Expert tips and guides to help your plants thrive</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-72">
                  <Skeleton className="w-full h-32" />
                  <div className="p-4">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {posts?.map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-72 group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <div className="text-3xl">🌱</div>
                    </div>
                    <CardContent className="p-4 h-40 flex flex-col">
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {post.category || 'General'}
                        </Badge>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-xs line-clamp-3 mb-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="text-green-600 hover:text-green-700 font-medium text-xs flex items-center mt-auto">
                        Read More
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {posts && posts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-600">Check back soon for plant care tips and guides!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </Layout>
  );
}
