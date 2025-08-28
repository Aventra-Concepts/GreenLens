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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus,
  Edit,
  Eye,
  Trash2,
  Users,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Download,
  Check,
  X,
  Clock,
  Filter,
  Search
} from "lucide-react";

// Job Posting Form Schema
const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  workType: z.enum(["remote", "onsite", "hybrid"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  qualifications: z.string().optional(),
  benefits: z.string().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  salaryNegotiable: z.boolean().default(false),
  experienceMin: z.number().min(0).optional(),
  experienceMax: z.number().min(0).optional(),
  applicationDeadline: z.string().optional(),
  numberOfPositions: z.number().min(1).default(1),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
});

type JobPostingFormData = z.infer<typeof jobPostingSchema>;

interface JobPosting extends JobPostingFormData {
  id: string;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

interface JobApplication {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPosition?: string;
  currentCompany?: string;
  totalExperience?: number;
  expectedSalary?: number;
  coverLetter?: string;
  resumeUrl: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  status: string;
  appliedAt: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
  employeeId?: string;
  dateOfJoining?: string;
  salary?: number;
  employmentType?: string;
  status: string;
}

export default function AdminHRDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch job postings
  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery<JobPosting[]>({
    queryKey: ['/api/hr/jobs'],
  });

  // Fetch job applications
  const { data: jobApplications = [], isLoading: applicationsLoading } = useQuery<JobApplication[]>({
    queryKey: ['/api/hr/applications'],
  });

  // Fetch staff members
  const { data: staffMembers = [], isLoading: staffLoading } = useQuery<StaffMember[]>({
    queryKey: ['/api/hr/staff'],
  });

  // Job posting form
  const jobForm = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      currency: 'USD',
      salaryNegotiable: false,
      numberOfPositions: 1,
      status: 'draft',
      workType: 'remote',
      employmentType: 'full-time',
    }
  });

  // Create/Update job posting
  const saveJobPosting = useMutation({
    mutationFn: async (data: JobPostingFormData & { id?: string }) => {
      const { id, ...jobData } = data;
      if (id) {
        return apiRequest(`/api/hr/jobs/${id}`, 'PUT', jobData);
      } else {
        return apiRequest('/api/hr/jobs', 'POST', jobData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: selectedJob ? "Job posting updated successfully" : "Job posting created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/jobs'] });
      setIsJobModalOpen(false);
      setSelectedJob(null);
      jobForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save job posting",
        variant: "destructive",
      });
    },
  });

  // Delete job posting
  const deleteJobPosting = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/hr/jobs/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Job posting deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job posting",
        variant: "destructive",
      });
    },
  });

  // Update application status
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/hr/applications/${id}/status`, 'PATCH', { status });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Application status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const handleCreateJob = () => {
    setSelectedJob(null);
    jobForm.reset();
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: JobPosting) => {
    setSelectedJob(job);
    jobForm.reset({
      ...job,
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
    });
    setIsJobModalOpen(true);
  };

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  const onSubmitJob = (data: JobPostingFormData) => {
    saveJobPosting.mutate(selectedJob ? { ...data, id: selectedJob.id } : data);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'closed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'reviewing':
        return 'default';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredApplications = jobApplications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      app.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (jobsLoading || applicationsLoading || staffLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Management Dashboard</h1>
          <p className="text-gray-600">Manage job postings, applications, and staff members</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Job Postings ({jobPostings.length})</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Applications ({jobApplications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Staff ({staffMembers.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Jobs</p>
                        <p className="text-xl font-semibold">{jobPostings.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Published</p>
                        <p className="text-xl font-semibold">
                          {jobPostings.filter(j => j.status === 'published').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Edit className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Drafts</p>
                        <p className="text-xl font-semibold">
                          {jobPostings.filter(j => j.status === 'draft').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Applications</p>
                        <p className="text-xl font-semibold">{jobApplications.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Button onClick={handleCreateJob} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Job Posting
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobPostings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditJob(job)}
                          data-testid={`button-edit-${job.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteJobPosting.mutate(job.id)}
                          data-testid={`button-delete-${job.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.department}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span className="font-medium">{job.employmentType}</span>
                      <span>{job.workType}</span>
                    </div>

                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>
                          {job.salaryMin && job.salaryMax
                            ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                            : job.salaryMin
                            ? `From $${job.salaryMin.toLocaleString()}`
                            : `Up to $${job.salaryMax?.toLocaleString()}`
                          }
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                      <span>{job.applicationCount} applications</span>
                      <span>{job.viewCount} views</span>
                    </div>

                    {job.applicationDeadline && (
                      <div className="flex items-center text-sm text-orange-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApplication(application)}
                        data-testid={`button-view-${application.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">
                      {application.firstName} {application.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm font-medium text-gray-900">
                      {application.jobTitle}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{application.email}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{application.phone}</span>
                    </div>

                    {application.currentPosition && (
                      <div className="text-sm text-gray-600">
                        <strong>Current:</strong> {application.currentPosition}
                        {application.currentCompany && ` at ${application.currentCompany}`}
                      </div>
                    )}

                    {application.totalExperience && (
                      <div className="text-sm text-gray-600">
                        <strong>Experience:</strong> {application.totalExperience} years
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                      <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateApplicationStatus.mutate({ id: application.id, status: 'accepted' })}
                          disabled={application.status === 'accepted'}
                          data-testid={`button-accept-${application.id}`}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateApplicationStatus.mutate({ id: application.id, status: 'rejected' })}
                          disabled={application.status === 'rejected'}
                          data-testid={`button-reject-${application.id}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Staff Management</p>
                  <p>Staff management features coming soon. This will include employee records, payroll, and attendance tracking.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Job Posting Modal */}
        <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedJob ? 'Edit Job Posting' : 'Create Job Posting'}</DialogTitle>
            </DialogHeader>
            
            <Form {...jobForm}>
              <form onSubmit={jobForm.handleSubmit(onSubmitJob)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={jobForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="workType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="onsite">On-site</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={jobForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, company culture, and what makes this opportunity unique..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobForm.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List the essential requirements for this role..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jobForm.control}
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsibilities *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Outline the key responsibilities and day-to-day tasks..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsJobModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700" 
                    disabled={saveJobPosting.isPending}
                  >
                    {saveJobPosting.isPending 
                      ? "Saving..." 
                      : selectedJob 
                        ? "Update Job Posting" 
                        : "Create Job Posting"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Application Details Modal */}
        <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Applicant Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{selectedApplication.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={getStatusBadgeVariant(selectedApplication.status)}>
                          {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                    <div className="space-y-3">
                      {selectedApplication.currentPosition && (
                        <div>
                          <Label className="text-sm font-medium">Current Position</Label>
                          <p className="text-sm">{selectedApplication.currentPosition}</p>
                        </div>
                      )}
                      {selectedApplication.currentCompany && (
                        <div>
                          <Label className="text-sm font-medium">Current Company</Label>
                          <p className="text-sm">{selectedApplication.currentCompany}</p>
                        </div>
                      )}
                      {selectedApplication.totalExperience && (
                        <div>
                          <Label className="text-sm font-medium">Total Experience</Label>
                          <p className="text-sm">{selectedApplication.totalExperience} years</p>
                        </div>
                      )}
                      {selectedApplication.expectedSalary && (
                        <div>
                          <Label className="text-sm font-medium">Expected Salary</Label>
                          <p className="text-sm">${selectedApplication.expectedSalary.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cover Letter</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-4">Links & Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="justify-start" 
                      onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                    {selectedApplication.portfolioUrl && (
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => window.open(selectedApplication.portfolioUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Portfolio
                      </Button>
                    )}
                    {selectedApplication.linkedinUrl && (
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => window.open(selectedApplication.linkedinUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {selectedApplication.githubUrl && (
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => window.open(selectedApplication.githubUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Applied on {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => updateApplicationStatus.mutate({ 
                        id: selectedApplication.id, 
                        status: 'reviewing' 
                      })}
                      disabled={selectedApplication.status === 'reviewing'}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Mark as Reviewing
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus.mutate({ 
                        id: selectedApplication.id, 
                        status: 'accepted' 
                      })}
                      disabled={selectedApplication.status === 'accepted'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateApplicationStatus.mutate({ 
                        id: selectedApplication.id, 
                        status: 'rejected' 
                      })}
                      disabled={selectedApplication.status === 'rejected'}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}