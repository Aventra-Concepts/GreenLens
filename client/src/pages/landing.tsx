import { Layout } from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import USOptimizedHero from "@/components/USOptimizedHero";
import PricingSection from "@/components/PricingSection";
import BlogPreviewSection from "@/components/BlogPreviewSection";
import { InArticleAd } from "@/components/AdSense";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <Layout showImageBanner={true} showSidebarAds={true}>
      <div className="space-y-4">
        <HeroSection />
        <PricingSection />
        <BlogPreviewSection />
        
        {/* Show Amazon Affiliate marketplace for non-authenticated users as a preview */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Gardening Tools Marketplace</h2>
              <p className="text-gray-600">Discover essential tools for your garden journey</p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  🔐 <strong>Sign in to unlock:</strong> Personalized tool recommendations based on your plant analysis results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
