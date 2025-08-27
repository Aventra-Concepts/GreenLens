import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  ArrowLeft, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  DollarSign,
  Globe,
  Star,
  Calendar,
  User,
  Tag
} from "lucide-react";

interface EbookUploadForm {
  title: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  authorName: string;
  authorBio: string;
  tags: string[];
  language: string;
  publishDate: string;
  isbn: string;
  pages: number;
  fileSize: string;
  previewText: string;
}

export default function EbookUpload() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<EbookUploadForm>({
    title: "",
    description: "",
    category: "",
    price: "",
    currency: "USD",
    authorName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    authorBio: "",
    tags: [],
    language: "English",
    publishDate: new Date().toISOString().split('T')[0],
    isbn: "",
    pages: 0,
    fileSize: "",
    previewText: ""
  });

  // Check authentication
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You need to be logged in as an author to upload e-books.
              </p>
              <Button onClick={() => setLocation('/login')} className="w-full">
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const submitEbookMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ebooks/submit", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "E-book Submitted Successfully!",
        description: "Your e-book has been submitted for review. You'll be notified once it's approved.",
      });
      setLocation('/author-dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'ebook' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'ebook') {
      // Validate e-book file
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|epub|mobi)$/)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, EPUB, or MOBI file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File Too Large",
          description: "E-book file must be less than 50MB.",
          variant: "destructive",
        });
        return;
      }

      setEbookFile(file);
      setFormData(prev => ({ 
        ...prev, 
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB` 
      }));
    } else {
      // Validate cover image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file for the cover.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Image Too Large",
          description: "Cover image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleTagRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!ebookFile) {
      toast({
        title: "E-book Required",
        description: "Please upload an e-book file before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!coverImage) {
      toast({
        title: "Cover Image Required",
        description: "Please upload a cover image for your e-book.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Create FormData for file uploads
      const uploadData = new FormData();
      uploadData.append('ebookFile', ebookFile);
      uploadData.append('coverImage', coverImage);
      uploadData.append('metadata', JSON.stringify({
        ...formData,
        authorId: user?.id,
        authorEmail: user?.email,
      }));

      await submitEbookMutation.mutateAsync(uploadData);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const steps = [
    { id: 1, title: "Book Details", icon: BookOpen },
    { id: 2, title: "Upload Files", icon: Upload },
    { id: 3, title: "Preview & Submit", icon: Eye },
  ];

  const categories = [
    "Gardening & Horticulture",
    "Plant Care Guides",
    "Indoor Plants",
    "Outdoor Gardening",
    "Sustainable Living",
    "Botanical Science",
    "Landscape Design",
    "Organic Gardening",
    "Hydroponics",
    "Permaculture"
  ];

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Chinese", "Japanese", "Korean", "Hindi", "Arabic", "Russian"
  ];

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation('/author-dashboard')}
              className="mb-4 flex items-center gap-2"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Author Dashboard
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Kindle-Style E-book Publisher
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Upload and publish your gardening and plant care e-books with professional quality
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Uploading your e-book...
                    </p>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress}%
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {/* Step 1: Book Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Book Details & Metadata
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Provide comprehensive information about your e-book
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Book Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter your book title"
                          required
                          data-testid="input-title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, category: value }))
                        }>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="price" className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Price *
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            required
                            data-testid="input-price"
                          />
                        </div>
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={formData.currency} onValueChange={(value) => 
                            setFormData(prev => ({ ...prev, currency: value }))
                          }>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                  {currency.symbol} {currency.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="language" className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Language
                        </Label>
                        <Select value={formData.language} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, language: value }))
                        }>
                          <SelectTrigger data-testid="select-language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="authorName" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Author Name *
                        </Label>
                        <Input
                          id="authorName"
                          value={formData.authorName}
                          onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                          placeholder="Author's full name"
                          required
                          data-testid="input-author-name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="isbn">ISBN (Optional)</Label>
                        <Input
                          id="isbn"
                          value={formData.isbn}
                          onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                          placeholder="978-0-000-00000-0"
                          data-testid="input-isbn"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="pages">Page Count</Label>
                          <Input
                            id="pages"
                            type="number"
                            value={formData.pages || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                            placeholder="0"
                            data-testid="input-pages"
                          />
                        </div>
                        <div>
                          <Label htmlFor="publishDate" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Publish Date
                          </Label>
                          <Input
                            id="publishDate"
                            type="date"
                            value={formData.publishDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                            data-testid="input-publish-date"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Book Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide a detailed description of your book, its content, and what readers will learn..."
                      rows={4}
                      required
                      data-testid="textarea-description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="authorBio">Author Bio</Label>
                    <Textarea
                      id="authorBio"
                      value={formData.authorBio}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorBio: e.target.value }))}
                      placeholder="Brief biography and credentials of the author..."
                      rows={3}
                      data-testid="textarea-author-bio"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags (Press Enter to add)
                    </Label>
                    <Input
                      placeholder="Add tags related to your book content"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTagAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      data-testid="input-tags"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" 
                               onClick={() => handleTagRemove(index)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.title || !formData.description || !formData.category || !formData.price}
                      data-testid="button-next-step-1"
                    >
                      Continue to File Upload
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: File Upload */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Upload Files
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Upload your e-book file and cover image
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* E-book File Upload */}
                    <Card className="border-dashed border-2">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            E-book File
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Upload PDF, EPUB, or MOBI file (max 50MB)
                          </p>
                          
                          {ebookFile ? (
                            <div className="space-y-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {ebookFile.name}
                              </Badge>
                              <p className="text-xs text-gray-500">{formData.fileSize}</p>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full"
                              data-testid="button-upload-ebook"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                          )}
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.epub,.mobi"
                            onChange={(e) => handleFileSelect(e, 'ebook')}
                            className="hidden"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cover Image Upload */}
                    <Card className="border-dashed border-2">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Cover Image
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Upload book cover (JPG, PNG, max 5MB)
                          </p>
                          
                          {coverPreview ? (
                            <div className="space-y-3">
                              <img 
                                src={coverPreview} 
                                alt="Cover preview" 
                                className="w-24 h-32 object-cover mx-auto rounded-lg shadow-md"
                              />
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Cover uploaded
                              </Badge>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => coverInputRef.current?.click()}
                              className="w-full"
                              data-testid="button-upload-cover"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Image
                            </Button>
                          )}
                          
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'cover')}
                            className="hidden"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview Text Section */}
                  <div>
                    <Label htmlFor="previewText">Book Preview/Excerpt (Optional)</Label>
                    <Textarea
                      id="previewText"
                      value={formData.previewText}
                      onChange={(e) => setFormData(prev => ({ ...prev, previewText: e.target.value }))}
                      placeholder="Provide a sample chapter or excerpt that readers can preview before purchasing..."
                      rows={6}
                      data-testid="textarea-preview"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be shown to potential buyers as a free preview
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      data-testid="button-back-step-2"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      disabled={!ebookFile || !coverImage}
                      data-testid="button-next-step-2"
                    >
                      Continue to Preview
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Preview & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Preview & Submit
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Review your e-book details before submitting for approval
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cover Preview */}
                    <div className="lg:col-span-1">
                      <Card>
                        <CardContent className="p-4">
                          {coverPreview && (
                            <img 
                              src={coverPreview} 
                              alt="E-book cover" 
                              className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                            />
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Book Details */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Book Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Title</Label>
                              <p className="font-medium text-gray-900 dark:text-white">{formData.title}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Author</Label>
                              <p className="font-medium text-gray-900 dark:text-white">{formData.authorName}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Category</Label>
                              <p className="font-medium text-gray-900 dark:text-white">{formData.category}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Price</Label>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {currencies.find(c => c.code === formData.currency)?.symbol}{formData.price} {formData.currency}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Language</Label>
                              <p className="font-medium text-gray-900 dark:text-white">{formData.language}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Pages</Label>
                              <p className="font-medium text-gray-900 dark:text-white">{formData.pages || 'Not specified'}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{formData.description}</p>
                          </div>

                          {formData.tags.length > 0 && (
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Tags</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {formData.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">File</Label>
                              <p className="font-medium text-gray-900 dark:text-white">{ebookFile?.name}</p>
                              <p className="text-xs text-gray-500">{formData.fileSize}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Cover</Label>
                              <p className="font-medium text-gray-900 dark:text-white">{coverImage?.name}</p>
                              <p className="text-xs text-gray-500">
                                {coverImage ? `${(coverImage.size / 1024 / 1024).toFixed(2)} MB` : ''}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Terms and Submit */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Submission Guidelines
                          </h3>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Your e-book will be reviewed within 2-3 business days</li>
                            <li>• Ensure content is original and free from copyright violations</li>
                            <li>• Books must be related to gardening, plants, or sustainable living</li>
                            <li>• Platform commission will be set during the approval process</li>
                            <li>• You'll receive email notifications about approval status</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      data-testid="button-back-step-3"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isUploading || submitEbookMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-submit-ebook"
                    >
                      {isUploading || submitEbookMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit for Review
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}