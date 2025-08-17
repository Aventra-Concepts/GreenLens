import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Facebook, Instagram, MessageCircle, Calendar, Send, Settings, BarChart3, Users } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

const socialPostSchema = z.object({
  platform: z.enum(["facebook", "twitter", "instagram", "whatsapp"]),
  content: z.string().min(1, "Content is required").max(2800, "Content too long"),
  imageUrl: z.string().optional(),
  scheduledFor: z.string().optional(),
  hashtags: z.string().optional(),
});

const socialSettingsSchema = z.object({
  facebookPageId: z.string().optional(),
  facebookAccessToken: z.string().optional(),
  twitterApiKey: z.string().optional(),
  twitterApiSecret: z.string().optional(),
  twitterAccessToken: z.string().optional(),
  twitterAccessTokenSecret: z.string().optional(),
  instagramUserId: z.string().optional(),
  instagramAccessToken: z.string().optional(),
  whatsappBusinessNumber: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
});

type SocialPostForm = z.infer<typeof socialPostSchema>;
type SocialSettingsForm = z.infer<typeof socialSettingsSchema>;

export default function AdminSocialMedia() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("facebook");

  // Fetch social media settings
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/social-settings"],
  });

  // Fetch social media posts
  const { data: posts = [] } = useQuery({
    queryKey: ["/api/admin/social-posts"],
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/social-analytics"],
  });

  const postForm = useForm<SocialPostForm>({
    resolver: zodResolver(socialPostSchema),
    defaultValues: {
      platform: "facebook",
      content: "",
      imageUrl: "",
      scheduledFor: "",
      hashtags: "",
    },
  });

  const settingsForm = useForm<SocialSettingsForm>({
    resolver: zodResolver(socialSettingsSchema),
    defaultValues: settings || {},
  });

  // Update form defaults when settings are loaded
  useEffect(() => {
    if (settings) {
      settingsForm.reset(settings);
    }
  }, [settings, settingsForm]);

  const createPostMutation = useMutation({
    mutationFn: async (data: SocialPostForm) => {
      const response = await apiRequest("POST", "/api/admin/social-posts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Social media post has been created successfully.",
      });
      postForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SocialSettingsForm) => {
      const response = await apiRequest("PUT", "/api/admin/social-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Social media settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/admin/social-posts/${postId}/publish`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Published",
        description: "Social media post has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/social-posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreatePost = (data: SocialPostForm) => {
    createPostMutation.mutate(data);
  };

  const onUpdateSettings = (data: SocialSettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "twitter":
        return <FaXTwitter className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "bg-blue-500";
      case "twitter":
        return "bg-black";
      case "instagram":
        return "bg-pink-500";
      case "whatsapp":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Layout showImageBanner={false} showSidebarAds={false}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Social Media Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your social media presence across all platforms
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="create">Create Post</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Followers</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.totalFollowers || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posts This Month</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.postsThisMonth || 0}
                      </p>
                    </div>
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics?.engagementRate || "0"}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Posts</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {posts.filter((post: any) => post.status === 'scheduled').length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Status */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["facebook", "twitter", "instagram", "whatsapp"].map((platform) => (
                    <div key={platform} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${getPlatformColor(platform)} text-white`}>
                        {getPlatformIcon(platform)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{platform}</p>
                        <Badge variant={settings?.[`${platform}AccessToken`] ? "default" : "secondary"}>
                          {settings?.[`${platform}AccessToken`] ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...postForm}>
                  <form onSubmit={postForm.handleSubmit(onCreatePost)} className="space-y-4">
                    <FormField
                      control={postForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {["facebook", "twitter", "instagram", "whatsapp"].map((platform) => (
                                <Button
                                  key={platform}
                                  type="button"
                                  variant={field.value === platform ? "default" : "outline"}
                                  className="flex items-center space-x-2"
                                  onClick={() => field.onChange(platform)}
                                  data-testid={`platform-${platform}`}
                                >
                                  {getPlatformIcon(platform)}
                                  <span className="capitalize">{platform}</span>
                                </Button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your post content here..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="post-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="hashtags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hashtags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="#greenlens #plants #gardening"
                              {...field}
                              data-testid="post-hashtags"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              data-testid="post-image-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="scheduledFor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule For (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              data-testid="post-schedule"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={createPostMutation.isPending}
                        data-testid="create-post-button"
                      >
                        {createPostMutation.isPending ? "Creating..." : "Create Post"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => postForm.reset()}
                        data-testid="reset-form-button"
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No posts created yet</p>
                  ) : (
                    posts.map((post: any) => (
                      <div key={post.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${getPlatformColor(post.platform)} text-white`}>
                              {getPlatformIcon(post.platform)}
                            </div>
                            <span className="font-medium capitalize">{post.platform}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status}
                            </Badge>
                            {post.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => publishPostMutation.mutate(post.id)}
                                disabled={publishPostMutation.isPending}
                                data-testid={`publish-post-${post.id}`}
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                        {post.hashtags && (
                          <p className="text-blue-600 dark:text-blue-400 text-sm">{post.hashtags}</p>
                        )}
                        {post.scheduledFor && (
                          <p className="text-gray-500 text-sm">
                            Scheduled for: {new Date(post.scheduledFor).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media API Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onUpdateSettings)} className="space-y-6">
                    {/* Facebook Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <Facebook className="w-5 h-5 text-blue-500" />
                        <span>Facebook</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="facebookPageId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Page ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Facebook Page ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="facebookAccessToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your Facebook Access Token" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Twitter Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <FaXTwitter className="w-5 h-5" />
                        <span>Twitter</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="twitterApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your Twitter API Key" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="twitterApiSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Secret</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your Twitter API Secret" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="twitterAccessToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your Twitter Access Token" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="twitterAccessTokenSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token Secret</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your Twitter Access Token Secret" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Instagram Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span>Instagram</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="instagramUserId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Instagram User ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="instagramAccessToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your Instagram Access Token" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* WhatsApp Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        <span>WhatsApp Business</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="whatsappBusinessNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your WhatsApp Business Number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="whatsappAccessToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your WhatsApp Access Token" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      data-testid="save-settings-button"
                    >
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}