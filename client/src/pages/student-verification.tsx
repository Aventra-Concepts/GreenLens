import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Upload, 
  FileText, 
  GraduationCap, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  School,
  Users,
  Percent
} from "lucide-react";

const studentVerificationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  
  // University Details
  universityName: z.string().min(2, "University name is required"),
  universityCountry: z.string().min(1, "University country is required"),
  universityCity: z.string().min(1, "University city is required"),
  studentId: z.string().min(1, "Student ID is required"),
  
  // Academic Details
  degreeProgram: z.string().min(1, "Degree program is required"),
  major: z.string().min(1, "Major/field of study is required"),
  currentYear: z.string().min(1, "Current academic year is required"),
  expectedGraduationDate: z.string().min(1, "Expected graduation date is required"),
  gpa: z.string().optional(),
  
  // Verification Documents
  documentType: z.string().min(1, "Please select a document type"),
  additionalInfo: z.string().optional(),
  
  // Terms
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  dataProcessingConsent: z.boolean().refine(val => val === true, "You must consent to data processing"),
});

type StudentVerificationForm = z.infer<typeof studentVerificationSchema>;

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", 
  "Netherlands", "Sweden", "Denmark", "Norway", "Finland", "Switzerland", 
  "Austria", "Belgium", "Ireland", "New Zealand", "Japan", "South Korea",
  "Singapore", "Hong Kong", "India", "Brazil", "Mexico", "Argentina", "Chile",
  "South Africa", "Egypt", "Israel", "Turkey", "UAE", "Other"
];

const degreePrograms = [
  "Bachelor's Degree", "Master's Degree", "PhD/Doctorate", "Associate Degree",
  "Certificate Program", "Diploma", "Professional Degree", "Other"
];

const currentYears = [
  "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year",
  "Graduate 1st Year", "Graduate 2nd Year", "Graduate 3rd Year+", "Final Year"
];

const documentTypes = [
  "Official Transcript", "Student ID Card", "Enrollment Certificate", 
  "Letter from Registrar", "University Email Verification", "Other Official Document"
];

export default function StudentVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StudentVerificationForm>({
    resolver: zodResolver(studentVerificationSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phoneNumber: "",
      dateOfBirth: "",
      universityName: "",
      universityCountry: "",
      universityCity: "",
      studentId: "",
      degreeProgram: "",
      major: "",
      currentYear: "",
      expectedGraduationDate: "",
      gpa: "",
      documentType: "",
      additionalInfo: "",
      termsAccepted: false,
      dataProcessingConsent: false,
    },
  });

  const { data: existingApplication } = useQuery({
    queryKey: ['/api/student/verification-status'],
    queryFn: async () => {
      const response = await fetch('/api/student/verification-status');
      if (response.status === 404) return null;
      return response.json();
    },
  });

  const verificationMutation = useMutation({
    mutationFn: async (data: StudentVerificationForm & { documents: File[] }) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'documents' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add documents
      data.documents.forEach((file, index) => {
        formData.append(`document_${index}`, file);
      });
      
      const response = await fetch('/api/student/verify', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Verification submission failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Submitted",
        description: "Your student verification has been submitted successfully. We'll review it within 2-3 business days.",
      });
      form.reset();
      setUploadedFiles([]);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentVerificationForm) => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Documents Required",
        description: "Please upload at least one verification document.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    verificationMutation.mutate({ ...data, documents: uploadedFiles });
    setIsSubmitting(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only JPEG, PNG, and PDF files under 5MB are allowed.",
        variant: "destructive",
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Show existing application status if user has already applied
  if (existingApplication) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Student Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {existingApplication.status === 'verified' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : existingApplication.status === 'rejected' ? (
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  ) : (
                    <Calendar className="h-8 w-8 text-yellow-600" />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">
                      Status: {existingApplication.status === 'verified' ? 'Verified' : 
                               existingApplication.status === 'rejected' ? 'Rejected' : 'Under Review'}
                    </h3>
                    <p className="text-gray-600">
                      Application submitted on {new Date(existingApplication.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {existingApplication.status === 'verified' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Student Benefits Active</h4>
                    </div>
                    <p className="text-green-700">
                      You're now eligible for 20% discount on all e-books in our marketplace!
                    </p>
                  </div>
                )}

                {existingApplication.status === 'rejected' && existingApplication.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Rejection Reason</h4>
                    <p className="text-red-700">{existingApplication.rejectionReason}</p>
                    <Button className="mt-3" onClick={() => window.location.reload()}>
                      Submit New Application
                    </Button>
                  </div>
                )}

                {existingApplication.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Under Review</h4>
                    <p className="text-yellow-700">
                      Our team is reviewing your application. You'll receive an email notification once the review is complete.
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Application Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">University:</span> {existingApplication.universityName}
                    </div>
                    <div>
                      <span className="font-medium">Program:</span> {existingApplication.degreeProgram}
                    </div>
                    <div>
                      <span className="font-medium">Major:</span> {existingApplication.major}
                    </div>
                    <div>
                      <span className="font-medium">Graduation:</span> {existingApplication.expectedGraduationDate}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Student Verification</h1>
          <p className="text-lg text-gray-600 mb-6">
            Verify your student status to unlock exclusive 20% discounts on all e-books.
          </p>
          
          {/* Benefits Card */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <Percent className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">20% Discount</h3>
                <p className="text-sm text-gray-600">On all e-books</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Student Community</h3>
                <p className="text-sm text-gray-600">Access to student forums</p>
              </div>
              <div className="text-center">
                <School className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Academic Resources</h3>
                <p className="text-sm text-gray-600">Exclusive educational content</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Student Verification Form
            </CardTitle>
            <CardDescription>
              Complete this form to verify your current student status. All information will be verified with your institution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="As shown on your student ID" {...field} data-testid="input-fullname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Preferably your .edu email" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-dob" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* University Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">University Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="universityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University/Institution Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full official name of your university" {...field} data-testid="input-university" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="universityCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University Country *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="universityCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University City *</FormLabel>
                          <FormControl>
                            <Input placeholder="City where university is located" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your official student ID number" {...field} data-testid="input-student-id" />
                        </FormControl>
                        <FormDescription>
                          This will be verified with your institution.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="degreeProgram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree Program *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-degree">
                                <SelectValue placeholder="Select degree type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {degreePrograms.map((program) => (
                                <SelectItem key={program} value={program}>
                                  {program}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Academic Year *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-year">
                                <SelectValue placeholder="Select current year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currentYears.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
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
                    name="major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major/Field of Study *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Agriculture, Horticulture, Environmental Science" {...field} data-testid="input-major" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expectedGraduationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Graduation Date *</FormLabel>
                          <FormControl>
                            <Input type="month" {...field} data-testid="input-graduation" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gpa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current GPA (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 3.5" {...field} data-testid="input-gpa" />
                          </FormControl>
                          <FormDescription>
                            If applicable to your grading system.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Verification Documents</h3>
                  
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Document Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-document-type">
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Upload Documents *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your student verification documents
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Accepted formats: JPEG, PNG, PDF (max 5MB each)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="document-upload"
                        data-testid="input-documents"
                      />
                      <label htmlFor="document-upload">
                        <Button type="button" variant="outline" className="cursor-pointer">
                          Choose Files
                        </Button>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Uploaded Files:</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              data-testid={`button-remove-${index}`}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information that might help with verification..."
                            {...field}
                            data-testid="textarea-additional"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Consent & Terms</h3>
                  
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the Student Verification Terms *
                            </FormLabel>
                            <FormDescription>
                              I understand that providing false information may result in account termination and agree to the student discount terms.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dataProcessingConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-consent"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Data Processing Consent *
                            </FormLabel>
                            <FormDescription>
                              I consent to the processing of my academic information for verification purposes and automatic status updates upon graduation.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    disabled={isSubmitting || verificationMutation.isPending}
                    data-testid="button-submit"
                  >
                    {isSubmitting || verificationMutation.isPending ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Verification...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Submit Student Verification
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Verification Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Document Review</p>
                  <p className="text-sm text-gray-600">Our team verifies your documents within 2-3 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Institution Verification</p>
                  <p className="text-sm text-gray-600">We may contact your institution to confirm enrollment status.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Status Activation</p>
                  <p className="text-sm text-gray-600">Once verified, your student discounts are automatically activated!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">All documents encrypted and securely stored</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Information used only for verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Automatic status updates upon graduation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">No sharing with third parties</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">GDPR and CCPA compliant</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}