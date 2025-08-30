import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Leaf, Heart, Trophy, Zap, TrendingUp, Star, Crown, Sparkles,
  Settings, Share, Sun, Droplets, Wind, Calendar, Bell, BarChart3,
  Activity, CheckCircle, AlertTriangle, Brain, Clock, Info,
  Search, Filter, Sprout, Flower, Award, Users, Plus, BookOpen, Camera
} from 'lucide-react';

// Enhanced PremiumGardenData interface
interface PremiumGardenData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    subscriptionPlan: string;
    subscriptionPlanId: string;
    location: string;
    joinDate: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    conditions: string;
    uvIndex: number;
    windSpeed: number;
    rainfall: number;
    forecast: Array<{
      date: string;
      temp: number;
      conditions: string;
      rainfall: number;
    }>;
  };
  consultations: Array<{
    id: string;
    expertName: string;
    expertTitle: string;
    topic: string;
    status: 'scheduled' | 'pending' | 'completed';
    scheduledDate?: string;
    duration: number;
    price: number;
  }>;
  tips: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
  }>;
  analytics: {
    advancedMetrics: {
      plantHealthScore: number;
      growthRate: number;
      careEfficiency: number;
      seasonalTrends: Array<{
        month: string;
        plantsAdded: number;
        healthScore: number;
      }>;
      speciesDistribution: Array<{
        family: string;
        count: number;
        percentage: number;
      }>;
      careReminders: Array<{
        id: string;
        plantName: string;
        action: string;
        dueDate: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
    totalPlants: number;
    healthyPlants: number;
    plantsNeedingCare: number;
    plantsDiagnosed: number;
    achievementScore: number;
    gardenLevel: number;
    experiencePoints: number;
    streakDays: number;
    monthlyGrowth: number;
  };
  plants: Array<{
    id: string;
    species: string;
    commonName: string;
    confidence: number;
    healthStatus: 'healthy' | 'needs_care' | 'critical';
    lastCared: string;
    nextCareDate: string;
    careTasks: string[];
    imageUrl?: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'identification' | 'care_plan' | 'diagnosis' | 'achievement';
    title: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'info';
  }>;
  aiInsights: Array<{
    type: 'tip' | 'warning' | 'opportunity';
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export function PremiumGardenDashboard() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: gardenData, isLoading } = useQuery<PremiumGardenData>({
    queryKey: ['/api/premium-garden-dashboard'],
    enabled: !!user,
  });

  const { data: premiumFeatures, isLoading: premiumLoading } = useQuery({
    queryKey: ['/api/premium/dashboard-data'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Loading Your Premium Garden</h2>
            <p className="text-gray-600 dark:text-gray-300">Preparing your personalized dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gardenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50">
        <div className="container mx-auto p-6">
          <Alert className="max-w-2xl mx-auto mt-12">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Unable to load your premium garden dashboard. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        
        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-white/20">
                <AvatarImage src={gardenData.user.profileImageUrl || ''} />
                <AvatarFallback className="bg-emerald-700 text-white text-lg font-bold">
                  {gardenData.user.firstName?.[0]}{gardenData.user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                <Crown className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                {gardenData.user.firstName}'s Premium Garden
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </h1>
              <p className="text-emerald-100 text-sm lg:text-base">
                {gardenData.user.subscriptionPlan} • Level {gardenData.analytics.gardenLevel} Gardener
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-3">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30">
              <Share className="h-4 w-4 mr-2" />
              Share Garden
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium">Total Plants</p>
                  <p className="text-2xl font-bold">{gardenData.analytics.totalPlants}</p>
                </div>
                <Leaf className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Health Score</p>
                  <p className="text-2xl font-bold">{Math.round((gardenData.analytics.healthyPlants / gardenData.analytics.totalPlants) * 100)}%</p>
                </div>
                <Heart className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Garden Level</p>
                  <p className="text-2xl font-bold">{gardenData.analytics.gardenLevel}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium">Care Streak</p>
                  <p className="text-2xl font-bold">{gardenData.analytics.streakDays}</p>
                </div>
                <Zap className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-xs font-medium">Monthly Growth</p>
                  <p className="text-2xl font-bold">+{gardenData.analytics.monthlyGrowth}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs font-medium">XP Points</p>
                  <p className="text-2xl font-bold">{gardenData.analytics.experiencePoints}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Tabs - Enhanced with Advanced Features */}
        <Tabs value={selectedView} onValueChange={setSelectedView} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="microclimate">Microclimate</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Intelligence</TabsTrigger>
            <TabsTrigger value="social">Plant Network</TabsTrigger>
            <TabsTrigger value="iot">Smart Garden</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {premiumFeatures?.systemStatus ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Devices Online</span>
                        <Badge variant="secondary">
                          {premiumFeatures.systemStatus.devicesOnline}/{premiumFeatures.systemStatus.totalDevices}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Data Freshness</span>
                        <Badge variant={premiumFeatures.systemStatus.dataFreshness === 'real-time' ? 'default' : 'secondary'}>
                          {premiumFeatures.systemStatus.dataFreshness}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Alerts</span>
                        <Badge variant={premiumFeatures.systemStatus.alertsActive > 0 ? 'destructive' : 'secondary'}>
                          {premiumFeatures.systemStatus.alertsActive}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Loading system status...</p>
                  )}
                </CardContent>
              </Card>

              {/* Latest Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Sustainability Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {premiumFeatures?.latestAnalytics ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600">
                          {Math.round(premiumFeatures.latestAnalytics.sustainabilityScore)}
                        </div>
                        <p className="text-sm text-gray-600">Sustainability Score</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Carbon Footprint</span>
                          <span className="text-green-600">
                            {premiumFeatures.latestAnalytics.carbonFootprint?.co2Absorbed}kg CO₂
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Biodiversity Index</span>
                          <span className="text-blue-600">
                            {Math.round(premiumFeatures.latestAnalytics.biodiversityIndex)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Loading analytics...</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-emerald-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <Sprout className="h-4 w-4 mr-2" />
                      Add Microclimate Zone
                    </Button>
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Plant Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Connect Plants
                    </Button>
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Share Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-600" />
                  Latest AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {premiumFeatures?.aiInsights ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {premiumFeatures.aiInsights.slice(0, 4).map((insight: any, index: number) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          <Badge variant={insight.urgencyLevel === 'high' ? 'destructive' : insight.urgencyLevel === 'medium' ? 'default' : 'secondary'}>
                            {insight.urgencyLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(insight.confidence)}%
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {insight.insightType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading AI insights...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Weather */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    Current Weather
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold">{gardenData.weather.temperature}°F</h3>
                      <p className="text-gray-600">{gardenData.weather.conditions}</p>
                      <p className="text-sm text-gray-500">{gardenData.user.location}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{gardenData.weather.humidity}% Humidity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{gardenData.weather.windSpeed} mph Wind</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">UV Index: {gardenData.weather.uvIndex}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Garden Recommendations */}
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">Garden Recommendations</h4>
                    <p className="text-sm text-emerald-700">
                      {gardenData.weather.temperature > 75 ? 'Perfect weather for watering outdoor plants early morning.' : 
                       gardenData.weather.temperature < 60 ? 'Cool weather - consider moving sensitive plants indoors.' :
                       'Ideal conditions for plant care activities.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 3-Day Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    3-Day Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gardenData.weather.forecast.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-sm text-gray-600">{day.conditions}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{day.temp}°F</p>
                          {day.rainfall > 0 && (
                            <p className="text-sm text-blue-600">{day.rainfall}" rain</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advanced Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Plant Health Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={gardenData.analytics.advancedMetrics.plantHealthScore} className="w-20" />
                      <span className="font-bold">{gardenData.analytics.advancedMetrics.plantHealthScore}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Growth Rate</span>
                    <span className="font-bold text-green-600">+{gardenData.analytics.advancedMetrics.growthRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Care Efficiency</span>
                    <div className="flex items-center gap-2">
                      <Progress value={gardenData.analytics.advancedMetrics.careEfficiency} className="w-20" />
                      <span className="font-bold">{gardenData.analytics.advancedMetrics.careEfficiency}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seasonal Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Seasonal Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gardenData.analytics.advancedMetrics.seasonalTrends.map((trend) => (
                      <div key={trend.month} className="flex items-center justify-between">
                        <span className="font-medium">{trend.month}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">+{trend.plantsAdded} plants</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${trend.healthScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{trend.healthScore}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gardenData.consultations.map((consultation) => (
                <Card key={consultation.id} className="border-l-4 border-l-emerald-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{consultation.expertName}</CardTitle>
                      <Badge variant={consultation.status === 'scheduled' ? 'default' : consultation.status === 'pending' ? 'secondary' : 'outline'}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{consultation.expertTitle}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">Topic: {consultation.topic}</h4>
                        {consultation.scheduledDate && (
                          <p className="text-sm text-gray-600">
                            Scheduled: {new Date(consultation.scheduledDate).toLocaleDateString()} at {new Date(consultation.scheduledDate).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Duration: {consultation.duration} minutes</span>
                        <span className="font-bold text-emerald-600">${consultation.price}</span>
                      </div>
                      <div className="flex gap-2">
                        {consultation.status === 'pending' && (
                          <Button size="sm" className="flex-1">Schedule</Button>
                        )}
                        {consultation.status === 'scheduled' && (
                          <Button size="sm" variant="outline" className="flex-1">Join Session</Button>
                        )}
                        <Button size="sm" variant="ghost">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Book New Consultation */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Book Expert Consultation</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Get personalized advice from plant experts
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gardenData.tips.map((tip) => (
                <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={tip.category === 'watering' ? 'default' : 'secondary'}>
                        {tip.category}
                      </Badge>
                      <Badge variant={tip.difficulty === 'beginner' ? 'default' : tip.difficulty === 'intermediate' ? 'secondary' : 'outline'}>
                        {tip.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{tip.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-600">⏱️ {tip.estimatedTime}</span>
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Microclimate Zones Tab */}
          <TabsContent value="microclimate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-emerald-600" />
                  Microclimate Zones Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {premiumFeatures?.microclimatezones ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {premiumFeatures.microclimatezones.map((zone: any) => (
                      <div key={zone.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-lg text-green-800">{zone.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Soil Type:</span>
                            <span className="ml-2 font-medium">{zone.soilType || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sunlight:</span>
                            <span className="ml-2 font-medium">{zone.sunlightHours || 'N/A'} hrs</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Moisture:</span>
                            <span className="ml-2 font-medium">{zone.moistureLevel || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Plants:</span>
                            <span className="ml-2 font-medium">{zone.plantSpecies?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No microclimate zones created yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Zone
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Intelligence Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-emerald-600" />
                    Predictive Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {premiumFeatures?.aiInsights ? (
                    <div className="space-y-4">
                      {premiumFeatures.aiInsights.slice(0, 3).map((insight: any, index: number) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge variant={insight.urgencyLevel === 'critical' ? 'destructive' : 'default'}>
                              {insight.urgencyLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Confidence: {Math.round(insight.confidence)}%</span>
                            <span className="text-gray-500">{insight.insightType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Loading AI insights...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Health Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800">Overall Garden Health</h4>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Predicted Health Score</span>
                          <span className="font-bold">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <p className="text-xs text-green-600 mt-2">Trending upward ↗</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-800">Care Recommendations</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Increase watering frequency by 15%</li>
                        <li>• Monitor for pest activity in Zone 2</li>
                        <li>• Consider fertilization in 2 weeks</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plant Social Network Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Companion Plant Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Tomatoes ↔ Basil</h4>
                        <Badge variant="default">Beneficial</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Basil repels pests and improves tomato flavor</p>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-gray-500">Distance: 12-18 inches</span>
                        <span className="text-yellow-500">★★★★★ Community Verified</span>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Roses ↔ Lavender</h4>
                        <Badge variant="default">Beneficial</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Lavender deters aphids and attracts beneficial insects</p>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-gray-500">Distance: 2-3 feet</span>
                        <span className="text-yellow-500">★★★★☆ Community Verified</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share className="h-5 w-5 text-emerald-600" />
                    Community Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Camera className="h-4 w-4 mr-2" />
                      Share Garden Progress
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Join Plant Exchange
                    </Button>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Recent Community Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Garden photos shared</span>
                          <span className="font-medium">247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tips exchanged</span>
                          <span className="font-medium">89</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plant connections made</span>
                          <span className="font-medium">156</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Smart Garden IoT Tab */}
          <TabsContent value="iot" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Connected Devices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {premiumFeatures?.iotDevices ? (
                    <div className="space-y-3">
                      {premiumFeatures.iotDevices.map((device: any) => (
                        <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{device.deviceName}</h4>
                            <p className="text-sm text-gray-600">{device.deviceType}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs">{device.isOnline ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No devices connected</p>
                      <Button size="sm" className="mt-2">Add Device</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    Real-time Sensors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Soil Moisture</span>
                      <div className="flex items-center gap-2">
                        <Progress value={78} className="w-16 h-2" />
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temperature</span>
                      <span className="text-sm font-medium">72°F</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Light Level</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-16 h-2" />
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">pH Level</span>
                      <span className="text-sm font-medium">6.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-600" />
                    Automation Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <h4 className="font-medium text-green-800">Auto-Watering</h4>
                      <p className="text-sm text-green-600">Moisture &lt; 40% → Water 30 seconds</p>
                      <Badge variant="outline" className="text-xs mt-1">Active</Badge>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-medium text-blue-800">Light Adjustment</h4>
                      <p className="text-sm text-blue-600">Light &lt; 50% → LED ON</p>
                      <Badge variant="outline" className="text-xs mt-1">Active</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Garden Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {premiumFeatures?.latestAnalytics && (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800">Water Efficiency</h4>
                      <div className="text-2xl font-bold text-green-600 mt-2">
                        {premiumFeatures.latestAnalytics.waterUsage?.efficiency || 85}%
                      </div>
                      <p className="text-sm text-green-600">Daily: {premiumFeatures.latestAnalytics.waterUsage?.daily || 0} gal</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Carbon Impact</h4>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        {premiumFeatures.latestAnalytics.carbonFootprint?.co2Absorbed || 0}kg
                      </div>
                      <p className="text-sm text-blue-600">CO₂ Absorbed Monthly</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800">ROI Analysis</h4>
                      <div className="text-2xl font-bold text-purple-600 mt-2">
                        {premiumFeatures.latestAnalytics.costBenefitAnalysis?.roi || 180}%
                      </div>
                      <p className="text-sm text-purple-600">Return on Investment</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800">Yield Projection</h4>
                      <div className="text-2xl font-bold text-orange-600 mt-2">
                        ${premiumFeatures.latestAnalytics.yieldAnalysis?.marketValue || 0}
                      </div>
                      <p className="text-sm text-orange-600">Monthly Market Value</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}