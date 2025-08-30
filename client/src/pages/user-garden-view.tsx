import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Leaf,
  Calendar,
  TrendingUp,
  Brain,
  Trophy,
  User,
  Stethoscope,
  Activity,
  Heart,
  Award,
  Target,
  Star,
  BarChart3,
  Crown,
  Gift,
  CheckCircle,
  AlertTriangle,
  Users
} from "lucide-react";

interface UserGardenData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    createdAt: string;
    subscriptionStatus: string;
    totalPlants: number;
    totalIdentifications: number;
    lastActive: string;
    gardenLevel: number;
    experiencePoints: number;
  };
  totalPlants: number;
  healthPredictions?: {
    overallHealth: string;
    diseaseRisk: string;
  };
  achievements?: {
    level: number;
    progress: number;
    badges: number;
    goals: number;
    points: number;
  };
  plants: PlantData[];
}

interface PlantData {
  id: string;
  species: string;
  primaryCommonName: string;
  confidence: number;
  createdAt: string;
  userId: string;
}

export default function UserGardenView() {
  const { userId } = useParams();
  const [, setLocation] = useLocation();

  const { data: userGardenData, isLoading: gardenLoading } = useQuery<UserGardenData>({
    queryKey: ['/api/admin/garden-user-data', userId],
    enabled: !!userId,
  });

  if (gardenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading user garden dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userGardenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              No garden data found for this user.
            </p>
            <Button onClick={() => setLocation('/admin-garden')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Garden
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const user = userGardenData.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/admin-garden')}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Garden
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImageUrl || ''} />
                <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}'s Garden
                </h1>
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.subscriptionStatus === 'active' && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Crown className="h-3 w-3 mr-1" />
                Premium Member
              </Badge>
            )}
            {user.subscriptionStatus === 'trialing' && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Gift className="h-3 w-3 mr-1" />
                Trial User
              </Badge>
            )}
            {(!user.subscriptionStatus || user.subscriptionStatus === 'free') && (
              <Badge variant="outline">
                Free User
              </Badge>
            )}
          </div>
        </div>

        {/* User Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Plants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{user.totalPlants || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Identified species</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Garden Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">Level {user.gardenLevel || 1}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Experience level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Experience Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{user.experiencePoints || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total XP earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-bold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Join date</p>
            </CardContent>
          </Card>
        </div>

        {/* Garden Features Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Garden Overview</TabsTrigger>
            <TabsTrigger value="plants">Plant Collection</TabsTrigger>
            <TabsTrigger value="health">Health Analytics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Predictions */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                    <Brain className="h-4 w-4" />
                    AI Health Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Health:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {userGardenData.healthPredictions?.overallHealth || 'Good'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disease Risk:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {userGardenData.healthPredictions?.diseaseRisk || 'Low'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-3">
                    <Brain className="h-3 w-3 inline mr-1" />
                    Based on {userGardenData.totalPlants || 0} plants analyzed
                  </div>
                </CardContent>
              </Card>

              {/* Achievement System */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
                    <Trophy className="h-4 w-4" />
                    Achievement Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Level:</span>
                    <span className="font-bold text-yellow-600">
                      {userGardenData.achievements?.level || 1}
                    </span>
                  </div>
                  <Progress 
                    value={userGardenData.achievements?.progress || 0} 
                    className="h-2" 
                  />
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <Trophy className="h-3 w-3 mx-auto text-yellow-500 mb-1" />
                      <span className="block font-medium">{userGardenData.achievements?.badges || 0}</span>
                      <span className="text-gray-500">Badges</span>
                    </div>
                    <div>
                      <Target className="h-3 w-3 mx-auto text-blue-500 mb-1" />
                      <span className="block font-medium">{userGardenData.achievements?.goals || 0}</span>
                      <span className="text-gray-500">Goals</span>
                    </div>
                    <div>
                      <Star className="h-3 w-3 mx-auto text-purple-500 mb-1" />
                      <span className="block font-medium">{userGardenData.achievements?.points || 0}</span>
                      <span className="text-gray-500">Points</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Plant Collection ({userGardenData.plants?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userGardenData.plants && userGardenData.plants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userGardenData.plants.map((plant, index) => (
                      <Card key={plant.id || index} className="p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-medium text-base">
                              {plant.primaryCommonName || 'Unknown Plant'}
                            </h3>
                            <p className="text-sm text-gray-500 italic">
                              {plant.species || 'Species unknown'}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">
                              {plant.confidence || 85}% confidence
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(plant.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Leaf className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Plants Yet</h3>
                    <p className="text-gray-500">This user hasn't identified any plants.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Overall Health</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {userGardenData.healthPredictions?.overallHealth || 'Good'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span>Disease Risk</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {userGardenData.healthPredictions?.diseaseRisk || 'Low'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Garden Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Identifications</span>
                    <span className="font-bold">{user.totalIdentifications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Plants</span>
                    <span className="font-bold">{user.totalPlants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Active</span>
                    <span className="font-bold">{new Date(user.lastActive).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                  <CardTitle>Level Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {userGardenData.achievements?.level || 1}
                  </div>
                  <Progress value={userGardenData.achievements?.progress || 0} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {userGardenData.achievements?.progress || 0}% to next level
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <CardTitle>Badges Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {userGardenData.achievements?.badges || 0}
                  </div>
                  <p className="text-sm text-gray-600">Achievement badges</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <CardTitle>Goals Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {userGardenData.achievements?.goals || 0}
                  </div>
                  <p className="text-sm text-gray-600">Goals achieved</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}