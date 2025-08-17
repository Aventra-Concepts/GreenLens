import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Tag, ArrowRight, Home } from "lucide-react";
import { Link } from "wouter";
import type { BlogCategory, BlogPost } from "@shared/schema";
import Navigation from "@/components/Navigation";

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
      {/* Navigation */}
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 dark:bg-gray-800 dark:hover:bg-green-900 dark:border-green-700 dark:text-green-300" data-testid="button-back-home">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
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

          {/* Category Tabs - Organized */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <div className="space-y-4">
              {/* All Categories Tab */}
              <div className="flex justify-center">
                <TabsList className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
                  <TabsTrigger value="all" className="text-sm font-medium px-4 py-2">
                    📚 All Categories
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Organized Category Groups */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Plant Care Group */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center">
                    <span className="mr-2">🌱</span>Plant Care & Gardening
                  </h4>
                  <TabsList className="grid grid-cols-2 gap-1 h-auto p-1 bg-white/50 dark:bg-gray-800/50">
                    {categories
                      .filter(cat => ['indoor-plants', 'outdoor-plants', 'fruiting-plants', 'flowering-plants', 'decorative-plants', 'non-flowering-plants'].includes(cat.slug))
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.slug}
                          className="text-xs flex items-center gap-1 p-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-800 dark:data-[state=active]:text-green-100"
                          data-testid={`tab-category-${category.slug}`}
                        >
                          <span>{category.icon}</span>
                          <span className="hidden sm:inline text-xs">{category.name.replace(' Plants', '')}</span>
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </div>

                {/* Agriculture Group */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center">
                    <span className="mr-2">🌾</span>Agriculture & Farming
                  </h4>
                  <TabsList className="grid grid-cols-3 gap-1 h-auto p-1 bg-white/50 dark:bg-gray-800/50">
                    {categories
                      .filter(cat => ['agri-crops', 'seeds', 'agri-tools'].includes(cat.slug))
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.slug}
                          className="text-xs flex items-center gap-1 p-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 dark:data-[state=active]:bg-amber-800 dark:data-[state=active]:text-amber-100"
                          data-testid={`tab-category-${category.slug}`}
                        >
                          <span>{category.icon}</span>
                          <span className="hidden sm:inline text-xs">{category.name.replace('Agricultural ', '')}</span>
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </div>

                {/* Health & Safety Group */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center">
                    <span className="mr-2">🛡️</span>Health & Safety
                  </h4>
                  <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-1 h-auto p-1 bg-white/50 dark:bg-gray-800/50">
                    {categories
                      .filter(cat => ['fertilizers', 'disinfectants', 'first-aid-toxicity'].includes(cat.slug))
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.slug}
                          className="text-xs flex flex-col items-center gap-1 p-2 min-h-[60px] data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-800 dark:data-[state=active]:text-blue-100"
                          data-testid={`tab-category-${category.slug}`}
                        >
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-xs text-center leading-tight">
                            {category.slug === 'first-aid-toxicity' ? 'First Aid' : category.name}
                          </span>
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </div>
              </div>
            </div>
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

        {/* Organized Categories Overview Section */}
        <div className="mt-16 space-y-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Expert Content Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive guides organized by expertise to help you succeed with your plants and gardening goals
            </p>
          </div>

          {/* Plant Care & Gardening Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full px-6 py-3 flex items-center">
                <span className="text-2xl mr-3">🌱</span>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">Plant Care & Gardening</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories
                .filter(cat => ['indoor-plants', 'outdoor-plants', 'fruiting-plants', 'flowering-plants', 'decorative-plants', 'non-flowering-plants'].includes(cat.slug))
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                  <Card 
                    key={category.id} 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-100 hover:border-green-300 dark:border-green-800 dark:hover:border-green-600"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                        {category.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-700 dark:group-hover:text-green-300">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          {filteredPosts.filter(post => post.categoryId === category.id).length} articles
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white hover:bg-green-50 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 dark:bg-gray-800 dark:hover:bg-green-900 dark:border-green-700 dark:text-green-300"
                        onClick={() => setSelectedCategory(category.slug)}
                        data-testid={`button-category-${category.slug}`}
                      >
                        Explore Guides
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Agriculture & Farming Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full px-6 py-3 flex items-center">
                <span className="text-2xl mr-3">🌾</span>
                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300">Agriculture & Farming</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories
                .filter(cat => ['agri-crops', 'seeds', 'agri-tools'].includes(cat.slug))
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                  <Card 
                    key={category.id} 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-100 hover:border-amber-300 dark:border-amber-800 dark:hover:border-amber-600"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                        {category.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                          {filteredPosts.filter(post => post.categoryId === category.id).length} articles
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white hover:bg-amber-50 border-amber-200 hover:border-amber-300 text-amber-700 hover:text-amber-800 dark:bg-gray-800 dark:hover:bg-amber-900 dark:border-amber-700 dark:text-amber-300"
                        onClick={() => setSelectedCategory(category.slug)}
                        data-testid={`button-category-${category.slug}`}
                      >
                        Explore Guides
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Health & Safety Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full px-6 py-3 flex items-center">
                <span className="text-2xl mr-3">🛡️</span>
                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Plant Health & Safety</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {categories
                .filter(cat => ['fertilizers', 'disinfectants', 'first-aid-toxicity'].includes(cat.slug))
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                  <Card 
                    key={category.id} 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-100 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-600 min-h-[280px] flex flex-col"
                  >
                    <CardContent className="p-6 text-center flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                          {category.icon}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 line-height-tight">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                      <div className="space-y-4 mt-auto pt-4">
                        <div className="flex items-center justify-center">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {filteredPosts.filter(post => post.categoryId === category.id).length} articles
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 dark:bg-gray-800 dark:hover:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
                          onClick={() => setSelectedCategory(category.slug)}
                          data-testid={`button-category-${category.slug}`}
                        >
                          Explore Guides
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}