import { Layout } from "@/components/Layout";
import MyGardenSection from "@/components/MyGardenSection";
import { GardeningToolsMarketplace } from "@/components/GardeningToolsMarketplace";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from 'lucide-react';

export default function MyGardenPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Layout showImageBanner={false} showSidebarAds={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 pt-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="py-2">
          {user ? (
            <div>
              {/* Title */}
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Garden</h1>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  Welcome to your personal garden dashboard. Track your plants, monitor their health, 
                  and get personalized care recommendations powered by AI technology.
                </p>
              </div>
              <MyGardenSection />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Title */}
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Garden</h1>
                <p className="text-sm text-gray-600 mb-6">
                  Your personal garden management dashboard. Track your plants, get AI-powered care recommendations, 
                  and build your dream garden with professional tools and insights.
                </p>
              </div>

              {/* Sign In Button */}
              <div className="text-center mb-6">
                <Link href="/auth">
                  <Button className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Features List */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-800 font-semibold mb-4 text-center text-lg">
                  Sign in to unlock advanced features:
                </p>
                <ul className="text-green-700 space-y-3 max-w-2xl mx-auto">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">•</span>
                    <span>Personalized tool recommendations based on your plants</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">•</span>
                    <span>Plant identification history and care tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">•</span>
                    <span>Custom gardening calendar and reminders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">•</span>
                    <span>Expert plant analysis with AI insights</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}