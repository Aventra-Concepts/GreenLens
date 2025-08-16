import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Camera, Upload, Zap, X } from "lucide-react";
import botanicalBgUrl from "@assets/generated_images/Cool_minimal_botanical_background_3aaa9e09.png";

export function ImageUploadBanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch admin-configurable banner settings
  const { data: bannerSettings } = useQuery<{ 
    imageUrl?: string; 
    heading?: string; 
    subheading?: string; 
  }>({
    queryKey: ["/api/admin/banner-settings"],
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
    <Card className="h-full border-green-200 dark:border-green-800 shadow-lg relative overflow-hidden">
      {/* Bright Background Image - No Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${bannerSettings?.imageUrl || botanicalBgUrl})` 
        }}
      ></div>
      
      <div className="h-full flex flex-col justify-center items-center px-6 py-8 relative z-10">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black text-center mb-4 leading-tight">
          <div>Identify Any Plant with</div>
          <div><span className="text-green-600">GreenLens-Powered</span> Precision</div>
        </h2>
        <h4 className="text-sm sm:text-base text-black text-center max-w-4xl">
          Upload a plant photo and get Instant Plant Identification
        </h4>
      </div>
    </Card>
  );
}