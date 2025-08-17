import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Droplets, 
  Sun, 
  Thermometer, 
  Wind,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Leaf
} from "lucide-react";

interface ResultsDashboardProps {
  result: any;
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("care");

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/plant-analysis/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: result.id }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plant-report-${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "PDF Downloaded",
        description: "Your plant care report has been downloaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const species = result.species || {};
  const carePlan = result.carePlan || {};
  const diseases = result.diseases || {};
  const confidence = Math.round((parseFloat(result.confidence) || 0) * 100);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg overflow-hidden">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white" data-testid="plant-name">
                    {species.commonName || 'Unknown Plant'}
                  </h2>
                  <p className="text-green-100 italic" data-testid="scientific-name">
                    {species.scientificName || 'Unknown species'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className="bg-white bg-opacity-20 text-white" data-testid="confidence-badge">
                      {confidence}% Confidence
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-20"
                onClick={() => downloadMutation.mutate()}
                disabled={downloadMutation.isPending}
                data-testid="download-pdf-button"
              >
                <Download className="w-5 h-5 mr-2" />
                {downloadMutation.isPending ? 'Generating...' : 'Download PDF Report'}
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="care" 
                  className="border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none bg-transparent px-6 py-4"
                  data-testid="care-tab"
                >
                  Care Plan
                </TabsTrigger>
                <TabsTrigger 
                  value="diseases" 
                  className="border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none bg-transparent px-6 py-4"
                  data-testid="diseases-tab"
                >
                  Health & Diseases
                </TabsTrigger>
                <TabsTrigger 
                  value="gallery" 
                  className="border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none bg-transparent px-6 py-4"
                  data-testid="gallery-tab"
                >
                  Gallery
                </TabsTrigger>
                <TabsTrigger 
                  value="raw" 
                  className="border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none bg-transparent px-6 py-4"
                  data-testid="raw-tab"
                >
                  Raw Data
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="care" className="p-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Care Overview Cards */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-green-50 border-green-100">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Watering</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {carePlan.watering?.description || 'Water when top 2 inches of soil feel dry, typically every 7-10 days'}
                        </p>
                        <div className="text-xs text-green-600 font-medium">
                          {carePlan.watering?.frequency || 'Every 7-10 days'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-yellow-50 border-yellow-100">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Sun className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Light</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {carePlan.light?.description || 'Bright, indirect light. Avoid direct sunlight which can scorch leaves'}
                        </p>
                        <div className="text-xs text-yellow-600 font-medium">
                          {carePlan.light?.level || 'Bright Indirect'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Wind className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Humidity</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {carePlan.humidity?.description || 'Prefers 40-60% humidity. Use humidifier or pebble tray if needed'}
                        </p>
                        <div className="text-xs text-blue-600 font-medium">
                          {carePlan.humidity?.range || '40-60%'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-100">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Thermometer className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Temperature</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {carePlan.temperature?.description || 'Thrives in warm temperatures between 65-75°F (18-24°C)'}
                        </p>
                        <div className="text-xs text-orange-600 font-medium">
                          {carePlan.temperature?.range || '65-75°F'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Care Instructions */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Detailed Care Instructions</h3>
                      <div className="space-y-4">
                        <div className="flex space-x-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Soil & Repotting</h4>
                            <p className="text-sm text-gray-600">
                              {carePlan.soil?.details || 'Use well-draining potting mix. Repot every 2-3 years or when rootbound.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Fertilizing</h4>
                            <p className="text-sm text-gray-600">
                              {carePlan.fertilizer?.details || 'Feed monthly during growing season (spring/summer) with diluted liquid fertilizer.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Pruning & Maintenance</h4>
                            <p className="text-sm text-gray-600">
                              {carePlan.pruning?.details || 'Remove dead or damaged leaves. Dust leaves weekly for optimal photosynthesis.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Reference Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Quick Reference</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Difficulty</span>
                          <span className="font-medium text-green-600">
                            {carePlan.plant_info?.difficulty || 'Moderate'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Growth Rate</span>
                          <span className="font-medium">
                            {carePlan.plant_info?.growthRate || 'Medium'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pet Safe</span>
                          <span className={`font-medium ${carePlan.plant_info?.petSafe ? 'text-green-600' : 'text-red-600'}`}>
                            {carePlan.plant_info?.petSafe ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Mature Size</span>
                          <span className="font-medium">
                            {carePlan.plant_info?.matureSize || '6-10 ft'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Care Reminders</h3>
                      <div className="space-y-3">
                        {carePlan.care_reminders?.map((reminder: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">{reminder.message}</span>
                          </div>
                        )) || (
                          <>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-700">Next watering in 5 days</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-gray-700">Fertilize in 2 weeks</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-700">Check humidity levels</span>
                            </div>
                          </>
                        )}
                      </div>
                      <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded-lg transition-colors">
                        Set Reminders
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="diseases" className="p-6">
              <div className="space-y-6">
                {diseases.diseases && diseases.diseases.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Health Assessment</h3>
                      <p className="text-gray-600">
                        Overall Status: <span className="font-medium">{diseases.overall_health_status}</span>
                      </p>
                      {diseases.urgent_actions_needed && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-red-800 font-medium">Urgent action needed</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {diseases.diseases.map((disease: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-red-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{disease.name}</h4>
                            <Badge variant="destructive">{disease.severity}</Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{disease.description}</p>
                          
                          {disease.symptoms && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Symptoms:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {disease.symptoms.map((symptom: string, idx: number) => (
                                  <li key={idx}>{symptom}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {disease.treatment && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Treatment:</h5>
                              {disease.treatment.immediate_actions && (
                                <div className="mb-2">
                                  <h6 className="text-sm font-medium text-gray-900">Immediate Actions:</h6>
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {disease.treatment.immediate_actions.map((action: string, idx: number) => (
                                      <li key={idx}>{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {disease.recovery_timeline && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Recovery Timeline:</span> {disease.recovery_timeline}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Plant Looks Healthy!</h3>
                      <p className="text-gray-600">No diseases or issues detected in your plant photos.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {result.images?.map((image: any, index: number) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Image {index + 1}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="raw" className="p-6">
              <Card>
                <CardContent className="p-6">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
}
