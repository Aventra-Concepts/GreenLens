import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Tag, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { BlogCategory, BlogPost } from "@shared/schema";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch blog categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  // Fetch all blog posts
  const { data: allPosts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
  });

  // Filter posts based on search and category
  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
      post.categoryId === categories.find(cat => cat.slug === selectedCategory)?.id;
    
    return matchesSearch && matchesCategory && post.published;
  });

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (categoriesLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading blog content...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            GreenLens Plant & Agriculture Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Expert guides, tips, and insights for plant care, agriculture, and gardening from our certified specialists
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-blog-search"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2 h-auto p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                All Categories
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.slug}
                  className="text-xs md:text-sm flex items-center gap-1"
                  data-testid={`tab-category-${category.slug}`}
                >
                  <span>{category.icon}</span>
                  <span className="hidden md:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search or browse different categories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const category = categories.find(cat => cat.id === post.categoryId);
              return (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border-green-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    {category && (
                      <Badge variant="secondary" className="w-fit mb-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {category.icon} {category.name}
                      </Badge>
                    )}
                    <CardTitle className="text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.createdAt!)}
                        </div>
                        {post.authorId && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Author
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" className="w-full group-hover:bg-green-50 dark:group-hover:bg-green-900 border-green-200 dark:border-green-700" data-testid={`button-read-post-${post.slug}`}>
                        Read Article
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Categories Overview Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Explore Our Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-green-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {category.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    onClick={() => setSelectedCategory(category.slug)}
                    data-testid={`button-category-${category.slug}`}
                  >
                    Browse Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}