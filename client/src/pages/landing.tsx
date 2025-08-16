import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PlantIdentifySection from "@/components/PlantIdentifySection";
import PricingSection from "@/components/PricingSection";
import BlogPreviewSection from "@/components/BlogPreviewSection";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <PlantIdentifySection />
      <PricingSection />
      <BlogPreviewSection />
      <Footer />
    </div>
  );
}
