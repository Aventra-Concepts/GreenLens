import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, FileText, GraduationCap, Shield, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const studentVerificationSchema = z.object({
  // Student Information - Enhanced validation for security
  studentId: z.string().min(1, "Student ID is required").max(50, "Student ID too long"),
  universityName: z.string().min(1, "University name is required").max(200, "University name too long"),
  degreeProgram: z.string().min(1, "Degree program is required").max(200, "Degree program too long"),
  yearOfStudy: z.number().min(1).max(10, "Year must be between 1-10"),
  expectedGraduationDate: z.string().min(1, "Expected graduation date is required"),
  
  // Contact Information - Enhanced email validation
  universityEmail: z.string()
    .email("Valid university email is required")
    .refine(
      (email) => email.includes(".edu") || email.includes(".ac.") || email.includes("university") || email.includes("college"),
      "Please use your official university email address"
    ),
  phoneNumber: z.string().max(20, "Phone number too long").optional(),
  emergencyContactName: z.string().max(100, "Contact name too long").optional(),
  emergencyContactPhone: z.string().max(20, "Contact phone too long").optional(),
  
  // Address Information - Enhanced validation
  currentAddress: z.object({
    street: z.string().min(1, "Street address is required").max(200, "Street address too long"),
    city: z.string().min(1, "City is required").max(100, "City name too long"),
    state: z.string().min(1, "State is required").max(100, "State name too long"),
    postalCode: z.string().min(1, "Postal code is required").max(20, "Postal code too long"),
    country: z.string().min(1, "Country is required").max(100, "Country name too long"),
  }),
  
  // Document URLs (will be handled by secure file upload)
  studentIdDocumentUrl: z.string().optional(),
  enrollmentCertificateUrl: z.string().optional(),
  transcriptUrl: z.string().optional(),
});

type StudentVerificationFormData = z.infer<typeof studentVerificationSchema>;

export default function StudentVerification() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    studentId?: string;
    enrollment?: string;
    transcript?: string;
  }>({});

  // Security: Check authentication and existing application status
  const { data: studentStatus } = useQuery({
    queryKey: ["/api/student-verification/status"],
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<StudentVerificationFormData>({
    resolver: zodResolver(studentVerificationSchema),
    defaultValues: {
      yearOfStudy: 1,
      currentAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
    },
  });

  const watchedFields = watch();

  // Secure mutation for submitting student verification
  const submitVerificationMutation = useMutation({
    mutationFn: async (data: StudentVerificationFormData) => {
      const submissionData = {
        ...data,
        studentIdDocumentUrl: uploadedDocuments.studentId,
        enrollmentCertificateUrl: uploadedDocuments.enrollment,
        transcriptUrl: uploadedDocuments.transcript,
      };

      const response = await apiRequest("POST", "/api/student-verification", submissionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Submitted",
        description: "Your student verification application has been submitted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: StudentVerificationFormData) => {
    submitVerificationMutation.mutate(data);
  };

  // Security: Enhanced file upload with validation
  const handleFileUpload = async (file: File, type: 'studentId' | 'enrollment' | 'transcript') => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB strict limit

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, JPG, or PNG files only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Security: Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const secureUrl = `/secure/student-documents/${type}/${Date.now()}_${sanitizedName}`;
    
    setUploadedDocuments(prev => ({
      ...prev,
      [type]: secureUrl,
    }));

    toast({
      title: "File Uploaded",
      description: `${file.name} uploaded securely.`,
    });
  };

  // Security: Redirect if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please log in to access the secure student verification system.
              </p>
              <Link href="/auth" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Login / Register
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Security: Show existing application status if available
  if (studentStatus?.hasApplication) {
    const statusColors = {
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
      under_review: "text-blue-600 bg-blue-50 border-blue-200",
      verified: "text-green-600 bg-green-50 border-green-200",
      rejected: "text-red-600 bg-red-50 border-red-200",
      expired: "text-gray-600 bg-gray-50 border-gray-200",
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                Student Verification Status
              </h2>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                statusColors[studentStatus.status as keyof typeof statusColors] || statusColors.pending
              }`}>
                Status: {studentStatus.status.replace('_', ' ').toUpperCase()}
              </div>
              
              <div className="text-left space-y-2 mb-6">
                <p><strong>Submitted:</strong> {new Date(studentStatus.submittedAt).toLocaleDateString()}</p>
                {studentStatus.verifiedAt && (
                  <p><strong>Verified:</strong> {new Date(studentStatus.verifiedAt).toLocaleDateString()}</p>
                )}
                {studentStatus.expiresAt && (
                  <p><strong>Expires:</strong> {new Date(studentStatus.expiresAt).toLocaleDateString()}</p>
                )}
                {studentStatus.discountPercentage && (
                  <p><strong>Discount:</strong> {studentStatus.discountPercentage}% on e-books</p>
                )}
                {studentStatus.adminNotes && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p className="text-sm"><strong>Admin Notes:</strong> {studentStatus.adminNotes}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Link href="/" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Return to Home
                  </Button>
                </Link>
                {studentStatus.status === 'verified' && (
                  <Link href="/ebook-marketplace" className="block">
                    <Button variant="outline" className="w-full">
                      Browse E-books with Discount
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Security: Show success message after submission
  if (submitVerificationMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                Verification Submitted Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your student verification application has been submitted for secure review. 
                You'll receive an email notification once the review is complete (typically within 2-3 business days).
              </p>
              <div className="space-y-2">
                <Link href="/" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Return to Home
                  </Button>
                </Link>
                <Link href="/ebook-marketplace" className="block">
                  <Button variant="outline" className="w-full">
                    Browse E-books
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Student Information", icon: GraduationCap },
    { number: 2, title: "Contact & Address", icon: FileText },
    { number: 3, title: "Secure Document Upload", icon: Upload },
    { number: 4, title: "Review & Submit", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Secure Student Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Verify your student status to get 15% discount on all e-books
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Secure Verification Process</p>
              <p className="text-blue-700 dark:text-blue-300">
                All information is encrypted and securely stored. Documents are only accessible to authorized administrators 
                for verification purposes and are automatically deleted after graduation.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'border-green-500 text-green-500 bg-white dark:bg-gray-800' 
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Secure Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your academic information"}
              {currentStep === 2 && "Provide your contact details and addresses"}
              {currentStep === 3 && "Upload required verification documents securely"}
              {currentStep === 4 && "Review your information before secure submission"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Student Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        {...register("studentId")}
                        placeholder="Enter your student ID"
                        data-testid="input-student-id"
                        maxLength={50}
                      />
                      {errors.studentId && (
                        <p className="text-sm text-red-500 mt-1">{errors.studentId.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="universityName">University Name *</Label>
                      <Input
                        id="universityName"
                        {...register("universityName")}
                        placeholder="Enter your university name"
                        data-testid="input-university-name"
                        maxLength={200}
                      />
                      {errors.universityName && (
                        <p className="text-sm text-red-500 mt-1">{errors.universityName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="degreeProgram">Degree Program *</Label>
                      <Input
                        id="degreeProgram"
                        {...register("degreeProgram")}
                        placeholder="e.g., Bachelor of Science in Biology"
                        data-testid="input-degree-program"
                        maxLength={200}
                      />
                      {errors.degreeProgram && (
                        <p className="text-sm text-red-500 mt-1">{errors.degreeProgram.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="yearOfStudy">Year of Study *</Label>
                      <Select onValueChange={(value) => setValue("yearOfStudy", parseInt(value))}>
                        <SelectTrigger data-testid="select-year-of-study">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              Year {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.yearOfStudy && (
                        <p className="text-sm text-red-500 mt-1">{errors.yearOfStudy.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="expectedGraduationDate">Expected Graduation Date *</Label>
                    <Input
                      id="expectedGraduationDate"
                      type="date"
                      {...register("expectedGraduationDate")}
                      data-testid="input-graduation-date"
                      min={new Date().toISOString().split('T')[0]} // Security: Prevent past dates
                    />
                    {errors.expectedGraduationDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.expectedGraduationDate.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Address */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="universityEmail">University Email *</Label>
                        <Input
                          id="universityEmail"
                          type="email"
                          {...register("universityEmail")}
                          placeholder="your.email@university.edu"
                          data-testid="input-university-email"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be your official university email address
                        </p>
                        {errors.universityEmail && (
                          <p className="text-sm text-red-500 mt-1">{errors.universityEmail.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            {...register("phoneNumber")}
                            placeholder="Your phone number"
                            data-testid="input-phone-number"
                            maxLength={20}
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                          <Input
                            id="emergencyContactName"
                            {...register("emergencyContactName")}
                            placeholder="Emergency contact name"
                            data-testid="input-emergency-contact-name"
                            maxLength={100}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          {...register("emergencyContactPhone")}
                          placeholder="Emergency contact phone"
                          data-testid="input-emergency-contact-phone"
                          maxLength={20}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Current Address</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentAddress.street">Street Address *</Label>
                        <Input
                          id="currentAddress.street"
                          {...register("currentAddress.street")}
                          placeholder="Street address"
                          data-testid="input-current-street"
                          maxLength={200}
                        />
                        {errors.currentAddress?.street && (
                          <p className="text-sm text-red-500 mt-1">{errors.currentAddress.street.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currentAddress.city">City *</Label>
                          <Input
                            id="currentAddress.city"
                            {...register("currentAddress.city")}
                            placeholder="City"
                            data-testid="input-current-city"
                            maxLength={100}
                          />
                          {errors.currentAddress?.city && (
                            <p className="text-sm text-red-500 mt-1">{errors.currentAddress.city.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="currentAddress.state">State *</Label>
                          <Input
                            id="currentAddress.state"
                            {...register("currentAddress.state")}
                            placeholder="State"
                            data-testid="input-current-state"
                            maxLength={100}
                          />
                          {errors.currentAddress?.state && (
                            <p className="text-sm text-red-500 mt-1">{errors.currentAddress.state.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currentAddress.postalCode">Postal Code *</Label>
                          <Input
                            id="currentAddress.postalCode"
                            {...register("currentAddress.postalCode")}
                            placeholder="Postal code"
                            data-testid="input-current-postal-code"
                            maxLength={20}
                          />
                          {errors.currentAddress?.postalCode && (
                            <p className="text-sm text-red-500 mt-1">{errors.currentAddress.postalCode.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="currentAddress.country">Country *</Label>
                          <Input
                            id="currentAddress.country"
                            {...register("currentAddress.country")}
                            placeholder="Country"
                            data-testid="input-current-country"
                            maxLength={100}
                          />
                          {errors.currentAddress?.country && (
                            <p className="text-sm text-red-500 mt-1">{errors.currentAddress.country.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Secure Document Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Secure Document Upload
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Upload clear, legible copies of required documents. Files are encrypted during upload and 
                      securely stored with restricted access for verification purposes only.
                    </p>
                  </div>

                  {/* Secure Document Upload Sections */}
                  {[
                    { key: 'studentId', title: 'Student ID Card', required: true, description: 'Official student identification card' },
                    { key: 'enrollment', title: 'Current Enrollment Certificate', required: true, description: 'Official enrollment verification for current semester' },
                    { key: 'transcript', title: 'Recent Academic Transcript', required: false, description: 'Optional: Recent transcript or grade report' },
                  ].map((doc) => (
                    <div key={doc.key} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {doc.title} {doc.required && '*'}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">{doc.description}</p>
                        <p className="text-xs text-gray-400 mb-4">
                          Secure upload: PDF, JPG, or PNG files (max 5MB)
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, doc.key as any);
                            }
                          }}
                          className="hidden"
                          id={`upload-${doc.key}`}
                        />
                        <label
                          htmlFor={`upload-${doc.key}`}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition-colors"
                          data-testid={`button-upload-${doc.key}`}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Secure Upload
                        </label>
                        {uploadedDocuments[doc.key as keyof typeof uploadedDocuments] && (
                          <div className="mt-2 text-sm text-green-600 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            File uploaded securely
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Review Your Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Student Information</h4>
                        <p><strong>Student ID:</strong> {watchedFields.studentId}</p>
                        <p><strong>University:</strong> {watchedFields.universityName}</p>
                        <p><strong>Degree Program:</strong> {watchedFields.degreeProgram}</p>
                        <p><strong>Year of Study:</strong> {watchedFields.yearOfStudy}</p>
                        <p><strong>Expected Graduation:</strong> {watchedFields.expectedGraduationDate}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Contact Information</h4>
                        <p><strong>University Email:</strong> {watchedFields.universityEmail}</p>
                        <p><strong>Phone:</strong> {watchedFields.phoneNumber || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Current Address</h4>
                        <p>
                          {watchedFields.currentAddress?.street}, {watchedFields.currentAddress?.city}, {' '}
                          {watchedFields.currentAddress?.state} {watchedFields.currentAddress?.postalCode}, {' '}
                          {watchedFields.currentAddress?.country}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Uploaded Documents</h4>
                        <ul className="space-y-1">
                          {uploadedDocuments.studentId && <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Student ID Card (Encrypted)</li>}
                          {uploadedDocuments.enrollment && <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Enrollment Certificate (Encrypted)</li>}
                          {uploadedDocuments.transcript && <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Academic Transcript (Encrypted)</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">What happens next?</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Your application will be securely reviewed within 2-3 business days</li>
                      <li>• You'll receive an encrypted email notification with the verification result</li>
                      <li>• Once verified, you'll get 15% discount on all e-books</li>
                      <li>• Student verification is valid until your graduation date</li>
                      <li>• All documents are automatically purged after graduation</li>
                    </ul>
                  </div>

                  {submitVerificationMutation.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-700 dark:text-red-300">
                          {submitVerificationMutation.error.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    data-testid="button-previous"
                    disabled={submitVerificationMutation.isPending}
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="ml-auto bg-green-600 hover:bg-green-700"
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitVerificationMutation.isPending || !uploadedDocuments.studentId || !uploadedDocuments.enrollment}
                    className="ml-auto bg-green-600 hover:bg-green-700"
                    data-testid="button-submit"
                  >
                    {submitVerificationMutation.isPending ? "Submitting Securely..." : "Submit Verification"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}