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

        
        {/* In-article ad between sections */}
        <InArticleAd />
        
        <PricingSection />
        <BlogPreviewSection />
      </div>
      <Footer />
    </Layout>
  );
}
