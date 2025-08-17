import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentProfileSchema, type InsertStudentProfile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudentStatus {
  hasApplication: boolean;
  status?: string;
  submittedAt?: string;
  verifiedAt?: string;
  expiresAt?: string;
  discountPercentage?: string;
  adminNotes?: string;
}

export default function StudentVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<{
    studentId?: File;
    enrollment?: File;
    transcript?: File;
  }>({});

  // Get current student status
  const { data: studentStatus, isLoading: statusLoading } = useQuery<StudentStatus>({
    queryKey: ["/api/student-verification/status"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/student-verification/status");
      return response.json();
    }
  });

  const form = useForm<InsertStudentProfile>({
    resolver: zodResolver(insertStudentProfileSchema),
    defaultValues: {
      studentId: "",
      universityName: "",
      degreeProgram: "",
      yearOfStudy: 1,
      universityEmail: "",
      phoneNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      currentAddress: {},
      permanentAddress: {},
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertStudentProfile) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add files
      if (selectedFiles.studentId) {
        formData.append('studentIdDocument', selectedFiles.studentId);
      }
      if (selectedFiles.enrollment) {
        formData.append('enrollmentCertificate', selectedFiles.enrollment);
      }
      if (selectedFiles.transcript) {
        formData.append('transcript', selectedFiles.transcript);
      }

      const response = await fetch("/api/student-verification", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit application");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your student verification application has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student-verification/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit student verification application.",
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (type: 'studentId' | 'enrollment' | 'transcript', file: File | undefined) => {
    setSelectedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="container-verification">
        <Card>
          <CardContent className="pt-6">
            <p data-testid="text-login-required">Please log in to access student verification.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="container-loading">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-testid="container-student-verification">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2" data-testid="heading-verification">
          Student Verification
        </h1>
        <p className="text-gray-600 dark:text-gray-300" data-testid="text-verification-description">
          Apply for student discounts and access to educational resources
        </p>
      </div>

      {/* Current Status */}
      {studentStatus?.hasApplication && (
        <Card className="mb-8" data-testid="card-current-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(studentStatus.status)}
              Current Application Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(studentStatus.status)} data-testid="badge-status">
                {studentStatus.status?.replace('_', ' ').toUpperCase()}
              </Badge>
              {studentStatus.discountPercentage && (
                <Badge variant="outline" data-testid="badge-discount">
                  {studentStatus.discountPercentage}% Discount
                </Badge>
              )}
            </div>
            
            {studentStatus.submittedAt && (
              <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-submitted-at">
                Submitted: {new Date(studentStatus.submittedAt).toLocaleDateString()}
              </p>
            )}
            
            {studentStatus.verifiedAt && (
              <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-verified-at">
                Verified: {new Date(studentStatus.verifiedAt).toLocaleDateString()}
              </p>
            )}
            
            {studentStatus.expiresAt && (
              <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-expires-at">
                Expires: {new Date(studentStatus.expiresAt).toLocaleDateString()}
              </p>
            )}
            
            {studentStatus.adminNotes && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Admin Notes:</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1" data-testid="text-admin-notes">
                  {studentStatus.adminNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      {(!studentStatus?.hasApplication || studentStatus.status === 'rejected') && (
        <Card data-testid="card-application-form">
          <CardHeader>
            <CardTitle>Student Verification Application</CardTitle>
            <CardDescription>
              Please fill out all required fields and upload the necessary documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
                {/* Academic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your student ID" {...field} data-testid="input-student-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="universityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University/College Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your institution name" {...field} data-testid="input-university" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="degreeProgram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree Program *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Bachelor of Science in Computer Science" {...field} data-testid="input-degree" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Study *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-year-study">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                            <SelectItem value="5">5th Year</SelectItem>
                            <SelectItem value="6">6th Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="universityEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.name@university.edu" 
                            {...field} 
                            data-testid="input-university-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} value={field.value || ""} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} value={field.value || ""} data-testid="input-emergency-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} value={field.value || ""} data-testid="input-emergency-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Required Documents</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Student ID Document */}
                    <div className="space-y-2">
                      <Label>Student ID Card/Document *</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('studentId', e.target.files?.[0])}
                          className="hidden"
                          id="student-id-upload"
                          data-testid="input-file-student-id"
                        />
                        <Label htmlFor="student-id-upload" className="cursor-pointer text-sm">
                          {selectedFiles.studentId ? selectedFiles.studentId.name : "Upload Student ID"}
                        </Label>
                      </div>
                    </div>

                    {/* Enrollment Certificate */}
                    <div className="space-y-2">
                      <Label>Enrollment Certificate</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('enrollment', e.target.files?.[0])}
                          className="hidden"
                          id="enrollment-upload"
                          data-testid="input-file-enrollment"
                        />
                        <Label htmlFor="enrollment-upload" className="cursor-pointer text-sm">
                          {selectedFiles.enrollment ? selectedFiles.enrollment.name : "Upload Certificate"}
                        </Label>
                      </div>
                    </div>

                    {/* Transcript */}
                    <div className="space-y-2">
                      <Label>Academic Transcript</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('transcript', e.target.files?.[0])}
                          className="hidden"
                          id="transcript-upload"
                          data-testid="input-file-transcript"
                        />
                        <Label htmlFor="transcript-upload" className="cursor-pointer text-sm">
                          {selectedFiles.transcript ? selectedFiles.transcript.name : "Upload Transcript"}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending || !selectedFiles.studentId}
                  className="w-full"
                  data-testid="button-submit-application"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}