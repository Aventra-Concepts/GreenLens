import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Leaf, Brain, Users, Globe, Award, Shield, Zap, Heart, Target, Camera, BookOpen, MessageSquare, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <Link href="/">
              <button className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8 font-medium transition-colors" data-testid="back-to-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <Leaf className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    About GreenLens
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300">
                    AI-Powered Plant Intelligence for Every Garden
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
                At GreenLens, we believe everyone deserves to connect with nature and successfully grow plants. 
                Our mission is to democratize plant knowledge through cutting-edge AI technology, making plant 
                identification, care, and education accessible to plant enthusiasts worldwide, from beginners 
                taking their first steps in gardening to experts seeking advanced insights.
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What We Do</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                GreenLens combines artificial intelligence, botanical expertise, and community knowledge 
                to create the most comprehensive plant identification and care platform available today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Plant Identification */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Camera className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Plant Identification</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Advanced computer vision and machine learning algorithms analyze plant photos to provide 
                  accurate species identification with detailed botanical information and care recommendations.
                </p>
              </div>

              {/* Personalized Care Plans */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personalized Care Plans</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  AI-generated care plans tailored to your specific plants, location, climate, and experience level, 
                  with reminders and seasonal adjustments for optimal plant health.
                </p>
              </div>

              {/* Disease Diagnosis */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Disease Diagnosis</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Early detection and treatment recommendations for plant diseases, pests, and nutrient deficiencies 
                  using AI-powered image analysis and expert botanical knowledge.
                </p>
              </div>

              {/* Expert Consultations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Expert Consultations</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Connect with certified horticulturists, botanists, and gardening experts for personalized advice 
                  on complex plant issues and advanced growing techniques.
                </p>
              </div>

              {/* E-Book Library */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">E-Book Library</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Comprehensive digital library featuring expert-authored guides on gardening, plant care, 
                  botany, and sustainable growing practices for all skill levels.
                </p>
              </div>

              {/* Garden Monitoring */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Garden Monitoring</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Track your plant collection's health, growth progress, and care history with automated reminders 
                  and insights to optimize your gardening success.
                </p>
              </div>
            </div>
          </div>

          {/* Our Technology */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-12 text-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Powered by Advanced AI</h2>
              </div>
              <p className="text-lg text-green-50 max-w-3xl mx-auto leading-relaxed">
                Our platform leverages state-of-the-art artificial intelligence, including computer vision, 
                natural language processing, and machine learning algorithms trained on millions of plant images 
                and expert botanical knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <h3 className="text-xl font-semibold">OpenAI Integration</h3>
                </div>
                <p className="text-green-50 text-sm">
                  Advanced language models provide detailed plant descriptions, care instructions, and 
                  personalized recommendations based on your specific needs.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="w-6 h-6 text-blue-300" />
                  <h3 className="text-xl font-semibold">Plant.id API</h3>
                </div>
                <p className="text-green-50 text-sm">
                  Leading plant identification service with 99%+ accuracy across 30,000+ plant species, 
                  including disease and pest detection capabilities.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-6 h-6 text-green-300" />
                  <h3 className="text-xl font-semibold">Global Plant Database</h3>
                </div>
                <p className="text-green-50 text-sm">
                  Comprehensive botanical database covering plants from all continents with regional care 
                  variations and climate-specific growing advice.
                </p>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                The principles that guide everything we do at GreenLens
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sustainability</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Promoting eco-friendly gardening practices and environmental stewardship through education and technology.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Building a global community of plant lovers who share knowledge, experiences, and support each other.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Continuously advancing plant science through AI research and cutting-edge technology development.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Excellence</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Delivering the highest quality plant identification and care recommendations through scientific accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Global Impact */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Global Impact</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                GreenLens serves plant enthusiasts across the world, supporting biodiversity conservation 
                and sustainable gardening practices in every climate zone.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50,000+</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Active Users Worldwide</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">30,000+</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Plant Species Identified</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Countries Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">99.2%</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Identification Accuracy</div>
              </div>
            </div>
          </div>

          {/* Join Our Mission */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-lg text-green-50 mb-6 max-w-3xl mx-auto leading-relaxed">
              Whether you're a beginner looking to identify your first plant or an expert gardener seeking 
              advanced insights, GreenLens provides the tools and knowledge you need to succeed. 
              Join thousands of plant lovers worldwide who trust GreenLens for their gardening journey.
            </p>
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors" data-testid="get-started">
                <Leaf className="w-5 h-5" />
                Get Started Today
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}