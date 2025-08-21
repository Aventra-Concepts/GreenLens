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
        {/* Header Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">My Garden Dashboard</h1>
              </div>
              {!user && (
                <div className="flex items-center space-x-4">
                  <Link href="/auth">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Sign In for Full Access
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-8">
          {user ? (
            <MyGardenSection />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to GreenLens Garden Tools</h2>
                <p className="text-lg text-gray-600 mb-6">Discover professional gardening tools to enhance your plant care journey</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 inline-block">
                  <p className="text-blue-700 mb-4">
                    <strong>Sign in to unlock advanced features:</strong>
                  </p>
                  <ul className="text-blue-600 text-left space-y-2">
                    <li>• Personalized tool recommendations based on your plants</li>
                    <li>• Plant identification history and care tracking</li>
                    <li>• Custom gardening calendar and reminders</li>
                    <li>• Expert plant analysis with AI insights</li>
                  </ul>
                </div>
              </div>
              
              {/* Amazon Affiliate Marketplace for non-authenticated users */}
              <GardeningToolsMarketplace plantResults={[]} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}