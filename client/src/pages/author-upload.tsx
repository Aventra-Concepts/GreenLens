import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, Image, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const authorUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(50, "Description must be at least 50 characters").max(2000, "Description too long"),
  category: z.string().min(1, "Category is required"),
  basePrice: z.string().min(1, "Price is required"),
  currency: z.string().default("USD"),
  language: z.string().min(1, "Language is required"),
  isbn: z.string().optional(),
  publisherInfo: z.string().optional(),
  targetAudience: z.string().min(1, "Target audience is required"),
  keywords: z.string().min(1, "Keywords are required"),
});

type AuthorUploadFormData = z.infer<typeof authorUploadSchema>;

export default function AuthorUpload() {
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("idle");

  const form = useForm<AuthorUploadFormData>({
    resolver: zodResolver(authorUploadSchema),
    defaultValues: {
      currency: "USD",
      language: "English",
    },
  });

  // Get e-book categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/ebook-categories"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: AuthorUploadFormData & { files: FormData }) => {
      setUploadProgress("uploading");
      const response = await fetch("/api/authors/upload-ebook", {
        method: "POST",
        body: data.files,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadProgress("success");
      toast({
        title: "Upload Successful",
        description: "Your e-book has been submitted for review. You'll be notified once it's approved.",
      });
      form.reset();
      setCoverImage(null);
      setPreviewFile(null);
      setFullFile(null);
    },
    onError: (error: any) => {
      setUploadProgress("error");
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload e-book",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthorUploadFormData) => {
    if (!coverImage || !fullFile) {
      toast({
        title: "Files Required",
        description: "Please upload both cover image and e-book file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    // Append form data
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Append files
    formData.append("coverImage", coverImage);
    formData.append("fullFile", fullFile);
    if (previewFile) {
      formData.append("previewFile", previewFile);
    }

    uploadMutation.mutate({ ...data, files: formData });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'cover' | 'preview' | 'full') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file types
    if (fileType === 'cover' && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Cover image must be an image file",
        variant: "destructive",
      });
      return;
    }

    if ((fileType === 'preview' || fileType === 'full') && 
        !['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "E-book files must be PDF, EPUB, or MOBI format",
        variant: "destructive",
      });
      return;
    }

    // Set file based on type
    switch (fileType) {
      case 'cover':
        setCoverImage(file);
        break;
      case 'preview':
        setPreviewFile(file);
        break;
      case 'full':
        setFullFile(file);
        break;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Your E-book
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your knowledge with our global community. All submissions are reviewed for quality and compliance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>E-book Details</CardTitle>
          <CardDescription>
            Please provide complete information about your e-book. All fields marked with * are required.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter e-book title"
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Provide a detailed description of your e-book (minimum 50 characters)"
                        rows={4}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0} / 2000 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pricing and Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-language">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Italian">Italian</SelectItem>
                          <SelectItem value="Portuguese">Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-audience">
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="All Levels">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Enter ISBN if available"
                          data-testid="input-isbn"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Enter keywords separated by commas (e.g., gardening, plants, organic)"
                        data-testid="input-keywords"
                      />
                    </FormControl>
                    <FormDescription>
                      Help readers find your e-book with relevant keywords
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Uploads */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">File Uploads</h3>
                
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cover Image * (JPG, PNG, WebP - Max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="flex justify-center">
                        <label htmlFor="cover-upload" className="cursor-pointer">
                          <span className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                            Choose Cover Image
                          </span>
                          <input
                            id="cover-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'cover')}
                            data-testid="input-cover-image"
                          />
                        </label>
                      </div>
                      {coverImage && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ {coverImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview File */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preview File (Optional - PDF, EPUB, MOBI - First 10-20 pages)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="flex justify-center">
                        <label htmlFor="preview-upload" className="cursor-pointer">
                          <span className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Choose Preview File
                          </span>
                          <input
                            id="preview-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.epub,.mobi"
                            onChange={(e) => handleFileChange(e, 'preview')}
                            data-testid="input-preview-file"
                          />
                        </label>
                      </div>
                      {previewFile && (
                        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                          ✓ {previewFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full E-book File */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full E-book File * (PDF, EPUB, MOBI - Max 50MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="flex justify-center">
                        <label htmlFor="full-upload" className="cursor-pointer">
                          <span className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                            Choose E-book File
                          </span>
                          <input
                            id="full-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.epub,.mobi"
                            onChange={(e) => handleFileChange(e, 'full')}
                            data-testid="input-full-file"
                          />
                        </label>
                      </div>
                      {fullFile && (
                        <p className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                          ✓ {fullFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Publishing Standards Notice */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Publishing Standards:</strong> All e-books must meet our quality standards including proper formatting, 
                  original content, professional presentation, and adherence to copyright laws. Our review process typically 
                  takes 2-5 business days.
                </AlertDescription>
              </Alert>

              {/* Upload Status */}
              {uploadProgress === "uploading" && (
                <Alert>
                  <Upload className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Uploading your e-book... Please don't close this page.
                  </AlertDescription>
                </Alert>
              )}

              {uploadProgress === "success" && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Upload successful! Your e-book is now under review.
                  </AlertDescription>
                </Alert>
              )}

              {uploadProgress === "error" && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    Upload failed. Please check your files and try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={uploadMutation.isPending || uploadProgress === "uploading"}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                  data-testid="button-submit-ebook"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Submit for Review"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}