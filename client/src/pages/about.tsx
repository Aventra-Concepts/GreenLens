import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Leaf, Brain, Users, Globe, Award, Shield, Zap, Heart, Target, Camera, BookOpen, MessageSquare, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 sm:mb-8 font-medium transition-colors" data-testid="back-to-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
            
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <Leaf className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    About GreenLens
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                    AI-Powered Plant Intelligence for Every Garden
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 mb-8 sm:mb-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto px-2 sm:px-0">
                GreenLens exists to bridge the gap between botanical science and everyday gardening success. 
                We harness the power of artificial intelligence to transform how people understand and nurture plants. 
                Our vision is to create a world where every plant lover can achieve gardening success, whether they're 
                cultivating their first houseplant or managing extensive botanical collections.
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">What We Do</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2 sm:px-0">
                We unite advanced machine learning algorithms with professional botanical knowledge and 
                global gardening wisdom to deliver unparalleled plant care intelligence and identification accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* AI Plant Identification */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start sm:items-center gap-3 mb-4">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex-shrink-0">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">AI Plant Identification</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Our proprietary neural networks examine plant imagery using multi-layered analysis to deliver 
                  precise species recognition coupled with comprehensive botanical profiles and tailored cultivation guidance.
                </p>
              </div>

              {/* Personalized Care Plans */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start sm:items-center gap-3 mb-4">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">Personalized Care Plans</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  AI-generated care plans tailored to your specific plants, location, climate, and experience level, 
                  with reminders and seasonal adjustments for optimal plant health.
                </p>
              </div>

              {/* Disease Diagnosis */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start sm:items-center gap-3 mb-4">
                  <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">Disease Diagnosis</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Early detection and treatment recommendations for plant diseases, pests, and nutrient deficiencies 
                  using AI-powered image analysis and expert botanical knowledge.
                </p>
              </div>

              {/* Expert Consultations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start sm:items-center gap-3 mb-4">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex-shrink-0">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">Expert Consultations</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Connect with certified horticulturists, botanists, and gardening experts for personalized advice 
                  on complex plant issues and advanced growing techniques.
                </p>
              </div>

              {/* E-Book Library */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start sm:items-center gap-3 mb-4">
                  <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex-shrink-0">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">E-Book Library</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Comprehensive digital library featuring expert-authored guides on gardening, plant care, 
                  botany, and sustainable growing practices for all skill levels.
                </p>
              </div>

              {/* Garden Monitoring */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start sm:items-center gap-3 mb-4">
                  <div className="p-2 sm:p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-tight">Garden Monitoring</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Track your plant collection's health, growth progress, and care history with automated reminders 
                  and insights to optimize your gardening success.
                </p>
              </div>
            </div>
          </div>

          {/* Our Technology */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-8 sm:mb-12 text-white">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-bold">Powered by Advanced AI</h2>
              </div>
              <p className="text-base sm:text-lg text-green-50 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                Our platform leverages state-of-the-art artificial intelligence, including computer vision, 
                natural language processing, and machine learning algorithms trained on millions of plant images 
                and expert botanical knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                  <h3 className="text-lg sm:text-xl font-semibold">OpenAI Integration</h3>
                </div>
                <p className="text-green-50 text-sm">
                  Advanced language models provide detailed plant descriptions, care instructions, and 
                  personalized recommendations based on your specific needs.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                  <h3 className="text-lg sm:text-xl font-semibold">Plant.id API</h3>
                </div>
                <p className="text-green-50 text-sm">
                  Leading plant identification service with 99%+ accuracy across 30,000+ plant species, 
                  including disease and pest detection capabilities.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" />
                  <h3 className="text-lg sm:text-xl font-semibold">Global Plant Database</h3>
                </div>
                <p className="text-green-50 text-sm">
                  Comprehensive botanical database covering plants from all continents with regional care 
                  variations and climate-specific growing advice.
                </p>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2 sm:px-0">
                The principles that guide everything we do at GreenLens
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="p-3 sm:p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Sustainability</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Promoting eco-friendly gardening practices and environmental stewardship through education and technology.
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Building a global community of plant lovers who share knowledge, experiences, and support each other.
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 sm:p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Continuously advancing plant science through AI research and cutting-edge technology development.
                </p>
              </div>

              <div className="text-center">
                <div className="p-3 sm:p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Excellence</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Delivering the highest quality plant identification and care recommendations through scientific accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Global Impact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Global Impact</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2 sm:px-0">
                GreenLens serves plant enthusiasts across the world, supporting biodiversity conservation 
                and sustainable gardening practices in every climate zone.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">50,000+</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Active Users Worldwide</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">30,000+</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Plant Species Identified</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">150+</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Countries Served</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">99.2%</div>
                <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Identification Accuracy</div>
              </div>
            </div>
          </div>

          {/* Join Our Mission */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-base sm:text-lg text-green-50 mb-6 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Whether you're a beginner looking to identify your first plant or an expert gardener seeking 
              advanced insights, GreenLens provides the tools and knowledge you need to succeed. 
              Join thousands of plant lovers worldwide who trust GreenLens for their gardening journey.
            </p>
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors" data-testid="get-started">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                Get Started Today
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}