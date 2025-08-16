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

export default function Identify() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
      toast({
        title: "Identification Failed",
        description: error.message,
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
    <Layout showImageBanner={false} showSidebarAds={false}>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">AI Plant Identification</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Upload up to 3 photos for 99% accurate identification</p>
          </div>

          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Plant Images</h2>
            <p className="text-gray-600 dark:text-gray-300">Add up to 3 photos for the most accurate identification</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index} className="relative border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                <CardContent className="p-6">
                  {uploadedFiles[index] ? (
                    <div className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                        {previews[index] ? (
                          <img 
                            src={previews[index]} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 text-center truncate mb-2">
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
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Image {index + 1}</h3>
                      <p className="text-sm text-gray-600 mb-4">JPEG/PNG • Max 100KB</p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          data-testid={`upload-file-${index}`}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCamera(index);
                          }}
                          className="text-xs"
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

          <div className="text-center">
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 px-8 py-4 text-lg"
              disabled={uploadedFiles.length === 0 || identifyMutation.isPending}
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
          </div>
        </div>
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
