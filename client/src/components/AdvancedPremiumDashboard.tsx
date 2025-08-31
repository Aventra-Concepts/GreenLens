import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';

import { 
  Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, 
  Leaf, BarChart3, Wifi, Plus, Settings, TrendingUp,
  Users, Lightbulb, Zap, Activity, Target, Award,
  Brain, Network, Sprout, ChevronRight, AlertTriangle
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  uvIndex: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
}

interface MicroclimatezoneData {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  soilMoisture: number;
  status: 'optimal' | 'warning' | 'critical';
  plantCount: number;
  autoWatering: boolean;
}

interface AIInsightData {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface PlantNetworkData {
  connections: Array<{
    plantA: string;
    plantB: string;
    compatibility: number;
    benefits: string[];
  }>;
  recommendations: Array<{
    plant: string;
    companions: string[];
    reason: string;
  }>;
  communityScore: number;
}

interface IoTDeviceData {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'monitor';
  status: 'online' | 'offline' | 'error';
  batteryLevel?: number;
  lastReading: string;
  value?: number;
  unit?: string;
}

interface AnalyticsData {
  sustainability: {
    carbonOffset: number;
    waterSaved: number;
    yieldIncrease: number;
    efficiency: number;
  };
  predictions: {
    nextHarvest: string;
    expectedYield: number;
    marketValue: number;
  };
  benchmarks: {
    local: number;
    national: number;
    yourScore: number;
  };
}

export function AdvancedPremiumDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [weatherLocation, setWeatherLocation] = useState({ lat: 40.7128, lon: -74.0060 }); // Default to NYC

  // Fetch weather data
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['/api/weather', weatherLocation.lat, weatherLocation.lon],
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch premium dashboard data
  const { data: premiumData, isLoading: premiumLoading } = useQuery({
    queryKey: ['/api/premium/dashboard-data'],
    refetchInterval: 60000, // 1 minute
  });

  // Get user location for weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setWeatherLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  }, []);

  // Mock data for demonstration (replace with real data from API)
  const mockMicroclimatezones: MicroclimatezoneData[] = [
    {
      id: '1',
      name: 'Greenhouse Zone A',
      temperature: 24,
      humidity: 65,
      lightLevel: 85,
      soilMoisture: 72,
      status: 'optimal',
      plantCount: 12,
      autoWatering: true
    },
    {
      id: '2',
      name: 'Outdoor Garden',
      temperature: 18,
      humidity: 45,
      lightLevel: 92,
      soilMoisture: 58,
      status: 'warning',
      plantCount: 8,
      autoWatering: false
    }
  ];

  const mockAIInsights: AIInsightData[] = [
    {
      id: '1',
      type: 'prediction',
      title: 'Pest Risk Alert',
      description: 'Aphid activity predicted to increase by 40% in next 5 days due to rising humidity',
      confidence: 87,
      urgency: 'high',
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Watering Optimization',
      description: 'Reduce watering by 15% in Zone A - current moisture levels are optimal',
      confidence: 94,
      urgency: 'medium',
      createdAt: '2024-01-20T09:15:00Z'
    }
  ];

  const mockPlantNetwork: PlantNetworkData = {
    connections: [
      {
        plantA: 'Tomatoes',
        plantB: 'Basil',
        compatibility: 95,
        benefits: ['Pest deterrent', 'Improved flavor', 'Space efficiency']
      }
    ],
    recommendations: [
      {
        plant: 'Lettuce',
        companions: ['Carrots', 'Radishes'],
        reason: 'Optimal space utilization and nutrient cycling'
      }
    ],
    communityScore: 82
  };

  const mockIoTDevices: IoTDeviceData[] = [
    {
      id: '1',
      name: 'Soil Moisture Sensor #1',
      type: 'sensor',
      status: 'online',
      batteryLevel: 89,
      lastReading: '2 min ago',
      value: 72,
      unit: '%'
    },
    {
      id: '2',
      name: 'Smart Irrigation Hub',
      type: 'actuator',
      status: 'online',
      lastReading: '1 min ago'
    }
  ];

  const mockAnalytics: AnalyticsData = {
    sustainability: {
      carbonOffset: 125,
      waterSaved: 340,
      yieldIncrease: 23,
      efficiency: 87
    },
    predictions: {
      nextHarvest: '2024-02-15',
      expectedYield: 45,
      marketValue: 180
    },
    benchmarks: {
      local: 65,
      national: 58,
      yourScore: 87
    }
  };

  if (premiumLoading || weatherLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading premium dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Advanced Garden Intelligence
              </h1>
              <p className="text-gray-600 mt-2">AI-powered insights for optimal plant care</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <Sun className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm opacity-90">Current Weather</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">{(weather as WeatherData)?.temperature || 22}°C</div>
                  <p className="opacity-90">{(weather as WeatherData)?.condition || 'Partly Cloudy'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Droplets className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm">{(weather as WeatherData)?.humidity || 65}%</p>
                  <p className="text-xs opacity-75">Humidity</p>
                </div>
                <div>
                  <Wind className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm">{(weather as WeatherData)?.windSpeed || 12} km/h</p>
                  <p className="text-xs opacity-75">Wind</p>
                </div>
                <div>
                  <Sun className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm">UV {(weather as WeatherData)?.uvIndex || 5}</p>
                  <p className="text-xs opacity-75">Index</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="microclimate" className="data-[state=active]:bg-white">
              <Thermometer className="w-4 h-4 mr-2" />
              Climate Zones
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="data-[state=active]:bg-white">
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="plant-network" className="data-[state=active]:bg-white">
              <Network className="w-4 h-4 mr-2" />
              Plant Network
            </TabsTrigger>
            <TabsTrigger value="iot-devices" className="data-[state=active]:bg-white">
              <Wifi className="w-4 h-4 mr-2" />
              IoT Devices
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Key Metrics Cards */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Zones</p>
                      <p className="text-2xl font-bold text-green-600">{mockMicroclimatezones.length}</p>
                    </div>
                    <Leaf className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">AI Alerts</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {mockAIInsights.filter(i => i.urgency === 'high' || i.urgency === 'critical').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Connected Devices</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {mockIoTDevices.filter(d => d.status === 'online').length}
                      </p>
                    </div>
                    <Wifi className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Efficiency Score</p>
                      <p className="text-2xl font-bold text-purple-600">{mockAnalytics.sustainability.efficiency}%</p>
                    </div>
                    <Award className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Droplets className="w-6 h-6 mb-2" />
                    Water Plants
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Lightbulb className="w-6 h-6 mb-2" />
                    Adjust Lighting
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Thermometer className="w-6 h-6 mb-2" />
                    Set Temperature
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Plus className="w-6 h-6 mb-2" />
                    Add Plant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Microclimate Zones Tab */}
          <TabsContent value="microclimate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockMicroclimatezones.map((zone) => (
                <Card key={zone.id} className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <Badge variant={zone.status === 'optimal' ? 'default' : 'destructive'}>
                        {zone.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Temperature</span>
                          <span className="text-sm font-medium">{zone.temperature}°C</span>
                        </div>
                        <Progress value={(zone.temperature / 30) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Humidity</span>
                          <span className="text-sm font-medium">{zone.humidity}%</span>
                        </div>
                        <Progress value={zone.humidity} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Light Level</span>
                          <span className="text-sm font-medium">{zone.lightLevel}%</span>
                        </div>
                        <Progress value={zone.lightLevel} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Soil Moisture</span>
                          <span className="text-sm font-medium">{zone.soilMoisture}%</span>
                        </div>
                        <Progress value={zone.soilMoisture} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-600">{zone.plantCount} plants</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Auto-watering</span>
                        <div className={`w-4 h-2 rounded-full ${zone.autoWatering ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="space-y-4">
              {mockAIInsights.map((insight) => (
                <Card key={insight.id} className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant={insight.urgency === 'high' ? 'destructive' : 'default'}>
                            {insight.urgency}
                          </Badge>
                          <Badge variant="outline">{insight.type}</Badge>
                          <span className="text-sm text-gray-500">
                            Confidence: {insight.confidence}%
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                        <p className="text-gray-600">{insight.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Plant Network Tab */}
          <TabsContent value="plant-network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Companion Planting Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPlantNetwork.connections.map((connection, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{connection.plantA} + {connection.plantB}</span>
                          <Badge variant="default">{connection.compatibility}% Compatible</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {connection.benefits.map((benefit, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Community Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {mockPlantNetwork.communityScore}
                    </div>
                    <p className="text-gray-600">Garden Harmony Index</p>
                    <Progress value={mockPlantNetwork.communityScore} className="mt-4" />
                  </div>
                  <div className="space-y-3">
                    {mockPlantNetwork.recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium text-sm mb-1">{rec.plant}</div>
                        <div className="text-xs text-gray-600 mb-2">{rec.reason}</div>
                        <div className="flex flex-wrap gap-1">
                          {rec.companions.map((companion, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {companion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* IoT Devices Tab */}
          <TabsContent value="iot-devices" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockIoTDevices.map((device) => (
                <Card key={device.id} className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{device.name}</h3>
                      <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                        {device.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type</span>
                        <span className="text-sm font-medium capitalize">{device.type}</span>
                      </div>
                      {device.batteryLevel && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Battery</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={device.batteryLevel} className="w-16 h-2" />
                            <span className="text-sm">{device.batteryLevel}%</span>
                          </div>
                        </div>
                      )}
                      {device.value && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current Reading</span>
                          <span className="text-sm font-medium">{device.value}{device.unit}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Update</span>
                        <span className="text-sm">{device.lastReading}</span>
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
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Sustainability Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {mockAnalytics.sustainability.carbonOffset}kg
                      </div>
                      <p className="text-sm text-gray-600">CO₂ Offset</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {mockAnalytics.sustainability.waterSaved}L
                      </div>
                      <p className="text-sm text-gray-600">Water Saved</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        +{mockAnalytics.sustainability.yieldIncrease}%
                      </div>
                      <p className="text-sm text-gray-600">Yield Increase</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {mockAnalytics.sustainability.efficiency}%
                      </div>
                      <p className="text-sm text-gray-600">Efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Performance Benchmarks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Your Garden</span>
                        <span className="text-sm font-bold">{mockAnalytics.benchmarks.yourScore}%</span>
                      </div>
                      <Progress value={mockAnalytics.benchmarks.yourScore} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Local Average</span>
                        <span className="text-sm">{mockAnalytics.benchmarks.local}%</span>
                      </div>
                      <Progress value={mockAnalytics.benchmarks.local} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">National Average</span>
                        <span className="text-sm">{mockAnalytics.benchmarks.national}%</span>
                      </div>
                      <Progress value={mockAnalytics.benchmarks.national} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Harvest Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">Next Harvest</div>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {mockAnalytics.predictions.nextHarvest}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">Expected Yield</div>
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      {mockAnalytics.predictions.expectedYield}kg
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">Market Value</div>
                    <div className="text-2xl font-bold text-purple-600 mt-2">
                      ${mockAnalytics.predictions.marketValue}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}