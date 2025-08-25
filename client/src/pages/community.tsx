import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertCommunityPostSchema, type InsertCommunityPostType, type CommunityPost, type User } from '@shared/schema';
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  MessageCircle, 
  Eye, 
  Search, 
  Filter,
  Leaf,
  Users,
  Recycle,
  Palette,
  HelpCircle,
  Lightbulb,
  BookOpen,
  MapPin,
  Calendar,
  Tag,
  Image as ImageIcon,
  Send
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CommunityPostWithUser extends CommunityPost {
  user: User;
  isLiked?: boolean;
}

export default function Community() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const form = useForm<InsertCommunityPostType>({
    resolver: zodResolver(insertCommunityPostSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      tags: [],
      location: '',
      telegramId: '',
      emailContact: '',
      isBarterPost: false,
      barterType: undefined,
      plantSpecies: '',
    }
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the community.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch community posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/community/posts', selectedCategory, sortBy, searchTerm],
    enabled: isAuthenticated,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: InsertCommunityPostType) => {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      setShowCreatePost(false);
      form.reset();
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to toggle like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    },
  });

  const categories = [
    { value: 'all', label: 'All Posts', icon: Users },
    { value: 'experience', label: 'Experiences', icon: BookOpen },
    { value: 'plant_barter', label: 'Plant Barter', icon: Recycle },
    { value: 'green_revolution', label: 'Green Revolution', icon: Leaf },
    { value: 'decoration', label: 'Decoration', icon: Palette },
    { value: 'tips', label: 'Tips & Tricks', icon: Lightbulb },
    { value: 'questions', label: 'Questions', icon: HelpCircle },
    { value: 'general', label: 'General', icon: MessageCircle },
  ];

  const onSubmit = (data: InsertCommunityPostType) => {
    createPostMutation.mutate(data);
  };

  const handleLike = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex flex-col gap-3">
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit px-3 py-2 border border-green-600 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    data-testid="button-back-home"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    Plant Community
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                    Share experiences, barter plants, and promote the green revolution
                  </p>
                </div>
              </div>
            </div>
              
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" data-testid="button-create-post">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Community Post</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter post title..." {...field} data-testid="input-post-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-post-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.slice(1).map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
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
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your plant experiences, tips, or barter requests... (No phone numbers allowed - use Telegram ID or email only)"
                              className="min-h-[120px]"
                              {...field}
                              data-testid="textarea-post-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Barter Post Section */}
                    <FormField
                      control={form.control}
                      name="isBarterPost"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Plant Barter Post</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              This is a plant trading/exchange post
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-barter-post"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch('isBarterPost') && (
                      <>
                        <FormField
                          control={form.control}
                          name="barterType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Barter Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-barter-type">
                                    <SelectValue placeholder="Select barter type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="offering">Offering plants</SelectItem>
                                  <SelectItem value="seeking">Seeking plants</SelectItem>
                                  <SelectItem value="exchange">Exchange/Trade</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="plantSpecies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plant Species</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Monstera Deliciosa, Snake Plant..." {...field} value={field.value || ''} data-testid="input-plant-species" />
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
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Your city/area for local trades..." {...field} value={field.value || ''} data-testid="input-location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="telegramId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telegram ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="@username or telegram_id" {...field} data-testid="input-telegram-id" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="emailContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="contact@email.com" {...field} value={field.value || ''} data-testid="input-contact-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowCreatePost(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={createPostMutation.isPending}
                        data-testid="button-submit-post"
                      >
                        {createPostMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-posts"
                  />
                </div>
              </div>
              
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 w-full h-auto p-1">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <TabsTrigger
                        key={category.value}
                        value={category.value}
                        className="text-xs xs:text-sm flex flex-col xs:flex-row items-center gap-1 p-2 h-auto min-h-[3rem] xs:min-h-[2.5rem]"
                        data-testid={`tab-${category.value}`}
                      >
                        <IconComponent className="h-3 w-3 xs:h-4 xs:w-4" />
                        <span className="text-[10px] xs:text-xs lg:text-sm leading-tight text-center xs:text-left">{category.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="discussed">Most Discussed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Community Posts */}
          <div className="space-y-6">
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p>Loading community posts...</p>
              </div>
            ) : !posts || (posts as any[]).length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Be the first to share your plant journey with the community!
                </p>
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-create-first-post"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </div>
            ) : (
              (posts as CommunityPostWithUser[]).map((post: CommunityPostWithUser) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow mx-2 sm:mx-0">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.user.profileImageUrl || ''} />
                          <AvatarFallback>
                            {post.user.firstName?.[0]}{post.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {post.user.firstName} {post.user.lastName}
                            </h3>
                            <Badge variant="secondary">
                              {categories.find(c => c.value === post.category)?.label || post.category}
                            </Badge>
                            {post.isBarterPost && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Recycle className="h-3 w-3 mr-1" />
                                Barter
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Calendar className="h-3 w-3" />
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                            {post.location && (
                              <>
                                <MapPin className="h-3 w-3 ml-2" />
                                {post.location}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg sm:text-xl mt-2 sm:mt-0">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                      
                      {post.isBarterPost && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            Plant Barter Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            {post.barterType && (
                              <div>
                                <span className="font-medium">Type:</span> {post.barterType}
                              </div>
                            )}
                            {post.plantSpecies && (
                              <div>
                                <span className="font-medium">Species:</span> {post.plantSpecies}
                              </div>
                            )}
                            {(post.telegramId || post.emailContact) && (
                              <div>
                                <span className="font-medium">Contact:</span>{' '}
                                {post.telegramId && `Telegram: ${post.telegramId}`}
                                {post.telegramId && post.emailContact && ' | '}
                                {post.emailContact}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                            data-testid={`button-like-${post.id}`}
                          >
                            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likeCount}
                          </Button>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MessageCircle className="h-4 w-4" />
                            {post.commentCount}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Eye className="h-4 w-4" />
                            {post.viewCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}