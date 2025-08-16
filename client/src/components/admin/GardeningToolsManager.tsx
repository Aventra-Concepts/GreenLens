import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Loader2, Package, Shovel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface GardeningTool {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: string;
  isRecommended?: boolean;
}

interface SoilPreparation {
  id: string;
  title: string;
  description: string;
  steps: string[];
  season: string;
}

interface GardeningContentData {
  sectionTitle: string;
  sectionDescription: string;
  tools: GardeningTool[];
  soilPreparation: SoilPreparation[];
}

export default function GardeningToolsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<GardeningContentData>({
    sectionTitle: "",
    sectionDescription: "",
    tools: [],
    soilPreparation: []
  });

  // Fetch current gardening content
  const { data: gardeningContent, isLoading } = useQuery<GardeningContentData>({
    queryKey: ["/api/admin/gardening-content"],
  });

  // Update form data when content is loaded
  useEffect(() => {
    if (gardeningContent) {
      setFormData(gardeningContent);
    }
  }, [gardeningContent]);

  // Update gardening content mutation
  const updateContentMutation = useMutation({
    mutationFn: async (content: GardeningContentData) => {
      const response = await fetch("/api/admin/gardening-content", {
        method: "POST",
        body: JSON.stringify(content),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update gardening content");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gardening tools content updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gardening-content"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContentMutation.mutate(formData);
  };

  const addTool = () => {
    const newTool: GardeningTool = {
      id: Date.now().toString(),
      name: "",
      description: "",
      category: "",
      price: "",
      isRecommended: false
    };
    setFormData({
      ...formData,
      tools: [...formData.tools, newTool]
    });
  };

  const updateTool = (index: number, field: keyof GardeningTool, value: string | boolean) => {
    const updatedTools = formData.tools.map((tool, i) => 
      i === index ? { ...tool, [field]: value } : tool
    );
    setFormData({ ...formData, tools: updatedTools });
  };

  const removeTool = (index: number) => {
    const updatedTools = formData.tools.filter((_, i) => i !== index);
    setFormData({ ...formData, tools: updatedTools });
  };

  const addSoilGuide = () => {
    const newGuide: SoilPreparation = {
      id: Date.now().toString(),
      title: "",
      description: "",
      steps: [""],
      season: ""
    };
    setFormData({
      ...formData,
      soilPreparation: [...formData.soilPreparation, newGuide]
    });
  };

  const updateSoilGuide = (index: number, field: keyof SoilPreparation, value: string | string[]) => {
    const updatedGuides = formData.soilPreparation.map((guide, i) => 
      i === index ? { ...guide, [field]: value } : guide
    );
    setFormData({ ...formData, soilPreparation: updatedGuides });
  };

  const removeSoilGuide = (index: number) => {
    const updatedGuides = formData.soilPreparation.filter((_, i) => i !== index);
    setFormData({ ...formData, soilPreparation: updatedGuides });
  };

  const addStep = (guideIndex: number) => {
    const updatedGuides = formData.soilPreparation.map((guide, i) => 
      i === guideIndex ? { ...guide, steps: [...guide.steps, ""] } : guide
    );
    setFormData({ ...formData, soilPreparation: updatedGuides });
  };

  const updateStep = (guideIndex: number, stepIndex: number, value: string) => {
    const updatedGuides = formData.soilPreparation.map((guide, i) => 
      i === guideIndex ? {
        ...guide,
        steps: guide.steps.map((step, j) => j === stepIndex ? value : step)
      } : guide
    );
    setFormData({ ...formData, soilPreparation: updatedGuides });
  };

  const removeStep = (guideIndex: number, stepIndex: number) => {
    const updatedGuides = formData.soilPreparation.map((guide, i) => 
      i === guideIndex ? {
        ...guide,
        steps: guide.steps.filter((_, j) => j !== stepIndex)
      } : guide
    );
    setFormData({ ...formData, soilPreparation: updatedGuides });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Gardening Tools Management
        </CardTitle>
        <CardDescription>
          Manage the gardening tools section content, including tools and soil preparation guides
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Header */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Section Information</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="sectionTitle">Section Title</Label>
                <Input
                  id="sectionTitle"
                  value={formData.sectionTitle}
                  onChange={(e) => setFormData({ ...formData, sectionTitle: e.target.value })}
                  placeholder="All you need to know about the Right Gardening Tools"
                  data-testid="input-section-title"
                />
              </div>
              <div>
                <Label htmlFor="sectionDescription">Section Description</Label>
                <Textarea
                  id="sectionDescription"
                  value={formData.sectionDescription}
                  onChange={(e) => setFormData({ ...formData, sectionDescription: e.target.value })}
                  placeholder="Everything you need for successful gardening..."
                  rows={3}
                  data-testid="textarea-section-description"
                />
              </div>
            </div>
          </div>

          {/* Gardening Tools */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shovel className="w-5 h-5" />
                Gardening Tools
              </h3>
              <Button type="button" onClick={addTool} size="sm" data-testid="button-add-tool">
                <Plus className="w-4 h-4 mr-2" />
                Add Tool
              </Button>
            </div>

            {formData.tools.map((tool, index) => (
              <Card key={tool.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Tool #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`recommended-${index}`} className="text-sm">Recommended</Label>
                        <Switch
                          id={`recommended-${index}`}
                          checked={tool.isRecommended || false}
                          onCheckedChange={(checked) => updateTool(index, 'isRecommended', checked)}
                          data-testid={`switch-recommended-${index}`}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTool(index)}
                          data-testid={`button-remove-tool-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`tool-name-${index}`}>Tool Name</Label>
                        <Input
                          id={`tool-name-${index}`}
                          value={tool.name}
                          onChange={(e) => updateTool(index, 'name', e.target.value)}
                          placeholder="Premium Garden Spade"
                          data-testid={`input-tool-name-${index}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tool-category-${index}`}>Category</Label>
                        <Input
                          id={`tool-category-${index}`}
                          value={tool.category}
                          onChange={(e) => updateTool(index, 'category', e.target.value)}
                          placeholder="Digging Tools"
                          data-testid={`input-tool-category-${index}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tool-price-${index}`}>Price (optional)</Label>
                        <Input
                          id={`tool-price-${index}`}
                          value={tool.price || ""}
                          onChange={(e) => updateTool(index, 'price', e.target.value)}
                          placeholder="$34.99"
                          data-testid={`input-tool-price-${index}`}
                        />
                      </div>
                      <div></div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`tool-description-${index}`}>Description</Label>
                        <Textarea
                          id={`tool-description-${index}`}
                          value={tool.description}
                          onChange={(e) => updateTool(index, 'description', e.target.value)}
                          placeholder="Durable stainless steel spade perfect for soil preparation..."
                          rows={2}
                          data-testid={`textarea-tool-description-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Soil Preparation Guides */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Soil Preparation Guides</h3>
              <Button type="button" onClick={addSoilGuide} size="sm" data-testid="button-add-soil-guide">
                <Plus className="w-4 h-4 mr-2" />
                Add Guide
              </Button>
            </div>

            {formData.soilPreparation.map((guide, guideIndex) => (
              <Card key={guide.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Guide #{guideIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSoilGuide(guideIndex)}
                        data-testid={`button-remove-soil-guide-${guideIndex}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`guide-title-${guideIndex}`}>Title</Label>
                        <Input
                          id={`guide-title-${guideIndex}`}
                          value={guide.title}
                          onChange={(e) => updateSoilGuide(guideIndex, 'title', e.target.value)}
                          placeholder="Spring Soil Preparation"
                          data-testid={`input-guide-title-${guideIndex}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`guide-season-${guideIndex}`}>Season</Label>
                        <Input
                          id={`guide-season-${guideIndex}`}
                          value={guide.season}
                          onChange={(e) => updateSoilGuide(guideIndex, 'season', e.target.value)}
                          placeholder="Spring"
                          data-testid={`input-guide-season-${guideIndex}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`guide-description-${guideIndex}`}>Description</Label>
                        <Textarea
                          id={`guide-description-${guideIndex}`}
                          value={guide.description}
                          onChange={(e) => updateSoilGuide(guideIndex, 'description', e.target.value)}
                          placeholder="Get your garden ready for the growing season..."
                          rows={2}
                          data-testid={`textarea-guide-description-${guideIndex}`}
                        />
                      </div>
                    </div>
                    
                    {/* Steps */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Preparation Steps</Label>
                        <Button
                          type="button"
                          onClick={() => addStep(guideIndex)}
                          size="sm"
                          variant="outline"
                          data-testid={`button-add-step-${guideIndex}`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Step
                        </Button>
                      </div>
                      {guide.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex gap-2 mb-2">
                          <Input
                            value={step}
                            onChange={(e) => updateStep(guideIndex, stepIndex, e.target.value)}
                            placeholder={`Step ${stepIndex + 1}`}
                            data-testid={`input-step-${guideIndex}-${stepIndex}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeStep(guideIndex, stepIndex)}
                            data-testid={`button-remove-step-${guideIndex}-${stepIndex}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={updateContentMutation.isPending}
            data-testid="button-save-gardening-content"
          >
            {updateContentMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Gardening Content
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}