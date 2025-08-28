import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  DollarSign, 
  CalendarDays,
  Building,
  Target,
  Award,
  FileText,
  Mail,
  Phone,
  Home
} from "lucide-react";
import { useLocation } from "wouter";

// Job Application Form Schema
const jobApplicationSchema = z.object({
  jobPostingId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  currentPosition: z.string().optional(),
  currentCompany: z.string().optional(),
  totalExperience: z.number().min(0).optional(),
  relevantExperience: z.number().min(0).optional(),
  currentSalary: z.number().min(0).optional(),
  expectedSalary: z.number().min(0).optional(),
  noticePeriod: z.number().min(0).optional(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().min(1, "Resume is required"),
  portfolioUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number()
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number()
  })).optional(),
  languages: z.array(z.string()).optional(),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  workType: string;
  employmentType: string;
  description: string;
  requirements: string;
  responsibilities: string;
  qualifications?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  salaryNegotiable: boolean;
  experienceMin?: number;
  experienceMax?: number;
  applicationDeadline?: string;
  numberOfPositions: number;
  status: string;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
}

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch published job postings
  const { data: jobPostings = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/hr/jobs', { status: 'published' }],
  });

  // Application form
  const applicationForm = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      skills: [],
      education: [],
      certifications: [],
      languages: [],
    }
  });

  // Submit job application
  const submitApplication = useMutation({
    mutationFn: async (data: JobApplicationFormData) => {
      return apiRequest('/api/hr/applications', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your job application has been submitted successfully. We'll review it and get back to you soon.",
      });
      setIsApplicationModalOpen(false);
      applicationForm.reset();
      setSelectedJob(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    applicationForm.setValue('jobPostingId', job.id);
    setIsApplicationModalOpen(true);
  };

  const onSubmitApplication = (data: JobApplicationFormData) => {
    submitApplication.mutate(data);
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `From ${formatter.format(min)}`;
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
    return 'Competitive';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="mb-6">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="inline-flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400"
                data-testid="button-go-home"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join Our Team at GreenLens
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help us revolutionize plant care with AI technology. Join a team passionate about 
              making gardening accessible, educational, and rewarding for everyone.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900">Collaborative Team</h3>
                <p className="text-gray-600 text-sm">Work with passionate experts</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900">Impactful Mission</h3>
                <p className="text-gray-600 text-sm">Make gardening accessible to all</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900">Growth Opportunities</h3>
                <p className="text-gray-600 text-sm">Develop your career with us</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Open Positions ({jobPostings.length})
          </h2>
          <p className="text-gray-600">
            Discover exciting opportunities to grow your career with us
          </p>
        </div>

        {jobPostings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 text-gray-400 rounded-lg mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Open Positions
              </h3>
              <p className="text-gray-600 mb-4">
                We don't have any open positions at the moment, but we're always looking for talented individuals.
              </p>
              <p className="text-sm text-gray-500">
                Check back soon or reach out to us at{' '}
                <a href="mailto:careers@greenlens.ai" className="text-green-600 hover:underline">
                  careers@greenlens.ai
                </a>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobPostings.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {job.department}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {job.applicationCount} {job.applicationCount === 1 ? 'applicant' : 'applicants'}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.workType}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{job.employmentType}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                    </div>
                  </div>

                  {job.experienceMin || job.experienceMax ? (
                    <div className="text-sm text-gray-600">
                      <strong>Experience:</strong>{' '}
                      {job.experienceMin && job.experienceMax
                        ? `${job.experienceMin}-${job.experienceMax} years`
                        : job.experienceMin
                        ? `${job.experienceMin}+ years`
                        : `Up to ${job.experienceMax} years`
                      }
                    </div>
                  ) : null}

                  <p className="text-sm text-gray-600 line-clamp-3">
                    {job.description}
                  </p>

                  {job.applicationDeadline && (
                    <div className="flex items-center space-x-1 text-sm text-orange-600">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-3">
                    <Button 
                      onClick={() => handleApplyClick(job)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid={`button-apply-${job.id}`}
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Job Application Modal */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          
          <Form {...applicationForm}>
            <form onSubmit={applicationForm.handleSubmit(onSubmitApplication)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={applicationForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} data-testid="input-firstName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={applicationForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} data-testid="input-lastName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={applicationForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={applicationForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Current Employment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Employment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={applicationForm.control}
                    name="currentPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Developer" {...field} data-testid="input-currentPosition" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={applicationForm.control}
                    name="currentCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Tech Corp" {...field} data-testid="input-currentCompany" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={applicationForm.control}
                    name="totalExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Experience (years)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-totalExperience"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={applicationForm.control}
                    name="noticePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notice Period (days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-noticePeriod"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documents & Links</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={applicationForm.control}
                    name="resumeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume URL *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://drive.google.com/file/d/..." 
                            {...field} 
                            data-testid="input-resumeUrl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={applicationForm.control}
                      name="portfolioUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://portfolio.com" {...field} data-testid="input-portfolioUrl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={applicationForm.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/..." {...field} data-testid="input-linkedinUrl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={applicationForm.control}
                      name="githubUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/..." {...field} data-testid="input-githubUrl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cover Letter</h3>
                <FormField
                  control={applicationForm.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why are you interested in this position?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us why you're excited about this opportunity and how you can contribute to our team..."
                          rows={5}
                          {...field}
                          data-testid="textarea-coverLetter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsApplicationModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700" 
                  disabled={submitApplication.isPending}
                  data-testid="button-submit-application"
                >
                  {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}