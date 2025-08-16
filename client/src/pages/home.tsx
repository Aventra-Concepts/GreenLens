import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import MyGardenSection from "@/components/MyGardenSection";
import { InArticleAd } from "@/components/AdSense";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PoweredBySection } from "@/components/PoweredBySection";
import GardeningToolsSection from "@/components/GardeningToolsSection";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Layout showImageBanner={true} showSidebarAds={true}>
      <div className="space-y-8">
        <HeroSection />
        
        {/* Powered by GreenLens AI Technology section */}
        <PoweredBySection />
        
        {/* In-article ad between sections */}
        <InArticleAd />
        
        {/* Gardening tools and soil preparation section */}
        <GardeningToolsSection />
        
        <MyGardenSection />
      </div>
      <Footer />
    </Layout>
  );
}
