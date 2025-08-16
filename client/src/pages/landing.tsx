import { Layout } from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import BlogPreviewSection from "@/components/BlogPreviewSection";
import { InArticleAd } from "@/components/AdSense";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <Layout showImageBanner={true} showSidebarAds={true}>
      <div className="space-y-8">
        <HeroSection />
        
        {/* Google AdSense space - placed after upload section */}
        <div className="py-8 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <InArticleAd />
          </div>
        </div>
        
        <PricingSection />
        <BlogPreviewSection />
      </div>
      <Footer />
    </Layout>
  );
}
