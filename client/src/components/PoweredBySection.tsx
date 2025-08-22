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
    "Advanced AI Plant Recognition for American Gardens",
    "99.5% Accuracy Rate for US Native Species",
    "Real-time Disease Detection & Treatment",
    "Personalized Care Plans by Growing Zone"
  ];

  const features = poweredBySettings?.features || defaultFeatures;
  const title = poweredBySettings?.title || "Powered by GreenLens AI Technology";
  const description = poweredBySettings?.description || "America's #1 AI-powered plant identification platform. Trusted by over 50,000 American gardeners for accurate plant identification across all US growing zones";

  return (
    <section className={`py-6 sm:py-8 lg:py-10 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Powered by <span className="text-green-600">GreenLens AI</span> Technology
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((feature, index) => {
            const icons = [Zap, Leaf, Brain, Shield];
            const Icon = icons[index % icons.length];
            
            return (
              <Card key={index} className="text-center hover:shadow-md transition-shadow duration-300 border-green-100 dark:border-green-800 h-full">
                <CardContent className="p-4 lg:p-5 h-full flex flex-col">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white mb-2 leading-tight flex-grow">
                    {feature}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Advanced technology for precise plant analysis
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}