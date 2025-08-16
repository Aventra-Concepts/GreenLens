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
              <div className="text-sm text-gray-600 leading-relaxed text-center">
                <div>Upload a photo and get instant plant identification, personalized care plans, and expert</div>
                <div>disease diagnosis powered by advanced <span className="text-green-600 font-semibold">GreenLens AI Technology</span>.</div>
              </div>
            </div>
            
            {/* Image upload boxes */}
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="w-40 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 mb-1">Image 1</span>
                  <span className="text-xs text-gray-400">≤100KB</span>
                </div>
                <Button 
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm mt-3 transition-colors"
                  data-testid="upload-image-1-button"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-40 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 mb-1">Image 2</span>
                  <span className="text-xs text-gray-400">≤100KB</span>
                </div>
                <Button 
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm mt-3 transition-colors"
                  data-testid="upload-image-2-button"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-40 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 mb-1">Image 3</span>
                  <span className="text-xs text-gray-400">≤100KB</span>
                </div>
                <Button 
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm mt-3 transition-colors"
                  data-testid="upload-image-3-button"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="outline"
                size="default"
                className="border-green-500 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium text-base transition-colors"
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
