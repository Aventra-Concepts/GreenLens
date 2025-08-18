import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Sparkles, Loader2, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import PlantAnalysisResults from "./PlantAnalysisResults";
import gardenImage from "@assets/image_1755326099673.png";

interface UploadedImage {
  file: File;
  preview: string;
  slot: number;
}

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const analysisQueueMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/plant-analysis/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setShowResults(true);
      toast({
        title: "Analysis Complete",
        description: "Your plant has been successfully identified!",
      });
    },
    onError: (error: any) => {
      if (error.message.includes('Free tier limit')) {
        toast({
          title: "Free Tier Limit Reached",
          description: "You've used all 3 free identifications. Please upgrade to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (100KB limit as shown in UI)
    if (file.size > 100 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 100KB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    const newImage: UploadedImage = { file, preview, slot };

    setUploadedImages(prev => {
      // Remove any existing image in this slot
      const filtered = prev.filter(img => img.slot !== slot);
      return [...filtered, newImage];
    });
  };

  const removeImage = (slot: number) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.slot === slot);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.slot !== slot);
    });
  };

  const handleAnalyze = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please upload at least one image to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to analyze your plant images",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    uploadedImages.forEach(image => {
      formData.append('images', image.file);
    });

    analysisQueueMutation.mutate(formData);
  };

  const getImageForSlot = (slot: number) => {
    return uploadedImages.find(img => img.slot === slot);
  };

  const handleDownloadPDF = () => {
    // PDF download will be handled by the PlantAnalysisResults component
    toast({
      title: "PDF Ready",
      description: "Your plant analysis report has been prepared",
    });
  };

  const closeResults = () => {
    setShowResults(false);
    setAnalysisResult(null);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 py-8 sm:py-12 lg:py-16 xl:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight text-center px-2">
                  Identify Any Plant with{" "}
                  <span className="text-green-600">GreenLens-Powered</span>{" "}
                  Precision
                </h1>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-center px-4">
                  <div>Upload up to 3 photos and get instant plant identification, personalized care plans, and expert</div>
                  <div>disease diagnosis with advanced AI analysis.</div>
                </div>
              </div>
              
              {/* Image upload boxes */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-6 justify-items-center max-w-[300px] sm:max-w-2xl mx-auto px-2 sm:px-4">
                {[1, 2, 3].map((slot) => {
                  const uploadedImage = getImageForSlot(slot);
                  return (
                    <div key={slot} className="flex flex-col items-center w-full">
                      <div 
                        className="w-full h-20 sm:h-32 lg:h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md sm:rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer relative"
                        onClick={() => fileInputRefs[slot - 1].current?.click()}
                      >
                        {uploadedImage ? (
                          <>
                            <img 
                              src={uploadedImage.preview} 
                              alt={`Upload ${slot}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(slot);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                              data-testid={`remove-image-${slot}-button`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400 dark:text-gray-500 mb-1" />
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Image {slot}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">≤100KB</span>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRefs[slot - 1]}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, slot)}
                        className="hidden"
                        data-testid={`file-input-${slot}`}
                      />
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white px-1 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm mt-1 sm:mt-2 transition-colors w-full"
                        onClick={() => fileInputRefs[slot - 1].current?.click()}
                        data-testid={`upload-image-${slot}-button`}
                      >
                        <Upload className="w-3 h-3 mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">{uploadedImage ? 'Change' : 'Upload'}</span>
                        <span className="sm:hidden">{slot}</span>
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Analyze button */}
              <div className="flex justify-center px-2 sm:px-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={analysisQueueMutation.isPending || uploadedImages.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all w-full max-w-xs sm:w-auto"
                  data-testid="analyze-images-button"
                >
                  {analysisQueueMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Analyzing Images...</span>
                      <span className="sm:hidden">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Analyze the Images</span>
                      <span className="sm:hidden">Analyze</span>
                    </>
                  )}
                </Button>
              </div>
              
              {!isAuthenticated && (
                <div className="text-center px-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Link href="/auth">
                      <span className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
                        Log in
                      </span>
                    </Link>{" "}
                    to get 3 free plant identifications
                  </p>
                </div>
              )}
            </div>


          </div>
        </div>
      </section>

      {/* Analysis Results Modal */}
      {showResults && analysisResult && (
        <PlantAnalysisResults
          analysisData={analysisResult}
          onClose={closeResults}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </>
  );
}