import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Clock, Settings, Zap, BarChart3, Edit3, Trash2 } from "lucide-react";
import type { BlogPost, BlogCategory } from "@shared/schema";

interface AutoBlogConfig {
  enabled: boolean;
  postsPerDay: number;
  publishTime: string;
  lastGenerated: Date | null;
}

export default function AdminBlogManager() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch auto-blog configuration
  const { data: autoConfig, isLoading: configLoading } = useQuery<AutoBlogConfig>({
    queryKey: ["/api/blog/auto-config"],
  });

  // Fetch blog categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  // Fetch all blog posts
  const { data: allPosts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
  });

  // Update auto-blog configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<AutoBlogConfig>) => {
      const res = await apiRequest("PUT", "/api/blog/auto-config", config);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/auto-config"] });
      toast({
        title: "Configuration Updated",
        description: "Auto-blog settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate manual blog
  const generateBlogMutation = useMutation({
    mutationFn: async (categorySlug: string) => {
      const res = await apiRequest("POST", `/api/blog/generate-manual/${categorySlug}`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      toast({
        title: "Blog Generated",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete blog post
  const deleteBlogMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await apiRequest("DELETE", `/api/blog/posts/${postId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      toast({
        title: "Blog Deleted",
        description: "Blog post has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredPosts = allPosts.filter(post => {
    if (selectedCategory === "all") return true;
    const category = categories.find(cat => cat.id === post.categoryId);
    return category?.slug === selectedCategory;
  });

  const autoPosts = allPosts.filter(post => !post.authorId);
  const manualPosts = allPosts.filter(post => post.authorId);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (configLoading || categoriesLoading || postsLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading blog management panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Blog Management System
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage automated blog generation and edit existing content
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="auto-config">Auto Config</TabsTrigger>
          <TabsTrigger value="posts">Manage Posts</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Total Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allPosts.length}</div>
                <div className="text-xs text-gray-500">
                  {autoPosts.length} auto • {manualPosts.length} manual
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {autoConfig?.enabled ? 'Active' : 'Disabled'}
                </div>
                <div className="text-xs text-gray-500">
                  {autoConfig?.postsPerDay} posts/day at {autoConfig?.publishTime}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {autoConfig?.lastGenerated 
                    ? formatDate(autoConfig.lastGenerated)
                    : 'Never'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const categoryPosts = allPosts.filter(post => post.categoryId === category.id);
                  return (
                    <div key={category.id} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-lg mb-1">{category.icon}</div>
                      <div className="text-sm font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">{categoryPosts.length} posts</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Configuration Tab */}
        <TabsContent value="auto-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Auto-Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-enabled" className="text-base font-medium">
                    Enable Auto-Generation
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Automatically generate blog posts daily
                  </p>
                </div>
                <Switch
                  id="auto-enabled"
                  checked={autoConfig?.enabled || false}
                  onCheckedChange={(checked) => {
                    updateConfigMutation.mutate({ enabled: checked });
                  }}
                  data-testid="switch-auto-generation"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="posts-per-day">Posts Per Day</Label>
                  <Input
                    id="posts-per-day"
                    type="number"
                    min="1"
                    max="5"
                    value={autoConfig?.postsPerDay || 2}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 5) {
                        updateConfigMutation.mutate({ postsPerDay: value });
                      }
                    }}
                    data-testid="input-posts-per-day"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 1-3 posts per day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publish-time">Publish Time</Label>
                  <Input
                    id="publish-time"
                    type="time"
                    value={autoConfig?.publishTime || "09:00"}
                    onChange={(e) => {
                      updateConfigMutation.mutate({ publishTime: e.target.value });
                    }}
                    data-testid="input-publish-time"
                  />
                  <p className="text-xs text-gray-500">
                    Daily posting time (server timezone)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">All Blog Posts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Edit or delete existing blog posts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="category-filter">Filter by category:</Label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border rounded-md"
                data-testid="select-category-filter"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const category = categories.find(cat => cat.id === post.categoryId);
              const isAutoGenerated = !post.authorId;
              
              return (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{post.title}</h4>
                          {isAutoGenerated && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-Generated
                            </Badge>
                          )}
                          <Badge variant={post.published ? "default" : "outline"} className="text-xs">
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{category?.name}</span>
                          <span>{formatDate(post.createdAt!)}</span>
                          {post.tags && post.tags.length > 0 && (
                            <span>{post.tags.length} tags</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to edit page (to be implemented)
                            toast({
                              title: "Edit Feature",
                              description: "Blog editing interface coming soon!",
                            });
                          }}
                          data-testid={`button-edit-post-${post.id}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                              deleteBlogMutation.mutate(post.id);
                            }
                          }}
                          data-testid={`button-delete-post-${post.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Manual Blog Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Generate blog posts immediately for specific categories
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border-2 hover:border-green-300 transition-colors">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h4 className="font-semibold mb-1">{category.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          generateBlogMutation.mutate(category.slug);
                        }}
                        disabled={generateBlogMutation.isPending}
                        className="w-full"
                        data-testid={`button-generate-${category.slug}`}
                      >
                        {generateBlogMutation.isPending ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Generate Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}