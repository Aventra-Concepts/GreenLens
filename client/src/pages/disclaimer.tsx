import { ArrowLeft, AlertTriangle, Lightbulb, BookOpen, Shield, Eye, Leaf, Heart } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-green-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              data-testid="link-home"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">GreenLens</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full">
              <AlertTriangle className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="heading-disclaimer">
            Disclaimer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" data-testid="text-disclaimer-subtitle">
            Important information about the use of GreenLens and the information provided through our platform
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-8">
          {/* General Disclaimer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-general-disclaimer">
                  General Disclaimer
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    The information provided by GreenLens ("we," "us," or "our") on our website and mobile application (the "Service") is for general informational purposes only. All information on the Service is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Service.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Service or reliance on any information provided on the Service.</strong> Your use of the Service and your reliance on any information on the Service is solely at your own risk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plant Identification Disclaimer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full flex-shrink-0">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-plant-identification">
                  Plant Identification and AI Technology
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                    <li>
                      <strong>AI Limitations:</strong> Our plant identification system uses artificial intelligence and machine learning algorithms. While these technologies are advanced, they are not infallible and may produce incorrect identifications.
                    </li>
                    <li>
                      <strong>Accuracy Not Guaranteed:</strong> We do not guarantee 100% accuracy in plant identification, disease diagnosis, or care recommendations. Results should always be verified with professional botanical resources or experts.
                    </li>
                    <li>
                      <strong>Image Quality Impact:</strong> The accuracy of our identification depends heavily on image quality, lighting conditions, plant maturity, and other factors that may affect the AI's ability to correctly identify species.
                    </li>
                    <li>
                      <strong>Regional Variations:</strong> Plant characteristics can vary significantly by geographic region, climate, and growing conditions, which may affect identification accuracy.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Medical and Safety Disclaimer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-red-200 dark:border-red-700">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full flex-shrink-0">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-medical-safety">
                  Medical and Safety Disclaimer
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4 border-l-4 border-red-500">
                    <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                      ⚠️ IMPORTANT SAFETY WARNING
                    </p>
                    <p className="text-red-700 dark:text-red-300">
                      Never consume, touch, or use any plant based solely on our identification or recommendations. Many plants are toxic or dangerous to humans and animals.
                    </p>
                  </div>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                    <li>
                      <strong>Not Medical Advice:</strong> Information provided by GreenLens is not intended as medical advice and should not be used to diagnose, treat, or prevent any medical condition.
                    </li>
                    <li>
                      <strong>Toxicity Risk:</strong> Many plants are poisonous or can cause allergic reactions. Always consult with qualified professionals before handling, consuming, or using plants for any purpose.
                    </li>
                    <li>
                      <strong>Pet Safety:</strong> Many plants that are safe for humans can be toxic to pets. Consult with a veterinarian before introducing new plants around animals.
                    </li>
                    <li>
                      <strong>Professional Consultation:</strong> For plant-related health concerns, pest management, or agricultural applications, always consult with qualified professionals such as botanists, horticulturists, or medical professionals.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Care Recommendations Disclaimer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-care-recommendations">
                  Plant Care Recommendations
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                    <li>
                      <strong>General Guidelines Only:</strong> Our care recommendations are general guidelines and may not be suitable for your specific plant, environment, or growing conditions.
                    </li>
                    <li>
                      <strong>Environmental Factors:</strong> Plant care requirements can vary significantly based on climate, soil type, humidity, light conditions, and seasonal changes in your specific location.
                    </li>
                    <li>
                      <strong>Individual Plant Needs:</strong> Each plant is unique and may have different requirements even within the same species. Monitor your plants closely and adjust care accordingly.
                    </li>
                    <li>
                      <strong>No Guarantee of Results:</strong> Following our recommendations does not guarantee plant health, growth, or survival. Plant care involves many variables beyond our control.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* External Links and Third-Party Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full flex-shrink-0">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-external-content">
                  External Links and Third-Party Content
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                    <li>
                      <strong>External Websites:</strong> Our Service may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                    </li>
                    <li>
                      <strong>Third-Party Services:</strong> We use third-party APIs and services for plant identification and information. We are not responsible for the accuracy or availability of these external services.
                    </li>
                    <li>
                      <strong>Amazon Affiliate:</strong> As an Amazon Associate, we earn from qualifying purchases. Product recommendations are based on general gardening principles and may not be suitable for all users.
                    </li>
                    <li>
                      <strong>User-Generated Content:</strong> Content created by users, including blog posts, reviews, and forum discussions, represents the opinions of individual users and not necessarily our views.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full flex-shrink-0">
                <Shield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-limitation-liability">
                  Limitation of Liability
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    In no event shall GreenLens, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                    <li>• Loss of profits, data, use, goodwill, or other intangible losses</li>
                    <li>• Personal injury or property damage resulting from plant misidentification</li>
                    <li>• Plant death, damage, or poor growth following our recommendations</li>
                    <li>• Allergic reactions or health issues related to plant exposure</li>
                    <li>• Financial losses from plant purchases or care expenses</li>
                  </ul>
                  <p className="text-gray-600 dark:text-gray-300">
                    This limitation applies regardless of the legal theory on which the claim is based, whether in contract, tort, negligence, strict liability, or otherwise, even if we have been advised of the possibility of such damages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Consultation Recommendation */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-700">
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full inline-block mb-4">
                <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-professional-recommendation">
                We Recommend Professional Consultation
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
                For important plant identification, especially regarding edibility, medicinal use, or toxic plants, we strongly recommend consulting with qualified professionals such as:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <strong className="text-emerald-600 dark:text-emerald-400">Botanists</strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">For accurate plant identification and botanical information</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <strong className="text-emerald-600 dark:text-emerald-400">Horticulturists</strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">For professional plant care and growing advice</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <strong className="text-emerald-600 dark:text-emerald-400">Medical Professionals</strong>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">For any health-related plant concerns or reactions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" data-testid="heading-contact-info">
              Questions About This Disclaimer?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If you have any questions about this disclaimer or our services, please don't hesitate to contact us.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              data-testid="button-contact-us"
            >
              Contact Us
            </Link>
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400" data-testid="text-last-updated">
            <p>This disclaimer was last updated on August 26, 2025</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}