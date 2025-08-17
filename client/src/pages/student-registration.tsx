import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, CheckCircle, GraduationCap, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const studentRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  universityName: z.string().min(1, "University name is required"),
  studentId: z.string().min(1, "Student ID is required"),
  graduationYear: z.string().min(1, "Expected graduation year is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  country: z.string().min(1, "Country is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;

export default function StudentRegistration() {
  const { toast } = useToast();
  const [studentDocument, setStudentDocument] = useState<File | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<string>("idle");

  const form = useForm<StudentRegistrationFormData>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {},
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: StudentRegistrationFormData & { document: File }) => {
      setRegistrationStatus("submitting");
      
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'document') {
          formData.append(key, value);
        }
      });
      formData.append('studentDocument', data.document);

      const response = await fetch("/api/register/student", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setRegistrationStatus("success");
      toast({
        title: "Registration Successful",
        description: "Your student registration has been submitted for verification. You'll receive an email once approved.",
      });
      form.reset();
      setStudentDocument(null);
    },
    onError: (error: any) => {
      setRegistrationStatus("error");
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register student account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentRegistrationFormData) => {
    if (!studentDocument) {
      toast({
        title: "Document Required",
        description: "Please upload your student verification document",
        variant: "destructive",
      });
      return;
    }

    registrationMutation.mutate({ ...data, document: studentDocument });
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50KB)
    if (file.size > 50 * 1024) {
      toast({
        title: "File Too Large",
        description: "Document must be less than 50KB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    setStudentDocument(file);
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Navigation Bar */}
      <div className="flex items-center justify-start mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-back-home">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="mb-8 text-center">
        <GraduationCap className="mx-auto h-16 w-16 text-green-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Student Registration
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Register as a verified student to access exclusive discounts and features
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Account Details</CardTitle>
          <CardDescription>
            Complete the form below to register for a verified student account. All information will be verified.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your first name"
                            data-testid="input-first-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your last name"
                            data-testid="input-last-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="Enter your email address"
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormDescription>
                        Please use your university email if available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="Create a password"
                            data-testid="input-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            placeholder="Confirm your password"
                            data-testid="input-confirm-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* University Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">University Information</h3>
                
                <FormField
                  control={form.control}
                  name="universityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your university name"
                          data-testid="input-university"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your student ID"
                            data-testid="input-student-id"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Graduation Year *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-graduation-year">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {graduationYears.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fieldOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Study *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-field-of-study">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Agriculture">Agriculture</SelectItem>
                            <SelectItem value="Horticulture">Horticulture</SelectItem>
                            <SelectItem value="Botany">Botany</SelectItem>
                            <SelectItem value="Environmental Science">Environmental Science</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="IN">India</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Verification Document</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Student Verification Document * (PDF, JPG, PNG - Max 50KB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="flex justify-center">
                        <label htmlFor="document-upload" className="cursor-pointer">
                          <span className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                            Choose Document
                          </span>
                          <input
                            id="document-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentChange}
                            data-testid="input-student-document"
                          />
                        </label>
                      </div>
                      {studentDocument && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ {studentDocument.name}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Upload student ID card, enrollment letter, or transcript
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Verification Requirements:</strong> Upload a clear photo or scan of your student ID card, 
                    enrollment verification letter, or recent transcript. This document will be used to verify your 
                    student status and unlock exclusive discounts.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Registration Status */}
              {registrationStatus === "submitting" && (
                <Alert>
                  <Upload className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Submitting your registration... Please don't close this page.
                  </AlertDescription>
                </Alert>
              )}

              {registrationStatus === "success" && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Registration successful! Your student status is under review.
                  </AlertDescription>
                </Alert>
              )}

              {registrationStatus === "error" && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    Registration failed. Please check your information and try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={registrationMutation.isPending || registrationStatus === "submitting"}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                  data-testid="button-register-student"
                >
                  {registrationMutation.isPending ? "Registering..." : "Register Student Account"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}