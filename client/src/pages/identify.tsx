import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Upload, X, Loader2, Camera } from "lucide-react";
import { CameraCapture } from "@/components/CameraCapture";
import { PoweredBySection } from "@/components/PoweredBySection";


import { InArticleAd } from "@/components/AdSense";
import { useAuth } from "@/hooks/use-auth";

export default function Identify() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<number>(0);

  const identifyMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('AUTHENTICATION_REQUIRED');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to identify plant');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Auto-delete images after successful identification
      clearAllImages();
      
      toast({
        title: "Plant Identified!",
        description: `Found ${data.species.commonName} with ${Math.round(data.confidence * 100)}% confidence`,
      });
      setLocation(`/result/${data.id}`);
    },
    onError: (error: Error) => {
      let title = "Identification Failed";
      let description = "Unable to analyze your plant right now. Please try again later.";
      
      // Handle authentication errors first
      if (error.message === 'AUTHENTICATION_REQUIRED' || error.message.includes('401') || error.message.includes('Unauthorized')) {
        title = "Login Required";
        description = "Please sign in to identify plants and track your garden collection.";
        toast({
          title,
          description,
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation('/auth');
        }, 1500);
        return;
      }
      
      // Handle sanitized error codes from backend
      if (error.message.includes('SERVICE_QUOTA_EXCEEDED')) {
        title = "Daily Limit Reached";
        description = "Our AI service has reached its daily limit. Please try again tomorrow or upgrade for unlimited access.";
      } else if (error.message.includes('AI_SERVICE_ERROR')) {
        title = "Service Temporarily Unavailable";
        description = "Plant analysis service is temporarily unavailable. Please try again in a few minutes.";
      } else if (error.message.includes('daily limit') || error.message.includes('quota')) {
        title = "Daily Limit Reached";
        description = "Daily analysis limit reached. Please try again tomorrow or upgrade for unlimited access.";
      } else if (error.message.includes('temporarily busy') || error.message.includes('wait a moment')) {
        title = "Service Busy";
        description = "Service is temporarily busy. Please wait a moment and try again.";
      } else if (error.message.includes('temporarily unavailable')) {
        title = "Service Unavailable";
        description = "Plant analysis service is temporarily unavailable. Please try again later.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const validateFile = useCallback((file: File): boolean => {
    // Check file type (JPEG/PNG only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only JPEG and PNG images are allowed",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (100KB max)
    const maxSize = 100 * 1024; // 100KB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Each image must be under 100KB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = event.target.files?.[0];
    if (!file || !validateFile(file)) {
      return;
    }

    const newFiles = [...uploadedFiles];
    newFiles[slotIndex] = file;
    setUploadedFiles(newFiles);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...previews];
      newPreviews[slotIndex] = e.target?.result as string;
      setPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  }, [uploadedFiles, previews, validateFile]);

  const removeFile = useCallback((index: number) => {
    const newFiles = [...uploadedFiles];
    const newPreviews = [...previews];
    
    newFiles[index] = undefined as any;
    newPreviews[index] = '';
    
    setUploadedFiles(newFiles.filter(Boolean));
    setPreviews(newPreviews.filter(Boolean));
  }, [uploadedFiles, previews]);

  const clearAllImages = useCallback(() => {
    setUploadedFiles([]);
    setPreviews([]);
  }, []);

  const handleCameraCapture = useCallback((file: File) => {
    if (!validateFile(file)) {
      setShowCamera(false);
      return;
    }

    const newFiles = [...uploadedFiles];
    newFiles[currentSlot] = file;
    setUploadedFiles(newFiles);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...previews];
      newPreviews[currentSlot] = e.target?.result as string;
      setPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
    
    setShowCamera(false);
  }, [validateFile, currentSlot, uploadedFiles, previews]);

  const openCamera = useCallback((slotIndex: number) => {
    setCurrentSlot(slotIndex);
    setShowCamera(true);
  }, []);

  const handleAnalyze = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please log in to analyze plants",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    identifyMutation.mutate(uploadedFiles);
  };

  return (
    <Layout showImageBanner={true} showSidebarAds={false}>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Plant Images</h2>
            <p className="text-gray-600 dark:text-gray-300">Add up to 3 photos for the most accurate identification</p>
            {!isAuthenticated && !isAuthLoading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Login Required:</strong> Please sign in to identify plants and track your garden collection.
                  <a href="/auth" className="underline hover:no-underline ml-1">Sign In Now</a>
                </p>
              </div>
            )}
            {isAuthenticated && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Free Tier:</strong> Limited to 45 AI analysis requests per day. 
                  <a href="/pricing" className="underline hover:no-underline ml-1">Upgrade for unlimited access</a>
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index} className="relative border-2 border-dashed border-green-300 hover:border-green-500 transition-colors bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-6">
                  {uploadedFiles[index] ? (
                    <div className="relative">
                      <div className="aspect-square bg-green-100 dark:bg-green-800/20 rounded-lg overflow-hidden mb-3">
                        {previews[index] ? (
                          <img 
                            src={previews[index]} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 text-center truncate mb-2">
                        {uploadedFiles[index].name}
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-6 h-6 p-0"
                        onClick={() => removeFile(index)}
                        data-testid={`remove-file-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="h-full flex flex-col items-center justify-center text-center cursor-pointer group"
                      onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                    >
                      <input
                        id={`file-input-${index}`}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleFileChange(e, index)}
                        className="hidden"
                        data-testid={`file-input-${index}`}
                      />
                      <div className="w-16 h-16 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-300 dark:group-hover:bg-green-600 transition-colors">
                        <Upload className="w-8 h-8 text-green-600 dark:text-green-300 group-hover:text-green-700 dark:group-hover:text-green-200" />
                      </div>
                      <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Image {index + 1}</h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">JPEG/PNG • Max 100KB</p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          className="text-xs bg-green-500 hover:bg-green-600 text-white"
                          data-testid={`upload-file-${index}`}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCamera(index);
                          }}
                          className="text-xs bg-green-700 hover:bg-green-800 text-white"
                          data-testid={`camera-${index}`}
                        >
                          <Camera className="w-3 h-3 mr-1" />
                          Camera
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>



          {/* Analysis Progress */}
          {identifyMutation.isPending && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Analyzing Your Plant...</h3>
                  <Progress value={33} className="w-full" />
                  <p className="text-sm text-gray-600">Our AI is identifying your plant species</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center space-y-4">
            {uploadedFiles.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllImages}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                data-testid="clear-all-button"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg text-white shadow-lg"
              disabled={uploadedFiles.length === 0 || identifyMutation.isPending || !isAuthenticated}
              onClick={handleAnalyze}
              data-testid="analyze-button"
            >
              {identifyMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Analyze Plant
                </>
              )}
            </Button>
            
            {!isAuthenticated && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                <span className="text-orange-600 dark:text-orange-400 font-medium">Login required:</span> Please{" "}
                <button 
                  onClick={() => setLocation("/auth")}
                  className="text-green-600 dark:text-green-400 underline hover:text-green-700 dark:hover:text-green-300"
                >
                  log in
                </button>
                {" "}to analyze your plants
              </p>
            )}
          </div>
        </div>
        
        {/* Additional Sections */}
        <PoweredBySection />
        
        <InArticleAd />
      </section>
      <Footer />
      
      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    </Layout>
  );
}
