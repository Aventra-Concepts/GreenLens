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
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left: Reduced size gardening image */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img 
                src="@assets/image_1755326099673.png" 
                alt="Gardening tools and soil preparation" 
                className="rounded-2xl shadow-lg w-full h-64 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Ready to Plant</div>
                    <div className="text-xs text-gray-600">Perfect Setup</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Identify Any Plant with{" "}
                <span className="text-green-500">AI-Powered</span>{" "}
                Precision
              </h1>
              <div className="text-sm text-gray-600 leading-relaxed">
                <div>Upload a photo and get instant plant identification, personalized care plans, and expert</div>
                <div>disease diagnosis powered by advanced <span className="text-green-600 font-semibold">GreenLens AI Technology</span>.</div>
              </div>
            </div>
            
            {/* Image upload boxes */}
            <div className="flex justify-start gap-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 mb-1">Image 1</span>
                  <span className="text-xs text-gray-400">≤100KB</span>
                </div>
                <Button 
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md font-medium text-xs mt-2 transition-colors"
                  data-testid="upload-image-1-button"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 mb-1">Image 2</span>
                  <span className="text-xs text-gray-400">≤100KB</span>
                </div>
                <Button 
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md font-medium text-xs mt-2 transition-colors"
                  data-testid="upload-image-2-button"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 mb-1">Image 3</span>
                  <span className="text-xs text-gray-400">≤100KB</span>
                </div>
                <Button 
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md font-medium text-xs mt-2 transition-colors"
                  data-testid="upload-image-3-button"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
            </div>

            <div className="flex justify-start">
              <Button 
                variant="outline"
                size="default"
                className="border-green-500 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium text-base transition-colors"
                data-testid="view-sample-report-button"
              >
                View Sample Report
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
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
        </div>
      </div>
    </section>
  );
}
