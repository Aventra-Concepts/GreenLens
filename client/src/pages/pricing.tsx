import { Layout } from "@/components/Layout";
import PricingSection from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Check, Star, Shield, Clock, Users } from "lucide-react";

export default function Pricing() {
  return (
    <Layout>
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>

      <div className="py-4">
        {/* Header Section */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Unlock the full potential of AI-powered plant care with our comprehensive plans designed for every gardener.
          </p>
          
          {/* Key Benefits */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">AI Plant ID</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Expert Care Plans</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">24/7 Monitoring</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Community Access</span>
            </div>
          </div>
        </div>

        <PricingSection />

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Why Choose GreenLens?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Advanced AI technology with 99% accuracy for plant identification</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Personalized care recommendations based on your location and climate</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Disease diagnosis and treatment plans from plant health experts</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Digital garden journal with growth tracking and milestone alerts</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Access to premium gardening tools and resources marketplace</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Priority customer support with response within 24 hours</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
