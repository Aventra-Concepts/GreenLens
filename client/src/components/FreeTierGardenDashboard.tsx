import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Leaf,
  Calendar,
  TrendingUp,
  Crown,
  Lock,
  Star,
  Heart,
  Trophy,
  Zap,
  Activity,
  Flower,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Gift,
  ArrowRight,
  ArrowUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface FreeTierGardenData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    subscriptionPlan: string;
    subscriptionPlanId: string;
    joinDate: string;
  };
  basicStats: {
    totalPlants: number;
    plantsIdentified: number;
    freeUsageRemaining: number;
    freeUsageLimit: number;
  };
  recentPlants: Array<{
    id: string;
    commonName: string;
    species: string;
    confidence: number;
    dateAdded: string;
    imageUrl?: string;
  }>;
  limitations: {
    maxPlantsPerMonth: number;
    advancedFeaturesLocked: string[];
    premiumBenefits: string[];
  };
}

export function FreeTierGardenDashboard() {
  const { user } = useAuth();

  const { data: gardenData, isLoading } = useQuery<FreeTierGardenData>({
    queryKey: ['/api/free-garden-dashboard'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-950 dark:to-emerald-950">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Loading your garden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gardenData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <Alert className="max-w-2xl mx-auto mt-12">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Unable to load your garden dashboard. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const usagePercentage = (gardenData.basicStats.freeUsageRemaining / gardenData.basicStats.freeUsageLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-950 dark:to-emerald-950">
      <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
        
        {/* Free Tier Header - Colorful gradient */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <Avatar className="h-14 w-14 border-4 border-white/50">
              <AvatarImage src={gardenData.user.profileImageUrl || ''} />
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {gardenData.user.firstName?.[0]}{gardenData.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                {gardenData.user.firstName}'s Garden
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  {gardenData.user.subscriptionPlan}
                </Badge>
                <span className="text-sm text-white/90">
                  Member since {new Date(gardenData.user.joinDate).getFullYear()}
                </span>
              </div>
            </div>
          </div>
          {gardenData.user.subscriptionPlanId !== 'pro' && gardenData.user.subscriptionPlanId !== 'premium' && (
            <Link href="/pricing">
              <Button className="bg-white text-purple-600 hover:bg-white/90 shadow-lg font-semibold" data-testid="button-upgrade-pro-premium">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro/Premium
              </Button>
            </Link>
          )}
        </div>

        {/* Usage Limit Alert */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="flex justify-between items-center">
              <span>
                Free tier usage: {gardenData.basicStats.freeUsageRemaining} of {gardenData.basicStats.freeUsageLimit} plants remaining this month
              </span>
              <Link href="/pricing">
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  Upgrade
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            <Progress 
              value={usagePercentage} 
              className="mt-2 h-2 bg-amber-200" 
            />
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Basic Stats */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards - Colorful gradients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-100 font-medium">Total Plants</p>
                      <p className="text-3xl font-bold text-white">{gardenData.basicStats.totalPlants}</p>
                    </div>
                    <Leaf className="h-12 w-12 text-white opacity-30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100 font-medium">Plants Identified</p>
                      <p className="text-3xl font-bold text-white">{gardenData.basicStats.plantsIdentified}</p>
                    </div>
                    <Eye className="h-12 w-12 text-white opacity-30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Plants */}
            <Card className="shadow-md bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flower className="h-5 w-5 text-green-600" />
                  Recent Plants
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gardenData.recentPlants.length > 0 ? (
                  <div className="space-y-3">
                    {gardenData.recentPlants.map((plant, index) => (
                      <div key={plant.id || index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                          {plant.imageUrl ? (
                            <img src={plant.imageUrl} alt={plant.commonName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Leaf className="h-6 w-6 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{plant.commonName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic">{plant.species}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {plant.confidence}% confidence
                            </Badge>
                            <span className="text-xs text-gray-500">{plant.dateAdded}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Leaf className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">No plants yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Start identifying plants to build your garden</p>
                    <Link href="/identify">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Identify Your First Plant
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upgrade Sections */}
          <div className="space-y-6">
            
            {/* Section 1: Pro/Premium Plans - Show only if user doesn't have Pro/Premium */}
            {gardenData.user.subscriptionPlanId !== 'pro' && gardenData.user.subscriptionPlanId !== 'premium' && (
              <Card className="shadow-md bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                    <Crown className="h-5 w-5" />
                    Unlock Advanced Plant Care Features
                  </CardTitle>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Pro/Premium Plans: $9-$19/month
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-800 dark:text-purple-200">AI-powered plant diagnostics</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-800 dark:text-purple-200">Professional PDF reports</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-800 dark:text-purple-200">Expert consultations</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-800 dark:text-purple-200">Priority support</span>
                    </div>
                  </div>
                  <Link href="/pricing">
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                      data-testid="button-upgrade-pro-premium-sidebar"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro/Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Section 2: Garden Monitoring Add-On - Always show */}
            <Card className="shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Activity className="h-5 w-5" />
                  Add Garden Monitoring Premium
                </CardTitle>
                <p className="text-sm text-green-600 dark:text-green-300 font-semibold">
                  Separate subscription for advanced garden management with Plant Diary
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                    Garden Monitoring is a separate add-on subscription
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">Real-time garden monitoring</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">Digital plant diary</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">IoT sensor integration</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">Microclimate tracking</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">AI growth predictions</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Add-On Price</span>
                    <span className="text-lg font-bold text-green-600">$95/year</span>
                  </div>
                  <Link href="/garden-monitoring">
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      data-testid="button-get-garden-monitoring"
                    >
                      <Leaf className="h-4 w-4 mr-2" />
                      Get Garden Monitoring
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/identify">
                  <Button size="sm" variant="outline" className="w-full justify-start" data-testid="button-identify-plant">
                    <Leaf className="h-4 w-4 mr-2" />
                    Identify a Plant
                  </Button>
                </Link>
                <Link href="/care-plans">
                  <Button size="sm" variant="outline" className="w-full justify-start" data-testid="button-care-plans">
                    <Heart className="h-4 w-4 mr-2" />
                    Browse Care Plans
                  </Button>
                </Link>
                <Link href="/plant-database">
                  <Button size="sm" variant="outline" className="w-full justify-start" data-testid="button-plant-database">
                    <Flower className="h-4 w-4 mr-2" />
                    Plant Database
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Limits Section */}
        <Card className="shadow-md bg-white dark:bg-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              Monthly Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {gardenData.limitations.maxPlantsPerMonth}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Plant Limit</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {gardenData.basicStats.plantsIdentified}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Plants Identified</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {gardenData.basicStats.freeUsageRemaining}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Remaining This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        <Card className="shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-2xl font-bold mb-2">Ready to Grow Your Garden?</h2>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Unlock unlimited plant identifications, AI-powered health diagnostics, personalized care plans, 
              weather integration, and advanced analytics with our Premium plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  <ArrowUp className="h-5 w-5 mr-2" />
                  View Pricing Plans
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More About Features
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}