import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Clock, Thermometer } from "lucide-react";

interface USRegion {
  code: string;
  name: string;
  timezone: string;
  popularPlants: string[];
  growingZone: string;
}

interface USRegionalInfo {
  region: USRegion;
  content: {
    welcomeMessage: string;
    gardeningTips: string[];
    seasonalAdvice: string;
  };
  plantRecommendations: Array<{
    name: string;
    difficulty: string;
    growingZone: string;
    nativeToRegion: boolean;
  }>;
  defaults: {
    currency: string;
    locale: string;
    timezone: string;
    region: string;
    units: 'imperial' | 'metric';
  };
  timestamp: string;
}

export function USOptimizedHero() {
  const [regionalInfo, setRegionalInfo] = useState<USRegionalInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegionalInfo = async () => {
      try {
        const response = await fetch('/api/us/regional-info');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRegionalInfo(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch regional info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionalInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-green-200 dark:bg-green-800 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-green-100 dark:bg-green-900 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!regionalInfo) {
    return null;
  }

  const { region, content, plantRecommendations } = regionalInfo;

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">

          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to GreenLens. Your perfect companion for a Scientific Garden.
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {content.seasonalAdvice}
          </p>
          
          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            Local Time: {regionalInfo.timestamp}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-green-800 dark:text-green-300">
                Regional Gardening Tips
              </h3>
              <ul className="space-y-2">
                {content.gardeningTips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-green-800 dark:text-green-300">
                Popular Native Plants
              </h3>
              <div className="flex flex-wrap gap-2">
                {region.popularPlants.slice(0, 4).map((plant, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {plant.charAt(0).toUpperCase() + plant.slice(1)}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Perfect for your {region.name} garden
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm md:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-green-800 dark:text-green-300">
                Recommended Plants
              </h3>
              <div className="space-y-2">
                {plantRecommendations.slice(0, 3).map((plant, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {plant.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={plant.difficulty === 'Easy' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {plant.difficulty}
                      </Badge>
                      {plant.nativeToRegion && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                          Native
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-800/30 rounded-full text-sm text-green-800 dark:text-green-300">
            <Thermometer className="w-4 h-4 mr-2" />
            All temperatures shown in Fahrenheit • Measurements in feet/inches
          </div>
        </div>
      </div>
    </section>
  );
}

export default USOptimizedHero;