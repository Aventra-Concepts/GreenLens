import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Camera, Upload, Zap, X } from "lucide-react";

export function ImageUploadBanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    <Card className="h-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-lg">
      <div className="h-full flex items-center justify-between px-6 py-4">
        {/* Left Section - Upload Area */}
        <div className="flex-1">
          <div 
            className={`
              relative border-2 border-dashed rounded-xl transition-all duration-200 h-16 
              ${isDragging 
                ? 'border-green-400 bg-green-100 dark:bg-green-900' 
                : 'border-green-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900'
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
            
            <div className="h-full flex items-center justify-center space-x-4 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Quick Plant ID
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Drop photos or click to browse
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="flex items-center space-x-3 mx-6">
            <div className="flex space-x-2">
              {uploadedFiles.slice(0, 3).map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg border-2 border-green-300 dark:border-green-600 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-green-600 dark:text-green-300" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`remove-file-${index}`}
                  >
                    <X className="w-2 h-2 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''} ready
            </span>
          </div>
        )}

        {/* Right Section - Action Button */}
        <div className="flex items-center space-x-4">
          {uploadedFiles.length > 0 && (
            <Button
              onClick={handleQuickAnalyze}
              disabled={identifyMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
              data-testid="quick-analyze-button"
            >
              {identifyMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Analyze
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => setLocation('/identify')}
            className="border-green-500 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-900"
            data-testid="full-identify-button"
          >
            Full Identify Page
          </Button>
        </div>
      </div>
    </Card>
  );
}