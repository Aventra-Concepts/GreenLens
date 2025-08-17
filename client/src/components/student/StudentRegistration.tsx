import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, Upload, AlertCircle, CheckCircle, Calendar, School } from "lucide-react";

const studentRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  
  // University Information
  universityName: z.string().min(2, "University name is required"),
  universityEmail: z.string().email("Please enter a valid university email address"),
  studentId: z.string().min(3, "Student ID is required"),
  degree: z.string().min(2, "Degree program is required"),
  fieldOfStudy: z.string().min(2, "Field of study is required"),
  yearOfStudy: z.enum(["1", "2", "3", "4", "graduate", "phd"], {
    required_error: "Please select your year of study"
  }),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  expectedGraduation: z.string().min(1, "Expected graduation date is required"),
  
  // Document Upload
  documentType: z.enum(["student_id", "enrollment_letter", "transcript", "fee_receipt"], {
    required_error: "Please select a document type"
  }),
  
  // Interests
  gardeningInterests: z.array(z.string()).min(1, "Please select at least one area of interest"),
  
  // Verification
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
  confirmStudentStatus: z.boolean().refine(val => val === true, "You must confirm your current student status")
});

type StudentRegistrationForm = z.infer<typeof studentRegistrationSchema>;

const gardeningInterestOptions = [
  "Indoor Plant Care",
  "Vegetable Gardening",
  "Flower Gardening",
  "Herb Gardening",
  "Sustainable Gardening",
  "Hydroponics",
  "Plant Biology",
  "Landscape Design",
  "Organic Farming",
  "Plant Diseases & Pests",
  "Garden Design",
  "Native Plants",
  "Greenhouse Management",
  "Composting",
  "Plant Propagation"
];

interface StudentRegistrationProps {
  onSuccess?: () => void;
}

export default function StudentRegistration({ onSuccess }: StudentRegistrationProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StudentRegistrationForm>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      universityName: "",
      universityEmail: "",
      studentId: "",
      degree: "",
      fieldOfStudy: "",
      enrollmentDate: "",
      expectedGraduation: "",
      gardeningInterests: [],
      agreeToTerms: false,
      confirmStudentStatus: false
    }
  });

  const registerStudentMutation = useMutation({
    mutationFn: async (data: StudentRegistrationForm) => {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("studentData", JSON.stringify({
        ...data,
        gardeningInterests: selectedInterests
      }));
      
      if (documentFile) {
        formData.append("verificationDocument", documentFile);
      }

      const response = await fetch("/api/students/register", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Submitted Successfully",
        description: "Your student registration has been submitted for verification. You'll receive an email within 2-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      form.reset();
      setSelectedInterests([]);
      setDocumentFile(null);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit student registration. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: StudentRegistrationForm) => {
    if (!documentFile) {
      toast({
        title: "Document Required",
        description: "Please upload a verification document to proceed.",
        variant: "destructive",
      });
      return;
    }

    registerStudentMutation.mutate({
      ...data,
      gardeningInterests: selectedInterests
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or PDF file.",
          variant: "destructive",
        });
        return;
      }

      setDocumentFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Registration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Register as a verified student to access exclusive 10% discounts on all e-books and educational materials.
          </p>
        </div>

        <Card className="border-t-4 border-t-blue-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <School className="w-6 h-6 text-blue-600" />
              Student Verification Application
            </CardTitle>
            <CardDescription>
              Complete your student registration to receive verified status and access to student discounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="Enter your first name"
                      data-testid="input-firstName"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Enter your last name"
                      data-testid="input-lastName"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Enter your personal email"
                      data-testid="input-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="Enter your phone number"
                      data-testid="input-phone"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                    data-testid="input-dateOfBirth"
                  />
                  {form.formState.errors.dateOfBirth && (
                    <p className="text-sm text-red-600">{form.formState.errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              {/* University Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  University Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="universityName">University Name *</Label>
                    <Input
                      id="universityName"
                      {...form.register("universityName")}
                      placeholder="Enter your university name"
                      data-testid="input-universityName"
                    />
                    {form.formState.errors.universityName && (
                      <p className="text-sm text-red-600">{form.formState.errors.universityName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="universityEmail">University Email *</Label>
                    <Input
                      id="universityEmail"
                      type="email"
                      {...form.register("universityEmail")}
                      placeholder="Enter your university email (.edu)"
                      data-testid="input-universityEmail"
                    />
                    {form.formState.errors.universityEmail && (
                      <p className="text-sm text-red-600">{form.formState.errors.universityEmail.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      {...form.register("studentId")}
                      placeholder="Enter your student ID"
                      data-testid="input-studentId"
                    />
                    {form.formState.errors.studentId && (
                      <p className="text-sm text-red-600">{form.formState.errors.studentId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearOfStudy">Year of Study *</Label>
                    <Select onValueChange={(value) => form.setValue("yearOfStudy", value as any)}>
                      <SelectTrigger data-testid="select-yearOfStudy">
                        <SelectValue placeholder="Select your year of study" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">First Year</SelectItem>
                        <SelectItem value="2">Second Year</SelectItem>
                        <SelectItem value="3">Third Year</SelectItem>
                        <SelectItem value="4">Fourth Year</SelectItem>
                        <SelectItem value="graduate">Graduate Student</SelectItem>
                        <SelectItem value="phd">PhD Student</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.yearOfStudy && (
                      <p className="text-sm text-red-600">{form.formState.errors.yearOfStudy.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree Program *</Label>
                    <Input
                      id="degree"
                      {...form.register("degree")}
                      placeholder="e.g., Bachelor of Science, Master of Arts"
                      data-testid="input-degree"
                    />
                    {form.formState.errors.degree && (
                      <p className="text-sm text-red-600">{form.formState.errors.degree.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                    <Input
                      id="fieldOfStudy"
                      {...form.register("fieldOfStudy")}
                      placeholder="e.g., Biology, Agriculture, Environmental Science"
                      data-testid="input-fieldOfStudy"
                    />
                    {form.formState.errors.fieldOfStudy && (
                      <p className="text-sm text-red-600">{form.formState.errors.fieldOfStudy.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                    <Input
                      id="enrollmentDate"
                      type="date"
                      {...form.register("enrollmentDate")}
                      data-testid="input-enrollmentDate"
                    />
                    {form.formState.errors.enrollmentDate && (
                      <p className="text-sm text-red-600">{form.formState.errors.enrollmentDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedGraduation">Expected Graduation *</Label>
                    <Input
                      id="expectedGraduation"
                      type="date"
                      {...form.register("expectedGraduation")}
                      data-testid="input-expectedGraduation"
                    />
                    {form.formState.errors.expectedGraduation && (
                      <p className="text-sm text-red-600">{form.formState.errors.expectedGraduation.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Verification Document
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <RadioGroup
                      onValueChange={(value) => form.setValue("documentType", value as any)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student_id" id="student_id" />
                        <Label htmlFor="student_id">Student ID Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enrollment_letter" id="enrollment_letter" />
                        <Label htmlFor="enrollment_letter">Enrollment Letter</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transcript" id="transcript" />
                        <Label htmlFor="transcript">Official Transcript</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fee_receipt" id="fee_receipt" />
                        <Label htmlFor="fee_receipt">Fee Payment Receipt</Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.documentType && (
                      <p className="text-sm text-red-600">{form.formState.errors.documentType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document">Upload Document *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {documentFile ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">
                            ✓ {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDocumentFile(null)}
                            data-testid="button-remove-document"
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, JPEG, or PNG (max 5MB)
                          </p>
                        </div>
                      )}
                      <Input
                        id="document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        data-testid="input-document"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('document')?.click()}
                        className="mt-2"
                        data-testid="button-upload-document"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Areas of Interest
                </h3>
                
                <div className="space-y-2">
                  <Label>Gardening & Plant Care Interests *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded-lg">
                    {gardeningInterestOptions.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={selectedInterests.includes(interest)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInterests([...selectedInterests, interest]);
                            } else {
                              setSelectedInterests(selectedInterests.filter(item => item !== interest));
                            }
                          }}
                          data-testid={`checkbox-${interest}`}
                        />
                        <Label htmlFor={interest} className="text-sm font-normal">
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedInterests.length === 0 && form.formState.errors.gardeningInterests && (
                    <p className="text-sm text-red-600">{form.formState.errors.gardeningInterests.message}</p>
                  )}
                </div>
              </div>

              {/* Terms and Verification */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirmStudentStatus"
                    {...form.register("confirmStudentStatus")}
                    data-testid="checkbox-confirm-status"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="confirmStudentStatus" className="text-sm font-normal">
                      I confirm that I am currently enrolled as a student *
                    </Label>
                    <p className="text-xs text-gray-500">
                      I certify that all information provided is accurate and that I am currently enrolled in an accredited educational institution.
                    </p>
                  </div>
                </div>
                {form.formState.errors.confirmStudentStatus && (
                  <p className="text-sm text-red-600">{form.formState.errors.confirmStudentStatus.message}</p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    {...form.register("agreeToTerms")}
                    data-testid="checkbox-terms"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="agreeToTerms" className="text-sm font-normal">
                      I agree to the Student Terms and Conditions *
                    </Label>
                    <p className="text-xs text-gray-500">
                      By checking this box, you agree to our student verification process and discount terms.
                    </p>
                  </div>
                </div>
                {form.formState.errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{form.formState.errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Benefits Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-900">Student Benefits</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <p>• 10% discount on all e-books and educational materials</p>
                      <p>• Access to exclusive student-only content</p>
                      <p>• Priority support for academic research</p>
                      <p>• Verification valid for up to 3 years or until graduation</p>
                      <p>• Benefits automatically expire upon graduation or after 3 years</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={registerStudentMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                data-testid="button-submit-registration"
              >
                {registerStudentMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting Registration...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Submit Student Registration
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