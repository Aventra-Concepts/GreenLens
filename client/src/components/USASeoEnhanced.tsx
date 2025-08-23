import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Users, Award } from "lucide-react";
import { useMemo } from "react";

export function USASeoEnhanced() {
  // Calculate user count that increases by 1000 every 3 months starting from 9000
  const userCount = useMemo(() => {
    const startDate = new Date('2024-01-01'); // Starting date
    const currentDate = new Date();
    const monthsPassed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
    const quartersPassedFromStart = Math.floor(monthsPassed / 3);
    const baseCount = 9000;
    const currentCount = baseCount + (quartersPassedFromStart * 1000);
    return `${currentCount.toLocaleString()}+`;
  }, []);
  return (
    <>
      {/* Global trust signals and statistics */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Gardeners Nationwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From around the world, GreenLens helps gardeners identify plants, diagnose diseases, 
              and grow healthier gardens across all climate zones with accurate scientific information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{userCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Global Users</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">App Store Rating</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">All</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Regions Covered</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">99.5%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Accuracy Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* USA Regional Coverage */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Accurate and Scientific Information On Plants Across All Regions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { zone: "Northeast", states: "ME, NH, VT, MA, RI, CT, NY, NJ, PA", plants: "Maple, Oak, Pine" },
                { zone: "Northwest", states: "WA, OR, ID, MT, WY, AK", plants: "Douglas Fir, Cedar, Spruce" },
                { zone: "Mideast", states: "DE, MD, DC, VA, WV, KY, TN, NC", plants: "Dogwood, Hickory, Tulip Tree" },
                { zone: "Midwest", states: "OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS", plants: "Corn, Wheat, Soybean" },
                { zone: "Southeast", states: "SC, GA, FL, AL, MS, LA, AR", plants: "Magnolia, Palm, Azalea" },
                { zone: "Southwest", states: "TX, OK, NM, AZ, CO, UT, NV, CA, HI", plants: "Cactus, Agave, Mesquite" }
              ].map((region, index) => (
                <Card key={index} className="text-center bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {region.zone}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {region.states}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {region.plants}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO-optimized FAQ for gardeners worldwide */}
      <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions - Plant Identification
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How accurate is plant identification for native and exotic species?",
                a: "GreenLens achieves 99.5% accuracy for plants worldwide including native species, ornamentals, and garden plants across all climate zones."
              },
              {
                q: "Does GreenLens work for plants in all climate zones?",
                a: "Yes! GreenLens is optimized for plants across all global climate zones, providing scientific information for diverse growing conditions worldwide."
              },
              {
                q: "Can I identify weeds and invasive species in my garden?",
                a: "Absolutely. GreenLens identifies common weeds, invasive species, and helps with proper removal and management strategies for your region."
              },
              {
                q: "Is plant care advice customized for my growing conditions?",
                a: "Yes, all care recommendations are tailored for various soil types, weather patterns, and seasonal changes specific to your geographic region."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}