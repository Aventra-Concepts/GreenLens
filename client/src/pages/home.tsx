import { Layout } from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import USOptimizedHero from "@/components/USOptimizedHero";
import MyGardenSection from "@/components/MyGardenSection";
import { InArticleAd } from "@/components/AdSense";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { PoweredBySection } from "@/components/PoweredBySection";
import { FeaturedEbooksSection } from "@/components/FeaturedEbooksSection";
import { SoilPreparationSection } from "@/components/SoilPreparationSection";
import { SoilTestingSection } from "@/components/SoilTestingSection";


export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Layout showImageBanner={true} showSidebarAds={true}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <HeroSection />
        
        {/* Powered by GreenLens AI Technology section */}
        <PoweredBySection />
        
        {/* In-article ad between sections */}
        <InArticleAd />
        
        {/* Featured E-books Section */}
        <FeaturedEbooksSection />
        
        {/* Soil Preparation Guide */}
        <SoilPreparationSection />
        
        {/* Soil Testing Guide */}
        <SoilTestingSection />
        
        <MyGardenSection />
      </div>
      <Footer />
    </Layout>
  );
}
