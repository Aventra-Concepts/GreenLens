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
    <section className={`py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 section-content-fix ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Powered by <span className="text-green-600">GreenLens AI</span> Technology
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const icons = [Zap, Leaf, Brain, Shield];
            const Icon = icons[index % icons.length];
            
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-green-100 dark:border-green-800 powered-by-card">
                <CardContent className="p-4 sm:p-6 card-content-fix">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                    {feature}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
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