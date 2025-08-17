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

  // Handle both old and new data structures
  const species = {
    commonName: result.species?.common || result.commonName || 'Unknown Plant',
    scientificName: result.species?.scientific || result.species || 'Unknown species',
    family: result.species?.family || 'Unknown family',
    genus: result.species?.genus || 'Unknown genus',
    alternativeNames: result.species?.alternativeNames || [],
    nativeRegion: result.species?.nativeRegion || 'Unknown region',
    plantType: result.species?.plantType || 'Unknown type'
  };

  const healthAssessment = result.healthAssessment || {};
  const careInstructions = result.careInstructions || {};
  const propagation = result.propagation || {};
  const growthCharacteristics = result.growthCharacteristics || {};
  const seasonalCalendar = result.seasonalCalendar || [];
  const recommendations = result.recommendations || [];
  const toxicity = result.toxicity;
  const companionPlants = result.companionPlants || [];
  const commonProblems = result.commonProblems || [];

  const confidence = Math.round((result.species?.confidence || parseFloat(result.confidence) || 0) * 100);

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
                  value="health" 
                  className="border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none bg-transparent px-6 py-4"
                  data-testid="health-tab"
                >
                  Health Assessment
                </TabsTrigger>
                <TabsTrigger 
                  value="seasonal" 
                  className="border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-600 rounded-none bg-transparent px-6 py-4"
                  data-testid="seasonal-tab"
                >
                  Seasonal Care
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
                          {careInstructions.watering?.method || 'Water when top 2 inches of soil feel dry, typically every 7-10 days'}
                        </p>
                        <div className="text-xs text-green-600 font-medium">
                          {careInstructions.watering?.frequency || 'Every 7-10 days'}
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
                          {careInstructions.lighting?.positioning || 'Bright, indirect light. Avoid direct sunlight which can scorch leaves'}
                        </p>
                        <div className="text-xs text-yellow-600 font-medium">
                          {careInstructions.lighting?.requirement || 'Bright Indirect'}
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
                          {careInstructions.humidity?.methods?.join(', ') || 'Prefers 40-60% humidity. Use humidifier or pebble tray if needed'}
                        </p>
                        <div className="text-xs text-blue-600 font-medium">
                          {careInstructions.humidity?.level || '40-60%'}
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
                          {careInstructions.temperature?.seasonalVariations || 'Thrives in warm temperatures between 65-75°F (18-24°C)'}
                        </p>
                        <div className="text-xs text-orange-600 font-medium">
                          {careInstructions.temperature?.optimal || '65-75°F'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Care Instructions */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Detailed Care Guide</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* Soil Care */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <div className="w-4 h-4 bg-amber-500 rounded-full mr-2"></div>
                            Soil Requirements
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Type:</strong> {careInstructions.soil?.type || 'Well-draining potting mix'}</p>
                            <p><strong>pH Level:</strong> {careInstructions.soil?.pH || '6.0-7.0'}</p>
                            <p><strong>Drainage:</strong> {careInstructions.soil?.drainage || 'Must have drainage holes'}</p>
                            {careInstructions.soil?.amendments && (
                              <p><strong>Amendments:</strong> {careInstructions.soil.amendments.join(', ')}</p>
                            )}
                          </div>
                        </div>

                        {/* Fertilizing */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                            Fertilizing
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Type:</strong> {careInstructions.fertilizing?.type || 'Balanced liquid fertilizer'}</p>
                            <p><strong>Frequency:</strong> {careInstructions.fertilizing?.frequency || 'Monthly during growing season'}</p>
                            <p><strong>NPK Ratio:</strong> {careInstructions.fertilizing?.npkRatio || '20-20-20'}</p>
                            <p><strong>Schedule:</strong> {careInstructions.fertilizing?.seasonalSchedule || 'Spring through fall'}</p>
                          </div>
                        </div>

                        {/* Pruning */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                            Pruning & Maintenance
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Timing:</strong> {careInstructions.pruning?.timing || 'Spring before new growth'}</p>
                            <p><strong>Method:</strong> {careInstructions.pruning?.method || 'Clean cuts with sterilized tools'}</p>
                            <p><strong>Frequency:</strong> {careInstructions.pruning?.frequency || 'As needed'}</p>
                            {careInstructions.pruning?.purpose && (
                              <p><strong>Purpose:</strong> {careInstructions.pruning.purpose.join(', ')}</p>
                            )}
                          </div>
                        </div>

                        {/* Repotting */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800 flex items-center">
                            <div className="w-4 h-4 bg-teal-500 rounded-full mr-2"></div>
                            Repotting
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Frequency:</strong> {careInstructions.repotting?.frequency || 'Every 2-3 years'}</p>
                            <p><strong>Best Time:</strong> {careInstructions.repotting?.timing || 'Early spring'}</p>
                            <p><strong>Container Size:</strong> {careInstructions.repotting?.containerSize || '1-2 inches larger'}</p>
                            {careInstructions.repotting?.signs && (
                              <div>
                                <strong>Signs to Repot:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {careInstructions.repotting.signs.map((sign, index) => (
                                    <li key={index}>{sign}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>

                  {/* Species Information */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Plant Information</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p><strong>Family:</strong> {species.family}</p>
                          <p><strong>Genus:</strong> {species.genus}</p>
                          <p><strong>Plant Type:</strong> {species.plantType}</p>
                          <p><strong>Native Region:</strong> {species.nativeRegion}</p>
                        </div>
                        {species.alternativeNames.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-700 mb-2">Alternative Names</p>
                            <div className="flex flex-wrap gap-1">
                              {species.alternativeNames.map((name, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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
                          <span className="text-gray-600">Watering</span>
                          <span className="font-medium text-blue-600">
                            {careInstructions.watering?.frequency || 'Weekly'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Light Level</span>
                          <span className="font-medium">
                            {careInstructions.lighting?.requirement || 'Bright Indirect'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Growth Rate</span>
                          <span className="font-medium">
                            {growthCharacteristics.growthRate || 'Medium'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Mature Size</span>
                          <span className="font-medium">
                            {growthCharacteristics.matureSize?.height || 'Varies'}
                          </span>
                        </div>
                        {toxicity && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Toxicity</span>
                            <span className={`font-medium ${toxicity.level === 'Non-toxic' ? 'text-green-600' : 'text-red-600'}`}>
                              {toxicity.level}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Propagation Guide */}
                  {propagation.methods && propagation.methods.length > 0 && (
                    <Card className="bg-purple-50 border-purple-100">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Propagation Methods</h3>
                        <div className="space-y-3">
                          {propagation.methods.map((method, index) => (
                            <div key={index} className="border-l-4 border-purple-500 pl-3">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-gray-800">{method.type}</h4>
                                <Badge variant={method.difficulty === 'Easy' ? 'default' : method.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                                  {method.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{method.instructions}</p>
                              <p className="text-xs text-purple-600">Best time: {method.timing}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Companion Plants */}
                  {companionPlants.length > 0 && (
                    <Card className="bg-green-50 border-green-100">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Companion Plants</h3>
                        <div className="flex flex-wrap gap-2">
                          {companionPlants.map((plant, index) => (
                            <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                              {plant}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Toxicity Warning */}
                  {toxicity && toxicity.level !== 'Non-toxic' && (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                          <h3 className="font-semibold text-red-800">Toxicity Warning</h3>
                        </div>
                        <p className="text-sm text-red-700 mb-2">
                          <strong>Level:</strong> {toxicity.level}
                        </p>
                        <p className="text-sm text-red-700 mb-2">
                          <strong>Affects:</strong> {toxicity.affectedParties.join(', ')}
                        </p>
                        {toxicity.symptoms.length > 0 && (
                          <div className="text-sm text-red-700">
                            <strong>Symptoms:</strong> {toxicity.symptoms.join(', ')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="health" className="p-6">
              <div className="space-y-6">
                {/* Overall Health Status */}
                <Card className={`border-l-4 ${healthAssessment.isHealthy ? 'border-l-green-500 bg-green-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Overall Plant Health</h3>
                      <Badge variant={healthAssessment.isHealthy ? 'default' : 'secondary'} className={healthAssessment.isHealthy ? 'bg-green-500' : 'bg-yellow-500'}>
                        {healthAssessment.isHealthy ? 'Healthy' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <p className="text-gray-600">
                      {healthAssessment.overallHealth || 'Health assessment completed.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Diseases */}
                {healthAssessment.diseases && healthAssessment.diseases.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Disease Detection</h4>
                    {healthAssessment.diseases.map((disease: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-red-500 bg-red-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">{disease.name}</h5>
                            <Badge variant="destructive">{disease.severity || 'Moderate'}</Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{disease.description}</p>
                          
                          {disease.treatment && (
                            <div className="bg-white p-4 rounded-lg border">
                              <h6 className="font-medium text-gray-900 mb-2">Treatment</h6>
                              <p className="text-sm text-gray-600">{disease.treatment}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pest Issues */}
                {healthAssessment.pests && healthAssessment.pests.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Pest Issues</h4>
                    {healthAssessment.pests.map((pest: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-orange-500 bg-orange-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">{pest.name}</h5>
                            <Badge variant="secondary" className="bg-orange-500 text-white">{pest.severity || 'Moderate'}</Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{pest.description}</p>
                          
                          {pest.treatment && (
                            <div className="bg-white p-4 rounded-lg border">
                              <h6 className="font-medium text-gray-900 mb-2">Treatment</h6>
                              <p className="text-sm text-gray-600">{pest.treatment}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Nutritional Deficiencies */}
                {healthAssessment.nutritionalDeficiencies && healthAssessment.nutritionalDeficiencies.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Nutritional Deficiencies</h4>
                    {healthAssessment.nutritionalDeficiencies.map((deficiency: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-purple-500 bg-purple-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">{deficiency.nutrient} Deficiency</h5>
                            <Badge variant="secondary" className="bg-purple-500 text-white">{deficiency.severity || 'Moderate'}</Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{deficiency.symptoms}</p>
                          
                          {deficiency.treatment && (
                            <div className="bg-white p-4 rounded-lg border">
                              <h6 className="font-medium text-gray-900 mb-2">Treatment</h6>
                              <p className="text-sm text-gray-600">{deficiency.treatment}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Environmental Stress */}
                {healthAssessment.environmentalStress && healthAssessment.environmentalStress.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Environmental Stress</h4>
                    {healthAssessment.environmentalStress.map((stress: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-500 bg-blue-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">{stress.type}</h5>
                            <Badge variant="secondary" className="bg-blue-500 text-white">{stress.severity || 'Moderate'}</Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{stress.description}</p>
                          
                          {stress.solution && (
                            <div className="bg-white p-4 rounded-lg border">
                              <h6 className="font-medium text-gray-900 mb-2">Solution</h6>
                              <p className="text-sm text-gray-600">{stress.solution}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Recommendations</h4>
                    <div className="grid gap-4">
                      {recommendations.map((rec: any, index: number) => (
                        <Card key={index} className={`border-l-4 ${rec.priority === 'High' ? 'border-l-red-500' : rec.priority === 'Medium' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h6 className="font-medium text-gray-900">{rec.category}</h6>
                              <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'secondary' : 'default'}>
                                {rec.priority} Priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rec.action}</p>
                            <p className="text-xs text-gray-500">{rec.reason}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Issues Found */}
                {healthAssessment.isHealthy && 
                 (!healthAssessment.diseases || healthAssessment.diseases.length === 0) &&
                 (!healthAssessment.pests || healthAssessment.pests.length === 0) &&
                 (!healthAssessment.nutritionalDeficiencies || healthAssessment.nutritionalDeficiencies.length === 0) &&
                 (!healthAssessment.environmentalStress || healthAssessment.environmentalStress.length === 0) && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-green-800 mb-2">Plant Looks Healthy!</h4>
                      <p className="text-green-600">
                        No significant health issues detected. Continue with regular care routine.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="seasonal" className="p-6">
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Seasonal Care Calendar</h3>
                  <p className="text-gray-600">Follow this seasonal guide to keep your plant healthy year-round.</p>
                </div>

                {seasonalCalendar.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {seasonalCalendar.map((season, index) => (
                      <Card key={index} className={`border-l-4 ${
                        season.season === 'Spring' ? 'border-l-green-500 bg-green-50' :
                        season.season === 'Summer' ? 'border-l-yellow-500 bg-yellow-50' :
                        season.season === 'Fall' ? 'border-l-orange-500 bg-orange-50' :
                        'border-l-blue-500 bg-blue-50'
                      }`}>
                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            {season.season === 'Spring' && '🌱'}
                            {season.season === 'Summer' && '☀️'}
                            {season.season === 'Fall' && '🍂'}
                            {season.season === 'Winter' && '❄️'}
                            <span className="ml-2">{season.season}</span>
                          </h4>
                          
                          {season.tasks && season.tasks.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-800 mb-2">Care Tasks</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {season.tasks.map((task, taskIndex) => (
                                  <li key={taskIndex} className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {season.expectations && season.expectations.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-800 mb-2">What to Expect</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {season.expectations.map((expectation, expIndex) => (
                                  <li key={expIndex} className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    {expectation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="p-6 text-center">
                      <div className="text-gray-400 mb-4">📅</div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Seasonal Care Calendar</h4>
                      <p className="text-gray-600 mb-4">
                        A seasonal care schedule will help you provide the best care for your plant throughout the year.
                      </p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 bg-white rounded-lg border">
                          <h5 className="font-medium text-green-600 mb-1">🌱 Spring</h5>
                          <p className="text-gray-600">Resume growth care, increase watering, begin fertilizing</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <h5 className="font-medium text-yellow-600 mb-1">☀️ Summer</h5>
                          <p className="text-gray-600">Peak growing season, regular feeding, monitor water needs</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <h5 className="font-medium text-orange-600 mb-1">🍂 Fall</h5>
                          <p className="text-gray-600">Prepare for dormancy, reduce fertilizing, adjust watering</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border">
                          <h5 className="font-medium text-blue-600 mb-1">❄️ Winter</h5>
                          <p className="text-gray-600">Dormant period, minimal watering, stop fertilizing</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="raw" className="p-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Raw Analysis Data</h3>
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