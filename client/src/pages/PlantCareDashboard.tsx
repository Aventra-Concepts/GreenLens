import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Leaf, 
  Droplets, 
  Sun, 
  Cloud, 
  Share2, 
  Heart,
  Calendar,
  Award,
  Activity,
  BarChart3,
  Zap,
  Users,
  CloudRain,
  ThermometerSun
} from 'lucide-react';

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

export default function PlantCareDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');

  // Fetch dashboard data
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
    queryKey: ['/api/weather/current', dashboardData?.weatherLocation || 'general'],
    enabled: !!dashboardData?.weatherLocation,
  });

  // Record care activity mutation
  const careActivityMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/garden/care-activity'),
    onSuccess: (data) => {
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

  const stats: UserStats = dashboardData?.stats || {};
  const plants = dashboardData?.plants || [];
  const recentPredictions = dashboardData?.recentPredictions || [];
  const recentAchievements = dashboardData?.recentAchievements || [];
  const recentShares = dashboardData?.recentShares || [];

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'seedling': return 'bg-green-100 text-green-800';
      case 'sprout': return 'bg-blue-100 text-blue-800';
      case 'gardener': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-orange-100 text-orange-800';
      case 'botanist': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'seedling': return '🌱';
      case 'sprout': return '🌿';
      case 'gardener': return '🌳';
      case 'expert': return '🔬';
      case 'botanist': return '👨‍🔬';
      default: return '🌱';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'cloudy': 
      case 'overcast': return <Cloud className="h-6 w-6 text-gray-500" />;
      default: return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const experienceToNextLevel = (stats.level * 100) - stats.experiencePoints;
  const progressToNextLevel = (stats.experiencePoints % 100);

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🌱 Plant Care Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your garden progress, achievements, and AI-powered plant care insights
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button 
              onClick={() => careActivityMutation.mutate()}
              disabled={careActivityMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-record-care"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Record Care Activity
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => batchPredictionsMutation.mutate()}
              disabled={batchPredictionsMutation.isPending}
              data-testid="button-generate-predictions"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate AI Predictions
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level & Rank</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{stats.level}</span>
                    <Badge className={getRankColor(stats.rank)}>
                      {getRankIcon(stats.rank)} {stats.rank}
                    </Badge>
                  </div>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to Level {stats.level + 1}</span>
                  <span>{experienceToNextLevel} XP needed</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Care Streak</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-orange-600">{stats.careStreak}</span>
                    <span className="text-sm text-gray-500">days</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Best: {stats.longestStreak} days</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plants & Points</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-bold text-green-600">{stats.plantsOwned}</span>
                    <span className="text-xl font-bold text-blue-600">{stats.totalPoints}pts</span>
                  </div>
                </div>
                <Leaf className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weather</p>
                  {weather && (
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(weather.condition)}
                        <span className="text-xl font-bold">{weather.temperature}°C</span>
                      </div>
                      <p className="text-xs text-gray-500">{weather.humidity}% humidity</p>
                    </div>
                  )}
                </div>
                <ThermometerSun className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" data-testid="tab-achievements">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="predictions" data-testid="tab-predictions">
              <Activity className="h-4 w-4 mr-2" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-social">
              <Users className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Plants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Your Plants ({plants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plants.slice(0, 5).map((plant: any) => (
                      <div key={plant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {plant.imageUrl && (
                            <img 
                              src={plant.imageUrl} 
                              alt={plant.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{plant.name}</p>
                            <p className="text-sm text-gray-500">{plant.species}</p>
                          </div>
                        </div>
                        <Badge variant={plant.status === 'healthy' ? 'default' : 'secondary'}>
                          {plant.status}
                        </Badge>
                      </div>
                    ))}
                    {plants.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No plants yet. Add your first plant to get started! 🌱
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAchievements.slice(0, 5).map((achievement: any) => (
                      <div key={achievement.achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg">
                        <div className="text-2xl">{achievement.achievement.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium">{achievement.achievement.name}</p>
                          <p className="text-sm text-gray-600">{achievement.achievement.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">+{achievement.achievement.points} pts</Badge>
                      </div>
                    ))}
                    {recentAchievements.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        Complete care activities to unlock achievements! 🏆
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements?.map((achievement: Achievement) => (
                <Card key={achievement.id} className={`${achievement.isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : 'opacity-75'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                      </div>
                      {achievement.isUnlocked && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant={achievement.isUnlocked ? "default" : "secondary"}>
                        {achievement.points} points
                      </Badge>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  AI Health Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPredictions.map((prediction: PlantPrediction & { id: string, plantId: string }) => (
                    <div key={prediction.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Plant Health Analysis</h4>
                        <div className="flex items-center gap-2">
                          <Progress value={prediction.healthScore} className="w-20 h-2" />
                          <span className="text-sm font-medium">{prediction.healthScore}%</span>
                        </div>
                      </div>
                      
                      {prediction.riskFactors.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Risk Factors:</p>
                          <div className="space-y-1">
                            {prediction.riskFactors.map((risk, index) => (
                              <Badge key={index} variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                                {risk.type}: {risk.description}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {prediction.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Recommendations:</p>
                          <div className="space-y-1">
                            {prediction.recommendations.slice(0, 3).map((rec, index) => (
                              <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                • {rec.action}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {recentPredictions.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No AI predictions yet</p>
                      <Button 
                        onClick={() => batchPredictionsMutation.mutate()}
                        disabled={batchPredictionsMutation.isPending}
                        data-testid="button-generate-first-predictions"
                      >
                        Generate Your First Predictions
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Recent Shares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentShares.map((share: any) => (
                    <div key={share.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{share.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Heart className="h-4 w-4" />
                          {share.likes}
                          <Share2 className="h-4 w-4" />
                          {share.shares}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {share.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{share.milestoneType}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(share.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {recentShares.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No shared milestones yet</p>
                      <p className="text-sm text-gray-400">
                        Share your plant achievements to connect with other gardeners!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}