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
    <Card className="h-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-lg">
      <div className="h-full flex flex-col justify-center items-center px-6 py-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Accurately Identify Your Plant - With our <span className="text-green-600">GreenLens-Powered AI</span> System
        </h2>
        <h4 className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center max-w-4xl">
          Upload a plant photo and get Instant Plant Identification
        </h4>
      </div>
    </Card>
  );
}