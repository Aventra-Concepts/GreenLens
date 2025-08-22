import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info,
  Beaker,
  Thermometer,
  Droplets,
  Zap,
  ArrowLeft,
  MapPin
} from "lucide-react";

export function SoilTestingSection() {
  const [selectedTestType, setSelectedTestType] = useState<string | null>(null);
  
  const testTypes = [
    {
      id: "basic",
      name: "Basic Soil Test",
      icon: TestTube,
      price: "$11-30",
      duration: "1-2 weeks",
      description: "Essential nutrients and pH level analysis",
      includes: ["pH Level", "Nitrogen (N)", "Phosphorus (P)", "Potassium (K)", "Organic Matter %"],
      frequency: "Annually in spring",
      difficulty: "Beginner",
      centers: [
        { region: "Northeast", name: "Rutgers Soil Testing Lab, NJ", phone: "(848) 932-9295", price: "$20" },
        { region: "Southeast", name: "University of Florida Extension", phone: "Contact local extension", price: "$15" },
        { region: "Midwest", name: "University of Minnesota Lab", phone: "(612) 625-3101", price: "$20" },
        { region: "Southwest", name: "Texas A&M AgriLife Extension", phone: "Contact local extension", price: "$15" },
        { region: "West", name: "Colorado State University Lab", phone: "(970) 491-5061", price: "$25" }
      ]
    },
    {
      id: "comprehensive",
      name: "Comprehensive Analysis",
      icon: Beaker,
      price: "$40-100",
      duration: "2-3 weeks",
      description: "Complete soil profile with micronutrients",
      includes: ["All Basic Tests", "Calcium", "Magnesium", "Sulfur", "Iron", "Zinc", "Manganese", "Soil Texture", "CEC (Cation Exchange)"],
      frequency: "Every 2-3 years",
      difficulty: "Intermediate",
      centers: [
        { region: "Northeast", name: "Cornell University Lab, NY", phone: "Contact extension office", price: "$65" },
        { region: "Southeast", name: "Virginia Tech Soil Lab", phone: "(540) 231-6758", price: "$55" },
        { region: "Midwest", name: "University of Missouri Lab", phone: "(573) 882-0623", price: "$60" },
        { region: "Southwest", name: "Oklahoma State University", phone: "(405) 744-6630", price: "$50" },
        { region: "West", name: "Wallace Laboratories, CA", phone: "(310) 615-0116", price: "$75" }
      ]
    },
    {
      id: "professional",
      name: "Professional Lab Test",
      icon: Target,
      price: "$100-200",
      duration: "1-2 weeks",
      description: "Laboratory-grade analysis with detailed recommendations",
      includes: ["Complete Nutrient Profile", "Heavy Metals", "Soil Biology", "Contamination Screen", "Custom Fertilizer Plan", "Expert Consultation"],
      frequency: "Every 3-5 years or as needed",
      difficulty: "Advanced",
      centers: [
        { region: "Northeast", name: "Waypoint Analytical", phone: "Multiple locations", price: "$150" },
        { region: "Southeast", name: "Ward Laboratories", phone: "Contact for pricing", price: "$125" },
        { region: "Midwest", name: "Midwest Laboratories", phone: "Contact local office", price: "$140" },
        { region: "Southwest", name: "Logan Labs", phone: "(614) 833-1510", price: "$130" },
        { region: "West", name: "Pacific Soil Analysis", phone: "Contact for pricing", price: "$175" }
      ]
    }
  ];

  const soilFactors = [
    {
      name: "pH Level",
      icon: TestTube,
      optimal: "6.0-7.0",
      description: "Affects nutrient availability",
      lowSigns: ["Yellowing leaves", "Poor growth", "Aluminum toxicity"],
      highSigns: ["Iron deficiency", "Yellowing between veins", "Stunted growth"],
      adjustment: {
        low: "Add lime to raise pH",
        high: "Add sulfur or organic matter to lower pH"
      }
    },
    {
      name: "Nitrogen (N)",
      icon: TrendingUp,
      optimal: "20-40 ppm",
      description: "Essential for leaf growth and green color",
      lowSigns: ["Yellow leaves from bottom up", "Slow growth", "Poor fruit production"],
      highSigns: ["Excessive leaf growth", "Delayed flowering", "Weak stems"],
      adjustment: {
        low: "Apply nitrogen-rich fertilizer or compost",
        high: "Reduce fertilizer, add carbon-rich materials"
      }
    },
    {
      name: "Phosphorus (P)",
      icon: Zap,
      optimal: "30-50 ppm",
      description: "Important for root development and flowering",
      lowSigns: ["Purple leaf tinge", "Poor root growth", "Delayed maturity"],
      highSigns: ["Iron and zinc deficiency", "Reduced microbial activity"],
      adjustment: {
        low: "Add bone meal or rock phosphate",
        high: "Reduce phosphorus inputs, add iron supplements"
      }
    },
    {
      name: "Potassium (K)",
      icon: Droplets,
      optimal: "100-200 ppm",
      description: "Helps with disease resistance and water regulation",
      lowSigns: ["Brown leaf edges", "Weak stems", "Poor disease resistance"],
      highSigns: ["Calcium and magnesium deficiency", "Salt buildup"],
      adjustment: {
        low: "Apply potash or wood ash",
        high: "Improve drainage, add gypsum"
      }
    }
  ];

  const testingSteps = [
    {
      step: 1,
      title: "Sample Collection",
      description: "Collect soil samples from multiple locations",
      tips: [
        "Take samples from 6-8 different spots in the area",
        "Avoid areas near buildings, driveways, or compost piles", 
        "Remove surface debris and collect from 4-6 inch depth",
        "Mix all samples together for a representative sample"
      ]
    },
    {
      step: 2,
      title: "Preparation",
      description: "Prepare sample for testing",
      tips: [
        "Let soil dry naturally, don't use heat",
        "Remove rocks, roots, and debris",
        "Crush large clumps and mix thoroughly",
        "Use about 2 cups of prepared soil for testing"
      ]
    },
    {
      step: 3,
      title: "Testing Method",
      description: "Choose your testing approach",
      tips: [
        "Home test kits: Quick but less accurate",
        "Cooperative extension: Most cost-effective",
        "Private labs: Most comprehensive analysis",
        "Digital meters: Good for pH and basic nutrients"
      ]
    },
    {
      step: 4,
      title: "Interpret Results",
      description: "Understand what the numbers mean",
      tips: [
        "Compare results to optimal ranges for your plants",
        "Consider soil type and local conditions",
        "Look for patterns across multiple nutrients",
        "Focus on major deficiencies first"
      ]
    }
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Complete Soil Testing Guide
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2 leading-relaxed">
            Understand your soil's health with comprehensive testing. Get the insights you need to 
            create the perfect growing environment for your plants.
          </p>
        </div>

        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-auto text-xs sm:text-sm">
            <TabsTrigger value="tests">Test Types</TabsTrigger>
            <TabsTrigger value="factors">Soil Factors</TabsTrigger>
            <TabsTrigger value="process">Testing Process</TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            {selectedTestType ? (
              <div className="space-y-6">
                {/* Back Navigation */}
                <Button
                  onClick={() => setSelectedTestType(null)}
                  variant="outline"
                  className="mb-4 flex items-center gap-2"
                  data-testid="button-back-to-test-types"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Test Types
                </Button>

                {/* Detailed Test Type View */}
                {(() => {
                  const selectedTest = testTypes.find(t => t.id === selectedTestType);
                  if (!selectedTest) return null;
                  
                  const Icon = selectedTest.icon;
                  
                  return (
                    <div className="space-y-6">
                      <Card className="border-2 border-blue-200">
                        <CardHeader className="text-center">
                          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon className="w-10 h-10 text-blue-600" />
                          </div>
                          <CardTitle className="text-2xl">{selectedTest.name}</CardTitle>
                          <div className="flex justify-center gap-2 mt-2">
                            <Badge variant="outline" className="text-sm">{selectedTest.price}</Badge>
                            <Badge variant="outline" className="text-sm">{selectedTest.duration}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-6">
                            {selectedTest.description}
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-3">
                                What's Included:
                              </h4>
                              <div className="space-y-2">
                                {selectedTest.includes.map((item, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium">Testing Frequency:</span>
                                  <span>{selectedTest.frequency}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Difficulty Level:</span>
                                  <Badge className={`${
                                    selectedTest.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                    selectedTest.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {selectedTest.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Regional Testing Centers */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            USA Regional Testing Centers
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-300">
                            Find certified soil testing laboratories near you
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedTest.centers.map((center, idx) => (
                              <Card key={idx} className="border border-gray-200">
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <Badge variant="secondary" className="mb-2">
                                      {center.region}
                                    </Badge>
                                    <h4 className="font-semibold text-sm">{center.name}</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      Phone: {center.phone}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                      <span className="text-xs text-gray-600">Approximate Cost:</span>
                                      <Badge variant="outline" className="text-xs font-semibold text-green-700">
                                        {center.price}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                              💡 Testing Tips for {selectedTest.name}:
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                              <li>• Contact your local extension office for the nearest certified lab</li>
                              <li>• Many university labs offer mail-in testing across state lines</li>
                              <li>• Rush processing available for an additional $25-50</li>
                              <li>• Bulk discounts available for multiple samples (agricultural use)</li>
                              {selectedTest.id === 'professional' && (
                                <li>• Professional tests often include consultation with soil scientists</li>
                              )}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {testTypes.map((test, index) => {
                  const Icon = test.icon;
                  return (
                    <Card key={test.id} className="hover:shadow-lg transition-shadow cursor-pointer" 
                          onClick={() => setSelectedTestType(test.id)}
                          data-testid={`card-test-type-${test.id}`}>
                      <CardHeader className="text-center pb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg sm:text-xl leading-tight">{test.name}</CardTitle>
                        <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{test.price}</Badge>
                          <Badge variant="outline" className="text-xs">{test.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 leading-relaxed px-2">
                          {test.description}
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
                              Includes:
                            </h4>
                            <div className="space-y-1">
                              {test.includes.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </div>
                              ))}
                              {test.includes.length > 3 && (
                                <p className="text-xs text-gray-500 italic">
                                  +{test.includes.length - 3} more tests...
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Frequency:</span>
                              <span className="font-medium text-right">{test.frequency}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
                              <span className="text-gray-600">Difficulty:</span>
                              <Badge className={`text-xs ${
                                test.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                test.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {test.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full mt-4" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTestType(test.id);
                            }}
                            data-testid={`button-view-details-${test.id}`}
                          >
                            View Details & Testing Centers
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="factors">
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {soilFactors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-blue-600" />
                        {factor.name}
                        <Badge variant="outline" className="ml-auto">
                          Optimal: {factor.optimal}
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">
                        {factor.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Low Level Signs
                          </h4>
                          <ul className="text-sm space-y-1">
                            {factor.lowSigns.map((sign, idx) => (
                              <li key={idx} className="text-red-700">• {sign}</li>
                            ))}
                          </ul>
                          <div className="mt-3 p-2 bg-red-100 rounded text-sm">
                            <strong>Fix:</strong> {factor.adjustment.low}
                          </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            High Level Signs
                          </h4>
                          <ul className="text-sm space-y-1">
                            {factor.highSigns.map((sign, idx) => (
                              <li key={idx} className="text-orange-700">• {sign}</li>
                            ))}
                          </ul>
                          <div className="mt-3 p-2 bg-orange-100 rounded text-sm">
                            <strong>Fix:</strong> {factor.adjustment.high}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="process">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {testingSteps.map((step, index) => (
                  <Card key={step.step} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-lg">{step.step}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {step.description}
                          </p>
                          <div className="grid md:grid-cols-2 gap-3">
                            {step.tips.map((tip, tipIndex) => (
                              <div key={tipIndex} className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {tip}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Testing Timeline */}
              <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-blue-600" />
                    Recommended Testing Schedule
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Spring (March-April)</h4>
                      <p className="text-gray-600">Annual basic soil test before planting season</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Mid-Season (July)</h4>
                      <p className="text-gray-600">Quick pH and nutrient check for growing crops</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Fall (September)</h4>
                      <p className="text-gray-600">Comprehensive test for next season planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}