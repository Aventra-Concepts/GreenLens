import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Upload, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function TripleImageUpload() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100KB = 100 * 1024 bytes)
    if (file.size > 100 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 100KB",
        variant: "destructive",
      });
      return;
    }

    const newFiles = [...uploadedFiles];
    const newPreviews = [...previews];

    newFiles[slotIndex] = file;
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      newPreviews[slotIndex] = e.target?.result as string;
      setPreviews(newPreviews);
    };
    reader.readAsDataURL(file);

    setUploadedFiles(newFiles);
  }, [uploadedFiles, previews, toast]);

  const removeFile = useCallback((index: number) => {
    const newFiles = [...uploadedFiles];
    const newPreviews = [...previews];
    
    newFiles[index] = undefined as any;
    newPreviews[index] = undefined as any;
    
    setUploadedFiles(newFiles.filter(Boolean));
    setPreviews(newPreviews.filter(Boolean));
  }, [uploadedFiles, previews]);

  const handleAnalyze = () => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }
    
    const validFiles = uploadedFiles.filter(Boolean);
    if (validFiles.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    identifyMutation.mutate(validFiles);
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upload 3 photos for plant identification
          </h2>
        </div>

        {/* Three Upload Slots */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[0, 1, 2].map((slotIndex) => {
            const hasFile = uploadedFiles[slotIndex];
            const preview = previews[slotIndex];
            
            return (
              <Card key={slotIndex} className="relative">
                <CardContent className="p-6">
                  <div 
                    className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-400 transition-colors cursor-pointer group relative overflow-hidden"
                    onClick={() => document.getElementById(`file-input-${slotIndex}`)?.click()}
                    data-testid={`upload-slot-${slotIndex}`}
                  >
                    <input
                      id={`file-input-${slotIndex}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, slotIndex)}
                      className="hidden"
                      data-testid={`file-input-${slotIndex}`}
                    />
                    
                    {preview ? (
                      <>
                        <img 
                          src={preview} 
                          alt={`Preview ${slotIndex + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(slotIndex);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                          data-testid={`remove-file-${slotIndex}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Upload className="w-12 h-12 mb-4 group-hover:text-green-500 transition-colors" />
                        <h3 className="text-lg font-medium mb-2">Photo {slotIndex + 1}</h3>
                        <p className="text-sm text-center px-4">
                          Click to upload<br />
                          Max 100KB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {hasFile && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {uploadedFiles[slotIndex]?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {Math.round((uploadedFiles[slotIndex]?.size || 0) / 1024)}KB
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Analyze Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            disabled={identifyMutation.isPending || uploadedFiles.filter(Boolean).length === 0}
            data-testid="analyze-plant-button"
          >
            {identifyMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing Plants...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Analyze Plants
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}