import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Camera, 
  Upload, 
  FileImage, 
  Home, 
  MessageCircle,
  AlertTriangle,
  Shield,
  Stethoscope,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { DiseaseRequest } from '@shared/schema';

interface DiagnosisResult {
  id: string;
  diagnosis: string;
  diseaseIdentified: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  treatmentPlan: string;
  preventiveMeasures: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  needsExpertReview: boolean;
  processingTime: number;
}

interface UsageStats {
  diseaseRequestsUsed: number;
  diseaseRequestsLimit: number;
  remainingRequests: number;
  isUnlimited: boolean;
}

export default function DiseaseDiagnosis() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [plantType, setPlantType] = useState('');
  const [requestType, setRequestType] = useState<'image' | 'symptoms' | 'both'>('both');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Check user usage limits
  const { data: usageStats } = useQuery<UsageStats>({
    queryKey: ['/api/user/usage-stats'],
    enabled: isAuthenticated,
  });

  // Get user's recent diagnosis history
  const { data: recentDiagnoses = [] } = useQuery<DiseaseRequest[]>({
    queryKey: ['/api/disease-diagnosis/history'],
    enabled: isAuthenticated,
  });

  // Redirect to auth if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Authentication Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  You need to log in to access the Disease Diagnosis feature. This helps us track your usage and provide personalized recommendations.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth">Log In / Sign Up</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">Go to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image under 10MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // For simplicity, we'll just trigger file input - full camera implementation would need more UI
      fileInputRef.current?.click();
      // Stop the stream since we're not using it directly
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please use the upload option or grant camera permissions",
        variant: "destructive"
      });
      fileInputRef.current?.click();
    }
  };

  const diagnosisMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/disease-diagnosis/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze');
      }
      
      return response.json();
    },
    onSuccess: (result: DiagnosisResult) => {
      setDiagnosisResult(result);
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/usage-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/disease-diagnosis/history'] });
      
      toast({
        title: "Analysis Complete",
        description: `Diagnosis completed with ${result.confidence}% confidence`,
      });
    },
    onError: (error: Error) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async () => {
    if (!selectedFile && !symptoms.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide either an image or describe symptoms",
        variant: "destructive"
      });
      return;
    }

    // Check usage limits
    if (usageStats && !usageStats.isUnlimited && usageStats.remainingRequests <= 0) {
      toast({
        title: "Usage Limit Reached",
        description: "Upgrade to Pro for unlimited disease diagnoses",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setDiagnosisResult(null);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    if (symptoms.trim()) {
      formData.append('symptoms', symptoms.trim());
    }
    if (plantType.trim()) {
      formData.append('plantType', plantType.trim());
    }
    formData.append('requestType', requestType);

    diagnosisMutation.mutate(formData);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSymptoms('');
    setPlantType('');
    setDiagnosisResult(null);
    setRequestType('both');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 text-center">AI Disease Diagnosis</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get instant AI-powered plant disease diagnosis through image analysis and symptom description. 
              Our advanced system identifies diseases and provides treatment recommendations.
            </p>
          </div>

          {/* Usage Stats */}
          {usageStats && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {usageStats.isUnlimited ? 'Unlimited Diagnoses' : `${usageStats.remainingRequests} Diagnoses Remaining`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {usageStats.isUnlimited 
                          ? 'You have unlimited access with your premium plan' 
                          : `${usageStats.diseaseRequestsUsed}/${usageStats.diseaseRequestsLimit} used this month`}
                      </p>
                    </div>
                  </div>
                  {!usageStats.isUnlimited && usageStats.remainingRequests <= 1 && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/pricing">Upgrade Plan</Link>
                    </Button>
                  )}
                </div>
                {!usageStats.isUnlimited && (
                  <Progress 
                    value={(usageStats.diseaseRequestsUsed / usageStats.diseaseRequestsLimit) * 100} 
                    className="mt-3 h-2"
                  />
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Expert Consultation Notice */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <MessageCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">Need Expert Help?</h3>
                        <p className="text-green-700 text-sm">
                          Get personalized advice from certified plant specialists
                        </p>
                      </div>
                    </div>
                    <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200" data-testid="button-expert-consultation">
                      <Link href="/talk-to-expert">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Expert Help
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              {showDisclaimer && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Medical Disclaimer:</strong> This AI diagnosis is for informational purposes only. 
                    For serious plant health issues, consult with a professional horticulturist or plant pathologist. 
                    Always test treatments on a small area first.
                    <Button
                      variant="link"
                      size="sm"
                      className="text-yellow-600 p-0 h-auto ml-2"
                      onClick={() => setShowDisclaimer(false)}
                    >
                      Dismiss
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Input Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Diagnosis Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Request Type Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      How would you like to provide information?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={requestType === 'image' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRequestType('image')}
                        className="flex flex-col gap-1 h-auto py-3"
                      >
                        <Camera className="h-4 w-4" />
                        <span className="text-xs">Image Only</span>
                      </Button>
                      <Button
                        variant={requestType === 'symptoms' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRequestType('symptoms')}
                        className="flex flex-col gap-1 h-auto py-3"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">Symptoms Only</span>
                      </Button>
                      <Button
                        variant={requestType === 'both' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRequestType('both')}
                        className="flex flex-col gap-1 h-auto py-3"
                      >
                        <Stethoscope className="h-4 w-4" />
                        <span className="text-xs">Both</span>
                      </Button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  {(requestType === 'image' || requestType === 'both') && (
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-gray-700">
                        Upload Plant Image
                      </label>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1"
                          data-testid="button-upload-image"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <Button
                          variant="outline"
                          onClick={startCamera}
                          className="flex-1"
                          data-testid="button-camera"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Use Camera
                        </Button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        data-testid="input-file-upload"
                      />

                      {previewUrl && (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Plant preview"
                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 bg-white"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Plant Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Plant Type (Optional)
                    </label>
                    <Input
                      value={plantType}
                      onChange={(e) => setPlantType(e.target.value)}
                      placeholder="e.g., Tomato, Rose, Oak Tree, Houseplant..."
                      data-testid="input-plant-type"
                    />
                  </div>

                  {/* Symptoms Description */}
                  {(requestType === 'symptoms' || requestType === 'both') && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Describe Symptoms
                      </label>
                      <Textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe what you're seeing: yellowing leaves, brown spots, wilting, unusual growth patterns, pest damage, etc..."
                        rows={4}
                        data-testid="textarea-symptoms"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isAnalyzing || diagnosisMutation.isPending}
                      className="flex-1"
                      data-testid="button-analyze"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Stethoscope className="h-4 w-4 mr-2" />
                          Get Diagnosis
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={isAnalyzing}
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Analysis Progress */}
              {isAnalyzing && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Analyzing Your Plant
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Our AI is examining the image and symptoms to provide accurate diagnosis...
                      </p>
                      <Progress value={75} className="max-w-xs mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Diagnosis Results */}
              {diagnosisResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Diagnosis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Disease Identification */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Identified Issue</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getSeverityColor(diagnosisResult.severity)}>
                          {diagnosisResult.severity.toUpperCase()} SEVERITY
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getUrgencyIcon(diagnosisResult.urgencyLevel)}
                          <span className="text-sm text-gray-600 capitalize">
                            {diagnosisResult.urgencyLevel} Priority
                          </span>
                        </div>
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {diagnosisResult.diseaseIdentified}
                      </p>
                      <p className="text-gray-700">{diagnosisResult.diagnosis}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {diagnosisResult.confidence}% confidence
                        </span>
                      </div>
                    </div>

                    {/* Treatment Plan */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Recommended Treatment</h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">
                          {diagnosisResult.treatmentPlan}
                        </p>
                      </div>
                    </div>

                    {/* Preventive Measures */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Prevention Tips</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">
                          {diagnosisResult.preventiveMeasures}
                        </p>
                      </div>
                    </div>

                    {/* Expert Review Notice */}
                    {diagnosisResult.needsExpertReview && (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          This case has been flagged for expert review due to complexity or severity. 
                          Consider consulting with a plant specialist for additional guidance.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button asChild variant="outline" className="flex-1" data-testid="button-go-home">
                        <Link href="/">
                          <Home className="h-4 w-4 mr-2" />
                          Home
                        </Link>
                      </Button>
                      <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" data-testid="button-talk-expert">
                        <Link href="/talk-to-expert">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Expert Help
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Diagnoses */}
              {recentDiagnoses.length > 0 && !isAnalyzing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Diagnoses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentDiagnoses.slice(0, 3).map((diagnosis) => (
                        <div key={diagnosis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {diagnosis.diseaseIdentified || 'Analysis Pending'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(diagnosis.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {diagnosis.confidence && (
                            <Badge variant="secondary">
                              {diagnosis.confidence}% confidence
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}