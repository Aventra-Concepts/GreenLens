import { Layout } from "@/components/Layout";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function Pricing() {
  return (
    <Layout>
      <div className="py-16">
        <PricingSection />
      </div>
      <Footer />
    </Layout>
  );
}
