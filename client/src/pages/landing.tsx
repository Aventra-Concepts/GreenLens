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
      </div>
      <Footer />
    </Layout>
  );
}
