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

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const totalFiles = uploadedFiles.length + imageFiles.length;

    if (totalFiles > 3) {
      toast({
        title: "Too Many Files",
        description: "Maximum 3 images allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles = [...uploadedFiles, ...imageFiles].slice(0, 3);
    setUploadedFiles(newFiles);

    // Generate previews
    const newPreviews = [...previews];
    imageFiles.forEach((file, index) => {
      if (uploadedFiles.length + index < 3) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews[uploadedFiles.length + index] = e.target?.result as string;
          setPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [uploadedFiles, previews, toast]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviews(newPreviews);
  }, [uploadedFiles, previews]);

  const handleCameraCapture = useCallback((file: File) => {
    handleFiles([file]);
    setShowCamera(false);
  }, [handleFiles]);

  const openCamera = useCallback(() => {
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

          <Card className="mb-8">
            <CardContent className="p-8">
              <div 
                className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors rounded-2xl p-8 cursor-pointer group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('file-input')?.click()}
                data-testid="upload-area"
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="file-input"
                />
                
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">Upload up to 3 photos for best results</h3>
                    <p className="text-gray-600">Drop images here or click to browse your files</p>
                    <p className="text-sm text-gray-500">Multiple angles improve accuracy • JPG, PNG up to 10MB each</p>
                  </div>
                  <div className="flex gap-4 justify-center items-center">
                    <Button className="bg-green-500 hover:bg-green-600" data-testid="choose-files-button">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openCamera();
                      }}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      data-testid="camera-button"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Preview Area */}
          {uploadedFiles.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {uploadedFiles.map((file, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
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
                    <div className="text-sm text-gray-600 text-center truncate">
                      {file.name}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      data-testid={`remove-file-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add more images slots */}
              {uploadedFiles.length < 3 && (
                <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                  <CardContent className="p-4">
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">Add Image</h3>
                      <p className="text-sm text-gray-600 mb-4">Upload another photo</p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('file-input')?.click()}
                          data-testid="add-file-button"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          File
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={openCamera}
                          data-testid="add-camera-button"
                        >
                          <Camera className="w-3 h-3 mr-1" />
                          Camera
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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
