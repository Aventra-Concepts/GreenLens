import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, DollarSign, Globe, AlertCircle, CheckCircle, FileText, Image as ImageIcon } from "lucide-react";

const ebookUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(50, "Description must be at least 50 characters").max(2000, "Description must be less than 2000 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.number().min(0.99, "Minimum price is $0.99").max(999.99, "Maximum price is $999.99"),
  originalPrice: z.number().optional(),
  currency: z.string().default("USD"),
  language: z.string().min(1, "Please select a language"),
  isbn: z.string().optional(),
  pages: z.number().min(1, "Number of pages must be at least 1").max(9999, "Maximum 9999 pages"),
  publicationDate: z.string().optional(),
  tags: z.string().max(500, "Tags must be less than 500 characters"),
  previewPages: z.number().min(3, "Preview must be at least 3 pages").max(50, "Maximum 50 preview pages")
});

type EbookUploadForm = z.infer<typeof ebookUploadSchema>;

interface UploadProgress {
  ebookFile: number;
  coverImage: number;
  previewFile: number;
}

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "ru", label: "Russian" }
];

interface EbookUploadProps {
  onSuccess?: () => void;
}

export default function EbookUpload({ onSuccess }: EbookUploadProps) {
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    ebookFile: 0,
    coverImage: 0,
    previewFile: 0
  });
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch e-book categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/ebook-categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ebook-categories");
      return response.json();
    }
  });

  const form = useForm<EbookUploadForm>({
    resolver: zodResolver(ebookUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      price: 9.99,
      originalPrice: undefined,
      currency: "USD",
      language: "en",
      isbn: "",
      pages: 1,
      publicationDate: "",
      tags: "",
      previewPages: 10
    }
  });

  const uploadEbookMutation = useMutation({
    mutationFn: async (data: EbookUploadForm) => {
      if (!ebookFile || !coverImage) {
        throw new Error("E-book file and cover image are required");
      }

      setIsUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("ebookData", JSON.stringify(data));
      formData.append("ebookFile", ebookFile);
      formData.append("coverImage", coverImage);
      
      if (previewFile) {
        formData.append("previewFile", previewFile);
      }

      const response = await fetch("/api/ebooks/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "E-book Uploaded Successfully",
        description: "Your e-book has been submitted for review. You'll be notified once it's approved and published.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ebooks"] });
      form.reset();
      setEbookFile(null);
      setCoverImage(null);
      setPreviewFile(null);
      setIsUploading(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload e-book. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });

  const onSubmit = (data: EbookUploadForm) => {
    if (!ebookFile) {
      toast({
        title: "E-book File Required",
        description: "Please upload your e-book file to proceed.",
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

    uploadEbookMutation.mutate(data);
  };

  const handleEbookFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "E-book file must be smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/epub+zip'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or EPUB file.",
          variant: "destructive",
        });
        return;
      }

      setEbookFile(file);
    }
  };

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Cover image must be smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or WebP image.",
          variant: "destructive",
        });
        return;
      }

      setCoverImage(file);
    }
  };

  const handlePreviewFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Preview file must be smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Preview must be a PDF file.",
          variant: "destructive",
        });
        return;
      }

      setPreviewFile(file);
    }
  };

  const priceValue = form.watch("price");
  const originalPriceValue = form.watch("originalPrice");
  const discount = originalPriceValue && originalPriceValue > priceValue ? 
    Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 text-white rounded-full mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upload Your E-book
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your knowledge and expertise with readers worldwide. Upload your e-book and start earning from your content.
          </p>
        </div>

        <Card className="border-t-4 border-t-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Upload className="w-6 h-6 text-yellow-600" />
              E-book Upload & Publication
            </CardTitle>
            <CardDescription>
              Fill out the details below to upload your e-book. All submissions are reviewed for quality and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* File Uploads */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  File Uploads
                </h3>
                
                {/* E-book File */}
                <div className="space-y-2">
                  <Label>E-book File * (PDF or EPUB)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {ebookFile ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">
                            ✓ {ebookFile.name} ({(ebookFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEbookFile(null)}
                            data-testid="button-remove-ebook"
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Upload your complete e-book</p>
                          <p className="text-xs text-gray-500">PDF or EPUB format (max 50MB)</p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept=".pdf,.epub"
                        onChange={handleEbookFileUpload}
                        className="hidden"
                        id="ebook-file"
                        data-testid="input-ebook-file"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('ebook-file')?.click()}
                        className="mt-2"
                        data-testid="button-upload-ebook"
                      >
                        Choose E-book File
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label>Cover Image * (Recommended: 600x800px)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {coverImage ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">
                            ✓ {coverImage.name} ({(coverImage.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCoverImage(null)}
                            data-testid="button-remove-cover"
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Upload an eye-catching cover image</p>
                          <p className="text-xs text-gray-500">JPEG, PNG, or WebP (max 5MB)</p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        id="cover-image"
                        data-testid="input-cover-image"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('cover-image')?.click()}
                        className="mt-2"
                        data-testid="button-upload-cover"
                      >
                        Choose Cover Image
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preview File */}
                <div className="space-y-2">
                  <Label>Preview File (Optional PDF)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      {previewFile ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">
                            ✓ {previewFile.name} ({(previewFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewFile(null)}
                            data-testid="button-remove-preview"
                          >
                            Remove Preview
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Upload preview pages (optional)</p>
                          <p className="text-xs text-gray-500">PDF format (max 10MB)</p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handlePreviewFileUpload}
                        className="hidden"
                        id="preview-file"
                        data-testid="input-preview-file"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('preview-file')?.click()}
                        className="mt-2"
                        data-testid="button-upload-preview"
                      >
                        Choose Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Book Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Enter your e-book title"
                    data-testid="input-title"
                  />
                  <p className="text-sm text-gray-500">
                    {form.watch("title")?.length || 0}/200 characters
                  </p>
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Provide a compelling description of your e-book. What will readers learn? What makes it valuable?"
                    className="min-h-[120px]"
                    data-testid="textarea-description"
                  />
                  <p className="text-sm text-gray-500">
                    {form.watch("description")?.length || 0}/2000 characters (minimum 50)
                  </p>
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select onValueChange={(value) => form.setValue("categoryId", value)}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.categoryId && (
                      <p className="text-sm text-red-600">{form.formState.errors.categoryId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language *</Label>
                    <Select 
                      defaultValue="en"
                      onValueChange={(value) => form.setValue("language", value)}
                    >
                      <SelectTrigger data-testid="select-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.language && (
                      <p className="text-sm text-red-600">{form.formState.errors.language.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pages">Number of Pages *</Label>
                    <Input
                      id="pages"
                      type="number"
                      min="1"
                      max="9999"
                      {...form.register("pages", { valueAsNumber: true })}
                      data-testid="input-pages"
                    />
                    {form.formState.errors.pages && (
                      <p className="text-sm text-red-600">{form.formState.errors.pages.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previewPages">Preview Pages</Label>
                    <Input
                      id="previewPages"
                      type="number"
                      min="3"
                      max="50"
                      {...form.register("previewPages", { valueAsNumber: true })}
                      data-testid="input-preview-pages"
                    />
                    {form.formState.errors.previewPages && (
                      <p className="text-sm text-red-600">{form.formState.errors.previewPages.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN (Optional)</Label>
                    <Input
                      id="isbn"
                      {...form.register("isbn")}
                      placeholder="978-0-123456-78-9"
                      data-testid="input-isbn"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    {...form.register("tags")}
                    placeholder="gardening, plants, organic, sustainability (comma-separated)"
                    data-testid="input-tags"
                  />
                  <p className="text-sm text-gray-500">
                    Separate tags with commas. These help readers find your e-book.
                  </p>
                  {form.formState.errors.tags && (
                    <p className="text-sm text-red-600">{form.formState.errors.tags.message}</p>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing & Revenue
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium text-blue-900">Revenue Sharing</h4>
                      <p className="text-sm text-blue-800">
                        You earn 70% of the sale price. Platform fee is 30%. All payments are processed securely.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Selling Price * (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.99"
                      max="999.99"
                      {...form.register("price", { valueAsNumber: true })}
                      data-testid="input-price"
                    />
                    {priceValue && (
                      <p className="text-sm text-green-600">
                        Your earnings: ${(priceValue * 0.7).toFixed(2)} per sale
                      </p>
                    )}
                    {form.formState.errors.price && (
                      <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="999.99"
                      {...form.register("originalPrice", { valueAsNumber: true })}
                      placeholder="Show discount from this price"
                      data-testid="input-original-price"
                    />
                    {discount > 0 && (
                      <Badge variant="secondary" className="text-green-600">
                        {discount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Publication Guidelines */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-900">Publication Guidelines</h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>• All e-books undergo quality review before publication</p>
                      <p>• Content must be original and comply with our publishing standards</p>
                      <p>• Review process typically takes 3-5 business days</p>
                      <p>• You'll receive email notifications about your submission status</p>
                      <p>• Once approved, your e-book will be available globally</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploadEbookMutation.isPending || isUploading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-lg font-semibold"
                data-testid="button-submit-ebook"
              >
                {uploadEbookMutation.isPending || isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Uploading E-book...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Submit E-book for Review
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}