import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Upload, CheckCircle, Eye } from "lucide-react";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-gradient-to-br from-green-50 to-green-100 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight text-center">
                Identify Any Plant with{" "}
                <span className="text-green-500">AI-Powered</span>{" "}
                Precision
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed text-center">
                <div>Upload a photo and get instant plant identification, personalized care plans,</div>
                <div>and expert disease diagnosis powered by advanced GreenLens AI Technology.</div>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={isAuthenticated ? "/identify" : "/api/login"}>
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
                  data-testid="upload-plant-photo-button"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Plant Photo
                </Button>
              </Link>
              <Button 
                variant="outline"
                size="lg"
                className="border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                data-testid="view-sample-report-button"
              >
                View Sample Report
              </Button>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>99% Accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>30,000+ Species</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Beautiful indoor garden with various plants" 
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Monstera Deliciosa</div>
                  <div className="text-sm text-gray-600">Identified in 2.3s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
