import { Layout } from "@/components/Layout";
import { FeatureShowcase } from '@/components/FeatureShowcase';

export default function FeaturesPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" data-testid="features-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Features & Capabilities
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover everything GreenLens can do to help you identify and care for your plants with AI-powered insights.
          </p>
        </div>
        
        <FeatureShowcase />
      </div>
      </div>
    </Layout>
  );
}