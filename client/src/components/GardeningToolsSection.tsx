import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shovel, Star, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface GardeningTool {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  usageTips?: string;
  bestFor?: string[];
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

export default function GardeningToolsSection() {
  const { data: gardeningContent, isLoading, error } = useQuery<GardeningContentData>({
    queryKey: ["/api/admin/gardening-content"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="relative">
        <section 
          className="py-16 bg-gray-50 dark:bg-gray-900 section-content-fix"
          style={{
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            width: '100vw'
          }}
          data-testid="gardening-tools-section"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !gardeningContent) {
    return (
      <div className="relative">
        <section 
          className="py-16 bg-gray-50 dark:bg-gray-900 section-content-fix"
          style={{
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            width: '100vw'
          }}
          data-testid="gardening-tools-section"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-red-500 mb-4">
              Failed to load gardening tools content
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Break out of container with absolute positioning */}
      <section 
        className="py-16 bg-gray-50 dark:bg-gray-900 section-content-fix"
        style={{
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          width: '100vw'
        }}
        data-testid="gardening-tools-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="section-title">
            {gardeningContent.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" data-testid="section-description">
            {gardeningContent.sectionDescription}
          </p>
        </div>

        {/* Gardening Tools Grid */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <Shovel className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Essential Gardening Tools - Usage Guide
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardeningContent.tools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-md transition-all duration-300 relative border-l-4 border-green-500" data-testid={`tool-card-${tool.id}`}>
                {tool.isRecommended && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-green-600 text-white flex items-center gap-1 px-2 py-1 text-xs">
                      <Star className="w-3 h-3" />
                      Essential
                    </Badge>
                  </div>
                )}
                
                {/* Tool Image */}
                <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 overflow-hidden">
                  {tool.imageUrl ? (
                    <img 
                      src={tool.imageUrl} 
                      alt={tool.name}
                      className="w-full h-full object-cover"
                      data-testid={`tool-image-${tool.id}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white mb-2" data-testid={`tool-name-${tool.id}`}>
                        {tool.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs" data-testid={`tool-category-${tool.id}`}>
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm leading-relaxed" data-testid={`tool-description-${tool.id}`}>
                    {tool.description}
                  </p>
                  
                  {/* Usage Tips */}
                  {tool.usageTips && (
                    <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg mb-3">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How to Use
                      </h4>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {tool.usageTips}
                      </p>
                    </div>
                  )}
                  
                  {/* Best For */}
                  {tool.bestFor && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Best for:</span>
                      {tool.bestFor.map((use: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Soil Preparation Guides */}
        <div>
          <div className="flex items-center mb-8">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Soil Preparation Guides
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {gardeningContent.soilPreparation.map((guide) => (
              <Card key={guide.id} className="hover:shadow-lg transition-shadow duration-300" data-testid={`soil-guide-${guide.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 dark:text-white" data-testid={`guide-title-${guide.id}`}>
                        {guide.title}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-2" data-testid={`guide-season-${guide.id}`}>
                        {guide.season}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-300 mt-3" data-testid={`guide-description-${guide.id}`}>
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Steps to Follow:
                    </h4>
                    <ul className="space-y-2">
                      {guide.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3" data-testid={`guide-step-${guide.id}-${index}`}>
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-gray-600 dark:text-gray-300">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Garden?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get professional plant identification and personalized care recommendations with our AI-powered GreenLens system.
            </p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3" data-testid="start-gardening-button">
              Start Plant Identification
            </Button>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}