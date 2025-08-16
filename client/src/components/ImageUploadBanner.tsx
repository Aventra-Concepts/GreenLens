import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Camera, Upload, Zap, X } from "lucide-react";
import botanicalBgUrl from "@assets/generated_images/Tropical_greenhouse_plants_ad3dfb74.png";

export function ImageUploadBanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch admin-configurable banner image
  const { data: bannerSettings } = useQuery<{ imageUrl?: string }>({
    queryKey: ["/api/admin/banner-image"],
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

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

  const handleFiles = useCallback((files: File[]) => {
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: `${file.name} is over 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    // Limit to 3 images total
    const totalFiles = uploadedFiles.length + validFiles.length;
    if (totalFiles > 3) {
      const allowedFiles = validFiles.slice(0, 3 - uploadedFiles.length);
      toast({
        title: "Too Many Images",
        description: "Maximum 3 images allowed",
        variant: "destructive",
      });
      setUploadedFiles(prev => [...prev, ...allowedFiles]);
    } else {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  }, [uploadedFiles, toast]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  }, [handleFiles]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleQuickAnalyze = () => {
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
    <Card className="h-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-lg relative overflow-hidden">
      {/* Background Image - Admin Configurable */}
      <div className="absolute inset-0 opacity-30 dark:opacity-15">
        <div 
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${bannerSettings?.imageUrl || botanicalBgUrl})` 
          }}
        ></div>
      </div>
      
      <div className="h-full flex flex-col justify-center px-6 py-4 relative z-10">
        {/* Main Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-200/80 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
            AI-Powered Plant Recognition
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight mb-2">
            Discover Your Plant's
            <span className="block text-green-700 dark:text-green-400">Identity & Care Needs</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload multiple photos from different angles for the most accurate identification. 
            Our advanced AI analyzes your plant and provides personalized care recommendations.
          </p>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Upload Area */}
          <div 
            className={`
              relative border-2 border-dashed rounded-lg transition-all duration-200 px-6 py-3 cursor-pointer
              ${isDragging 
                ? 'border-green-400 bg-green-100/80 dark:bg-green-900/50' 
                : 'border-green-300 hover:border-green-400 hover:bg-green-50/80 dark:hover:bg-green-900/30'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('banner-file-input')?.click()}
            data-testid="banner-upload-area"
          >
            <input
              id="banner-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              data-testid="banner-file-input"
            />
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Quick Upload
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload up to 3 photos for 99% accuracy
                </p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {uploadedFiles.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {uploadedFiles.slice(0, 3).map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-md border border-green-300 dark:border-green-600 flex items-center justify-center">
                      <Upload className="w-3 h-3 text-green-600 dark:text-green-300" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`remove-file-${index}`}
                    >
                      <X className="w-1.5 h-1.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''} ready
              </span>
            </div>
          )}

          {/* Action Button */}
          {uploadedFiles.length > 0 && (
            <Button
              onClick={handleQuickAnalyze}
              disabled={identifyMutation.isPending}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-2 rounded-md shadow-sm transition-all duration-200 hover:shadow-md"
              data-testid="quick-analyze-button"
            >
              {identifyMutation.isPending ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Quick Analyze
                </>
              )}
            </Button>
          )}
        </div>

        {/* Benefits Section */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            99% Accuracy Rate
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Personalized Care Guide
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Instant Results
          </div>
        </div>
      </div>
    </Card>
  );
}