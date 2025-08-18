import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Image, Type, Save, DollarSign, Package, Shovel, Share2 } from "lucide-react";
import PricingManagement from "@/components/PricingManagement";
import PricingPlanManager from "@/components/admin/PricingPlanManager";
import GardeningToolsManager from "@/components/admin/GardeningToolsManager";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication
  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem("adminAuthenticated");
    if (!isAdminAuthenticated) {
      setLocation("/admin-login");
      return;
    }
  }, [setLocation]);
  const [formData, setFormData] = useState({
    imageUrl: "",
    heading: "",
    subheading: ""
  });

  // Fetch current banner settings
  const { data: bannerSettings, isLoading } = useQuery<{
    imageUrl?: string;
    heading?: string;
    subheading?: string;
  }>({
    queryKey: ["/api/admin/banner-settings"],
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (bannerSettings) {
      setFormData({
        imageUrl: bannerSettings.imageUrl || "",
        heading: bannerSettings.heading || "",
        subheading: bannerSettings.subheading || ""
      });
    }
  }, [bannerSettings]);

  // Update banner settings mutation
  const updateBannerMutation = useMutation({
    mutationFn: async (settings: { imageUrl?: string; heading?: string; subheading?: string }) => {
      const response = await fetch("/api/admin/banner-settings", {
        method: "POST",
        body: JSON.stringify(settings),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update banner settings");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Banner Updated",
        description: "Banner settings have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banner-settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBannerMutation.mutate(formData);
  };

  const resetToDefaults = () => {
    setFormData({
      imageUrl: "",
      heading: "Accurately Identify Your Plant With Our GreenLens-Powered AI System",
      subheading: "Upload a plant photo and get Instant Plant Identification"
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage banner content, pricing, and system settings
            </p>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/dashboard")}
                className="flex items-center gap-2"
                data-testid="nav-admin-dashboard"
              >
                <Settings className="w-4 h-4" />
                User Management
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/blog")}
                className="flex items-center gap-2"
                data-testid="nav-admin-blog"
              >
                <Type className="w-4 h-4" />
                Blog Manager
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/social-media")}
                className="flex items-center gap-2"
                data-testid="nav-admin-social"
              >
                <Share2 className="w-4 h-4" />
                Social Media
              </Button>
            </div>
          </div>

          <Tabs defaultValue="banner" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="banner" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Banner Settings
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Feature Control
              </TabsTrigger>
              <TabsTrigger value="gardening" className="flex items-center gap-2">
                <Shovel className="w-4 h-4" />
                Gardening Tools
              </TabsTrigger>
              <TabsTrigger value="pricing-plans" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pricing Plans
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing Settings
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Social Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="banner">
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Image Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Banner Background Image
                </CardTitle>
                <CardDescription>
                  Set a custom background image for the main banner. Leave empty to use the default botanical image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                      data-testid="banner-image-url-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Use a high-resolution image (1920x1080 or larger) for best results
                    </p>
                  </div>
                  
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img 
                          src={formData.imageUrl} 
                          alt="Banner preview" 
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Banner Text Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Banner Text Content
                </CardTitle>
                <CardDescription>
                  Customize the main heading and subheading text displayed on the banner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="heading">Main Heading</Label>
                    <Textarea
                      id="heading"
                      placeholder="Accurately Identify Your Plant With Our GreenLens-Powered AI System"
                      value={formData.heading}
                      onChange={(e) => handleInputChange("heading", e.target.value)}
                      rows={3}
                      data-testid="banner-heading-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Use "GreenLens-Powered AI" for automatic green highlighting
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="subheading">Subheading</Label>
                    <Input
                      id="subheading"
                      placeholder="Upload a plant photo and get Instant Plant Identification"
                      value={formData.subheading}
                      onChange={(e) => handleInputChange("subheading", e.target.value)}
                      data-testid="banner-subheading-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={resetToDefaults}
                data-testid="reset-defaults-button"
              >
                Reset to Defaults
              </Button>
              <Button
                type="submit"
                disabled={updateBannerMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="save-banner-settings-button"
              >
                {updateBannerMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
              </form>
            </TabsContent>

            <TabsContent value="features">
              <FeatureControlManager />
            </TabsContent>

            <TabsContent value="gardening">
              <GardeningToolsManager />
            </TabsContent>

            <TabsContent value="pricing-plans">
              <PricingPlanManager />
            </TabsContent>

            <TabsContent value="pricing">
              <PricingManagement />
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Social Media Management
                  </CardTitle>
                  <CardDescription>
                    Manage social media accounts, posts, and analytics from the dedicated social media dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        Advanced Social Media Features
                      </h3>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Manage Facebook, WhatsApp, Instagram, and Twitter accounts</li>
                        <li>• Create and schedule posts across all platforms</li>
                        <li>• View analytics and engagement metrics</li>
                        <li>• Configure automatic cross-posting settings</li>
                        <li>• Monitor social media activity and responses</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setLocation("/admin/social-media")}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        data-testid="navigate-social-media-button"
                      >
                        <Share2 className="w-4 h-4" />
                        Open Social Media Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

// Feature Control Manager Component
function FeatureControlManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current feature settings
  const { data: featureSettings, isLoading } = useQuery<{
    gardeningShopEnabled?: boolean;
    ebookMarketplaceEnabled?: boolean;
  }>({
    queryKey: ["/api/admin/feature-settings"],
  });

  // Update feature settings mutation
  const updateFeatureMutation = useMutation({
    mutationFn: async (settings: { key: string; value: boolean }) => {
      const response = await apiRequest("POST", "/api/admin/feature-settings", {
        settingKey: settings.key,
        settingValue: settings.value.toString(),
        settingType: "boolean",
        category: "features",
        description: `Enable/disable ${settings.key} feature`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feature-settings"] });
      toast({
        title: "Settings Updated",
        description: "Feature settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update feature settings",
        variant: "destructive",
      });
    },
  });

  const handleFeatureToggle = (featureKey: string, enabled: boolean) => {
    updateFeatureMutation.mutate({ key: featureKey, value: enabled });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Feature Control
          </CardTitle>
          <CardDescription>
            Enable or disable specific platform features for users. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gardening Tools Shop Control */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Gardening Tools Shop</h3>
              <p className="text-sm text-gray-600 mt-1">
                Allow users to browse and purchase gardening tools and equipment from the dedicated shop page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {featureSettings?.gardeningShopEnabled ? "Enabled" : "Disabled"}
              </span>
              <Button
                variant={featureSettings?.gardeningShopEnabled ? "destructive" : "default"}
                size="sm"
                onClick={() => handleFeatureToggle("gardeningShopEnabled", !featureSettings?.gardeningShopEnabled)}
                disabled={updateFeatureMutation.isPending}
                data-testid="toggle-gardening-shop"
              >
                {featureSettings?.gardeningShopEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>

          {/* E-Books Control */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">E-Books</h3>
              <p className="text-sm text-gray-600 mt-1">
                Allow users to browse and purchase gardening and plant care e-books.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {featureSettings?.ebookMarketplaceEnabled ? "Enabled" : "Disabled"}
              </span>
              <Button
                variant={featureSettings?.ebookMarketplaceEnabled ? "destructive" : "default"}
                size="sm"
                onClick={() => handleFeatureToggle("ebookMarketplaceEnabled", !featureSettings?.ebookMarketplaceEnabled)}
                disabled={updateFeatureMutation.isPending}
                data-testid="toggle-ebook-marketplace"
              >
                {featureSettings?.ebookMarketplaceEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Gardening Tools Shop: <span className="font-medium">
                  {featureSettings?.gardeningShopEnabled ? "Active" : "Inactive"}
                </span>
              </li>
              <li>
                • E-Books: <span className="font-medium">
                  {featureSettings?.ebookMarketplaceEnabled ? "Active" : "Inactive"}
                </span>
              </li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Users will only see enabled features in the navigation and can only access enabled shop sections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}