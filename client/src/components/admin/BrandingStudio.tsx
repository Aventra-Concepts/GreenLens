import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Palette, 
  Upload, 
  Download, 
  Save, 
  RefreshCw, 
  Image, 
  Type, 
  Layout, 
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Paintbrush,
  Settings
} from "lucide-react";

interface BrandingSettings {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
  tagline: string;
  description: string;
  footerText: string;
  customCss: string;
  enableDarkMode: boolean;
  enableCustomFonts: boolean;
  fontFamily: string;
  heroImageUrl: string;
  bannerText: string;
  showBanner: boolean;
  bannerType: 'info' | 'warning' | 'success' | 'error';
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  customJs: string;
  enableMaintenanceMode: boolean;
  maintenanceMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandingPreview {
  desktop: string;
  tablet: string;
  mobile: string;
}

export default function BrandingStudio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState('colors');

  // Fetch current branding settings
  const { data: brandingSettings, isLoading, refetch } = useQuery<BrandingSettings>({
    queryKey: ["/api/admin/branding/settings"],
  });

  // Fetch preview images
  const { data: previewData } = useQuery<BrandingPreview>({
    queryKey: ["/api/admin/branding/preview"],
    refetchInterval: 30000,
  });

  // Update branding settings
  const updateBrandingMutation = useMutation({
    mutationFn: async (settings: Partial<BrandingSettings>) => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('PUT', '/api/admin/branding/settings', {
        ...settings,
        adminToken: token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      toast({
        title: "Branding Updated",
        description: "Brand settings have been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update branding settings",
        variant: "destructive",
      });
    }
  });

  // Generate preview
  const generatePreviewMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('POST', '/api/admin/branding/generate-preview', {
        adminToken: token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding/preview"] });
      toast({
        title: "Preview Generated",
        description: "New preview has been generated",
      });
    }
  });

  const handleSettingUpdate = (field: keyof BrandingSettings, value: any) => {
    if (!brandingSettings) return;
    
    const updatedSettings = {
      ...brandingSettings,
      [field]: value
    };
    
    updateBrandingMutation.mutate({ [field]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Branding Studio</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your platform's visual identity and branding
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => generatePreviewMutation.mutate()}
            disabled={generatePreviewMutation.isPending}
            className="flex items-center gap-2"
            data-testid="generate-preview"
          >
            <Eye className="w-4 h-4" />
            {generatePreviewMutation.isPending ? "Generating..." : "Preview"}
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="refresh-branding"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="xl:col-span-2">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Color Palette
                  </CardTitle>
                  <CardDescription>
                    Define your brand's color scheme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={brandingSettings?.primaryColor || "#22c55e"}
                          onChange={(e) => handleSettingUpdate('primaryColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                          data-testid="input-primary-color"
                        />
                        <Input
                          value={brandingSettings?.primaryColor || "#22c55e"}
                          onChange={(e) => handleSettingUpdate('primaryColor', e.target.value)}
                          placeholder="#22c55e"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={brandingSettings?.secondaryColor || "#16a34a"}
                          onChange={(e) => handleSettingUpdate('secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                          data-testid="input-secondary-color"
                        />
                        <Input
                          value={brandingSettings?.secondaryColor || "#16a34a"}
                          onChange={(e) => handleSettingUpdate('secondaryColor', e.target.value)}
                          placeholder="#16a34a"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="accent-color"
                          type="color"
                          value={brandingSettings?.accentColor || "#3b82f6"}
                          onChange={(e) => handleSettingUpdate('accentColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                          data-testid="input-accent-color"
                        />
                        <Input
                          value={brandingSettings?.accentColor || "#3b82f6"}
                          onChange={(e) => handleSettingUpdate('accentColor', e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode Support</Label>
                        <p className="text-sm text-gray-600">Enable dark mode toggle for users</p>
                      </div>
                      <Switch
                        checked={brandingSettings?.enableDarkMode || false}
                        onCheckedChange={(checked) => handleSettingUpdate('enableDarkMode', checked)}
                        data-testid="switch-dark-mode"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Brand Assets
                  </CardTitle>
                  <CardDescription>
                    Upload and manage your brand assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {brandingSettings?.logoUrl ? (
                          <img
                            src={brandingSettings.logoUrl}
                            alt="Company Logo"
                            className="max-h-20 mx-auto mb-2"
                          />
                        ) : (
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        )}
                        <Button variant="outline" size="sm" data-testid="upload-logo">
                          Upload Logo
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Favicon</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {brandingSettings?.faviconUrl ? (
                          <img
                            src={brandingSettings.faviconUrl}
                            alt="Favicon"
                            className="w-8 h-8 mx-auto mb-2"
                          />
                        ) : (
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        )}
                        <Button variant="outline" size="sm" data-testid="upload-favicon">
                          Upload Favicon
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hero Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {brandingSettings?.heroImageUrl ? (
                        <img
                          src={brandingSettings.heroImageUrl}
                          alt="Hero Image"
                          className="max-h-32 mx-auto mb-2 rounded"
                        />
                      ) : (
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      )}
                      <Button variant="outline" size="sm" data-testid="upload-hero">
                        Upload Hero Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Brand Content
                  </CardTitle>
                  <CardDescription>
                    Configure your brand messaging and content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={brandingSettings?.companyName || ""}
                      onChange={(e) => handleSettingUpdate('companyName', e.target.value)}
                      placeholder="Your Company Name"
                      data-testid="input-company-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={brandingSettings?.tagline || ""}
                      onChange={(e) => handleSettingUpdate('tagline', e.target.value)}
                      placeholder="Your company tagline"
                      data-testid="input-tagline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={brandingSettings?.description || ""}
                      onChange={(e) => handleSettingUpdate('description', e.target.value)}
                      placeholder="Brief description of your company"
                      rows={3}
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Footer Text</Label>
                    <Textarea
                      id="footer-text"
                      value={brandingSettings?.footerText || ""}
                      onChange={(e) => handleSettingUpdate('footerText', e.target.value)}
                      placeholder="Footer copyright text"
                      rows={2}
                      data-testid="textarea-footer"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Site Banner</CardTitle>
                  <CardDescription>
                    Configure announcement banner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Banner</Label>
                      <p className="text-sm text-gray-600">Display banner at top of site</p>
                    </div>
                    <Switch
                      checked={brandingSettings?.showBanner || false}
                      onCheckedChange={(checked) => handleSettingUpdate('showBanner', checked)}
                      data-testid="switch-banner"
                    />
                  </div>

                  {brandingSettings?.showBanner && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="banner-text">Banner Text</Label>
                        <Input
                          id="banner-text"
                          value={brandingSettings?.bannerText || ""}
                          onChange={(e) => handleSettingUpdate('bannerText', e.target.value)}
                          placeholder="Announcement text"
                          data-testid="input-banner-text"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>
                    Custom CSS, JavaScript, and advanced configurations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-css">Custom CSS</Label>
                    <Textarea
                      id="custom-css"
                      value={brandingSettings?.customCss || ""}
                      onChange={(e) => handleSettingUpdate('customCss', e.target.value)}
                      placeholder="/* Your custom CSS */"
                      rows={6}
                      className="font-mono text-sm"
                      data-testid="textarea-custom-css"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-js">Custom JavaScript</Label>
                    <Textarea
                      id="custom-js"
                      value={brandingSettings?.customJs || ""}
                      onChange={(e) => handleSettingUpdate('customJs', e.target.value)}
                      placeholder="// Your custom JavaScript"
                      rows={6}
                      className="font-mono text-sm"
                      data-testid="textarea-custom-js"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Mode</CardTitle>
                  <CardDescription>
                    Enable maintenance mode for site updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">Show maintenance page to users</p>
                    </div>
                    <Switch
                      checked={brandingSettings?.enableMaintenanceMode || false}
                      onCheckedChange={(checked) => handleSettingUpdate('enableMaintenanceMode', checked)}
                      data-testid="switch-maintenance"
                    />
                  </div>

                  {brandingSettings?.enableMaintenanceMode && (
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-message">Maintenance Message</Label>
                      <Textarea
                        id="maintenance-message"
                        value={brandingSettings?.maintenanceMessage || ""}
                        onChange={(e) => handleSettingUpdate('maintenanceMessage', e.target.value)}
                        placeholder="We're currently performing maintenance..."
                        rows={3}
                        data-testid="textarea-maintenance-message"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how your changes look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                  className="flex items-center gap-2"
                  data-testid="preview-desktop"
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                  className="flex items-center gap-2"
                  data-testid="preview-tablet"
                >
                  <Tablet className="w-4 h-4" />
                  Tablet
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                  className="flex items-center gap-2"
                  data-testid="preview-mobile"
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <div className="aspect-video bg-white flex items-center justify-center">
                  {previewData?.[previewDevice] ? (
                    <img
                      src={previewData[previewDevice]}
                      alt={`${previewDevice} preview`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Monitor className="w-12 h-12 mx-auto mb-2" />
                      <p>Preview not available</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePreviewMutation.mutate()}
                        className="mt-2"
                        data-testid="generate-preview-inline"
                      >
                        Generate Preview
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => window.open('/', '_blank')}
                data-testid="view-live-site"
              >
                <Globe className="w-4 h-4 mr-2" />
                View Live Site
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}