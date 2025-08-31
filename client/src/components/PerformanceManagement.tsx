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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, Edit, Eye, Trash2, Calendar, Target, FileText,
  TrendingUp, BarChart3, Star, Award, CheckCircle,
  Clock, Filter, Search, Download, Upload,
  Users, Building2, GraduationCap, LineChart,
  Activity, AlertTriangle, Send, BookOpen
} from "lucide-react";

// Performance Report Template Schema
const performanceTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  type: z.enum(["monthly", "annual", "quarterly"]),
  evaluationCriteria: z.array(z.object({
    category: z.string(),
    description: z.string(),
    weight: z.number().min(0).max(1),
    maxScore: z.number().default(5)
  })),
  isActive: z.boolean().default(true)
});

// Performance Report Schema
const performanceReportSchema = z.object({
  staffMemberId: z.string().min(1, "Employee is required"),
  templateId: z.string().min(1, "Template is required"),
  reportType: z.enum(["monthly", "annual", "quarterly"]),
  reviewPeriod: z.string().min(1, "Review period is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reviewerId: z.string().min(1, "Reviewer is required")
});

// Performance Evaluation Schema
const performanceEvaluationSchema = z.object({
  category: z.string().min(1, "Category is required"),
  score: z.number().min(0).max(5),
  rating: z.enum(["excellent", "good", "satisfactory", "needs_improvement", "unsatisfactory"]),
  comments: z.string().min(1, "Comments are required"),
  evidence: z.string().optional(),
  weight: z.number().min(0).max(1).default(1)
});

interface PerformanceManagementProps {
  userRole?: string;
  departmentAccess?: string[];
}

export function PerformanceManagement({ userRole = "admin", departmentAccess = [] }: PerformanceManagementProps) {
  const [activeTab, setActiveTab] = useState('reports');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch performance templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/hr/performance/templates'],
    retry: false,
  });

  // Fetch performance reports
  const { data: reports = [] } = useQuery({
    queryKey: ['/api/hr/performance/reports', { status: filterStatus, type: filterType }],
    retry: false,
  });

  // Fetch staff members
  const { data: staffMembers = [] } = useQuery({
    queryKey: ['/api/hr/staff'],
    retry: false,
  });

  // Fetch performance analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/hr/performance/analytics'],
    retry: false,
  });

  // Template form
  const templateForm = useForm({
    resolver: zodResolver(performanceTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'monthly' as const,
      evaluationCriteria: [
        { category: 'Productivity', description: 'Quality and quantity of work output', weight: 0.3, maxScore: 5 },
        { category: 'Quality', description: 'Accuracy and attention to detail', weight: 0.25, maxScore: 5 },
        { category: 'Communication', description: 'Verbal and written communication skills', weight: 0.2, maxScore: 5 },
        { category: 'Teamwork', description: 'Collaboration and team contribution', weight: 0.15, maxScore: 5 },
        { category: 'Initiative', description: 'Proactive approach and innovation', weight: 0.1, maxScore: 5 }
      ],
      isActive: true
    }
  });

  // Report form
  const reportForm = useForm({
    resolver: zodResolver(performanceReportSchema),
    defaultValues: {
      staffMemberId: '',
      templateId: '',
      reportType: 'monthly' as const,
      reviewPeriod: '',
      startDate: '',
      endDate: '',
      reviewerId: ''
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/hr/performance/templates', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/performance/templates'] });
      setIsTemplateModalOpen(false);
      templateForm.reset();
      toast({
        title: "Success",
        description: "Performance template created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive"
      });
    }
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/hr/performance/reports', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/performance/reports'] });
      setIsReportModalOpen(false);
      reportForm.reset();
      toast({
        title: "Success",
        description: "Performance report created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create report",
        variant: "destructive"
      });
    }
  });

  // Submit evaluation mutation
  const submitEvaluationMutation = useMutation({
    mutationFn: async ({ reportId, evaluations }: { reportId: string; evaluations: any[] }) => {
      return apiRequest(`/api/hr/performance/reports/${reportId}/submit`, 'POST', { evaluations });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/performance/reports'] });
      setIsEvaluationModalOpen(false);
      setSelectedReport(null);
      toast({
        title: "Success",
        description: "Performance evaluation submitted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit evaluation",
        variant: "destructive"
      });
    }
  });

  // Generate monthly reports mutation
  const generateMonthlyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/hr/performance/generate/monthly', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/performance/reports'] });
      toast({
        title: "Success",
        description: "Monthly reports generated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate reports",
        variant: "destructive"
      });
    }
  });

  const filteredReports = (reports as any[] || []).filter((report: any) => {
    const matchesSearch = searchQuery === '' || 
      report.staffMemberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.reportType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getRatingBadge = (rating: string) => {
    const ratingConfig = {
      excellent: { color: 'bg-green-100 text-green-800', label: 'Excellent' },
      good: { color: 'bg-blue-100 text-blue-800', label: 'Good' },
      satisfactory: { color: 'bg-yellow-100 text-yellow-800', label: 'Satisfactory' },
      needs_improvement: { color: 'bg-orange-100 text-orange-800', label: 'Needs Improvement' },
      unsatisfactory: { color: 'bg-red-100 text-red-800', label: 'Unsatisfactory' }
    };
    
    const config = ratingConfig[rating as keyof typeof ratingConfig];
    return config ? <Badge className={config.color}>{config.label}</Badge> : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Management</h2>
          <p className="text-gray-600">Track employee performance and development</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsTemplateModalOpen(true)} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            New Template
          </Button>
          <Button 
            onClick={() => setIsReportModalOpen(true)} 
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Target className="w-4 h-4 mr-2" />
            New Performance Review
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics as any)?.totalReports || 0}</div>
              <p className="text-xs text-gray-500 mt-1">This year</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(analytics as any)?.avgScoreByDepartment?.length > 0 
                  ? ((analytics as any).avgScoreByDepartment.reduce((acc: number, dept: any) => acc + dept.avgScore, 0) / (analytics as any).avgScoreByDepartment.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {(analytics as any)?.reportsByStatus?.find((s: any) => s.status === 'submitted')?.count || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {((analytics as any)?.totalReports || 0) > 0 
                  ? Math.round((((analytics as any)?.reportsByStatus?.find((s: any) => s.status === 'approved')?.count || 0) / (analytics as any).totalReports) * 100)
                  : 0
                }%
              </div>
              <p className="text-xs text-gray-500 mt-1">Approved reviews</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Performance Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals & Development</TabsTrigger>
        </TabsList>

        {/* Performance Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Performance Reports</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report: any) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{report.staffMemberName}</h3>
                            {getStatusBadge(report.status)}
                            <Badge variant="outline">{report.reportType}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{report.department}</p>
                          <p className="text-sm text-gray-500">
                            Review Period: {report.reviewPeriod} • {report.startDate} to {report.endDate}
                          </p>
                          {report.overallScore && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Overall Score:</span>
                              <span className="font-bold text-lg">{report.overallScore}/5.0</span>
                              {report.overallRating && getRatingBadge(report.overallRating)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsEvaluationModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {report.status === 'draft' && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setIsEvaluationModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Evaluate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No performance reports found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(templates as any[] || []).length > 0 ? (
                  (templates as any[] || []).map((template: any) => (
                    <Card key={template.id} className="border-2 hover:border-indigo-200 transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Type:</span>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Criteria:</span>
                            <span className="font-medium">{template.evaluationCriteria?.length || 0} items</span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" className="flex-1">
                              <Target className="w-4 h-4 mr-1" />
                              Use
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No templates found. Create your first template to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(analytics as any)?.avgScoreByDepartment?.length > 0 ? (
                  <div className="space-y-4">
                    {((analytics as any)?.avgScoreByDepartment || []).map((dept: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{dept.department || 'Unknown'}</span>
                          <span className="text-sm font-bold">{dept.avgScore?.toFixed(1) || '0.0'}/5.0</span>
                        </div>
                        <Progress value={(dept.avgScore || 0) * 20} className="h-2" />
                        <p className="text-xs text-gray-500">{dept.reportCount} reports</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No department data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(analytics as any)?.monthlyTrends?.length > 0 ? (
                  <div className="space-y-4">
                    {((analytics as any)?.monthlyTrends || []).slice(-6).map((trend: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{trend.month}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{trend.avgScore?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-gray-500">({trend.reportCount} reports)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No trend data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals & Development Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Performance Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Goals management coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-500" />
                  Development Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Development plans coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Performance Template</DialogTitle>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit((data) => createTemplateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Monthly Performance Review" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Template description..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Template</FormLabel>
                      <div className="text-sm text-gray-500">
                        Make this template available for creating reports
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Performance Report</DialogTitle>
          </DialogHeader>
          <Form {...reportForm}>
            <form onSubmit={reportForm.handleSubmit((data) => createReportMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={reportForm.control}
                  name="staffMemberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(staffMembers as any[] || []).map((staff: any) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.firstName} {staff.lastName} - {staff.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={reportForm.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(templates as any[] || []).filter((t: any) => t.isActive).map((template: any) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={reportForm.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={reportForm.control}
                  name="reviewPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Period</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., January 2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={reportForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={reportForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={reportForm.control}
                name="reviewerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reviewer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reviewer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(staffMembers as any[] || []).filter((staff: any) => staff.isManager || staff.isAdmin).map((staff: any) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.firstName} {staff.lastName} - {staff.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createReportMutation.isPending}>
                  {createReportMutation.isPending ? 'Creating...' : 'Create Report'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Performance Evaluation Modal */}
      <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Performance Evaluation - {selectedReport?.staffMemberName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employee:</span> {selectedReport.staffMemberName}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {selectedReport.department}
                  </div>
                  <div>
                    <span className="font-medium">Review Period:</span> {selectedReport.reviewPeriod}
                  </div>
                  <div>
                    <span className="font-medium">Report Type:</span> {selectedReport.reportType}
                  </div>
                </div>
              </div>
              
              {selectedReport.status === 'draft' ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">This report is ready for evaluation.</p>
                  <Button onClick={() => {
                    // Here you would implement the evaluation form
                    // For now, we'll just show a placeholder
                    toast({
                      title: "Evaluation System",
                      description: "Evaluation form will be implemented here",
                    });
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Start Evaluation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Summary</h4>
                  {selectedReport.overallScore && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Overall Score:</span>
                        <span className="text-2xl font-bold text-indigo-600">
                          {selectedReport.overallScore}/5.0
                        </span>
                      </div>
                      {selectedReport.overallRating && (
                        <div className="flex items-center gap-2">
                          <span>Rating:</span>
                          {getRatingBadge(selectedReport.overallRating)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedReport.evaluations && selectedReport.evaluations.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium">Evaluation Details</h5>
                      {selectedReport.evaluations.map((evaluation: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{evaluation.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{evaluation.score}/5</span>
                              {evaluation.rating && getRatingBadge(evaluation.rating)}
                            </div>
                          </div>
                          {evaluation.comments && (
                            <p className="text-sm text-gray-600">{evaluation.comments}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}