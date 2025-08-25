import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  ArrowLeft,
  Search,
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
  RefreshCw
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

export default function CarePlansPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/auth';
    }
  }, [isAuthenticated, isLoading]);

  const { data: carePlans = [], isLoading: carePlansLoading } = useQuery({
    queryKey: ['/api/care-plans'],
    enabled: isAuthenticated,
  });

  // Cast to proper type for TypeScript
  const typedCarePlans = carePlans as CarePlan[];

  // Filter care plans based on search and difficulty
  const filteredPlans = typedCarePlans.filter(plan => {
    const matchesSearch = plan.plantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || plan.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Moderate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Difficult": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Care Plans
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  Personalized AI-generated care plans for your identified plants
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search your care plans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-care-plans"
                  />
                </div>
              </div>
              
              <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty} className="w-full lg:w-auto">
                <TabsList className="grid grid-cols-4 w-full lg:w-auto">
                  <TabsTrigger value="all" data-testid="tab-all-difficulty">All</TabsTrigger>
                  <TabsTrigger value="Easy" data-testid="tab-easy-difficulty">Easy</TabsTrigger>
                  <TabsTrigger value="Moderate" data-testid="tab-moderate-difficulty">Moderate</TabsTrigger>
                  <TabsTrigger value="Difficult" data-testid="tab-difficult-difficulty">Difficult</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Care Plans List */}
          <div className="space-y-6">
            {carePlansLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p>Loading your care plans...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {typedCarePlans.length === 0 ? "No care plans yet" : "No plans match your search"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {typedCarePlans.length === 0 
                    ? "Start by identifying some plants to get personalized care plans!"
                    : "Try adjusting your search or filters to find the care plans you're looking for."
                  }
                </p>
                {typedCarePlans.length === 0 && (
                  <Link href="/identify">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Identify Your First Plant
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              filteredPlans.map((plan: CarePlan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{plan.plantName}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            {plan.scientificName}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getDifficultyColor(plan.difficulty)}>
                              {plan.difficulty}
                            </Badge>
                            {plan.petSafe ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <Heart className="h-3 w-3 mr-1" />
                                Pet Safe
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Pet Caution
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        <p>Updated {new Date(plan.lastUpdated).toLocaleDateString()}</p>
                        <p className="font-medium text-green-600 dark:text-green-400 mt-1">
                          Next: {plan.nextCareAction}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="care">Care Guide</TabsTrigger>
                        <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
                        <TabsTrigger value="reminders">Reminders</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-700 dark:text-blue-300">Watering</span>
                            </div>
                            <p className="text-sm text-blue-600 dark:text-blue-200">
                              {plan.careData.watering.frequency}
                            </p>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Sun className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-700 dark:text-yellow-300">Light</span>
                            </div>
                            <p className="text-sm text-yellow-600 dark:text-yellow-200">
                              {plan.careData.light.level}
                            </p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Thermometer className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-700 dark:text-red-300">Temperature</span>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-200">
                              {plan.careData.temperature.range}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <RefreshCw className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700 dark:text-green-300">Humidity</span>
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-200">
                              {plan.careData.humidity.range}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="care" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                              <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                                <Droplets className="h-4 w-4" />
                                Watering
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {plan.careData.watering.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Schedule: {plan.careData.watering.schedule}
                              </p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <h4 className="font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                Light Requirements
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {plan.careData.light.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Placement: {plan.careData.light.placement}
                              </p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                                <Leaf className="h-4 w-4" />
                                Soil & Repotting
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {plan.careData.soil.details}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Repotting: {plan.careData.soil.repotting}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                              <h4 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Fertilizing
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {plan.careData.fertilizer.details}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Frequency: {plan.careData.fertilizer.frequency}
                              </p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                <Scissors className="h-4 w-4" />
                                Pruning
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {plan.careData.pruning.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Best time: {plan.careData.pruning.best_time}
                              </p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                                <Thermometer className="h-4 w-4" />
                                Temperature & Humidity
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {plan.careData.humidity.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {plan.careData.temperature.seasonal_notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="seasonal" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                              🌱 Spring Care
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {plan.careData.seasonal_care.spring}
                            </p>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                              ☀️ Summer Care
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {plan.careData.seasonal_care.summer}
                            </p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                              🍂 Fall Care
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {plan.careData.seasonal_care.fall}
                            </p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                              ❄️ Winter Care
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {plan.careData.seasonal_care.winter}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="reminders" className="space-y-4 mt-4">
                        {plan.reminders.length > 0 ? (
                          <div className="space-y-3">
                            {plan.reminders.map((reminder, index) => (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border ${getPriorityColor(reminder.priority)}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">{reminder.type}</span>
                                  </div>
                                  <span className="text-xs">
                                    Due: {new Date(reminder.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm mt-2">{reminder.message}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-300">
                              No pending care reminders for this plant
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}