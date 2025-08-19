import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Droplets, 
  Sun, 
  Thermometer, 
  TrendingUp, 
  Camera, 
  Calendar as CalendarIcon,
  Leaf,
  BarChart3,
  Activity,
  Bell,
  MapPin,
  Target,
  Zap,
  Settings,
  Edit3,
  Sparkles,
  Save,
  Trophy,
  Award,
  Users,
  Share2,
  Heart,
  Cloud,
  CloudRain,
  ThermometerSun
} from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Plant {
  id: string;
  name: string;
  species: string;
  dateAdded: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical';
  lastWatered: string;
  nextWatering: string;
  photoUrl?: string;
  height: number;
  notes: string;
  careSchedule: CareActivity[];
  growthData: GrowthPoint[];
  environmentalData: EnvironmentalReading[];
}

interface CareActivity {
  id: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'pest_treatment';
  date: string;
  notes: string;
  completed: boolean;
}

interface GrowthPoint {
  date: string;
  height: number;
  width: number;
  leafCount: number;
  notes: string;
}

interface EnvironmentalReading {
  date: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  soilMoisture: number;
}

interface GardenStats {
  totalPlants: number;
  healthyPlants: number;
  plantsNeedingCare: number;
  averageGrowthRate: number;
  weeklyGrowth: number;
  upcomingTasks: number;
}

interface GardenContentSection {
  id: string;
  sectionType: string;
  title: string;
  content: string;
  metadata?: any;
  isActive: boolean;
  order: number;
}

interface UserStats {
  totalPoints: number;
  level: number;
  plantsOwned: number;
  achievementsUnlocked: number;
  careStreak: number;
  longestStreak: number;
  rank: string;
  experiencePoints: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface WeatherData {
  temperature: string;
  humidity: string;
  uvIndex: string;
  condition: string;
  precipitation: string;
}

interface PlantPrediction {
  id: string;
  plantId: string;
  healthScore: number;
  riskFactors: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  recommendations: Array<{
    category: string;
    action: string;
    priority: string;
  }>;
  weatherImpact: {
    nextWeekOutlook: string;
    specificConcerns: string[];
  };
}

export default function MyGarden() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  // Fetch dashboard data with gamified features
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/garden/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch achievements
  const { data: achievements, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
  });

  // Fetch weather data
  const { data: weather } = useQuery({
    queryKey: ['/api/weather/current', (dashboardData as any)?.weatherLocation || 'general'],
    enabled: !!(dashboardData as any)?.weatherLocation,
  });

  // Record care activity mutation
  const careActivityMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/garden/care-activity');
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Care Activity Recorded! 🌱",
        description: "Your daily care streak has been updated.",
      });

      if (data.newAchievements && data.newAchievements.length > 0) {
        data.newAchievements.forEach((achievement: Achievement) => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.name}: ${achievement.description}`,
          });
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/garden/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/garden/stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record care activity",
        variant: "destructive",
      });
    },
  });

  // Generate batch predictions mutation
  const batchPredictionsMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/garden/batch-predictions'),
    onSuccess: () => {
      toast({
        title: "AI Predictions Generated! 🤖",
        description: "Health predictions updated for all your plants.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/garden/dashboard'] });
    },
  });

  // Fetch garden content sections (admin-editable)
  const { data: gardenContentSections = [] } = useQuery<GardenContentSection[]>({
    queryKey: ['/api/garden-content'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/garden-content');
      return response.json();
    }
  });

  // User's plants data - no copyrighted content, only original demo data
  const { data: plants = [], isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ['/api/my-garden/plants'],
    queryFn: async () => {
      // Original, non-copyrighted demo data
      return [
        {
          id: '1',
          name: 'Sample Indoor Plant',
          species: 'Fictional planticus',
          dateAdded: '2024-03-15',
          location: 'Indoor Location',
          status: 'healthy',
          lastWatered: '2024-08-17',
          nextWatering: '2024-08-19',
          height: 15.5,
          notes: 'Sample plant for demonstration',
          careSchedule: [
            { id: '1', type: 'watering', date: '2024-08-19', notes: 'Regular care', completed: false },
            { id: '2', type: 'fertilizing', date: '2024-08-20', notes: 'Monthly care', completed: false }
          ],
          growthData: [
            { date: '2024-08-01', height: 12.0, width: 8.0, leafCount: 15, notes: 'Sample growth data' },
            { date: '2024-08-08', height: 13.5, width: 9.0, leafCount: 18, notes: 'Continued growth' },
            { date: '2024-08-15', height: 15.5, width: 10.0, leafCount: 22, notes: 'Latest measurement' }
          ],
          environmentalData: [
            { date: '2024-08-17', temperature: 22.5, humidity: 60, lightLevel: 85, soilMoisture: 45 }
          ]
        }
      ];
    }
  });

  const { data: gardenStats } = useQuery<GardenStats>({
    queryKey: ['/api/my-garden/stats'],
    queryFn: () => Promise.resolve({
      totalPlants: plants.length,
      healthyPlants: plants.filter(p => p.status === 'healthy').length,
      plantsNeedingCare: plants.filter(p => p.status !== 'healthy').length,
      averageGrowthRate: 12.5,
      weeklyGrowth: 8.2,
      upcomingTasks: 3
    })
  });

  const addPlantMutation = useMutation({
    mutationFn: async (plantData: Partial<Plant>) => {
      // Replace with actual API call
      return apiRequest('POST', '/api/my-garden/plants', plantData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-garden/plants'] });
      toast({ title: "Plant added successfully!" });
    }
  });

  const updateCareMutation = useMutation({
    mutationFn: async ({ plantId, activityId }: { plantId: string; activityId: string }) => {
      return apiRequest('PATCH', `/api/my-garden/plants/${plantId}/care/${activityId}`, { completed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-garden/plants'] });
      toast({ title: "Care activity completed!" });
    }
  });

  // Admin content editing mutations
  const updateContentMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      return apiRequest('PATCH', `/api/garden-content/${id}`, { title, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/garden-content'] });
      setEditingContent(null);
      toast({ title: "Content updated successfully!" });
    }
  });

  // AI content generation mutation
  const generateAiContentMutation = useMutation({
    mutationFn: async ({ prompt, contentType }: { prompt: string; contentType: string }) => {
      return apiRequest('POST', '/api/ai/generate-garden-content', { prompt, contentType });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/garden-content'] });
      toast({ title: "AI content generated successfully!" });
    }
  });

  const getStatusColor = (status: Plant['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextCareActivity = (activities: CareActivity[]) => {
    const upcoming = activities
      .filter(activity => !activity.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0];
  };

  const calculateGrowthRate = (growthData: GrowthPoint[]) => {
    if (growthData.length < 2) return 0;
    const latest = growthData[growthData.length - 1];
    const previous = growthData[growthData.length - 2];
    const daysDiff = (new Date(latest.date).getTime() - new Date(previous.date).getTime()) / (1000 * 60 * 60 * 24);
    return ((latest.height - previous.height) / daysDiff) * 7; // cm per week
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl" data-testid="my-garden-page">
      <div className="mb-8">
        {gardenContentSections.find(section => section.sectionType === 'hero') ? (
          <div className="relative">
            {gardenContentSections
              .filter(section => section.sectionType === 'hero' && section.isActive)
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id} className="relative group">
                  <h1 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-2">
                    {section.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {section.content}
                  </p>
                  
                  {/* Admin Edit Controls */}
                  {user?.isAdmin && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingContent(section.id);
                            setEditForm({ title: section.title, content: section.content });
                          }}
                          data-testid={`edit-content-${section.id}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateAiContentMutation.mutate({ 
                            prompt: `Generate engaging garden dashboard hero content about: ${section.title}`,
                            contentType: 'hero'
                          })}
                          disabled={generateAiContentMutation.isPending}
                          data-testid={`ai-generate-${section.id}`}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div>
            <h1 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-2">
              My Garden Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track, monitor, and optimize your plant collection with scientific precision
            </p>
            {user?.isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => generateAiContentMutation.mutate({ 
                  prompt: 'Generate engaging hero content for a garden management dashboard',
                  contentType: 'hero'
                })}
                disabled={generateAiContentMutation.isPending}
                data-testid="ai-generate-hero"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Content
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Garden Statistics Overview */}
      {gardenStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{gardenStats.totalPlants}</div>
              <p className="text-xs text-muted-foreground">Active in your collection</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy Plants</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{gardenStats.healthyPlants}</div>
              <p className="text-xs text-muted-foreground">
                {((gardenStats.healthyPlants / gardenStats.totalPlants) * 100).toFixed(0)}% of collection
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {gardenStats.weeklyGrowth}cm
              </div>
              <p className="text-xs text-muted-foreground">Average weekly growth</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
              <Bell className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{gardenStats.upcomingTasks}</div>
              <p className="text-xs text-muted-foreground">Care activities pending</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${user?.isAdmin ? 'grid-cols-8' : 'grid-cols-7'}`}>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plants" data-testid="tab-plants">My Plants</TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">🏆 Achievements</TabsTrigger>
          <TabsTrigger value="predictions" data-testid="tab-predictions">🤖 AI Health</TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-social">📱 Social</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="care" data-testid="tab-care">Care Schedule</TabsTrigger>
          {user?.isAdmin && (
            <TabsTrigger value="admin" data-testid="tab-admin">Admin</TabsTrigger>
          )}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Plant Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Plant Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plants.map((plant) => (
                  <div key={plant.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(plant.status)}`} />
                      <div>
                        <p className="font-medium">{plant.name}</p>
                        <p className="text-sm text-gray-500">{plant.species}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{plant.height}cm</p>
                      <p className="text-xs text-gray-500">
                        Growth: +{calculateGrowthRate(plant.growthData).toFixed(1)}cm/week
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Environmental Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-blue-600" />
                  Environmental Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plants.map((plant) => {
                  const latestEnv = plant.environmentalData[plant.environmentalData.length - 1];
                  if (!latestEnv) return null;
                  
                  return (
                    <div key={plant.id} className="space-y-3">
                      <h4 className="font-medium">{plant.name}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Temperature</p>
                          <p className="font-medium">{latestEnv.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Humidity</p>
                          <p className="font-medium">{latestEnv.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Light Level</p>
                          <p className="font-medium">{latestEnv.lightLevel}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Soil Moisture</p>
                          <p className="font-medium">{latestEnv.soilMoisture}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Today's Care Activities & Gamified Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Today's Care Tasks & Achievements
              </CardTitle>
              <CardDescription>Complete tasks to earn points and unlock achievements!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Record Daily Care Activity</p>
                    <p className="text-sm text-gray-600">Water, check, or care for your plants</p>
                  </div>
                </div>
                <Button 
                  onClick={() => careActivityMutation.mutate()}
                  disabled={careActivityMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-record-care"
                >
                  {careActivityMutation.isPending ? "Recording..." : "Record Care +10 XP"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Generate AI Health Predictions</p>
                    <p className="text-sm text-gray-600">Get AI insights for all your plants</p>
                  </div>
                </div>
                <Button 
                  onClick={() => batchPredictionsMutation.mutate()}
                  disabled={batchPredictionsMutation.isPending}
                  variant="outline"
                  data-testid="button-generate-predictions"
                >
                  {batchPredictionsMutation.isPending ? "Generating..." : "Generate Predictions"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weather Information */}
          {weather && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  Weather Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <ThermometerSun className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-semibold">{weather.temperature}°C</p>
                  </div>
                  <div className="text-center">
                    <Droplets className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-sm text-gray-600">Humidity</p>
                    <p className="font-semibold">{weather.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <Sun className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                    <p className="text-sm text-gray-600">UV Index</p>
                    <p className="font-semibold">{weather.uvIndex}</p>
                  </div>
                  <div className="text-center">
                    <CloudRain className="h-6 w-6 mx-auto text-indigo-500 mb-2" />
                    <p className="text-sm text-gray-600">Precipitation</p>
                    <p className="font-semibold">{weather.precipitation}mm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Stats */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">Level 5</div>
                  <div className="text-sm text-gray-600">Plant Care Expert</div>
                  <Progress value={75} className="mt-2" />
                  <div className="text-xs text-gray-500 mt-1">750/1000 XP to next level</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-gray-600">Care Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Achievements</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Gallery */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Achievement Gallery</CardTitle>
                <CardDescription>Unlock badges by caring for your plants!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Demo achievements */}
                  {[
                    { name: "Green Thumb", icon: "🌱", unlocked: true, description: "Care for plants 7 days in a row" },
                    { name: "Plant Parent", icon: "🪴", unlocked: true, description: "Own 5 or more plants" },
                    { name: "Growth Guardian", icon: "📈", unlocked: true, description: "Track plant growth for 30 days" },
                    { name: "Weather Watcher", icon: "☀️", unlocked: false, description: "Use weather insights 10 times" },
                    { name: "AI Assistant", icon: "🤖", unlocked: false, description: "Generate 5 AI predictions" },
                    { name: "Social Gardener", icon: "📱", unlocked: false, description: "Share 3 plant milestones" }
                  ].map((achievement, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border text-center ${
                        achievement.unlocked 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="font-medium text-sm">{achievement.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{achievement.description}</div>
                      {achievement.unlocked && <Badge className="mt-2" variant="secondary">Unlocked!</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Health Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                AI Health Predictions & Recommendations
              </CardTitle>
              <CardDescription>Get personalized insights powered by AI and weather data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {plants.map((plant) => (
                <div key={plant.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{plant.name}</h3>
                      <p className="text-sm text-gray-600">{plant.species}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-gray-600">Health Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-700">🎯 Recommendations</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>Water in 2 days based on soil moisture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>Move to brighter location this week</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>Check for pests on undersides of leaves</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-blue-700">🌤️ Weather Impact</h4>
                      <div className="text-sm space-y-1">
                        <p className="text-blue-600">Next week outlook: Favorable conditions</p>
                        <p className="text-gray-600">• High humidity supports growth</p>
                        <p className="text-gray-600">• UV levels optimal for photosynthesis</p>
                        <p className="text-gray-600">• No extreme temperature expected</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Sharing Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-indigo-600" />
                Share Your Plant Journey
              </CardTitle>
              <CardDescription>Celebrate milestones and connect with other plant enthusiasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Share a milestone */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <h3 className="font-semibold mb-3">🎉 Share a Plant Milestone</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                    <span className="text-sm">Achievement Unlock</span>
                  </Button>
                  <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Growth Progress</span>
                  </Button>
                  <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                    <Camera className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">New Plant Photo</span>
                  </Button>
                </div>
              </div>

              {/* Recent shares feed */}
              <div>
                <h3 className="font-semibold mb-4">Recent Plant Community Shares</h3>
                <div className="space-y-4">
                  {[
                    {
                      user: "Plant Parent Pro",
                      content: "🏆 Just unlocked the 'Growth Guardian' achievement!",
                      image: "🌱",
                      likes: 12,
                      time: "2 hours ago"
                    },
                    {
                      user: "Garden Enthusiast",
                      content: "My Monstera reached 50cm tall! 📈",
                      image: "🪴", 
                      likes: 8,
                      time: "5 hours ago"
                    }
                  ].map((post, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{post.image}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{post.user}</span>
                            <span className="text-sm text-gray-500">{post.time}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Button size="sm" variant="ghost" className="gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </Button>
                            <Button size="sm" variant="ghost" className="gap-1">
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Original Plants Tab Content */}
        <TabsContent value="plants" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Plant Collection</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" data-testid="button-add-plant">
                  <Plus className="h-4 w-4" />
                  Add Plant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Plant</DialogTitle>
                  <DialogDescription>Add a new plant to your garden collection</DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="plant-name">Plant Name</Label>
                    <Input id="plant-name" placeholder="e.g., My Monstera" data-testid="input-plant-name" />
                  </div>
                  <div>
                    <Label htmlFor="plant-species">Species</Label>
                    <Input id="plant-species" placeholder="e.g., Monstera deliciosa" data-testid="input-plant-species" />
                  </div>
                  <div>
                    <Label htmlFor="plant-location">Location</Label>
                    <Input id="plant-location" placeholder="e.g., Living room - West window" data-testid="input-plant-location" />
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-submit-plant">
                    Add Plant
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <Card key={plant.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plant.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(plant.status)}`} />
                  </div>
                  <CardDescription className="text-sm">{plant.species}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Height</p>
                      <p className="font-medium">{plant.height}cm</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{plant.location}</p>
                    </div>
                  </div>
                  
                  {plant.careSchedule.filter(activity => !activity.completed).length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Upcoming Care:</p>
                      {plant.careSchedule
                        .filter(activity => !activity.completed)
                        .slice(0, 2)
                        .map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                            <span className="text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Growth charts will appear here</p>
                    <p className="text-sm text-gray-400">Add more measurements to see trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Environmental data charts</p>
                    <p className="text-sm text-gray-400">Monitor temperature, humidity, and light</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Care Schedule Tab */}
        <TabsContent value="care" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Care Schedule Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-96">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-4">
                    Tasks for {selectedDate.toLocaleDateString()}
                  </h3>
                  <div className="space-y-3">
                    {plants.flatMap(plant => 
                      plant.careSchedule
                        .filter(activity => 
                          new Date(activity.date).toDateString() === selectedDate.toDateString()
                        )
                        .map(activity => (
                          <div key={`${plant.id}-${activity.id}`} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="font-medium">{plant.name}</p>
                                <p className="text-sm text-gray-500 capitalize">
                                  {activity.type.replace('_', ' ')} - {activity.notes}
                                </p>
                              </div>
                            </div>
                            <Badge variant={activity.completed ? "default" : "secondary"}>
                              {activity.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        ))
                    )}
                    {plants.flatMap(plant => 
                      plant.careSchedule.filter(activity => 
                        new Date(activity.date).toDateString() === selectedDate.toDateString()
                      )
                    ).length === 0 && (
                      <p className="text-gray-500 text-center py-8">No care activities scheduled for this date</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        {user?.isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gardenContentSections.map((section) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{section.title}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingContent(section.id);
                            setEditForm({ title: section.title, content: section.content });
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateAiContentMutation.mutate({ 
                            prompt: `Generate engaging garden content for: ${section.title}`,
                            contentType: section.sectionType
                          })}
                          disabled={generateAiContentMutation.isPending}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Type: {section.sectionType}</p>
                    <p className="text-sm">{section.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {editingContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    updateContentMutation.mutate({
                      id: editingContent,
                      title: editForm.title,
                      content: editForm.content
                    });
                  }}>
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-content">Content</Label>
                      <Textarea
                        id="edit-content"
                        value={editForm.content}
                        onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateContentMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingContent(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Content Modal */}
      {editingContent && (
        <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Garden Content</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              updateContentMutation.mutate({
                id: editingContent,
                title: editForm.title,
                content: editForm.content
              });
            }}>
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateContentMutation.isPending}>
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingContent(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
