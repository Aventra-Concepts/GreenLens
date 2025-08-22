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
import { Settings, Image, Camera, Type, Save, DollarSign, Package, Shovel, Share2 } from "lucide-react";
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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="banner" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Banner Settings
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Feature Control
              </TabsTrigger>
              <TabsTrigger value="plant-id" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Plant ID Image
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

            <TabsContent value="plant-id">
              <PlantIdImageManager />
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

// Plant ID Image Manager Component
function PlantIdImageManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [plantIdFormData, setPlantIdFormData] = useState({
    imageType: "svg", // "svg" or "url"
    imageUrl: "",
    svgContent: ""
  });

  // Fetch current plant ID image settings
  const { data: plantIdSettings, isLoading: plantIdLoading } = useQuery<{
    imageType?: string;
    imageUrl?: string;
    svgContent?: string;
  }>({
    queryKey: ["/api/admin/plant-id-image-settings"],
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (plantIdSettings) {
      setPlantIdFormData({
        imageType: plantIdSettings.imageType || "svg",
        imageUrl: plantIdSettings.imageUrl || "",
        svgContent: plantIdSettings.svgContent || ""
      });
    }
  }, [plantIdSettings]);

  // Update plant ID image settings mutation
  const updatePlantIdImageMutation = useMutation({
    mutationFn: async (data: typeof plantIdFormData) => {
      const response = await apiRequest("POST", "/api/admin/plant-id-image-settings", {
        settingKey: "plantIdImage",
        settingValue: JSON.stringify(data),
        settingType: "json",
        category: "ui",
        description: "Plant identification page image settings",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plant-id-image-settings"] });
      toast({
        title: "Image Settings Updated",
        description: "Plant identification image has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update image settings",
        variant: "destructive",
      });
    },
  });

  const handlePlantIdInputChange = (key: string, value: string) => {
    setPlantIdFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePlantIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlantIdImageMutation.mutate(plantIdFormData);
  };

  const resetPlantIdToDefaults = () => {
    setPlantIdFormData({
      imageType: "svg",
      imageUrl: "",
      svgContent: ""
    });
    updatePlantIdImageMutation.mutate({
      imageType: "svg",
      imageUrl: "",
      svgContent: ""
    });
  };

  if (plantIdLoading) {
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
    <form onSubmit={handlePlantIdSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Plant Identification Illustration
          </CardTitle>
          <CardDescription>
            Customize the illustration shown on the plant identification page. You can use the default SVG design or upload a custom image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Type Selection */}
          <div className="space-y-3">
            <Label>Image Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="imageType"
                  value="svg"
                  checked={plantIdFormData.imageType === "svg"}
                  onChange={(e) => handlePlantIdInputChange("imageType", e.target.value)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">Default SVG Illustration</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="imageType"
                  value="url"
                  checked={plantIdFormData.imageType === "url"}
                  onChange={(e) => handlePlantIdInputChange("imageType", e.target.value)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm">Custom Image URL</span>
              </label>
            </div>
          </div>

          {/* Custom Image URL Input */}
          {plantIdFormData.imageType === "url" && (
            <div className="space-y-2">
              <Label htmlFor="plantIdImageUrl">Custom Image URL</Label>
              <Input
                id="plantIdImageUrl"
                type="url"
                placeholder="https://example.com/plant-scanner-image.jpg"
                value={plantIdFormData.imageUrl}
                onChange={(e) => handlePlantIdInputChange("imageUrl", e.target.value)}
                data-testid="plant-id-image-url-input"
              />
              <p className="text-sm text-gray-500">
                Recommended: 320x200px or larger for best quality. JPEG or PNG format.
              </p>
              
              {/* Image Preview */}
              {plantIdFormData.imageUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden max-w-md">
                    <img 
                      src={plantIdFormData.imageUrl} 
                      alt="Plant ID illustration preview" 
                      className="w-full h-auto max-h-48 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SVG Preview */}
          {plantIdFormData.imageType === "svg" && (
            <div className="space-y-2">
              <Label>Current SVG Illustration</Label>
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="flex justify-center">
                  <svg width="320" height="200" viewBox="0 0 320 200" className="border rounded-lg">
                    <rect width="320" height="200" fill="#f0fdf4" rx="8"/>
                    
                    <path d="M120 120 Q140 100 160 120 Q180 100 200 120" stroke="#16a34a" strokeWidth="2" fill="none" />
                    <circle cx="140" cy="110" r="8" fill="#22c55e" opacity="0.8" />
                    <circle cx="180" cy="110" r="6" fill="#4ade80" opacity="0.6" />
                    
                    <path d="M144 100 Q152 108 160 100 Q168 108 176 100" stroke="#15803d" strokeWidth="1" fill="none" />
                    <line x1="160" y1="100" x2="160" y2="115" stroke="#15803d" strokeWidth="1.5" />
                    
                    <rect x="132" y="135" width="56" height="6" rx="3" fill="#16a34a" opacity="0.8" />
                    <rect x="132" y="142" width="40" height="5" rx="2" fill="#22c55e" opacity="0.6" />
                    <rect x="132" y="148" width="48" height="5" rx="2" fill="#4ade80" opacity="0.4" />
                    
                    <line x1="105" y1="88" x2="125" y2="88" stroke="#22c55e" strokeWidth="1.5" opacity="0.7" />
                    <line x1="195" y1="104" x2="215" y2="104" stroke="#22c55e" strokeWidth="1.5" opacity="0.7" />
                    <line x1="105" y1="120" x2="125" y2="120" stroke="#16a34a" strokeWidth="1.5" opacity="0.5" />
                    <line x1="195" y1="136" x2="215" y2="136" stroke="#16a34a" strokeWidth="1.5" opacity="0.5" />
                    
                    <path d="M124 68 L124 76 M124 68 L132 68" stroke="#22c55e" strokeWidth="1.5" fill="none" />
                    <path d="M196 68 L188 68 M196 68 L196 76" stroke="#22c55e" strokeWidth="1.5" fill="none" />
                    <path d="M124 172 L124 164 M124 172 L132 172" stroke="#22c55e" strokeWidth="1.5" fill="none" />
                    <path d="M196 172 L188 172 M196 172 L196 164" stroke="#22c55e" strokeWidth="1.5" fill="none" />
                    
                    <text x="160" y="32" textAnchor="middle" fill="#16a34a" fontSize="14" fontWeight="bold">AI Plant Scanner</text>
                    <text x="160" y="48" textAnchor="middle" fill="#22c55e" fontSize="10">Instant Plant Identification</text>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Default SVG illustration with AI plant scanning theme
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetPlantIdToDefaults}
              data-testid="reset-plant-id-defaults-button"
            >
              Reset to Default
            </Button>
            <Button
              type="submit"
              disabled={updatePlantIdImageMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="save-plant-id-settings-button"
            >
              {updatePlantIdImageMutation.isPending ? (
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
        </CardContent>
      </Card>
    </form>
  );
}