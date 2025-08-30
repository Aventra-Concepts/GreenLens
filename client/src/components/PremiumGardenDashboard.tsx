import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Leaf,
  Calendar,
  TrendingUp,
  Brain,
  Trophy,
  Crown,
  Sparkles,
  BarChart3,
  Heart,
  Award,
  Target,
  Star,
  Zap,
  Shield,
  Bell,
  Settings,
  Camera,
  BookOpen,
  Users,
  MapPin,
  Clock,
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  Wind,
  ChevronRight,
  Plus,
  Activity,
  Flower,
  TreePine,
  Sprout,
  Search,
  Filter,
  Download,
  Share,
  Eye,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Lock,
  Unlock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

interface PremiumGardenData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    subscriptionPlan: string;
    subscriptionPlanId: string;
    location?: string;
    joinDate: string;
  };
  analytics: {
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
  recentActivity: Array<{
    id: string;
    type: 'identification' | 'care_plan' | 'diagnosis' | 'achievement';
    title: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'info';
  }>;
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
  weatherData?: {
    temperature: number;
    humidity: number;
    conditions: string;
    uvIndex: number;
    recommendation: string;
  };
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

        {/* Main Dashboard Content */}
        <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="plants" className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Flower className="h-4 w-4" />
              <span className="hidden sm:inline">My Plants</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Garden Health Overview */}
              <Card className="xl:col-span-2 shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Garden Health Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold text-green-800">{gardenData.analytics.healthyPlants}</p>
                          <p className="text-green-600 text-sm font-medium">Healthy Plants</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold text-yellow-800">{gardenData.analytics.plantsNeedingCare}</p>
                          <p className="text-yellow-600 text-sm font-medium">Need Care</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-3">
                        <Brain className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold text-purple-800">{gardenData.analytics.plantsDiagnosed}</p>
                          <p className="text-purple-600 text-sm font-medium">AI Diagnosed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Overall Garden Health</span>
                      <span className="text-emerald-600 font-bold">
                        {Math.round((gardenData.analytics.healthyPlants / gardenData.analytics.totalPlants) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(gardenData.analytics.healthyPlants / gardenData.analytics.totalPlants) * 100} 
                      className="h-3 bg-gray-200" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gardenData.recentActivity.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plants Tab */}
          <TabsContent value="plants" className="space-y-6">
            {/* Search and Filter */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="plant-search" className="sr-only">Search plants</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="plant-search"
                        placeholder="Search your plants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plants</SelectItem>
                        <SelectItem value="healthy">Healthy</SelectItem>
                        <SelectItem value="needs_care">Needs Care</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gardenData.plants
                .filter(plant => 
                  (filterStatus === 'all' || plant.healthStatus === filterStatus) &&
                  (searchTerm === '' || plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   plant.species.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((plant, index) => (
                <Card key={plant.id || index} className="overflow-hidden shadow-lg border-0 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center">
                    {plant.imageUrl ? (
                      <img src={plant.imageUrl} alt={plant.commonName} className="w-full h-full object-cover" />
                    ) : (
                      <Sprout className="h-16 w-16 text-green-600" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">{plant.commonName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">{plant.species}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={
                          plant.healthStatus === 'healthy' ? 'default' :
                          plant.healthStatus === 'needs_care' ? 'secondary' : 'destructive'
                        } className={
                          plant.healthStatus === 'healthy' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          plant.healthStatus === 'needs_care' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                          'bg-red-100 text-red-800 hover:bg-red-200'
                        }>
                          {plant.healthStatus === 'healthy' ? 'Healthy' :
                           plant.healthStatus === 'needs_care' ? 'Needs Care' : 'Critical'}
                        </Badge>
                        <span className="text-sm text-gray-500">{plant.confidence}% ID</span>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex justify-between">
                          <span>Last cared:</span>
                          <span className="font-medium">{plant.lastCared}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next care:</span>
                          <span className="font-medium text-emerald-600">{plant.nextCareDate}</span>
                        </div>
                      </div>

                      {plant.careTasks.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Care Tasks:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            {plant.careTasks.slice(0, 2).map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                {task}
                              </li>
                            ))}
                            {plant.careTasks.length > 2 && (
                              <li className="text-emerald-600 font-medium">+{plant.careTasks.length - 2} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-4">
              {gardenData.aiInsights.map((insight, index) => (
                <Card key={index} className={`shadow-lg border-0 ${
                  insight.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-l-red-500' :
                  insight.priority === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-500' :
                  'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        insight.type === 'warning' ? 'bg-red-100' :
                        insight.type === 'tip' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {insight.type === 'warning' ? (
                          <AlertTriangle className={`h-5 w-5 ${
                            insight.priority === 'high' ? 'text-red-600' :
                            insight.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        ) : insight.type === 'tip' ? (
                          <Brain className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{insight.content}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant={
                            insight.priority === 'high' ? 'destructive' :
                            insight.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline">{insight.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-6">
            {gardenData.weatherData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900 dark:to-blue-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sky-800 dark:text-sky-200">
                      <Sun className="h-5 w-5" />
                      Current Weather Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                        <Thermometer className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <p className="text-2xl font-bold">{gardenData.weatherData.temperature}°F</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Temperature</p>
                      </div>
                      <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                        <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{gardenData.weatherData.humidity}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Humidity</p>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                      <p className="text-lg font-semibold mb-1">{gardenData.weatherData.conditions}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">UV Index: {gardenData.weatherData.uvIndex}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <Brain className="h-5 w-5" />
                      AI Weather Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {gardenData.weatherData.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <Cloud className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Weather Data Unavailable</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Unable to fetch weather data for your location. Please check your location settings.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900">
                <CardHeader className="text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-600" />
                  <CardTitle className="text-yellow-800 dark:text-yellow-200">Garden Level</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">{gardenData.analytics.gardenLevel}</div>
                  <Progress value={75} className="mb-2 bg-yellow-200" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">75% to next level</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900">
                <CardHeader className="text-center">
                  <Star className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                  <CardTitle className="text-purple-800 dark:text-purple-200">Experience Points</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{gardenData.analytics.experiencePoints}</div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Total XP earned</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900 dark:to-green-900">
                <CardHeader className="text-center">
                  <Zap className="h-12 w-12 mx-auto mb-2 text-emerald-600" />
                  <CardTitle className="text-emerald-800 dark:text-emerald-200">Care Streak</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">{gardenData.analytics.streakDays}</div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Days in a row</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Achievement Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        i < 6 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        <Award className={`h-6 w-6 ${i < 6 ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <p className="text-xs font-medium">Badge {i + 1}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}