import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shovel, Scissors, Droplets, Sun, Flower2, Hammer } from "lucide-react";

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

export function GardeningToolsSection() {
  // Fetch admin-configurable gardening tools and soil preparation content
  const { data: gardeningData } = useQuery<{
    tools?: GardeningTool[];
    soilPreparation?: SoilPreparation[];
    sectionTitle?: string;
    sectionDescription?: string;
  }>({
    queryKey: ["/api/admin/gardening-content"],
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const defaultTools: GardeningTool[] = [
    {
      id: "1",
      name: "Premium Garden Spade",
      description: "Durable stainless steel spade perfect for soil preparation and planting",
      category: "Digging Tools",
      price: "$34.99",
      isRecommended: true
    },
    {
      id: "2", 
      name: "Pruning Shears",
      description: "Sharp, ergonomic pruning shears for precise plant trimming and care",
      category: "Cutting Tools",
      price: "$24.99"
    },
    {
      id: "3",
      name: "Watering Can with Spout",
      description: "2-gallon watering can with precision spout for targeted watering",
      category: "Watering Tools",
      price: "$19.99"
    },
    {
      id: "4",
      name: "Hand Cultivator",
      description: "Essential tool for breaking up soil and removing weeds",
      category: "Soil Tools",
      price: "$16.99"
    }
  ];

  const defaultSoilPreparation: SoilPreparation[] = [
    {
      id: "1",
      title: "Spring Soil Preparation",
      description: "Get your garden ready for the growing season with proper soil preparation",
      steps: [
        "Test soil pH levels (ideal range: 6.0-7.0)",
        "Remove weeds and debris from planting areas",
        "Add 2-3 inches of compost or organic matter",
        "Till or dig soil to 8-10 inches deep",
        "Level the surface and create planting rows"
      ],
      season: "Spring"
    },
    {
      id: "2",
      title: "Fall Garden Cleanup",
      description: "Prepare your soil for winter and next year's growing season",
      steps: [
        "Remove spent plants and diseased materials",
        "Add fallen leaves as natural mulch",
        "Plant cover crops or green manure",
        "Apply slow-release organic fertilizer",
        "Create winter protection for perennials"
      ],
      season: "Fall"
    }
  ];

  const tools = gardeningData?.tools || defaultTools;
  const soilPreparation = gardeningData?.soilPreparation || defaultSoilPreparation;
  const sectionTitle = gardeningData?.sectionTitle || "Gardening Tools & Soil Preparation";
  const sectionDescription = gardeningData?.sectionDescription || "Everything you need for successful gardening, from essential tools to expert soil preparation techniques";

  const getToolIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'digging tools': return Shovel;
      case 'cutting tools': return Scissors;
      case 'watering tools': return Droplets;
      case 'soil tools': return Hammer;
      default: return Flower2;
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {sectionDescription}
          </p>
        </div>

        {/* Gardening Tools Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Essential <span className="text-green-600">Gardening Tools</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const IconComponent = getToolIcon(tool.category);
              return (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow duration-300 border-green-100 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      {tool.isRecommended && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    {tool.price && (
                      <div className="text-xl font-bold text-green-600">{tool.price}</div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {tool.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Soil Preparation Guide */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            <span className="text-green-600">Soil Preparation</span> Guide
          </h3>
          <div className="grid lg:grid-cols-2 gap-8">
            {soilPreparation.map((guide) => (
              <Card key={guide.id} className="border-green-100 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{guide.title}</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                      <Sun className="w-3 h-3 mr-1" />
                      {guide.season}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {guide.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white">
            <h4 className="text-2xl font-bold mb-4">Ready to Start Your Garden?</h4>
            <p className="text-lg mb-6 opacity-90">
              Get personalized plant care recommendations with our AI-powered plant identification
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
              data-testid="start-gardening-button"
            >
              <Flower2 className="w-5 h-5 mr-2" />
              Identify Your First Plant
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}