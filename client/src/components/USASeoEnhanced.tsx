import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Users, Award } from "lucide-react";

export function USASeoEnhanced() {
  return (
    <>
      {/* USA-specific trust signals and local SEO */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by American Gardeners Nationwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From coast to coast, GreenLens helps American gardeners identify plants, diagnose diseases, 
              and grow healthier gardens across all US climate zones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">50,000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">American Users</div>
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">All 50</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">States Covered</div>
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
              Complete Coverage Across American Growing Zones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { zone: "Northeast", states: "NY, MA, CT, etc.", plants: "Maple, Oak, Pine" },
                { zone: "Southeast", states: "FL, GA, NC, etc.", plants: "Magnolia, Palm, Azalea" },
                { zone: "Midwest", states: "IL, OH, MI, etc.", plants: "Corn, Wheat, Soybean" },
                { zone: "Southwest", states: "TX, AZ, NM, etc.", plants: "Cactus, Agave, Mesquite" },
                { zone: "West Coast", states: "CA, WA, OR, etc.", plants: "Redwood, Eucalyptus, Fern" }
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

      {/* SEO-optimized FAQ for American gardeners */}
      <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions - American Plant Identification
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How accurate is plant identification for American native species?",
                a: "GreenLens achieves 99.5% accuracy for North American plants including native species, ornamentals, and garden plants across all US growing zones."
              },
              {
                q: "Does GreenLens work for plants in all US climate zones?",
                a: "Yes! GreenLens is optimized for plants across all American climate zones from USDA zones 3-11, covering everything from Alaska to Hawaii."
              },
              {
                q: "Can I identify weeds and invasive species in my American garden?",
                a: "Absolutely. GreenLens identifies common American weeds, invasive species, and helps with proper removal and management strategies."
              },
              {
                q: "Is plant care advice customized for American growing conditions?",
                a: "Yes, all care recommendations are tailored for American soil types, weather patterns, and seasonal changes specific to your region."
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