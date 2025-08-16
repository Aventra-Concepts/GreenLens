import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Upload, X, Search } from "lucide-react";
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
    <section id="identify" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">AI Plant Identification</h2>
          <p className="text-lg text-gray-600">Upload up to 3 photos for the most accurate identification</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div 
              className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors cursor-pointer group"
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
                  <h3 className="text-xl font-semibold text-gray-900">Drop your plant photos here</h3>
                  <p className="text-gray-600">or click to browse your files</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG up to 10MB • Maximum 3 images</p>
                </div>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  data-testid="choose-files-button"
                >
                  Choose Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
