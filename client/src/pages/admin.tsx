import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Image, Type, Save } from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
              Manage banner content and appearance settings
            </p>
          </div>

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
        </div>
      </div>
    </Layout>
  );
}