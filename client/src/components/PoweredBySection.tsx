import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Leaf, Brain, Shield } from "lucide-react";

interface PoweredBySectionProps {
  className?: string;
}

export function PoweredBySection({ className = "" }: PoweredBySectionProps) {
  // Fetch admin-configurable content
  const { data: poweredBySettings } = useQuery<{ 
    title?: string; 
    description?: string; 
    features?: string[];
  }>({
    queryKey: ["/api/admin/powered-by-settings"],
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const defaultFeatures = [
    "Advanced AI Plant Recognition",
    "99.5% Accuracy Rate",
    "Real-time Disease Detection",
    "Personalized Care Plans"
  ];

  const features = poweredBySettings?.features || defaultFeatures;
  const title = poweredBySettings?.title || "Powered by GreenLens AI Technology";
  const description = poweredBySettings?.description || "Experience the future of plant identification with our cutting-edge artificial intelligence system";

  return (
    <section className={`py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powered by <span className="text-green-600">GreenLens AI</span> Technology
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const icons = [Zap, Leaf, Brain, Shield];
            const Icon = icons[index % icons.length];
            
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-green-100 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Advanced technology for precise plant analysis
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Technology Showcase */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-green-100 dark:border-green-800">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Advanced Neural Networks
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our AI system uses state-of-the-art deep learning models trained on millions of plant images 
                to provide you with accurate identification and comprehensive care recommendations.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Multi-angle image analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Species classification accuracy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Health assessment capabilities</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-8 text-white">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99.5%</div>
                  <div className="text-sm opacity-90">Identification Accuracy</div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-xs opacity-90">Plant Species</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1M+</div>
                    <div className="text-xs opacity-90">Identifications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}