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
      <div className="min-h-screen bg-gray-50 dark:from-gray-900">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your garden dashboard...</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
        
        {/* Free Tier Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={gardenData.user.profileImageUrl || ''} />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                {gardenData.user.firstName?.[0]}{gardenData.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {gardenData.user.firstName}'s Garden
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-gray-600">
                  {gardenData.user.subscriptionPlan}
                </Badge>
                <span className="text-sm text-gray-500">
                  Member since {new Date(gardenData.user.joinDate).getFullYear()}
                </span>
              </div>
            </div>
          </div>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
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
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-md bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Plants</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{gardenData.basicStats.totalPlants}</p>
                    </div>
                    <Leaf className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Plants Identified</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{gardenData.basicStats.plantsIdentified}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
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

          {/* Premium Features Showcase */}
          <div className="space-y-6">
            
            {/* Locked Features */}
            <Card className="shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Lock className="h-5 w-5" />
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {gardenData.limitations.advancedFeaturesLocked.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-800 dark:text-amber-200">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/pricing">
                  <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Crown className="h-4 w-4 mr-2" />
                    Unlock All Features
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Benefits */}
            <Card className="shadow-md bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <Sparkles className="h-5 w-5" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {gardenData.limitations.premiumBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-white/50 dark:bg-white/10">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-emerald-800 dark:text-emerald-200">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Premium Plan</span>
                    <span className="text-lg font-bold text-emerald-600">$19/mo</span>
                  </div>
                  <Link href="/pricing">
                    <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                      <Gift className="h-4 w-4 mr-2" />
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/identify">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Leaf className="h-4 w-4 mr-2" />
                    Identify a Plant
                  </Button>
                </Link>
                <Link href="/care-plans">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Browse Care Plans
                  </Button>
                </Link>
                <Link href="/plant-database">
                  <Button size="sm" variant="outline" className="w-full justify-start">
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