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
  Settings
} from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function MyGarden() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Mock data for demonstration - replace with real API calls
  const { data: plants = [], isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ['/api/my-garden/plants'],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        name: 'Morning Glory',
        species: 'Ipomoea purpurea',
        dateAdded: '2024-03-15',
        location: 'Living Room - South Window',
        status: 'healthy',
        lastWatered: '2024-08-17',
        nextWatering: '2024-08-19',
        height: 15.5,
        notes: 'Growing rapidly, showing new blooms',
        careSchedule: [
          { id: '1', type: 'watering', date: '2024-08-19', notes: 'Regular watering', completed: false },
          { id: '2', type: 'fertilizing', date: '2024-08-20', notes: 'Monthly fertilizer', completed: false }
        ],
        growthData: [
          { date: '2024-08-01', height: 12.0, width: 8.0, leafCount: 15, notes: 'Good growth' },
          { date: '2024-08-08', height: 13.5, width: 9.0, leafCount: 18, notes: 'New leaves appearing' },
          { date: '2024-08-15', height: 15.5, width: 10.0, leafCount: 22, notes: 'First flowers!' }
        ],
        environmentalData: [
          { date: '2024-08-17', temperature: 22.5, humidity: 60, lightLevel: 85, soilMoisture: 45 }
        ]
      },
      {
        id: '2',
        name: 'Snake Plant',
        species: 'Sansevieria trifasciata',
        dateAdded: '2024-02-10',
        location: 'Bedroom - North Corner',
        status: 'warning',
        lastWatered: '2024-08-10',
        nextWatering: '2024-08-18',
        height: 45.0,
        notes: 'Slight yellowing on lower leaves - may need less water',
        careSchedule: [
          { id: '3', type: 'watering', date: '2024-08-18', notes: 'Water sparingly', completed: false }
        ],
        growthData: [
          { date: '2024-08-01', height: 43.0, width: 25.0, leafCount: 12, notes: 'Stable growth' },
          { date: '2024-08-15', height: 45.0, width: 25.0, leafCount: 12, notes: 'Minimal growth as expected' }
        ],
        environmentalData: [
          { date: '2024-08-17', temperature: 20.0, humidity: 55, lightLevel: 30, soilMoisture: 30 }
        ]
      }
    ])
  });

  const { data: gardenStats } = useQuery<GardenStats>({
    queryKey: ['/api/my-garden/stats'],
    queryFn: () => Promise.resolve({
      totalPlants: 2,
      healthyPlants: 1,
      plantsNeedingCare: 1,
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
      // Replace with actual API call
      return apiRequest('PATCH', `/api/my-garden/plants/${plantId}/care/${activityId}`, { completed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-garden/plants'] });
      toast({ title: "Care activity completed!" });
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
        <h1 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-2">
          My Garden Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track, monitor, and optimize your plant collection with scientific precision
        </p>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plants" data-testid="tab-plants">My Plants</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="care" data-testid="tab-care">Care Schedule</TabsTrigger>
          <TabsTrigger value="journal" data-testid="tab-journal">Garden Journal</TabsTrigger>
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

          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Today's Care Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plants.map((plant) => {
                  const nextActivity = getNextCareActivity(plant.careSchedule);
                  if (!nextActivity || new Date(nextActivity.date) > new Date()) return null;
                  
                  return (
                    <div key={plant.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{plant.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{nextActivity.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => updateCareMutation.mutate({ plantId: plant.id, activityId: nextActivity.id })}
                        data-testid={`complete-task-${plant.id}`}
                      >
                        Complete
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plants Tab */}
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
              <Card key={plant.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPlant(plant)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plant.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(plant.status)}`} />
                  </div>
                  <CardDescription>{plant.species}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {plant.location}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Height: {plant.height}cm</span>
                      <span>Growth: +{calculateGrowthRate(plant.growthData).toFixed(1)}cm/week</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Next watering</span>
                        <span>{new Date(plant.nextWatering).toLocaleDateString()}</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>
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
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plants.map((plant) => (
                    <div key={plant.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{plant.name}</span>
                        <span className="text-sm text-gray-500">
                          {calculateGrowthRate(plant.growthData).toFixed(1)}cm/week
                        </span>
                      </div>
                      <Progress value={Math.min(100, calculateGrowthRate(plant.growthData) * 10)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plants.map((plant) => {
                    const healthScore = plant.status === 'healthy' ? 95 : plant.status === 'warning' ? 70 : 35;
                    return (
                      <div key={plant.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{plant.name}</span>
                          <span className="text-sm font-medium">{healthScore}%</span>
                        </div>
                        <Progress value={healthScore} className="h-2" />
                      </div>
                    );
                  })}
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
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                Care Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Tasks for {selectedDate.toLocaleDateString()}
                  </h3>
                  {plants.map((plant) => 
                    plant.careSchedule
                      .filter(activity => 
                        new Date(activity.date).toDateString() === selectedDate.toDateString() &&
                        !activity.completed
                      )
                      .map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{plant.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{activity.type.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-400">{activity.notes}</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => updateCareMutation.mutate({ plantId: plant.id, activityId: activity.id })}
                          >
                            Complete
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Tab */}
        <TabsContent value="journal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-green-600" />
                Garden Journal
              </CardTitle>
              <CardDescription>
                Document your garden's progress with photos and observations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="journal-plant">Select Plant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plant" />
                    </SelectTrigger>
                    <SelectContent>
                      {plants.map((plant) => (
                        <SelectItem key={plant.id} value={plant.id}>
                          {plant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="journal-date">Date</Label>
                  <Input type="date" id="journal-date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div>
                <Label htmlFor="journal-notes">Observations & Notes</Label>
                <Textarea 
                  id="journal-notes" 
                  placeholder="Record growth observations, changes, care activities, or any notable events..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="journal-height">Height (cm)</Label>
                  <Input type="number" id="journal-height" placeholder="0.0" step="0.1" />
                </div>
                <div>
                  <Label htmlFor="journal-width">Width (cm)</Label>
                  <Input type="number" id="journal-width" placeholder="0.0" step="0.1" />
                </div>
                <div>
                  <Label htmlFor="journal-leaves">Leaf Count</Label>
                  <Input type="number" id="journal-leaves" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="journal-health">Health Score</Label>
                  <Input type="number" id="journal-health" placeholder="1-10" min="1" max="10" />
                </div>
              </div>
              <Button className="w-full" data-testid="button-add-journal-entry">
                <Camera className="h-4 w-4 mr-2" />
                Add Journal Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plant Detail Modal */}
      {selectedPlant && (
        <Dialog open={!!selectedPlant} onOpenChange={() => setSelectedPlant(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPlant.name}
                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedPlant.status)}`} />
              </DialogTitle>
              <DialogDescription>{selectedPlant.species}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Growth Progress</h4>
                  <div className="space-y-2">
                    {selectedPlant.growthData.map((point, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{new Date(point.date).toLocaleDateString()}</span>
                        <span>{point.height}cm ({point.leafCount} leaves)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Care Schedule</h4>
                  <div className="space-y-2">
                    {selectedPlant.careSchedule.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                          <span className="text-gray-500 ml-2">{new Date(activity.date).toLocaleDateString()}</span>
                        </div>
                        <Badge variant={activity.completed ? 'default' : 'secondary'}>
                          {activity.completed ? 'Done' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Conditions</h4>
                  {selectedPlant.environmentalData.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Temperature</p>
                        <p className="font-medium">
                          {selectedPlant.environmentalData[selectedPlant.environmentalData.length - 1].temperature}°C
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Humidity</p>
                        <p className="font-medium">
                          {selectedPlant.environmentalData[selectedPlant.environmentalData.length - 1].humidity}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Light Level</p>
                        <p className="font-medium">
                          {selectedPlant.environmentalData[selectedPlant.environmentalData.length - 1].lightLevel}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Soil Moisture</p>
                        <p className="font-medium">
                          {selectedPlant.environmentalData[selectedPlant.environmentalData.length - 1].soilMoisture}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedPlant.notes}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}