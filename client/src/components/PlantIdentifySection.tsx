import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Upload, X, Search, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PlantIdentifySection() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  const handleAnalyze = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
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

    setLocation('/identify');
  };

  return (
    <section id="identify" className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI-Powered Plant Recognition
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Discover Your Plant's
            <span className="block text-green-600">Identity & Care Needs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload multiple photos from different angles for the most accurate identification. 
            Our advanced AI analyzes your plant and provides personalized care recommendations.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Upload Interface */}
          <div>
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div 
                  className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 border-2 border-dashed border-green-300 hover:border-green-400 transition-all duration-300 cursor-pointer group hover:shadow-lg"
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
                    <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors shadow-lg">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900">Upload Plant Photos</h3>
                      <p className="text-gray-600 text-lg">Drag & drop or click to select up to 3 images</p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          JPG, PNG formats
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Max 10MB each
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Multiple angles preferred
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      data-testid="choose-files-button"
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Benefits */}
          <div className="space-y-8">
            <div className="grid gap-6">
              <div className="flex gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">99% Accuracy Rate</h4>
                  <p className="text-gray-600">Upload 2-3 photos from different angles for the most precise identification</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personalized Care Guide</h4>
                  <p className="text-gray-600">Get detailed watering, lighting, and care instructions tailored to your plant</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Instant Results</h4>
                  <p className="text-gray-600">Powered by advanced AI for quick and reliable plant identification</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Area */}
        {uploadedFiles.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="relative bg-white rounded-lg border border-gray-200 shadow-sm">
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
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 text-center truncate">{file.name}</div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition-colors"
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
            
            {/* Empty slots for remaining images */}
            {Array.from({ length: 3 - uploadedFiles.length }).map((_, index) => (
              <Card 
                key={`empty-${index}`}
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors cursor-pointer group"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600 text-center">Image slot</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            data-testid="analyze-plant-button"
          >
            <Search className="w-5 h-5 mr-2" />
            Analyze Plant
          </Button>
        </div>
      </div>
    </section>
  );
}
