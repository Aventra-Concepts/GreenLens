import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Leaf, 
  Globe, 
  Heart, 
  Camera, 
  FileText, 
  BarChart3, 
  Clock, 
  Star,
  Shield,
  Zap,
  Gift
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface FreeTierStatus {
  eligible: boolean;
  remainingUses: number;
  daysLeft: number;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export function FeatureShowcase() {
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Fetch free tier status
  const { data: freeTierStatus } = useQuery<FreeTierStatus>({
    queryKey: ['/api/free-tier-status'],
    enabled: true,
  });

  // Fetch supported languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
    enabled: true,
  });

  const handleLanguageChange = async (language: string) => {
    try {
      await fetch('/api/user/language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      setSelectedLanguage(language);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  const features = [
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Free Tier Plan",
      description: "Get started with 3 free plant identifications, valid for 7 days",
      details: [
        "3 free plant identifications",
        "7-day validity period", 
        "Full AI-powered species identification",
        "Basic care recommendations",
        "No credit card required"
      ],
      category: "free"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multilingual Plant Names",
      description: "View plant names in your preferred language",
      details: [
        "12+ supported languages",
        "Scientific and common names",
        "Regional name variations",
        "Automatic language detection",
        "Cultural plant knowledge"
      ],
      category: "localization"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Plant Health Monitoring",
      description: "Regular health check-ups for your plants",
      details: [
        "Disease detection and diagnosis",
        "Health status tracking",
        "Treatment recommendations",
        "Progress monitoring",
        "Expert AI advice"
      ],
      category: "health"
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Advanced Image Analysis",
      description: "AI-powered image quality assessment and suggestions",
      details: [
        "Image quality verification",
        "Photography tips",
        "Multiple angle analysis",
        "Lighting recommendations",
        "95%+ accuracy rate"
      ],
      category: "identification"
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Personalized Care Plans",
      description: "Custom care instructions based on your environment",
      details: [
        "Location-specific advice",
        "Seasonal care adjustments",
        "Watering schedules",
        "Lighting requirements",
        "Fertilization guides"
      ],
      category: "care"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Detailed PDF Reports",
      description: "Professional plant identification and care reports",
      details: [
        "Comprehensive species information",
        "Care instructions",
        "High-quality images",
        "Scientific references",
        "Printable format"
      ],
      category: "reports"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Garden Management Dashboard",
      description: "Track and manage your entire plant collection",
      details: [
        "Collection overview",
        "Care reminders",
        "Health history",
        "Growth tracking",
        "Notes and observations"
      ],
      category: "management"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Disease Prevention",
      description: "Proactive plant health monitoring and alerts",
      details: [
        "Early disease detection",
        "Prevention recommendations",
        "Treatment protocols",
        "Environmental monitoring",
        "Expert consultations"
      ],
      category: "health"
    }
  ];

  const progressPercentage = freeTierStatus 
    ? ((3 - freeTierStatus.remainingUses) / 3) * 100 
    : 0;

  return (
    <div className="space-y-8" data-testid="feature-showcase">
      {/* Free Tier Status Card */}
      {freeTierStatus && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800 dark:text-green-200">Free Tier Status</CardTitle>
              </div>
              <Badge variant={freeTierStatus.eligible ? "default" : "secondary"} data-testid="free-tier-badge">
                {freeTierStatus.eligible ? "Active" : "Expired"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Identifications Used</span>
                  <span>{3 - freeTierStatus.remainingUses}/3</span>
                </div>
                <Progress value={progressPercentage} className="h-2" data-testid="progress-usage" />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Days remaining: {freeTierStatus.daysLeft}
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {freeTierStatus.remainingUses} free uses left
                </span>
              </div>

              {!freeTierStatus.eligible && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Upgrade to Pro for unlimited plant identifications and premium features!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Selection */}
      {languages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Language Preferences</span>
            </CardTitle>
            <CardDescription>
              Select your preferred language for plant names and interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange} data-testid="language-selector">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your preferred language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center space-x-2">
                      <span>{lang.nativeName}</span>
                      <span className="text-gray-500">({lang.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Feature Categories */}
      <Tabs defaultValue="free" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="free" data-testid="tab-free">Free Features</TabsTrigger>
          <TabsTrigger value="identification" data-testid="tab-identification">Identification</TabsTrigger>
          <TabsTrigger value="care" data-testid="tab-care">Plant Care</TabsTrigger>
          <TabsTrigger value="premium" data-testid="tab-premium">Premium</TabsTrigger>
        </TabsList>

        <TabsContent value="free" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {features.filter(f => f.category === "free").map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="identification" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {features.filter(f => f.category === "identification" || f.category === "localization").map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="care" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {features.filter(f => f.category === "care" || f.category === "health").map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {features.filter(f => f.category === "reports" || f.category === "management").map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Feature Suggestions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Coming Soon</span>
          </CardTitle>
          <CardDescription>
            Exciting new features we're working on for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Care reminders & notifications</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Star className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Plant rating & reviews</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Camera className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Growth progress photos</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Environmental data logging</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Heart className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Community plant sharing</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Expert consultation booking</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({ feature }: { feature: any }) {
  return (
    <Card className="h-full" data-testid={`feature-card-${feature.category}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {feature.icon}
          <span>{feature.title}</span>
        </CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {feature.details.map((detail: string, index: number) => (
            <li key={index} className="flex items-start space-x-2 text-sm">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-600 dark:text-gray-400">{detail}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}