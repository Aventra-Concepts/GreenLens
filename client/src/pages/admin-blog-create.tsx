import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save, Eye, FileText, Calendar, Tag, Image, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Layout from "@/components/Layout";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be less than 100 characters"),
  excerpt: z.string().min(1, "Excerpt is required").max(500, "Excerpt must be less than 500 characters"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  published: z.boolean().default(false),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export default function AdminBlogCreate() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Check admin authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isAdmin) {
            setIsAuthenticated(true);
            return;
          }
        }
        
        setLocation("/admin-login");
      } catch (error) {
        setLocation("/admin-login");
      }
    };
    
    checkAuth();
  }, [setLocation]);

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      categoryId: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      featuredImageUrl: "",
      published: false,
    },
  });

  // Fetch blog categories
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
    enabled: isAuthenticated,
  });

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle && !form.getValues("slug")) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchTitle, form]);

  // Create blog post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const response = await apiRequest("POST", "/api/blog/posts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Created",
        description: "Your blog post has been created successfully.",
      });
      setLocation('/admin-dashboard?tab=content');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogPostFormData) => {
    createPostMutation.mutate(data);
  };

  const handleSaveDraft = () => {
    const data = form.getValues();
    data.published = false;
    onSubmit(data);
  };

  const handlePublish = () => {
    const data = form.getValues();
    data.published = true;
    onSubmit(data);
  };

  if (!isAuthenticated) {
    return null;
  }

  const formData = form.watch();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/admin-dashboard?tab=content')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Blog Post</h1>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-300">
                Create engaging content for your blog audience
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>
          </div>

          {!previewMode ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Post Content
                        </CardTitle>
                        <CardDescription>
                          Write your blog post content and basic information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your blog post title..." 
                                  {...field}
                                  className="text-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Slug *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="url-friendly-slug" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of your post (will be shown in search results and social media)"
                                  rows={3}
                                  {...field}
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
                              <FormLabel>Content *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Write your blog post content here..."
                                  rows={20}
                                  className="font-mono"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Publishing */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Publishing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={handleSaveDraft}
                            variant="outline"
                            disabled={createPostMutation.isPending}
                            className="w-full"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Draft
                          </Button>
                          <Button
                            type="button"
                            onClick={handlePublish}
                            disabled={createPostMutation.isPending}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Publish Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Categories & Tags */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="w-5 h-5" />
                          Organization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        <span>{category.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="gardening, plants, tips (comma separated)" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="w-5 h-5" />
                          Featured Image
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="featuredImageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/image.jpg" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          SEO Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="SEO title (defaults to post title)" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="SEO description (defaults to excerpt)"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </form>
            </Form>
          ) : (
            /* Preview Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="space-y-2">
                      {formData.categoryId && (
                        <Badge variant="outline">
                          {categories.find(c => c.id === formData.categoryId)?.name}
                        </Badge>
                      )}
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formData.title || "Untitled Post"}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        {formData.excerpt || "No excerpt provided"}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formData.featuredImageUrl && (
                      <img 
                        src={formData.featuredImageUrl} 
                        alt="Featured" 
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <div className="prose max-w-none">
                      {formData.content ? (
                        <div className="whitespace-pre-wrap">
                          {formData.content}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No content provided</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Status: </span>
                      <Badge variant={formData.published ? "default" : "secondary"}>
                        {formData.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Slug: </span>
                      <span className="text-sm font-mono">{formData.slug || "not-set"}</span>
                    </div>
                    {formData.tags && (
                      <div>
                        <span className="font-medium">Tags: </span>
                        <span className="text-sm">{formData.tags}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}