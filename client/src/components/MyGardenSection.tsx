import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import {
  Droplets,
  Sun,
  Thermometer,
  Heart,
  Calendar,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Clock,
  Scissors,
  RefreshCw,
  Search,
  Plus,
  TrendingUp,
  Bell
} from "lucide-react";


interface CarePlan {
  id: string;
  plantName: string;
  scientificName: string;
  difficulty: "Easy" | "Moderate" | "Difficult";
  petSafe: boolean;
  lastUpdated: string;
  nextCareAction: string;
  careData: {
    watering: {
      frequency: string;
      description: string;
      schedule: string;
    };
    light: {
      level: string;
      description: string;
      placement: string;
    };
    humidity: {
      range: string;
      description: string;
      tips: string[];
    };
    temperature: {
      range: string;
      description: string;
      seasonal_notes: string;
    };
    soil: {
      type: string;
      details: string;
      repotting: string;
    };
    fertilizer: {
      type: string;
      frequency: string;
      details: string;
    };
    pruning: {
      frequency: string;
      description: string;
      best_time: string;
    };
    seasonal_care: {
      spring: string;
      summer: string;
      fall: string;
      winter: string;
    };
  };
  reminders: Array<{
    type: string;
    message: string;
    dueDate: string;
    priority: "low" | "medium" | "high";
  }>;
}

export default function MyGardenSection() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Check subscription status to determine access to My Garden features
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscription/status'],
    retry: false,
  });

  // Fetch user's care plans for My Garden
  const { data: carePlans = [], isLoading: carePlansLoading } = useQuery({
    queryKey: ['/api/my-garden/care-plans'],
    enabled: !!user,
    retry: false,
  });

  // Fetch garden dashboard data
  const { data: gardenStats } = useQuery({
    queryKey: ['/api/garden/dashboard'],
    enabled: !!user,
    retry: false,
  });

  const hasActiveSubscription = (subscription as any)?.hasActiveSubscription === true;
  const typedCarePlans = carePlans as CarePlan[];

  if (subscriptionLoading) {
    return (
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-6 sm:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Garden</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {hasActiveSubscription 
                ? "Track and manage your identified plants" 
                : "Premium plant tracking and management"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-3 sm:gap-4">
            <div className="bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm w-full sm:w-auto">
              <span className="text-gray-600">Subscription:</span>
              <span className={`font-semibold ml-2 ${hasActiveSubscription ? 'text-green-600' : 'text-gray-600'}`}>
                {(subscription as any)?.planName || 'Free Plan'}
              </span>
            </div>
            <Link href="/account" className="w-full sm:w-auto">
              <Button className="bg-green-500 hover:bg-green-600 w-full sm:w-auto text-sm sm:text-base" data-testid="account-settings-button">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Garden Statistics */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Plants</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {(gardenStats as any)?.totalPlants || 0}
                  </p>
                </div>
                <Leaf className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Care Plans</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {typedCarePlans.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Reminders</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                    {typedCarePlans.reduce((acc, plan) => acc + plan.reminders.length, 0)}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {(gardenStats as any)?.growthScore || 85}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Care Plans Section - Exclusive My Garden Feature */}
        {user && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-green-600" />
                  My Care Plans
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Exclusive
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  AI-generated personalized care plans for your identified plants
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/identify" className="w-full sm:w-auto">
                  <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm" data-testid="button-identify-more-plants">
                    <Plus className="h-4 w-4 mr-2" />
                    Identify More Plants
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search your plants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-garden-plants"
                    />
                  </div>
                </div>
                
                <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty} className="w-full lg:w-auto">
                  <TabsList className="grid grid-cols-4 w-full lg:w-auto">
                    <TabsTrigger value="all" data-testid="tab-all-plants">All</TabsTrigger>
                    <TabsTrigger value="Easy" data-testid="tab-easy-plants">Easy</TabsTrigger>
                    <TabsTrigger value="Moderate" data-testid="tab-moderate-plants">Moderate</TabsTrigger>
                    <TabsTrigger value="Difficult" data-testid="tab-difficult-plants">Difficult</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Care Plans List */}
            <div className="space-y-6">
              {carePlansLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your care plans...</p>
                </div>
              ) : typedCarePlans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                    <Leaf className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Start Your Garden Journey
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Identify your first plant to get personalized AI-generated care plans with detailed watering schedules, lighting needs, and seasonal care instructions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/identify">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Identify Your First Plant
                        </Button>
                      </Link>
                      <Link href="/care-plans">
                        <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                          View All Care Plans
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {typedCarePlans
                    .filter(plan => {
                      const matchesSearch = plan.plantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          plan.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesDifficulty = selectedDifficulty === "all" || plan.difficulty === selectedDifficulty;
                      return matchesSearch && matchesDifficulty;
                    })
                    .slice(0, 3) // Show only first 3 plans in My Garden
                    .map((plan: CarePlan) => (
                      <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{plan.plantName}</CardTitle>
                                <p className="text-sm text-gray-600 italic">
                                  {plan.scientificName}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={`${getDifficultyColor(plan.difficulty)}`}>
                                    {plan.difficulty}
                                  </Badge>
                                  {plan.petSafe ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Heart className="h-3 w-3 mr-1" />
                                      Pet Safe
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-orange-100 text-orange-800">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Pet Caution
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>Next: {plan.nextCareAction}</p>
                              <p className="text-xs mt-1">
                                Updated {new Date(plan.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Quick Care Overview */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <Droplets className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                              <p className="text-xs font-medium text-blue-700">Watering</p>
                              <p className="text-xs text-blue-600">{plan.careData.watering.frequency}</p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                              <Sun className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                              <p className="text-xs font-medium text-yellow-700">Light</p>
                              <p className="text-xs text-yellow-600">{plan.careData.light.level}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg text-center">
                              <Thermometer className="h-4 w-4 text-red-600 mx-auto mb-1" />
                              <p className="text-xs font-medium text-red-700">Temperature</p>
                              <p className="text-xs text-red-600">{plan.careData.temperature.range}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                              <RefreshCw className="h-4 w-4 text-green-600 mx-auto mb-1" />
                              <p className="text-xs font-medium text-green-700">Humidity</p>
                              <p className="text-xs text-green-600">{plan.careData.humidity.range}</p>
                            </div>
                          </div>

                          {/* Active Reminders */}
                          {plan.reminders.length > 0 && (
                            <div className="border-t pt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Active Reminders ({plan.reminders.length})
                              </h4>
                              <div className="space-y-2">
                                {plan.reminders.slice(0, 2).map((reminder, index) => (
                                  <div key={index} className={`text-xs p-2 rounded border ${getPriorityColor(reminder.priority)}`}>
                                    <div className="flex justify-between items-start">
                                      <span className="font-medium">{reminder.type}</span>
                                      <span>Due: {new Date(reminder.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <p className="mt-1 text-xs opacity-80">{reminder.message}</p>
                                  </div>
                                ))}
                                {plan.reminders.length > 2 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{plan.reminders.length - 2} more reminders
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  
                  {/* View All Care Plans Button */}
                  {typedCarePlans.length > 3 && (
                    <div className="text-center pt-4">
                      <Link href="/care-plans">
                        <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                          View All {typedCarePlans.length} Care Plans
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );

  // Helper functions
  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Moderate": return "bg-yellow-100 text-yellow-800";
      case "Difficult": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }
}
