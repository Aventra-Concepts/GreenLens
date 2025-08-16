import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, CheckCircle, AlertTriangle, Leaf, Heart, Book } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlantAnalysisResultsProps {
  analysisData: {
    id: string;
    species: {
      scientific: string;
      common: string;
      confidence: number;
      localizedNames?: Record<string, string>;
    };
    healthAssessment: {
      isHealthy: boolean;
      diseases: Array<{
        name: string;
        description: string;
        treatment?: string;
      }>;
      suggestions: Array<{
        name: string;
        description: string;
      }>;
    };
    careInstructions: string;
    pdfReportUrl?: string;
  };
  onClose: () => void;
  onDownloadPDF: () => void;
}

export default function PlantAnalysisResults({ 
  analysisData, 
  onClose, 
  onDownloadPDF 
}: PlantAnalysisResultsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/plant-analysis/download-pdf', {
        analysisId: analysisData.id
      });
      return response;
    },
    onSuccess: () => {
      onDownloadPDF();
      toast({
        title: "PDF Downloaded",
        description: "Your plant analysis report has been downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download PDF report",
        variant: "destructive",
      });
    },
  });

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadMutation.mutateAsync();
    } finally {
      setIsDownloading(false);
    }
  };

  const { species, healthAssessment, careInstructions } = analysisData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Plant Analysis Complete
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Powered by <span className="text-green-600 font-semibold">GreenLens AI Technology</span>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose} data-testid="close-results-button">
              ✕
            </Button>
          </div>

          {/* Species Identification */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <span>Plant Identification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white italic">
                    {species.scientific}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                    {species.common}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {Math.round(species.confidence * 100)}% Confidence
                  </Badge>
                </div>
                
                {species.localizedNames && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Names in Different Languages:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(species.localizedNames).map(([lang, name]) => (
                        <div key={lang} className="text-sm">
                          <span className="font-medium text-green-600 uppercase">
                            {lang}:
                          </span>{' '}
                          <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Assessment */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Health Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {healthAssessment.isHealthy ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  )}
                  <span className="text-lg font-medium">
                    {healthAssessment.isHealthy ? 'Plant appears healthy' : 'Plant needs attention'}
                  </span>
                </div>

                {healthAssessment.diseases && healthAssessment.diseases.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Detected Issues:
                    </h4>
                    <div className="space-y-2">
                      {healthAssessment.diseases.map((disease, index) => (
                        <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                          <h5 className="font-medium text-yellow-800 dark:text-yellow-300">
                            {disease.name}
                          </h5>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                            {disease.description}
                          </p>
                          {disease.treatment && (
                            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1 font-medium">
                              Treatment: {disease.treatment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {healthAssessment.suggestions && healthAssessment.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Recommendations:
                    </h4>
                    <ul className="space-y-1">
                      {healthAssessment.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{suggestion.description || suggestion.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Care Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="w-5 h-5 text-blue-500" />
                <span>Care Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {careInstructions}
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Download Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Analysis completed with <span className="text-green-600 font-semibold">GreenLens AI Technology</span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} data-testid="close-results-button-bottom">
                Close
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading || downloadMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="download-pdf-button"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading || downloadMutation.isPending ? 'Generating PDF...' : 'Download PDF Report'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}