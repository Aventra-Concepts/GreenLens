import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Droplets, 
  Sun, 
  Snowflake, 
  Flower2, 
  Thermometer,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function SoilPreparationSection() {
  const seasons = [
    {
      id: "spring",
      name: "Spring",
      icon: Flower2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      tasks: [
        {
          title: "Soil Temperature Check",
          description: "Ensure soil temperature is consistently above 50°F (10°C)",
          timing: "Early March - April",
          difficulty: "Beginner",
          tools: ["Soil thermometer"]
        },
        {
          title: "Remove Winter Debris",
          description: "Clear fallen leaves, dead plant material, and winter mulch",
          timing: "Late March - Early April",
          difficulty: "Beginner",
          tools: ["Rake", "Garden gloves", "Compost bin"]
        },
        {
          title: "Soil Aeration",
          description: "Break up compacted soil from winter freeze-thaw cycles",
          timing: "April - May",
          difficulty: "Intermediate",
          tools: ["Garden fork", "Aerator", "Compost"]
        },
        {
          title: "Organic Matter Addition",
          description: "Mix in 2-4 inches of compost or aged manure",
          timing: "April - May",
          difficulty: "Beginner",
          tools: ["Shovel", "Compost", "Garden rake"]
        }
      ]
    },
    {
      id: "summer",
      name: "Summer",
      icon: Sun,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      tasks: [
        {
          title: "Moisture Management",
          description: "Maintain consistent soil moisture with deep, infrequent watering",
          timing: "June - August",
          difficulty: "Intermediate",
          tools: ["Moisture meter", "Soaker hose", "Mulch"]
        },
        {
          title: "Mulch Application",
          description: "Apply 2-3 inches of organic mulch around plants",
          timing: "Early June",
          difficulty: "Beginner",
          tools: ["Organic mulch", "Rake", "Garden cart"]
        },
        {
          title: "Soil pH Monitoring",
          description: "Test and adjust soil pH as plants actively grow",
          timing: "Mid-July",
          difficulty: "Intermediate",
          tools: ["pH test kit", "Lime or sulfur", "Watering can"]
        }
      ]
    },
    {
      id: "fall",
      name: "Fall",
      icon: Droplets,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      tasks: [
        {
          title: "Soil Amendment",
          description: "Add slow-release fertilizer and bone meal for next season",
          timing: "September - October",
          difficulty: "Beginner",
          tools: ["Organic fertilizer", "Bone meal", "Garden fork"]
        },
        {
          title: "Leaf Composting",
          description: "Collect and compost fallen leaves for next year's soil improvement",
          timing: "October - November",
          difficulty: "Beginner",
          tools: ["Rake", "Compost bin", "Shredder (optional)"]
        },
        {
          title: "Winter Cover Prep",
          description: "Plant cover crops or apply protective winter mulch",
          timing: "Late October - November",
          difficulty: "Intermediate",
          tools: ["Cover crop seeds", "Winter mulch", "Seeder"]
        }
      ]
    },
    {
      id: "winter",
      name: "Winter",
      icon: Snowflake,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      tasks: [
        {
          title: "Soil Protection",
          description: "Maintain mulch layer to protect soil from freeze-thaw cycles",
          timing: "December - February",
          difficulty: "Beginner",
          tools: ["Additional mulch", "Burlap", "Stakes"]
        },
        {
          title: "Planning & Testing",
          description: "Plan next season's garden layout and order soil amendments",
          timing: "January - February",
          difficulty: "Beginner",
          tools: ["Garden notebook", "Soil test kit", "Seed catalogs"]
        },
        {
          title: "Tool Maintenance",
          description: "Clean and maintain soil preparation tools for spring",
          timing: "January - March",
          difficulty: "Beginner",
          tools: ["Wire brush", "Oil", "Sharpening stone"]
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Seasonal Soil Preparation Guide
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2 leading-relaxed">
            Optimize your soil health throughout the year with our comprehensive seasonal preparation guide. 
            Healthy soil is the foundation of a thriving garden.
          </p>
        </div>

        <Tabs defaultValue="spring" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 h-auto">
            {seasons.map((season) => {
              const Icon = season.icon;
              return (
                <TabsTrigger 
                  key={season.id} 
                  value={season.id}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-1 sm:p-3 text-xs sm:text-sm min-h-[44px] sm:min-h-[auto]"
                >
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${season.color} flex-shrink-0`} />
                  <span className="text-xs sm:text-sm leading-tight text-center">{season.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {seasons.map((season) => {
            const Icon = season.icon;
            return (
              <TabsContent key={season.id} value={season.id}>
                <Card className={`${season.bgColor} ${season.borderColor} border-2`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Icon className={`w-8 h-8 ${season.color}`} />
                      {season.name} Soil Preparation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {season.tasks.map((task, index) => (
                        <Card key={index} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                                {task.title}
                              </h4>
                              <Badge className={getDifficultyColor(task.difficulty)}>
                                {task.difficulty}
                              </Badge>
                            </div>
                            
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                              {task.description}
                            </p>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {task.timing}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {task.tools.map((tool, toolIndex) => (
                                  <Badge key={toolIndex} variant="outline" className="text-xs leading-tight px-2 py-1">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Quick Tips */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Year-Round Soil Health Tips
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Test soil pH twice yearly (spring and fall)</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Never work wet or frozen soil to avoid compaction</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Maintain 2-4 inches of organic matter annually</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Rotate crop locations to prevent soil depletion</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use organic mulch to suppress weeds and retain moisture</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Avoid over-fertilizing to prevent nutrient runoff</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}