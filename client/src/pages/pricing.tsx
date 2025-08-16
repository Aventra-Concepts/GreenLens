import Navigation from "@/components/Navigation";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-16">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
}
