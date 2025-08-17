import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['/api/blog', slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-1/3" />
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
                <p className="text-gray-600 mb-6">The blog post you're looking for could not be found.</p>
                <Link href="/blog">
                  <Button>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          <article>
            <header className="mb-8">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <Badge variant="secondary">{post.category || 'General'}</Badge>
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </header>

            <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-8">
              <div className="text-8xl">🌱</div>
            </div>

            <Card>
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg max-w-none prose-green prose-headings:text-gray-900 prose-a:text-green-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>
          </article>
        </div>
      </section>

      <Footer />
    </Layout>
  );
}
