import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Leaf,
  Droplets,
  Sun,
  Calendar,
  MapPin,
  AlertCircle,
  Sprout,
  Edit,
  Trash2,
  Eye,
  X,
  Beaker,
  Thermometer,
  Lightbulb,
  TrendingUp,
  Bug,
  Sparkles,
  Clock,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FileText,
  Package,
  CheckCircle2,
  Brain,
  Stethoscope,
  MessageSquare,
  Users,
  Upload,
  Send,
  Camera,
  Flower,
  CloudRain,
  Wind,
  CloudSnow,
  Cloudy,
  Zap,
  Moon,
  Sunrise,
  Sunset,
  Activity,
  Share2,
  Phone,
  BookOpenCheck,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGardenPlantSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlantDetailView } from "./PlantDetailView";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Plant {
  id: string;
  name: string;
  species?: string;
  variety?: string;
  location?: string;
  status: "healthy" | "warning" | "critical" | "dormant";
  photoUrl?: string;
  dateAdded: string;
  soilType?: string;
  season?: string;
  wateringFrequency?: string;
  plantingDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Form schema for adding a new plant
const addPlantFormSchema = insertGardenPlantSchema.extend({
  name: z.string().min(1, "Plant name is required"),
});

// Analytics Tab Component
function AnalyticsTabContent() {
  const [harvestGroupBy, setHarvestGroupBy] = useState<'plant' | 'month' | 'bed'>('plant');
  
  const { data: wateringHealthData, isLoading: wateringHealthLoading } = useQuery({
    queryKey: ['/api/analytics/watering-health'],
  });
  
  const { data: tasksOverdueData, isLoading: tasksOverdueLoading } = useQuery({
    queryKey: ['/api/analytics/tasks-overdue'],
  });
  
  const { data: harvestData, isLoading: harvestLoading } = useQuery({
    queryKey: ['/api/analytics/harvest', harvestGroupBy],
  });
  
  const { data: successRateVarietyData, isLoading: successRateVarietyLoading } = useQuery({
    queryKey: ['/api/analytics/success-rate/variety'],
  });
  
  const { data: successRateSeasonData, isLoading: successRateSeasonLoading } = useQuery({
    queryKey: ['/api/analytics/success-rate/season'],
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <>
      {/* Watering Frequency vs Health Events */}
      <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-500 dark:from-blue-500 dark:to-cyan-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-6 w-6" />
            Watering Frequency vs Health Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {wateringHealthLoading ? (
            <p className="text-center py-8">Loading chart...</p>
          ) : wateringHealthData?.wateringActivities?.length === 0 && wateringHealthData?.healthEvents?.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No data available yet. Start tracking watering and health events!</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wateringHealthData?.wateringActivities || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Watering Events" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tasks Overdue Heatmap */}
      <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-rose-950/30 dark:via-pink-950/30 dark:to-red-950/30 border-2 border-rose-200 dark:border-rose-800">
        <CardHeader className="bg-gradient-to-r from-rose-400 to-pink-500 dark:from-rose-500 dark:to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Tasks Overdue Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {tasksOverdueLoading ? (
            <p className="text-center py-8">Loading chart...</p>
          ) : !tasksOverdueData || tasksOverdueData.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No overdue tasks! Great job!</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {tasksOverdueData.map((task: any, idx: number) => (
                task.daysOverdue > 0 && (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg ${
                      task.daysOverdue > 7 ? 'bg-red-100 dark:bg-red-900/30' : 
                      task.daysOverdue > 3 ? 'bg-orange-100 dark:bg-orange-900/30' : 
                      'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{task.plantName} - {task.activityType}</span>
                      <Badge variant={task.daysOverdue > 7 ? 'destructive' : 'default'}>
                        {task.daysOverdue} days overdue
                      </Badge>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Harvest Analytics */}
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-200 dark:border-green-800">
        <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-6 w-6" />
              Harvest Analytics
            </CardTitle>
            <Select value={harvestGroupBy} onValueChange={(val: any) => setHarvestGroupBy(val)}>
              <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plant">By Plant</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="bed">By Bed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {harvestLoading ? (
            <p className="text-center py-8">Loading chart...</p>
          ) : !harvestData || harvestData.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No harvest data yet. Start logging your harvests!</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={harvestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={harvestGroupBy === 'plant' ? 'plantName' : harvestGroupBy === 'month' ? 'month' : 'bedName'} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalYield" fill="#10b981" name="Total Yield" />
                <Bar dataKey="totalRevenue" fill="#3b82f6" name="Total Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate by Variety */}
        <Card className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/30 dark:via-violet-950/30 dark:to-indigo-950/30 border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="bg-gradient-to-r from-purple-400 to-violet-500 dark:from-purple-500 dark:to-violet-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Success Rate by Variety
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {successRateVarietyLoading ? (
              <p className="text-center py-8">Loading...</p>
            ) : !successRateVarietyData || successRateVarietyData.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No variety data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={successRateVarietyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.variety}: ${entry.successRate}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="successRate"
                  >
                    {successRateVarietyData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Success Rate by Season */}
        <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border-2 border-amber-200 dark:border-amber-800">
          <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Success Rate by Season
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {successRateSeasonLoading ? (
              <p className="text-center py-8">Loading...</p>
            ) : !successRateSeasonData || successRateSeasonData.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No season data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={successRateSeasonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="season" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#f59e0b" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function PremiumGardenDashboard() {
  const { user } = useAuth();
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user's plants
  const { data: plants = [], isLoading } = useQuery<Plant[]>({
    queryKey: ['/api/garden/plants'],
    enabled: !!user,
  });

  // Check WhatsApp eligibility for Pro users
  const { data: whatsappEligibility } = useQuery<{ eligible: boolean; reason?: string; hasProPlan: boolean; hasVerifiedPhone: boolean }>({
    queryKey: ['/api/social/whatsapp/eligibility'],
    enabled: !!user,
  });

  // Form for adding a new plant
  const form = useForm<z.infer<typeof addPlantFormSchema>>({
    resolver: zodResolver(addPlantFormSchema),
    defaultValues: {
      name: "",
      species: "",
      variety: "",
      location: "",
      status: "healthy",
    },
  });

  // Mutation for creating a new plant
  const createPlantMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addPlantFormSchema>) => {
      const response = await fetch("/api/garden/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Plant added to your diary successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/garden/plants'] });
      setShowAddPlant(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add plant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof addPlantFormSchema>) => {
    createPlantMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-950 dark:to-emerald-950 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Loading your garden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-slate-950 p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Elegant Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <span className="bg-gradient-to-br from-blue-400 to-purple-500 p-2.5 rounded-2xl shadow-lg">
                  <Sprout className="h-6 w-6 text-white" />
                </span>
                My Garden
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm ml-1">
                Your elegant garden management sanctuary
              </p>
            </div>
          </div>
        </div>

        {/* Elegant Tabbed Dashboard */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-11 mb-6 bg-white dark:bg-gray-800 p-1.5 h-auto shadow-[0_4px_20px_rgb(0,0,0,0.05)] rounded-2xl border border-gray-100 dark:border-gray-700">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-100 data-[state=active]:to-indigo-100 data-[state=active]:text-blue-700 dark:data-[state=active]:from-blue-900/40 dark:data-[state=active]:to-indigo-900/40 dark:data-[state=active]:text-blue-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-950/20" data-testid="tab-overview">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="plant-diary" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-100 data-[state=active]:to-teal-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:from-emerald-900/40 dark:data-[state=active]:to-teal-900/40 dark:data-[state=active]:text-emerald-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" data-testid="tab-plant-diary">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Diary</span>
            </TabsTrigger>
            <TabsTrigger value="smart-assistant" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-100 data-[state=active]:to-pink-100 data-[state=active]:text-purple-700 dark:data-[state=active]:from-purple-900/40 dark:data-[state=active]:to-pink-900/40 dark:data-[state=active]:text-purple-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-950/20" data-testid="tab-smart-assistant">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Smart AI</span>
            </TabsTrigger>
            <TabsTrigger value="environment" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-sky-100 data-[state=active]:to-cyan-100 data-[state=active]:text-sky-700 dark:data-[state=active]:from-sky-900/40 dark:data-[state=active]:to-cyan-900/40 dark:data-[state=active]:text-sky-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-sky-50 dark:hover:bg-sky-950/20" data-testid="tab-environment">
              <Sun className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Environment</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-100 data-[state=active]:to-purple-100 data-[state=active]:text-violet-700 dark:data-[state=active]:from-violet-900/40 dark:data-[state=active]:to-purple-900/40 dark:data-[state=active]:text-violet-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-violet-50 dark:hover:bg-violet-950/20" data-testid="tab-planning">
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Planning</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-orange-100 data-[state=active]:text-amber-700 dark:data-[state=active]:from-amber-900/40 dark:data-[state=active]:to-orange-900/40 dark:data-[state=active]:text-amber-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-950/20" data-testid="tab-inventory">
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-100 data-[state=active]:to-pink-100 data-[state=active]:text-rose-700 dark:data-[state=active]:from-rose-900/40 dark:data-[state=active]:to-pink-900/40 dark:data-[state=active]:text-rose-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-950/20" data-testid="tab-analytics">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-100 data-[state=active]:to-amber-100 data-[state=active]:text-orange-700 dark:data-[state=active]:from-orange-900/40 dark:data-[state=active]:to-amber-900/40 dark:data-[state=active]:text-orange-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-orange-50 dark:hover:bg-orange-950/20" data-testid="tab-calendar">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-100 data-[state=active]:to-blue-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:from-indigo-900/40 dark:data-[state=active]:to-blue-900/40 dark:data-[state=active]:text-indigo-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20" data-testid="tab-reports">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-teal-100 data-[state=active]:to-cyan-100 data-[state=active]:text-teal-700 dark:data-[state=active]:from-teal-900/40 dark:data-[state=active]:to-cyan-900/40 dark:data-[state=active]:text-teal-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-teal-50 dark:hover:bg-teal-950/20" data-testid="tab-social">
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Social</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-100 data-[state=active]:to-emerald-100 data-[state=active]:text-green-700 dark:data-[state=active]:from-green-900/40 dark:data-[state=active]:to-emerald-900/40 dark:data-[state=active]:text-green-300 py-2 px-3 rounded-xl transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-950/20" data-testid="tab-manual">
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Manual</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Elegant Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-500 dark:text-blue-400 font-semibold mb-1.5">Total Plants</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">{plants.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-2.5 rounded-xl">
                    <Sprout className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/50 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold mb-1.5">Healthy</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      {plants.filter(p => p.status === "healthy").length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 rounded-xl">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900/50 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold mb-1.5">Need Attention</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {plants.filter(p => p.status === "warning").length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-100 dark:border-rose-900/50 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold mb-1.5">Critical</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                      {plants.filter(p => p.status === "critical").length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-2.5 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

            {/* Elegant Due Soon Tasks */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-[0_4px_20px_rgb(0,0,0,0.05)]">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold">Due Soon - Next 7 Days</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plants.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>No plants in your garden yet. Add plants to start tracking care activities!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {plants.slice(0, 3).map((plant) => (
                        <div 
                          key={plant.id} 
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-900 hover:shadow-md transition-all"
                          data-testid={`due-task-${plant.id}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{plant.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {plant.wateringFrequency ? `Watering: ${plant.wateringFrequency}` : 'Check care schedule'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Due today</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              <Droplets className="h-3 w-3 mr-1" />
                              Water
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    {plants.length > 3 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
                        + {plants.length - 3} more tasks. View Calendar tab for full schedule.
                      </p>
                    )}
                    {plants.length <= 3 && plants.length > 0 && (
                      <p className="text-sm text-green-500 dark:text-green-400 text-center mt-4 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        You're all caught up! Great job keeping your garden healthy.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Overview - Recent Plants */}
            <div className="mt-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick overview of your garden. View the Plant Diary tab for detailed management.
              </p>
            </div>
          </TabsContent>

          {/* Plant Diary Tab */}
          <TabsContent value="plant-diary" className="space-y-6">
            {/* Elegant Add Plant Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowAddPlant(true)}
                className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] transition-all duration-300"
                data-testid="button-add-plant"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Plant
              </Button>
            </div>

            {/* Plant List */}
            {plants.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-[0_4px_20px_rgb(0,0,0,0.05)] text-center py-12">
            <CardContent>
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Sprout className="h-12 w-12 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
                No plants in your diary yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
                Start tracking your plants' growth journey today!
              </p>
              <Button 
                onClick={() => setShowAddPlant(true)}
                className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                data-testid="button-add-first-plant"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Plant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <Card key={plant.id} className={`border hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 ${
                plant.status === "healthy" ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800" :
                plant.status === "warning" ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800" :
                plant.status === "critical" ? "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800" :
                "bg-white dark:from-gray-800 border-gray-200 dark:border-gray-700"
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1 flex items-center gap-2">
                        {plant.name}
                        {plant.status === "healthy" && <Leaf className="h-4 w-4 text-green-500" />}
                      </CardTitle>
                      {plant.species && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">{plant.species}</p>
                      )}
                    </div>
                    <Badge className={
                      plant.status === "healthy" ? "bg-green-400 hover:bg-green-500 text-white" :
                      plant.status === "warning" ? "bg-yellow-400 hover:bg-yellow-500 text-white" :
                      plant.status === "critical" ? "bg-red-400 hover:bg-red-500 text-white" : ""
                    }>
                      {plant.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plant.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{plant.location}</span>
                    </div>
                  )}
                  {plant.soilType && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Sun className="h-4 w-4 text-gray-500" />
                      <span>Soil: {plant.soilType}</span>
                    </div>
                  )}
                  {plant.wateringFrequency && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Droplets className="h-4 w-4 text-gray-500" />
                      <span>Water: {plant.wateringFrequency}</span>
                    </div>
                  )}
                  {plant.season && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Season: {plant.season}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedPlantId(plant.id)}
                      data-testid={`button-view-${plant.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`button-edit-${plant.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Last Updated Timestamp */}
                  {plant.updatedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700 mt-3">
                      <Clock className="h-3 w-3" />
                      <span>
                        Updated: {new Date(plant.updatedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          {/* Smart Assistant Tab */}
          <TabsContent value="smart-assistant" className="space-y-6">
            {/* Disease/Pest Detection */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-[0_4px_20px_rgb(0,0,0,0.05)]">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-xl">
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent font-bold">Disease & Pest Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload a photo of your plant to detect diseases, pests, or health issues. Our AI will analyze the image and provide actionable recommendations.
                  </p>
                  <div className="flex items-center gap-4">
                    <Input type="file" accept="image/*" className="flex-1 border-gray-200 dark:border-gray-700" data-testid="input-disease-photo" />
                    <Button className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]" data-testid="button-analyze-disease">
                      <Camera className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-xl p-4 border border-rose-100 dark:border-rose-900/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Results will appear here after analysis...</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrient Deficiency Checker */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-[0_4px_20px_rgb(0,0,0,0.05)]">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl">
                    <Beaker className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold">Nutrient Deficiency Checker</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Describe the symptoms your plant is showing, and we'll identify the likely nutrient deficiency and suggest solutions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Plant</label>
                      <Select>
                        <SelectTrigger data-testid="select-plant-nutrient">
                          <SelectValue placeholder="Choose a plant" />
                        </SelectTrigger>
                        <SelectContent>
                          {plants.map((plant) => (
                            <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Symptom Type</label>
                      <Select>
                        <SelectTrigger data-testid="select-symptom-type">
                          <SelectValue placeholder="Select symptom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yellowing">Yellowing Leaves</SelectItem>
                          <SelectItem value="browning">Brown Spots/Edges</SelectItem>
                          <SelectItem value="curling">Leaf Curling</SelectItem>
                          <SelectItem value="stunted">Stunted Growth</SelectItem>
                          <SelectItem value="wilting">Wilting</SelectItem>
                          <SelectItem value="discoloration">Discoloration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Describe the symptoms in detail (e.g., 'Lower leaves turning yellow with green veins, leaves dropping...')" 
                    className="min-h-[80px]"
                    data-testid="textarea-nutrient-symptoms"
                  />
                  <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]" data-testid="button-check-nutrient">
                    <Brain className="h-4 w-4 mr-2" />
                    Check Deficiency
                  </Button>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Diagnosis and recommendations will appear here...</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expert Q&A Chat */}
            <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Expert Q&A Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Ask our AI gardening expert anything about your plants. Get instant answers to questions like "What's wrong with my tomato leaves?" or "How do I propagate succulents?"
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800 min-h-[200px] max-h-[300px] overflow-y-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chat history will appear here...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Ask a question... (e.g., 'Why are my tomato leaves curling?')" 
                      className="flex-1"
                      data-testid="input-expert-question"
                    />
                    <Button className="bg-blue-400 hover:bg-blue-500" data-testid="button-ask-expert">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Companion Planting Suggestions */}
            <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-200 dark:border-green-800">
              <CardHeader className="bg-gradient-to-r from-green-400 to-teal-500 dark:from-green-500 dark:to-teal-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Companion Planting Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Get personalized companion planting recommendations for your garden beds and planters. Maximize growth and pest protection through strategic plant placement.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Your Plant</label>
                      <Select>
                        <SelectTrigger data-testid="select-plant-companion">
                          <SelectValue placeholder="Choose a plant" />
                        </SelectTrigger>
                        <SelectContent>
                          {plants.map((plant) => (
                            <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Growing Location</label>
                      <Select>
                        <SelectTrigger data-testid="select-location-companion">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="raised_bed">Raised Bed</SelectItem>
                          <SelectItem value="container">Container</SelectItem>
                          <SelectItem value="ground">In Ground</SelectItem>
                          <SelectItem value="greenhouse">Greenhouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full bg-green-400 hover:bg-green-500" data-testid="button-get-companions">
                    <Sprout className="h-4 w-4 mr-2" />
                    Get Companion Suggestions
                  </Button>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Companion planting recommendations will appear here...</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variety Recommendations */}
            <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 border-2 border-violet-200 dark:border-violet-800">
              <CardHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-600 dark:from-violet-600 dark:to-fuchsia-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  Variety Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Get personalized plant variety recommendations based on your climate zone, season, and growing conditions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Plant Type</label>
                      <Select>
                        <SelectTrigger data-testid="select-plant-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="herbs">Herbs</SelectItem>
                          <SelectItem value="flowers">Flowers</SelectItem>
                          <SelectItem value="trees">Trees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Season</label>
                      <Select>
                        <SelectTrigger data-testid="select-season-variety">
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spring">Spring</SelectItem>
                          <SelectItem value="summer">Summer</SelectItem>
                          <SelectItem value="fall">Fall</SelectItem>
                          <SelectItem value="winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Climate Zone</label>
                      <Input placeholder="e.g., Zone 7a" data-testid="input-climate-zone" />
                    </div>
                  </div>
                  <Button className="w-full bg-violet-500 hover:bg-violet-600" data-testid="button-get-varieties">
                    <Leaf className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </Button>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Variety recommendations will appear here...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environment & Automation Tab */}
          <TabsContent value="environment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Weather Dashboard */}
              <Card className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-2 border-sky-200 dark:border-sky-800">
                <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-600 dark:to-blue-700 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sun className="h-5 w-5" />
                    Weather Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Location Input */}
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter your city or ZIP code" 
                      data-testid="input-location"
                      className="flex-1"
                    />
                    <Button data-testid="button-get-weather" className="bg-sky-600 hover:bg-sky-700">
                      Get Weather
                    </Button>
                  </div>

                  {/* Today's Weather */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sky-200 dark:border-sky-900">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      Today's Conditions
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm" data-testid="weather-today">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">Temp:</span>
                        <span className="font-medium">-- °F</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">Humidity:</span>
                        <span className="font-medium">-- %</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Wind:</span>
                        <span className="font-medium">-- mph</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">Rain:</span>
                        <span className="font-medium">-- in</span>
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Forecast */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sky-200 dark:border-sky-900">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-sky-500" />
                      7-Day Forecast
                    </h4>
                    <div className="space-y-2" data-testid="weather-forecast">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b dark:border-gray-700 last:border-0">
                          <span className="text-gray-600 dark:text-gray-400 w-20">Day {i + 1}</span>
                          <div className="flex items-center gap-2 flex-1">
                            <Cloudy className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-500">--</span>
                          </div>
                          <span className="font-medium">--°F</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weather Alerts */}
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
                    <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Active Alerts
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300" data-testid="weather-alerts">
                      No active weather alerts for your area.
                    </p>
                  </div>

                  {/* Rain-Skip Watering */}
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">Rain-Skip Watering</span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700" data-testid="rain-skip-status">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Skip watering if ≥0.25" rain forecasted in next 24h
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Microclimate Tracking */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800">
                <CardHeader className="bg-gradient-to-r from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Thermometer className="h-5 w-5" />
                    Microclimate Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Log temperature, humidity, and light levels for different zones in your garden.
                  </p>

                  {/* Manual Log Entry Form */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-900 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Add Manual Log</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Zone/Location</label>
                        <Input placeholder="e.g., North Garden" data-testid="input-zone" className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Temperature (°F)</label>
                        <Input type="number" placeholder="72" data-testid="input-temperature" className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Humidity (%)</label>
                        <Input type="number" placeholder="65" data-testid="input-humidity" className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Light (Lux)</label>
                        <Input type="number" placeholder="15000" data-testid="input-light" className="h-8 text-sm" />
                      </div>
                    </div>
                    
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-8 text-sm" data-testid="button-log-microclimate">
                      <Activity className="h-3.5 w-3.5 mr-2" />
                      Log Data
                    </Button>
                  </div>

                  {/* Recent Logs */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-900">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Recent Logs</h4>
                    <div className="space-y-2" data-testid="microclimate-logs">
                      <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-4">
                        No microclimate data logged yet. Start tracking your garden zones!
                      </p>
                    </div>
                  </div>

                  {/* Sensor Integration Note */}
                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Future Enhancement:</strong> Connect IoT sensors for automatic data collection
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Irrigation Schedule Helper */}
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-2 border-cyan-200 dark:border-cyan-800">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Droplets className="h-5 w-5" />
                    Irrigation Schedule Helper
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Calculate optimal watering based on ET (evapotranspiration), rainfall, and temperature.
                  </p>

                  {/* ET Calculator */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-cyan-200 dark:border-cyan-900 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Beaker className="h-4 w-4 text-cyan-600" />
                      Water Need Calculator
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Avg Temp (°F)</label>
                        <Input type="number" placeholder="75" data-testid="input-avg-temp" className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Rainfall (in)</label>
                        <Input type="number" placeholder="0.5" data-testid="input-rainfall" className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Plant Type</label>
                        <Select>
                          <SelectTrigger data-testid="select-plant-type" className="h-8 text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="flowers">Flowers</SelectItem>
                            <SelectItem value="trees">Trees/Shrubs</SelectItem>
                            <SelectItem value="lawn">Lawn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Soil Type</label>
                        <Select>
                          <SelectTrigger data-testid="select-soil-type" className="h-8 text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="loam">Loam</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 h-8 text-sm" data-testid="button-calculate-irrigation">
                      Calculate Water Needs
                    </Button>
                  </div>

                  {/* Irrigation Recommendation */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">Recommended Schedule</h4>
                    <div className="space-y-2 text-xs" data-testid="irrigation-recommendation">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-600 dark:text-gray-400">Water Amount:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">-- inches/week</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">-- times/week</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">-- min/session</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Tips */}
                  <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <Lightbulb className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                      Water early morning (6-10 AM) to reduce evaporation and disease risk
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Moon Phase & Planting Calendar */}
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-200 dark:border-indigo-800">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Moon className="h-5 w-5" />
                    Moon Phase & Planting Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Traditional lunar gardening guidance for planting and harvesting.
                  </p>

                  {/* Current Moon Phase */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-900">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-600" />
                      Current Moon Phase
                    </h4>
                    <div className="text-center py-4" data-testid="moon-phase">
                      <div className="text-4xl mb-2">🌕</div>
                      <p className="font-medium text-gray-900 dark:text-white">Full Moon</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Best for harvesting and transplanting</p>
                    </div>
                  </div>

                  {/* Planting Recommendations by Moon Phase */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-200 dark:border-indigo-900">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Lunar Planting Guide</h4>
                    <div className="space-y-2 text-xs" data-testid="lunar-guide">
                      <div className="flex items-start gap-2 py-1.5 border-b dark:border-gray-700">
                        <span className="text-lg">🌑</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">New Moon</p>
                          <p className="text-gray-600 dark:text-gray-400">Plant leafy annuals (lettuce, spinach, celery)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 py-1.5 border-b dark:border-gray-700">
                        <span className="text-lg">🌓</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">First Quarter</p>
                          <p className="text-gray-600 dark:text-gray-400">Plant fruiting annuals (tomatoes, peppers, beans)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 py-1.5 border-b dark:border-gray-700">
                        <span className="text-lg">🌕</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Full Moon</p>
                          <p className="text-gray-600 dark:text-gray-400">Plant root crops & perennials (carrots, potatoes)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 py-1.5">
                        <span className="text-lg">🌘</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Last Quarter</p>
                          <p className="text-gray-600 dark:text-gray-400">Avoid planting; focus on pruning & weeding</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seasonal Planting Calendar */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
                    <div className="flex items-center gap-2 mb-2">
                      <Sunrise className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Best Planting Times</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Spring (Mar-May): Cool-season crops • Summer (Jun-Aug): Heat-loving plants • Fall (Sep-Nov): Root vegetables
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Planning & Layout Tab */}
          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Garden Map - Beds & Containers */}
              <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 border-2 border-violet-200 dark:border-violet-800">
                <CardHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-600 dark:from-violet-600 dark:to-fuchsia-700 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5" />
                    Garden Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create and manage your garden beds, containers, and planting zones
                  </p>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white" 
                      size="sm"
                      data-testid="button-add-bed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bed/Container
                    </Button>
                    
                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-violet-200 dark:border-violet-900">
                      <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-100 mb-2">Your Beds</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        <div className="flex items-center justify-between p-2 bg-violet-50 dark:bg-violet-950/30 rounded border border-violet-200 dark:border-violet-800">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">Raised Bed #1</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">4×8 ft • Full Sun</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" data-testid="button-edit-bed">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" data-testid="button-delete-bed">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-2">
                          Add your first bed to get started
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-violet-100 dark:bg-violet-950/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-violet-600" />
                      <span className="text-sm font-medium text-violet-900 dark:text-violet-100">Quick Stats</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white dark:bg-gray-800/50 rounded p-2">
                        <p className="text-gray-600 dark:text-gray-400">Total Beds</p>
                        <p className="text-lg font-bold text-violet-600">0</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800/50 rounded p-2">
                        <p className="text-gray-600 dark:text-gray-400">Active Plants</p>
                        <p className="text-lg font-bold text-violet-600">0</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crop Rotation Tracker */}
              <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800">
                <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5" />
                    Crop Rotation Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track planting history and get rotation warnings
                  </p>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                      size="sm"
                      data-testid="button-check-rotation"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Check Rotation Conflict
                    </Button>

                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Recent History</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-2">
                          No rotation history yet
                        </p>
                      </div>
                    </div>

                    <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                        Rotate plant families yearly to prevent disease and maintain soil health
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-950/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Plant Families</h4>
                    <div className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                      <p>🍅 Nightshade: Tomatoes, Peppers, Eggplant</p>
                      <p>🥬 Brassica: Cabbage, Broccoli, Kale</p>
                      <p>🫛 Legume: Beans, Peas, Lentils</p>
                      <p>🥕 Root: Carrots, Beets, Radish</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Planting Schedule Generator */}
            <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 border-2 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="bg-gradient-to-r from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 text-white rounded-t-lg pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  Planting Schedule Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate customized planting schedules based on your location and season
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Season</label>
                    <Select>
                      <SelectTrigger className="h-9 text-sm" data-testid="select-season">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spring">Spring</SelectItem>
                        <SelectItem value="summer">Summer</SelectItem>
                        <SelectItem value="fall">Fall</SelectItem>
                        <SelectItem value="winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Zone</label>
                    <Input 
                      placeholder="e.g., 5b" 
                      className="h-9 text-sm" 
                      data-testid="input-zone"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Year</label>
                    <Input 
                      type="number" 
                      placeholder="2025" 
                      defaultValue={new Date().getFullYear()}
                      className="h-9 text-sm" 
                      data-testid="input-year"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                  size="sm"
                  data-testid="button-generate-schedule"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Schedule
                </Button>

                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-emerald-200 dark:border-emerald-900">
                  <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Your Schedules</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-2">
                      Generate your first schedule to see planting dates
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Sow Date</p>
                    <p className="text-sm font-semibold text-emerald-500">Mar 15</p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Transplant</p>
                    <p className="text-sm font-semibold text-emerald-500">Apr 20</p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Harvest</p>
                    <p className="text-sm font-semibold text-emerald-500">Jul 5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory & Costs Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Financial Summary Card */}
            <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-yellow-600 text-white rounded-t-lg pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Expenses</p>
                    <p className="text-lg font-bold text-red-500">$0.00</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-lg font-bold text-green-500">$0.00</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Net Profit</p>
                    <p className="text-lg font-bold text-blue-500">$0.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seeds Inventory */}
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-200 dark:border-green-800">
                <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sprout className="h-5 w-5" />
                    Seeds Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm" data-testid="button-add-seed">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Seeds
                  </Button>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-green-200 dark:border-green-900">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Your Seeds</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-4">
                      No seeds in inventory. Add your first seed packet!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Supplies Inventory */}
              <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-sky-950/30 border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-500 dark:from-blue-500 dark:to-cyan-600 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5" />
                    Supplies & Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm" data-testid="button-add-supply">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supply
                  </Button>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Supplies</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-4">
                      No supplies tracked yet
                    </p>
                  </div>
                  <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                      Low Stock Alerts: 0 items need attention
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expenses Tracker */}
              <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-rose-950/30 dark:via-pink-950/30 dark:to-red-950/30 border-2 border-rose-200 dark:border-rose-800">
                <CardHeader className="bg-gradient-to-r from-rose-400 to-pink-500 dark:from-rose-500 dark:to-pink-600 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5" />
                    Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white" size="sm" data-testid="button-add-expense">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-rose-200 dark:border-rose-900">
                    <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-100 mb-2">Recent Expenses</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-4">
                      No expenses recorded yet
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Harvest Log */}
              <Card className="bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 dark:from-lime-950/30 dark:via-green-950/30 dark:to-emerald-950/30 border-2 border-lime-200 dark:border-lime-800">
                <CardHeader className="bg-gradient-to-r from-lime-500 to-green-600 dark:from-lime-600 dark:to-green-700 text-white rounded-t-lg pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Leaf className="h-5 w-5" />
                    Harvest Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white" size="sm" data-testid="button-add-harvest">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Harvest
                  </Button>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-lime-200 dark:border-lime-900">
                    <h4 className="text-sm font-semibold text-lime-900 dark:text-lime-100 mb-2">Recent Harvests</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center py-4">
                      No harvests logged yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTabContent />
          </TabsContent>

          {/* Calendar Tab - Colorful coming soon */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-orange-950/30 dark:via-pink-950/30 dark:to-purple-950/30 border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-pink-500 dark:from-orange-500 dark:to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-6 w-6" />
                  Garden Calendar & Care Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <CalendarDays className="h-20 w-20 mx-auto text-orange-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Track care schedules, watering reminders, seasonal planting guides, and important gardening dates all in one place.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <Droplets className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-sm font-medium">Watering Schedule</p>
                    </div>
                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <Sun className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                      <p className="text-sm font-medium">Seasonal Reminders</p>
                    </div>
                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <Sprout className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-sm font-medium">Care Tasks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab - Colorful coming soon */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-2 border-indigo-200 dark:border-indigo-800">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Garden Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <TrendingUp className="h-20 w-20 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Generate detailed reports on plant growth, care history, and garden performance with beautiful visualizations.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <p className="text-sm font-medium">Growth Tracking</p>
                    </div>
                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <Sparkles className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <p className="text-sm font-medium">Health Analytics</p>
                    </div>
                    <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-sm font-medium">PDF Reports</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social & Sharing Tab */}
          <TabsContent value="social" className="space-y-6">
            {/* Care Sheet Export */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-teal-400 to-cyan-500 dark:from-teal-500 dark:to-cyan-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Care Sheet Export
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Generate and export detailed care sheets for your plants. Perfect for sharing or printing.
                </p>
                <div className="space-y-3">
                  {plants.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No plants to export yet. Add plants to get started!</p>
                  ) : (
                    plants.map((plant) => (
                      <div key={plant.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Leaf className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">{plant.name}</p>
                            <p className="text-xs text-gray-500">{plant.species || 'Unknown species'}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const response = await apiRequest(`/api/social/care-sheet/${plant.id}`, {
                                method: 'GET',
                              });
                              
                              const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${plant.name}-care-sheet.json`;
                              a.click();
                              window.URL.revokeObjectURL(url);
                              
                              toast({
                                title: "Care Sheet Downloaded",
                                description: `Care sheet for ${plant.name} has been downloaded.`,
                              });
                            } catch (error) {
                              toast({
                                title: "Export Failed",
                                description: "Failed to generate care sheet.",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid={`button-export-${plant.id}`}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Share Plant Profile */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-cyan-400 to-teal-500 dark:from-cyan-500 dark:to-teal-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Plant Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create shareable links for your plant profiles. Perfect for sharing with friends or on social media.
                </p>
                
                {whatsappEligibility?.hasProPlan && !whatsappEligibility?.hasVerifiedPhone && (
                  <Alert className="mb-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                    <Phone className="h-4 w-4 text-green-500 dark:text-green-400" />
                    <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                      <strong>Pro Feature:</strong> Verify your phone number in your profile to unlock WhatsApp sharing and send plant profiles directly to your registered number!
                    </AlertDescription>
                  </Alert>
                )}
                
                {!whatsappEligibility?.hasProPlan && (
                  <Alert className="mb-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Upgrade to Pro:</strong> WhatsApp sharing is available for Pro and Premium members. Messages are sent only to your verified phone number for security.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {plants.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No plants to share yet. Add plants to get started!</p>
                  ) : (
                    plants.slice(0, 3).map((plant) => (
                      <div key={plant.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Leaf className="h-5 w-5 text-teal-500" />
                          <div>
                            <p className="font-medium text-sm">{plant.name}</p>
                            <p className="text-xs text-gray-500">{plant.species || 'Unknown species'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const link = await apiRequest('/api/social/shared-links', {
                                  method: 'POST',
                                  body: JSON.stringify({
                                    plantId: plant.id,
                                    title: `${plant.name} - My Garden Plant`,
                                    description: `Check out my ${plant.species || 'plant'}!`,
                                    isPublic: true,
                                    allowComments: false,
                                  }),
                                });
                                
                                const shareUrl = `${window.location.origin}/shared/${link.shareToken}`;
                                await navigator.clipboard.writeText(shareUrl);
                                
                                toast({
                                  title: "Link Copied!",
                                  description: `Shareable link for ${plant.name} copied to clipboard.`,
                                });
                              } catch (error) {
                                toast({
                                  title: "Failed to Create Link",
                                  description: "Could not generate shareable link.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            data-testid={`button-share-${plant.id}`}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                          
                          {whatsappEligibility?.eligible && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900"
                              onClick={async () => {
                                try {
                                  const link = await apiRequest('/api/social/shared-links', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      plantId: plant.id,
                                      title: `${plant.name} - My Garden Plant`,
                                      description: `Check out my ${plant.species || 'plant'}!`,
                                      isPublic: true,
                                      allowComments: false,
                                    }),
                                  });
                                  
                                  await apiRequest('/api/social/whatsapp/share-plant', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      plantId: plant.id,
                                      shareToken: link.shareToken,
                                    }),
                                  });
                                  
                                  toast({
                                    title: "Sent via WhatsApp!",
                                    description: `Plant profile sent to your registered number.`,
                                  });
                                } catch (error) {
                                  toast({
                                    title: "WhatsApp Failed",
                                    description: "Could not send via WhatsApp. Check your phone verification.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              data-testid={`button-whatsapp-${plant.id}`}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ask an Expert */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-400 to-indigo-500 dark:from-purple-500 dark:to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ask an Expert
                  {user?.subscriptionPlanId === 'pro' && (
                    <Badge className="bg-yellow-400 text-white">Priority</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get help from gardening experts. {user?.subscriptionPlanId === 'pro' ? 'As a Pro member, you get priority responses!' : 'Upgrade to Pro for priority support!'}
                </p>

                {/* Consultation Pricing */}
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Consultation Fee</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Per expert question</p>
                    </div>
                    <div className="text-right">
                      {user?.subscriptionPlanId === 'pro' ? (
                        <div>
                          <p className="text-lg font-bold text-green-500 dark:text-green-400 flex items-center gap-2">
                            $4.99
                            <Badge className="bg-green-400 text-white text-xs">50% OFF</Badge>
                          </p>
                          <p className="text-xs text-gray-500 line-through">$9.99</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">$9.99</p>
                          <p className="text-xs text-green-500 dark:text-green-400">Save 50% with Pro!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Plant (Optional)</label>
                    <Select>
                      <SelectTrigger data-testid="select-expert-plant">
                        <SelectValue placeholder="Choose a plant or ask a general question" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Question</SelectItem>
                        {plants.map((plant) => (
                          <SelectItem key={plant.id} value={plant.id}>
                            {plant.name} - {plant.species}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      placeholder="Brief description of your question"
                      data-testid="input-expert-subject"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Question</label>
                    <Textarea
                      placeholder="Describe your plant care question in detail..."
                      className="min-h-[120px]"
                      data-testid="textarea-expert-question"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Urgency Level</label>
                    <Select defaultValue="medium">
                      <SelectTrigger data-testid="select-urgency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General Question</SelectItem>
                        <SelectItem value="medium">Medium - Need Advice Soon</SelectItem>
                        <SelectItem value="high">High - Urgent Plant Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Upload photos (up to 5)</p>
                    <Button variant="outline" size="sm" data-testid="button-upload-photos">
                      <Upload className="h-4 w-4 mr-1" />
                      Choose Files
                    </Button>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-400 to-indigo-500 text-white" data-testid="button-submit-expert">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Question
                  </Button>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Expert responses are saved to your plant's care history for future reference.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Digest Email */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Weekly Garden Digest
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get a weekly summary of your garden's health, tasks, and personalized tips delivered to your inbox.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                    <div>
                      <p className="font-medium text-sm">Enable Weekly Digest</p>
                      <p className="text-xs text-gray-500">Receive garden updates every week</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-400"
                      data-testid="checkbox-digest-enabled"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred Day</label>
                    <Select defaultValue="monday">
                      <SelectTrigger data-testid="select-digest-day">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Include in Digest</label>
                    <div className="space-y-2">
                      {['Plant Health Status', 'Upcoming Tasks', 'Recent Harvests', 'Garden Tips', 'Weather Forecast'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                            data-testid={`checkbox-digest-${item.toLowerCase().replace(/\s+/g, '-')}`}
                          />
                          <label className="text-sm">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white" data-testid="button-save-digest">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Manual Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-emerald-400 to-green-500 dark:from-emerald-500 dark:to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenCheck className="h-6 w-6" />
                    My Garden Dashboard - User Manual
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white text-emerald-500 hover:bg-emerald-50"
                    onClick={() => {
                      import('jspdf').then(({ default: jsPDF }) => {
                        const doc = new jsPDF();
                        let yPosition = 20;
                        
                        // Title
                        doc.setFontSize(20);
                        doc.setTextColor(16, 185, 129);
                        doc.text('My Garden Dashboard', 105, yPosition, { align: 'center' });
                        yPosition += 10;
                        doc.setFontSize(16);
                        doc.text('User Manual', 105, yPosition, { align: 'center' });
                        yPosition += 15;
                        
                        // Overview Section
                        doc.setFontSize(14);
                        doc.setTextColor(0, 0, 0);
                        doc.text('1. Overview Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const overviewText = 'View your garden at a glance with key statistics including total plants, health status, tasks due soon, and recent activity summary.';
                        const overviewLines = doc.splitTextToSize(overviewText, 170);
                        doc.text(overviewLines, 20, yPosition);
                        yPosition += overviewLines.length * 5 + 8;
                        
                        // Plant Diary
                        doc.setFontSize(14);
                        doc.text('2. Plant Diary Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const diaryText = 'Manage individual plants with detailed tracking. Add new plants, view care history, update health status, and track growth progress. Each plant card shows name, species, location, watering needs, and current health.';
                        const diaryLines = doc.splitTextToSize(diaryText, 170);
                        doc.text(diaryLines, 20, yPosition);
                        yPosition += diaryLines.length * 5 + 8;
                        
                        // Smart Assistant
                        doc.setFontSize(14);
                        doc.text('3. Smart Assistant Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const smartText = 'AI-powered tools: Disease & Pest Detection (upload photos for diagnosis), Nutrient Deficiency Checker, Expert Q&A, Companion Planting suggestions, and Variety Recommendations based on your climate.';
                        const smartLines = doc.splitTextToSize(smartText, 170);
                        doc.text(smartLines, 20, yPosition);
                        yPosition += smartLines.length * 5 + 8;
                        
                        // Environment & Automation
                        doc.setFontSize(14);
                        doc.text('4. Environment & Automation Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const envText = 'Weather Dashboard with 7-day forecast, Microclimate Tracking for different zones, Irrigation Schedule Helper, and Moon Phase Calendar for optimal planting times.';
                        const envLines = doc.splitTextToSize(envText, 170);
                        doc.text(envLines, 20, yPosition);
                        yPosition += envLines.length * 5 + 8;
                        
                        // Check if we need a new page
                        if (yPosition > 250) {
                          doc.addPage();
                          yPosition = 20;
                        }
                        
                        // Planning & Layout
                        doc.setFontSize(14);
                        doc.text('5. Planning & Layout Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const planText = 'Design your garden with Garden Map (beds & containers), track Crop Rotation to maintain soil health, and generate Planting Schedules based on your location and season.';
                        const planLines = doc.splitTextToSize(planText, 170);
                        doc.text(planLines, 20, yPosition);
                        yPosition += planLines.length * 5 + 8;
                        
                        // Inventory & Costs
                        doc.setFontSize(14);
                        doc.text('6. Inventory & Costs Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const invText = 'Financial Summary with expenses/revenue tracking, Seeds Inventory with viability dates, Supplies & Materials with low-stock alerts, Expenses Tracker, and Harvest Logs to record yield and revenue.';
                        const invLines = doc.splitTextToSize(invText, 170);
                        doc.text(invLines, 20, yPosition);
                        yPosition += invLines.length * 5 + 8;
                        
                        // Analytics
                        doc.setFontSize(14);
                        doc.text('7. Analytics Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const analyticsText = 'Data visualizations: Watering vs Health Events chart, Tasks Overdue Heatmap, Harvest Analytics by plant/month/bed, Success Rate by Variety (pie chart), and Success Rate by Season.';
                        const analyticsLines = doc.splitTextToSize(analyticsText, 170);
                        doc.text(analyticsLines, 20, yPosition);
                        yPosition += analyticsLines.length * 5 + 8;
                        
                        // Social & Sharing
                        doc.setFontSize(14);
                        doc.text('8. Social & Sharing Tab', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const socialText = 'Export Care Sheets (JSON), Share Plant Profiles via link or WhatsApp (Pro only), Ask an Expert (priority for Pro/Premium), and Weekly Garden Digest email subscription.';
                        const socialLines = doc.splitTextToSize(socialText, 170);
                        doc.text(socialLines, 20, yPosition);
                        yPosition += socialLines.length * 5 + 8;
                        
                        // Calendar & Reports
                        doc.setFontSize(14);
                        doc.text('9. Calendar & Reports Tabs', 20, yPosition);
                        yPosition += 8;
                        doc.setFontSize(10);
                        const comingSoonText = 'Coming Soon: Comprehensive garden calendar for care schedules and seasonal reminders, plus detailed performance reports with PDF generation.';
                        const comingSoonLines = doc.splitTextToSize(comingSoonText, 170);
                        doc.text(comingSoonLines, 20, yPosition);
                        
                        // Save PDF
                        doc.save('My-Garden-User-Manual.pdf');
                        
                        toast({
                          title: "PDF Downloaded!",
                          description: "User manual has been saved to your downloads.",
                        });
                      });
                    }}
                    data-testid="button-download-manual"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 max-w-4xl">
                <div className="prose dark:prose-invert max-w-none">
                  
                  {/* Introduction */}
                  <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Welcome to My Garden Dashboard!</h3>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                      Your comprehensive garden management platform. This manual covers all features across 10 specialized tabs designed to help you grow healthier plants, track progress, and optimize your gardening efforts.
                    </p>
                  </div>

                  {/* 1. Overview Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-blue-500" />
                      1. Overview Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Stats Bar</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">View key metrics at a glance: Total Plants, Healthy count, plants needing attention, and critical cases.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Due Soon Tray</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">See tasks due within the next 7 days to stay on top of plant care.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Quick Overview</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recent activity snapshot showing your latest garden updates.</p>
                      </div>
                    </div>
                  </section>

                  {/* 2. Plant Diary Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-500" />
                      2. Plant Diary Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Add New Plants</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click "Add New Plant" to record plant details: name, species, variety, location, soil type, watering frequency, and planting season.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Plant Cards</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Each plant displays essential info with health status indicators (Healthy, Warning, Critical). View detailed care history or edit plant information.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Track Progress</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monitor growth, update health status, and maintain complete care records for each plant.</p>
                      </div>
                    </div>
                  </section>

                  {/* 3. Smart Assistant Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-cyan-500" />
                      3. Smart Assistant Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Disease & Pest Detection</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload photos of affected plants for AI-powered diagnosis and treatment recommendations.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Nutrient Deficiency Checker</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Describe symptoms to identify missing nutrients and get fertilization advice.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Expert Q&A Assistant</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Chat interface to ask gardening questions and receive expert guidance.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Companion Planting</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get recommendations for plants that thrive together and improve each other's growth.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Variety Recommendations</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Discover plant varieties best suited to your climate, season, and growing conditions.</p>
                      </div>
                    </div>
                  </section>

                  {/* 4. Environment & Automation Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Sun className="h-5 w-5 text-sky-500" />
                      4. Environment & Automation Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Weather Dashboard</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current conditions and 7-day forecast. Enter your location for accurate weather data.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Microclimate Tracking</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Log temperature, humidity, and light levels for different garden zones. Future IoT sensor integration planned.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Irrigation Schedule Helper</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calculate optimal watering schedules based on weather, soil type, and plant requirements.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Moon Phase Calendar</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Planting and harvesting guidance based on lunar cycles and seasonal recommendations.</p>
                      </div>
                    </div>
                  </section>

                  {/* 5. Planning & Layout Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-violet-500" />
                      5. Planning & Layout Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Garden Map</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage garden beds and containers. Visualize your garden layout digitally.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Crop Rotation Tracker</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Track planting history by family to avoid soil depletion. Receive warnings about rotation conflicts.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Planting Schedule Generator</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Generate customized planting schedules with frost date calculations based on your location.</p>
                      </div>
                    </div>
                  </section>

                  {/* 6. Inventory & Costs Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-amber-500" />
                      6. Inventory & Costs Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Financial Summary</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Track Total Expenses, Total Revenue, and Net Profit for your garden.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Seeds Inventory</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage seed stock with viability tracking to know when seeds expire.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Supplies & Materials</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Track gardening supplies with low-stock alerts to never run out of essentials.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Expenses Tracker</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Log all garden-related expenses with categories and dates.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Harvest Logs</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Record harvest yields and revenue to measure garden productivity.</p>
                      </div>
                    </div>
                  </section>

                  {/* 7. Analytics Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-pink-500" />
                      7. Analytics Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Watering vs Health Events</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Line chart showing correlation between watering frequency and plant health events.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Tasks Overdue Heatmap</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Color-coded visualization of overdue tasks by severity.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Harvest Analytics</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bar chart displaying harvest data grouped by plant, month, or garden bed.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Success Rate by Variety</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pie chart showing which plant varieties perform best in your garden.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Success Rate by Season</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bar chart illustrating seasonal success patterns for optimal planning.</p>
                      </div>
                    </div>
                  </section>

                  {/* 8. Social & Sharing Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-teal-500" />
                      8. Social & Sharing Tab
                    </h3>
                    <div className="pl-7 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Care Sheet Export</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Generate and download detailed care sheets (JSON format) for your plants.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Share Plant Profile</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Create shareable links for plant profiles. Pro/Premium users can share via WhatsApp to their verified phone number.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Ask an Expert</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Submit questions to gardening experts with photo uploads. Pro users get priority, Premium users get highest priority responses.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Weekly Garden Digest</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Subscribe to weekly email summaries including plant health status, tasks, harvests, tips, and weather forecasts.</p>
                      </div>
                    </div>
                  </section>

                  {/* 9. Calendar Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-orange-500" />
                      9. Calendar Tab (Coming Soon)
                    </h3>
                    <div className="pl-7">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Comprehensive garden calendar featuring care schedules, watering reminders, seasonal planting guides, and important gardening dates all in one unified view.
                      </p>
                    </div>
                  </section>

                  {/* 10. Reports Tab */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-500" />
                      10. Reports Tab (Coming Soon)
                    </h3>
                    <div className="pl-7">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generate detailed reports on plant growth, care history, and garden performance with beautiful visualizations. Export as PDF for record-keeping or sharing.
                      </p>
                    </div>
                  </section>

                  {/* Footer Tips */}
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Pro Tips</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                      <li>Use Analytics tab weekly to identify patterns and optimize care routines</li>
                      <li>Set up Weekly Digest to stay informed without checking daily</li>
                      <li>Track expenses and harvest revenue to measure ROI</li>
                      <li>Upgrade to Pro/Premium for WhatsApp sharing and priority expert support</li>
                      <li>Use Crop Rotation Tracker to maintain healthy soil year-round</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ultra-Compact Landscape Form */}
        {showAddPlant && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto pt-8 pb-8">
            <Card className="w-full max-w-7xl bg-white dark:bg-gray-800 my-3">
              <CardHeader className="py-2 px-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4" />
                      Add Plant to Your Diary
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddPlant(false)}
                    className="text-white hover:bg-white/20 h-7 w-7 p-0"
                    data-testid="button-close-modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    
                    {/* Basic Info - Ultra-compact 5-column landscape */}
                    <div className="rounded border border-green-300 dark:border-green-800 p-2 bg-green-50/50 dark:bg-green-950/20">
                      <h3 className="text-xs font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-1.5">
                        <Leaf className="h-3.5 w-3.5" />
                        Basic Info
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Plant Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="My Rose Bush" {...field} data-testid="input-plant-name" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="species" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Species</FormLabel>
                            <FormControl>
                              <Input placeholder="Rosa gallica" {...field} value={field.value || ""} data-testid="input-species" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="variety" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Variety</FormLabel>
                            <FormControl>
                              <Input placeholder="Hybrid Tea" {...field} value={field.value || ""} data-testid="input-variety" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="status" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "healthy"}>
                              <FormControl>
                                <SelectTrigger data-testid="select-status" className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="healthy">Healthy</SelectItem>
                                <SelectItem value="warning">Attention</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="dormant">Dormant</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="plantingDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Planting Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""} data-testid="input-planting-date" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Acquisition & Container - Ultra-compact 3-column */}
                    <div className="rounded border border-cyan-300 dark:border-cyan-800 p-2 bg-cyan-50/50 dark:bg-cyan-950/20">
                      <h3 className="text-xs font-bold text-cyan-900 dark:text-cyan-100 mb-2 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        Acquisition & Container
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <FormField control={form.control} name="source" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Source</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-source" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nursery">Nursery</SelectItem>
                                <SelectItem value="online_store">Online Store</SelectItem>
                                <SelectItem value="friend_family">Friend/Family</SelectItem>
                                <SelectItem value="farmers_market">Farmers Market</SelectItem>
                                <SelectItem value="grown_from_seed">Grown from Seed</SelectItem>
                                <SelectItem value="propagated">Propagated</SelectItem>
                                <SelectItem value="gift">Gift</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="acquisitionDate" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Acquisition Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""} data-testid="input-acquisition-date" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="containerType" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Container Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-container" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ground">In Ground</SelectItem>
                                <SelectItem value="raised_bed">Raised Bed</SelectItem>
                                <SelectItem value="terracotta_pot">Terracotta Pot</SelectItem>
                                <SelectItem value="plastic_pot">Plastic Pot</SelectItem>
                                <SelectItem value="ceramic_pot">Ceramic Pot</SelectItem>
                                <SelectItem value="fabric_pot">Fabric Pot</SelectItem>
                                <SelectItem value="hanging_basket">Hanging Basket</SelectItem>
                                <SelectItem value="window_box">Window Box</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Soil & Environment - Ultra-compact 5-column */}
                    <div className="rounded border border-amber-300 dark:border-amber-800 p-2 bg-amber-50/50 dark:bg-amber-950/20">
                      <h3 className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-1.5">
                        <Beaker className="h-3.5 w-3.5" />
                        Soil & Environment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <FormField control={form.control} name="soilType" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Soil Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-soil-type" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="clay">Clay</SelectItem>
                                <SelectItem value="sandy">Sandy</SelectItem>
                                <SelectItem value="loamy">Loamy</SelectItem>
                                <SelectItem value="silt">Silt</SelectItem>
                                <SelectItem value="peat">Peat</SelectItem>
                                <SelectItem value="chalky">Chalky</SelectItem>
                                <SelectItem value="potting_mix">Potting Mix</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="soilPh" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">pH Level</FormLabel>
                            <FormControl>
                              <Input placeholder="6.5" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} data-testid="input-soil-ph" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="sunExposure" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Sun</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-sun-exposure" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full_sun">Full Sun</SelectItem>
                                <SelectItem value="partial_shade">Partial Shade</SelectItem>
                                <SelectItem value="full_shade">Full Shade</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="season" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Season</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-season" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="spring">Spring</SelectItem>
                                <SelectItem value="summer">Summer</SelectItem>
                                <SelectItem value="fall">Fall</SelectItem>
                                <SelectItem value="winter">Winter</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="humidityPreference" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Humidity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-humidity" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="location" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Front garden" {...field} value={field.value || ""} data-testid="input-location" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="regionZone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Zone</FormLabel>
                            <FormControl>
                              <Input placeholder="Zone 7a" {...field} value={field.value || ""} data-testid="input-region" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Care & Maintenance - Ultra-compact 5-column */}
                    <div className="rounded border border-blue-300 dark:border-blue-800 p-2 bg-blue-50/50 dark:bg-blue-950/20">
                      <h3 className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5" />
                        Care & Maintenance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <FormField control={form.control} name="wateringFrequency" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Water Freq.</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-watering-frequency" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="every_2_days">Every 2 days</SelectItem>
                                <SelectItem value="twice_weekly">2x week</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="wateringMethod" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Water Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-watering-method" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hand_watering">Hand</SelectItem>
                                <SelectItem value="drip_irrigation">Drip</SelectItem>
                                <SelectItem value="sprinkler">Sprinkler</SelectItem>
                                <SelectItem value="soaker_hose">Soaker Hose</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="fertilizingSchedule" render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormLabel className="text-xs">Fertilizing Schedule</FormLabel>
                            <FormControl>
                              <Input placeholder="Monthly with 10-10-10" {...field} value={field.value || ""} data-testid="input-fertilizing" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Growth Tracking - Ultra-compact 5-column */}
                    <div className="rounded border border-purple-300 dark:border-purple-800 p-2 bg-purple-50/50 dark:bg-purple-950/20">
                      <h3 className="text-xs font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Growth Tracking
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <FormField control={form.control} name="growthStage" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Stage</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-growth-stage" className="h-8 text-sm">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="seedling">Seedling</SelectItem>
                                <SelectItem value="vegetative">Vegetative</SelectItem>
                                <SelectItem value="flowering">Flowering</SelectItem>
                                <SelectItem value="fruiting">Fruiting</SelectItem>
                                <SelectItem value="mature">Mature</SelectItem>
                                <SelectItem value="dormant">Dormant</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="currentHeight" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Height (in)</FormLabel>
                            <FormControl>
                              <Input placeholder="12" type="number" step="0.1" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} data-testid="input-height" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="currentSpread" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Spread (in)</FormLabel>
                            <FormControl>
                              <Input placeholder="8" type="number" step="0.1" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} data-testid="input-spread" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="bloomCount" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Blooms</FormLabel>
                            <FormControl>
                              <Input placeholder="5" type="number" {...field} value={field.value?.toString() || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)} data-testid="input-bloom-count" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="yieldAmount" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Yield</FormLabel>
                            <FormControl>
                              <Input placeholder="5 lbs" {...field} value={field.value || ""} data-testid="input-yield" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Pest & Disease - Ultra-compact 2-column */}
                    <div className="rounded border border-red-300 dark:border-red-800 p-2 bg-red-50/50 dark:bg-red-950/20">
                      <h3 className="text-xs font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-1.5">
                        <Bug className="h-3.5 w-3.5" />
                        Pest & Disease
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FormField control={form.control} name="companionPlants" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Companion Plants</FormLabel>
                            <FormControl>
                              <Input placeholder="Basil, Marigolds" {...field} value={field.value || ""} data-testid="input-companions" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="pestHistory" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Pest History</FormLabel>
                            <FormControl>
                              <Input placeholder="Aphids (May 2024)" {...field} value={field.value || ""} data-testid="input-pest-history" className="h-8 text-sm" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    {/* Notes - Single row */}
                    <div className="rounded border border-gray-300 dark:border-gray-700 p-2 bg-gray-50/50 dark:bg-gray-900/20">
                      <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Observations, care instructions..." {...field} value={field.value || ""} data-testid="textarea-notes" className="min-h-[50px] text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )} />
                    </div>

                    {/* Form Actions - Compact */}
                    <div className="flex gap-2 justify-end pt-2 border-t dark:border-gray-700">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowAddPlant(false)} disabled={createPlantMutation.isPending} data-testid="button-cancel" className="h-8">
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 h-8" disabled={createPlantMutation.isPending} data-testid="button-submit-plant">
                        {createPlantMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1.5"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add to Diary
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* Plant Detail View Dialog */}
      {selectedPlantId && (
        <PlantDetailView 
          plantId={selectedPlantId} 
          onClose={() => setSelectedPlantId(null)} 
        />
      )}
    </div>
  );
}
