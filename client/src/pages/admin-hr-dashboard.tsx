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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { PerformanceManagement } from "@/components/PerformanceManagement";
import { 
  Plus, Edit, Eye, Trash2, Users, Briefcase, Calendar, MapPin, DollarSign, FileText,
  Mail, Phone, ExternalLink, Download, Check, X, Clock, Filter, Search, 
  TrendingUp, BarChart3, PieChart, UserCheck, AlertTriangle, CheckCircle,
  Building2, GraduationCap, Award, Target, Heart, Shield, CreditCard,
  Timer, PlayCircle, PauseCircle, Star, FileCheck, Banknote, Calculator,
  Globe, UserX, UserPlus, Settings, Archive, RefreshCw, ChevronRight,
  Briefcase as BriefcaseIcon, Home, Laptop, Coffee, BookOpen,
  TrendingDown, Activity, LineChart, Database, Bell, Flag, MessageSquare,
  ClipboardList, UserCog, Zap, Layers, Network, BarChart, Camera,
  Upload, CloudUpload, Paperclip, Lock, Unlock, ArrowRight, ArrowLeft,
  IndianRupee, Percent, Receipt, PlusCircle
} from "lucide-react";

// Enhanced Employee Profile Schema
const employeeProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("USA"),
  postalCode: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  employmentType: z.enum(["full-time", "part-time", "contract", "intern"]),
  workLocation: z.enum(["remote", "office", "hybrid"]),
  dateOfJoining: z.string().min(1, "Join date is required"),
  baseSalary: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  payFrequency: z.enum(["monthly", "bi-weekly", "weekly"]).default("monthly"),
  status: z.enum(["active", "inactive", "terminated", "resigned"]).default("active"),
});

// Leave Request Schema
const leaveRequestSchema = z.object({
  staffMemberId: z.string().min(1, "Employee is required"),
  leaveType: z.enum(["annual", "sick", "maternity", "paternity", "emergency", "unpaid"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(1, "Reason is required"),
  isEmergency: z.boolean().default(false),
});

// Salary Advance Schema
const salaryAdvanceSchema = z.object({
  staffMemberId: z.string().min(1, "Employee is required"),
  requestedAmount: z.number().min(1, "Amount must be greater than 0"),
  reason: z.string().min(1, "Reason is required"),
  repaymentPeriod: z.number().min(1).max(12, "Repayment period must be 1-12 months"),
});

// Performance Review Schema
const performanceReviewSchema = z.object({
  staffMemberId: z.string().min(1, "Employee is required"),
  reviewPeriod: z.string().min(1, "Review period is required"),
  overallRating: z.number().min(1).max(10),
  technicalRating: z.number().min(1).max(10),
  communicationRating: z.number().min(1).max(10),
  teamworkRating: z.number().min(1).max(10),
  goals: z.string().min(1, "Goals are required"),
  achievements: z.string().min(1, "Achievements are required"),
  improvementAreas: z.string().optional(),
  nextReviewDate: z.string().min(1, "Next review date is required"),
});

type EmployeeProfileFormData = z.infer<typeof employeeProfileSchema>;
type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
type SalaryAdvanceFormData = z.infer<typeof salaryAdvanceSchema>;
type PerformanceReviewFormData = z.infer<typeof performanceReviewSchema>;

interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  employmentType: string;
  workLocation?: string;
  dateOfJoining: string;
  baseSalary?: number;
  currency: string;
  status: string;
  profileImageUrl?: string;
}

interface EmployeeRecord {
  id: string;
  staffMemberId: string;
  totalAnnualLeave: number;
  usedAnnualLeave: number;
  remainingAnnualLeave: number;
  totalSickLeave: number;
  usedSickLeave: number;
  remainingSickLeave: number;
  presentDays: number;
  absentDays: number;
  lateArrivals: number;
  overtimeHours: number;
  currentSalary?: number;
  lastSalaryReview?: string;
  nextSalaryReview?: string;
  healthInsurance: boolean;
  dentalInsurance: boolean;
  retirementPlan: boolean;
}

interface LeaveRequest {
  id: string;
  staffMemberId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  isEmergency: boolean;
}

interface SalaryAdvance {
  id: string;
  staffMemberId: string;
  employeeName: string;
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  status: string;
  repaymentPeriod?: number;
  monthlyDeduction?: number;
  remainingAmount?: number;
  createdAt: string;
}

interface HRAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  averageSalary: number;
  totalPayroll: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  pendingSalaryAdvances: number;
  averageAttendance: number;
  departmentBreakdown: Array<{ department: string; count: number; }>;
  employmentTypeBreakdown: Array<{ type: string; count: number; }>;
}

export default function AdminHRDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<StaffMember | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch HR Analytics
  const { data: hrAnalytics, isLoading: analyticsLoading } = useQuery<HRAnalytics>({
    queryKey: ['/api/hr/analytics'],
  });

  // Fetch staff members
  const { data: staffMembers = [], isLoading: staffLoading } = useQuery<StaffMember[]>({
    queryKey: ['/api/hr/staff'],
  });

  // Fetch employee records
  const { data: employeeRecords = [], isLoading: recordsLoading } = useQuery<EmployeeRecord[]>({
    queryKey: ['/api/hr/employee-records'],
  });

  // Fetch leave requests
  const { data: leaveRequests = [], isLoading: leavesLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['/api/hr/leave-requests'],
  });

  // Fetch salary advances
  const { data: salaryAdvances = [], isLoading: advancesLoading } = useQuery<SalaryAdvance[]>({
    queryKey: ['/api/hr/salary-advances'],
  });

  // Employee form
  const employeeForm = useForm<EmployeeProfileFormData>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: {
      country: 'USA',
      currency: 'USD',
      payFrequency: 'monthly',
      status: 'active',
      employmentType: 'full-time',
      workLocation: 'office',
    }
  });

  // Leave request form
  const leaveForm = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveType: 'annual',
      isEmergency: false,
    }
  });

  // Salary advance form
  const advanceForm = useForm<SalaryAdvanceFormData>({
    resolver: zodResolver(salaryAdvanceSchema),
    defaultValues: {
      repaymentPeriod: 3,
    }
  });

  // Performance review form
  const performanceForm = useForm<PerformanceReviewFormData>({
    resolver: zodResolver(performanceReviewSchema),
  });

  // Create/Update employee
  const saveEmployee = useMutation({
    mutationFn: async (data: EmployeeProfileFormData & { id?: string }) => {
      const { id, ...employeeData } = data;
      if (id) {
        return apiRequest(`/api/hr/staff/${id}`, 'PUT', employeeData);
      } else {
        return apiRequest('/api/hr/staff', 'POST', employeeData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: selectedEmployee ? "Employee updated successfully" : "Employee added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/analytics'] });
      setIsEmployeeModalOpen(false);
      setSelectedEmployee(null);
      employeeForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      });
    },
  });

  // Create leave request
  const createLeaveRequest = useMutation({
    mutationFn: async (data: LeaveRequestFormData) => {
      return apiRequest('/api/hr/leave-requests', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Leave request created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/leave-requests'] });
      setIsLeaveModalOpen(false);
      leaveForm.reset();
    },
  });

  // Create salary advance
  const createSalaryAdvance = useMutation({
    mutationFn: async (data: SalaryAdvanceFormData) => {
      return apiRequest('/api/hr/salary-advances', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Salary advance request created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/salary-advances'] });
      setIsAdvanceModalOpen(false);
      advanceForm.reset();
    },
  });

  // Update leave status
  const updateLeaveStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/hr/leave-requests/${id}/status`, 'PATCH', { status });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Leave request status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/leave-requests'] });
    },
  });

  // Update advance status
  const updateAdvanceStatus = useMutation({
    mutationFn: async ({ id, status, approvedAmount }: { id: string; status: string; approvedAmount?: number }) => {
      return apiRequest(`/api/hr/salary-advances/${id}/status`, 'PATCH', { status, approvedAmount });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Salary advance status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/salary-advances'] });
    },
  });

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    employeeForm.reset();
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (employee: StaffMember) => {
    setSelectedEmployee(employee);
    employeeForm.reset({
      ...employee,
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '',
    });
    setIsEmployeeModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'resigned': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'annual': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'sick': return <Heart className="w-4 h-4 text-red-500" />;
      case 'maternity': case 'paternity': return <Users className="w-4 h-4 text-pink-500" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredEmployees = staffMembers.filter(emp => {
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (analyticsLoading || staffLoading) {
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Human Resources Dashboard</h1>
              <p className="text-gray-600">Comprehensive employee management and HR operations</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/admin-dashboard'}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Button>
              <Button onClick={handleCreateEmployee} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="recruitment" className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4" />
              Recruitment
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Employees</p>
                      <p className="text-3xl font-bold text-blue-900">{hrAnalytics?.totalEmployees || staffMembers.length}</p>
                      <p className="text-xs text-blue-600">{hrAnalytics?.activeEmployees || 0} active</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">New Hires</p>
                      <p className="text-3xl font-bold text-green-900">{hrAnalytics?.newHiresThisMonth || 0}</p>
                      <p className="text-xs text-green-600">This month</p>
                    </div>
                    <UserPlus className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Payroll</p>
                      <p className="text-3xl font-bold text-purple-900">${hrAnalytics?.totalPayroll?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-purple-600">Monthly</p>
                    </div>
                    <Banknote className="w-10 h-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Avg Attendance</p>
                      <p className="text-3xl font-bold text-orange-900">{hrAnalytics?.averageAttendance || 95}%</p>
                      <p className="text-xs text-orange-600">This month</p>
                    </div>
                    <Activity className="w-10 h-10 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department and Employment Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Department Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hrAnalytics?.departmentBreakdown?.map((dept, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept.department}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(dept.count / (hrAnalytics?.totalEmployees || 1)) * 100} className="w-20" />
                          <span className="text-sm text-gray-600">{dept.count}</span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">No department data available</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Employment Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hrAnalytics?.employmentTypeBreakdown?.map((type, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{type.type}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(type.count / (hrAnalytics?.totalEmployees || 1)) * 100} className="w-20" />
                          <span className="text-sm text-gray-600">{type.count}</span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">No employment type data available</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200" onClick={() => setActiveTab('leave')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Pending Leave</p>
                      <p className="text-2xl font-bold text-green-900">
                        {leaveRequests.filter(l => l.status === 'pending').length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200" onClick={() => setActiveTab('payroll')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Salary Advances</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {salaryAdvances.filter(a => a.status === 'pending').length}
                      </p>
                    </div>
                    <CreditCard className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-purple-200" onClick={() => setActiveTab('recruitment')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Open Positions</p>
                      <p className="text-2xl font-bold text-purple-900">5</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-orange-200" onClick={() => setActiveTab('performance')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Reviews Due</p>
                      <p className="text-2xl font-bold text-orange-900">3</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                      <SelectItem value="resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
              <Button onClick={handleCreateEmployee} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => {
                const employeeRecord = employeeRecords.find(r => r.staffMemberId === employee.id);
                return (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={employee.profileImageUrl} />
                            <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-gray-600">{employee.employeeId}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">{employee.department}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{employee.position}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{employee.email}</span>
                        </div>
                        {employee.baseSalary && (
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                            <span>${employee.baseSalary.toLocaleString()} {employee.currency}</span>
                          </div>
                        )}
                      </div>

                      {employeeRecord && (
                        <div className="pt-3 border-t space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Annual Leave</span>
                            <span>{employeeRecord.remainingAnnualLeave}/{employeeRecord.totalAnnualLeave} days</span>
                          </div>
                          <Progress 
                            value={(employeeRecord.usedAnnualLeave / employeeRecord.totalAnnualLeave) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Attendance: {((employeeRecord.presentDays / (employeeRecord.presentDays + employeeRecord.absentDays)) * 100 || 100).toFixed(1)}%</span>
                            <span>Late: {employeeRecord.lateArrivals}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEmployee(employee)}
                          className="flex-1"
                          data-testid={`button-edit-employee-${employee.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* View employee profile */}}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <AttendanceManagement />
          </TabsContent>

          {/* Leave Management Tab */}
          <TabsContent value="leave" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
                <p className="text-gray-600">Manage employee leave requests and time off</p>
              </div>
              <Button onClick={() => setIsLeaveModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Leave Request
              </Button>
            </div>

            {/* Leave Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {leaveRequests.filter(l => l.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Approved</p>
                      <p className="text-2xl font-bold text-green-900">
                        {leaveRequests.filter(l => l.status === 'approved').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-900">
                        {leaveRequests.filter(l => l.status === 'rejected').length}
                      </p>
                    </div>
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Days</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {leaveRequests.reduce((sum, l) => sum + l.totalDays, 0)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leave Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getLeaveTypeIcon(leave.leaveType)}
                        <div>
                          <p className="font-medium">{leave.employeeName}</p>
                          <p className="text-sm text-gray-600">
                            {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} 
                            ({leave.totalDays} days)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status}
                        </Badge>
                        {leave.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => updateLeaveStatus.mutate({ id: leave.id, status: 'approved' })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateLeaveStatus.mutate({ id: leave.id, status: 'rejected' })}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {leaveRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No leave requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <PayrollManagement />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceManagement />
          </TabsContent>

          {/* Recruitment Tab */}
          <TabsContent value="recruitment" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h2>
                <p className="text-gray-600">Manage job postings and hiring process</p>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Job Posting
              </Button>
            </div>

            {/* Recruitment Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">8</p>
                  <p className="text-sm text-blue-600">Open Positions</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-900">24</p>
                  <p className="text-sm text-yellow-600">Applications</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">12</p>
                  <p className="text-sm text-purple-600">Interviews</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-900">3</p>
                  <p className="text-sm text-orange-600">Offers Made</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">2</p>
                  <p className="text-sm text-green-600">Hired</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Job Postings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Active Job Postings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Senior React Developer', 'Marketing Manager', 'UI/UX Designer', 'Data Analyst', 'Customer Success Manager'].map((title, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-sm text-gray-600">Engineering • Remote • Full-time</p>
                          <p className="text-xs text-gray-500">Posted 2 days ago • {Math.floor(Math.random() * 20) + 5} applications</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">HR Analytics & Reports</h2>
              <p className="text-gray-600">Comprehensive insights into workforce metrics</p>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Workforce Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Employee Retention Rate</span>
                      <span className="font-semibold text-green-600">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Tenure</span>
                      <span className="font-semibold text-blue-600">2.8 years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Internal Promotions</span>
                      <span className="font-semibold text-purple-600">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Employee Satisfaction</span>
                      <span className="font-semibold text-orange-600">8.7/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Diversity & Inclusion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gender Diversity</span>
                      <span className="font-semibold">52% F / 48% M</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Age Range</span>
                      <span className="font-semibold">25-45 avg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Remote Workers</span>
                      <span className="font-semibold text-blue-600">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">International</span>
                      <span className="font-semibold text-green-600">23%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Compensation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engineering Avg</span>
                      <span className="font-semibold text-green-600">$95,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing Avg</span>
                      <span className="font-semibold text-blue-600">$72,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Operations Avg</span>
                      <span className="font-semibold text-purple-600">$68,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pay Equity Score</span>
                      <span className="font-semibold text-orange-600">A+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500" />
                    Turnover Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Turnover</span>
                      <span className="font-semibold text-red-600">2.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Annual Projection</span>
                      <span className="font-semibold text-orange-600">8.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Exit Interviews</span>
                      <span className="font-semibold text-blue-600">100%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Voluntary Exits</span>
                      <span className="font-semibold text-purple-600">75%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Downloadable Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Downloadable Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Employee Directory', desc: 'Complete employee list with contact info', icon: Users },
                    { name: 'Payroll Summary', desc: 'Monthly payroll breakdown by department', icon: DollarSign },
                    { name: 'Attendance Report', desc: 'Employee attendance and punctuality metrics', icon: Clock },
                    { name: 'Leave Balance', desc: 'Current leave balances for all employees', icon: Calendar },
                    { name: 'Performance Dashboard', desc: 'Performance ratings and review summaries', icon: Star },
                    { name: 'Recruitment Pipeline', desc: 'Current hiring status and candidate flow', icon: Briefcase },
                  ].map((report, idx) => {
                    const IconComponent = report.icon;
                    return (
                      <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{report.name}</h4>
                              <p className="text-xs text-gray-500">{report.desc}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="w-4 h-4 mr-1" />
                            Download PDF
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Employee Profile Modal */}
        <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? 'Edit Employee Profile' : 'Add New Employee'}</DialogTitle>
            </DialogHeader>
            
            <Form {...employeeForm}>
              <form onSubmit={employeeForm.handleSubmit((data) => saveEmployee.mutate(selectedEmployee ? { ...data, id: selectedEmployee.id } : data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={employeeForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position *</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="workLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="dateOfJoining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Joining *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="baseSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Salary</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="75000" 
                            {...field}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employeeForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                            <SelectItem value="resigned">Resigned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEmployeeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {selectedEmployee ? 'Update Employee' : 'Add Employee'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Leave Request Modal */}
        <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Leave Request</DialogTitle>
            </DialogHeader>
            
            <Form {...leaveForm}>
              <form onSubmit={leaveForm.handleSubmit((data) => createLeaveRequest.mutate(data))} className="space-y-4">
                <FormField
                  control={leaveForm.control}
                  name="staffMemberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staffMembers.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName} - {emp.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={leaveForm.control}
                    name="leaveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="annual">Annual Leave</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="maternity">Maternity Leave</SelectItem>
                            <SelectItem value="paternity">Paternity Leave</SelectItem>
                            <SelectItem value="emergency">Emergency Leave</SelectItem>
                            <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={leaveForm.control}
                    name="isEmergency"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Emergency Leave</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Mark as emergency for priority processing
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={leaveForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={leaveForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={leaveForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please provide reason for leave..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsLeaveModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Leave Request
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Salary Advance Modal */}
        <Dialog open={isAdvanceModalOpen} onOpenChange={setIsAdvanceModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Salary Advance Request</DialogTitle>
            </DialogHeader>
            
            <Form {...advanceForm}>
              <form onSubmit={advanceForm.handleSubmit((data) => createSalaryAdvance.mutate(data))} className="space-y-4">
                <FormField
                  control={advanceForm.control}
                  name="staffMemberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staffMembers.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName} - {emp.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={advanceForm.control}
                    name="requestedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Amount *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5000" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={advanceForm.control}
                    name="repaymentPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repayment Period (Months) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="12" 
                            placeholder="3" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={advanceForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please provide reason for salary advance..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAdvanceModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Create Advance Request
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Attendance Management Component
const AttendanceManagement = () => {
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isRecordingLogin, setIsRecordingLogin] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [workLocation, setWorkLocation] = useState('office');
  const [notes, setNotes] = useState('');

  // Queries
  const { data: attendanceRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['/api/hr/attendance'],
    retry: false,
  });

  const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
    queryKey: ['/api/hr/staff'],
    retry: false,
  });

  const { data: todayAttendance = [] } = useQuery({
    queryKey: ['/api/hr/attendance', { startDate: attendanceDate, endDate: attendanceDate }],
    retry: false,
  });

  // Mutations
  const recordLoginMutation = useMutation({
    mutationFn: async ({ staffMemberId, workLocation, notes }: any) => {
      return await apiRequest('/api/hr/attendance/login', {
        method: 'POST',
        body: JSON.stringify({ staffMemberId, workLocation, notes }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Login Recorded",
        description: "Employee login time has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/attendance'] });
      setSelectedEmployee('');
      setWorkLocation('office');
      setNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to record login time.",
        variant: "destructive",
      });
    },
  });

  const recordLogoutMutation = useMutation({
    mutationFn: async ({ recordId, notes }: any) => {
      return await apiRequest(`/api/hr/attendance/${recordId}/logout`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Logout Recorded",
        description: "Employee logout time has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/attendance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to record logout time.",
        variant: "destructive",
      });
    },
  });

  const createManualRecordMutation = useMutation({
    mutationFn: async (recordData: any) => {
      return await apiRequest('/api/hr/attendance', {
        method: 'POST',
        body: JSON.stringify(recordData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Attendance Record Created",
        description: "Manual attendance record has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/attendance'] });
      setIsManualModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create attendance record.",
        variant: "destructive",
      });
    },
  });

  const handleRecordLogin = () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee first.",
        variant: "destructive",
      });
      return;
    }

    recordLoginMutation.mutate({
      staffMemberId: selectedEmployee,
      workLocation,
      notes,
    });
  };

  const handleRecordLogout = (recordId: string) => {
    recordLogoutMutation.mutate({
      recordId,
      notes: '',
    });
  };

  // Get today's statistics
  const todayStats = {
    present: todayAttendance.filter((r: any) => r.status === 'present' || r.status === 'late').length,
    absent: staffMembers.length - todayAttendance.length,
    late: todayAttendance.filter((r: any) => r.isLate).length,
    remote: todayAttendance.filter((r: any) => r.workLocation === 'remote').length,
  };

  if (recordsLoading || staffLoading) {
    return <div className="flex justify-center p-8">Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Track employee login/logout times and manage attendance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsManualModalOpen(true)} 
            variant="outline"
            data-testid="button-create-manual-record"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Record
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            data-testid="button-refresh-attendance"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Login Recording Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Record Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="employee-select">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger id="employee-select" data-testid="select-employee">
                  <SelectValue placeholder="Choose employee..." />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff: any) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName} ({staff.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="work-location">Work Location</Label>
              <Select value={workLocation} onValueChange={setWorkLocation}>
                <SelectTrigger id="work-location" data-testid="select-work-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="client_site">Client Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                data-testid="input-notes"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleRecordLogin}
                disabled={recordLoginMutation.isPending || !selectedEmployee}
                className="w-full"
                data-testid="button-record-login"
              >
                {recordLoginMutation.isPending ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                Record Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Present</p>
                <p className="text-2xl font-bold text-green-900">{todayStats.present}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-900">{todayStats.absent}</p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Late</p>
                <p className="text-2xl font-bold text-yellow-900">{todayStats.late}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Remote</p>
                <p className="text-2xl font-bold text-blue-900">{todayStats.remote}</p>
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Attendance Records ({attendanceDate})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAttendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records for today
            </div>
          ) : (
            <div className="space-y-2">
              {todayAttendance.map((record: any) => {
                const staff = staffMembers.find((s: any) => s.id === record.staffMemberId);
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {staff ? `${staff.firstName[0]}${staff.lastName[0]}` : 'UK'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Employee'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {staff?.employeeId} • {record.workLocation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-medium">In:</span> {
                            record.loginTime ? new Date(record.loginTime).toLocaleTimeString() : 'Not recorded'
                          }
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Out:</span> {
                            record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : 'Not recorded'
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={record.isLate ? "destructive" : "secondary"}>
                          {record.status}
                        </Badge>
                        {record.loginTime && !record.logoutTime && (
                          <Button
                            size="sm"
                            onClick={() => handleRecordLogout(record.id)}
                            disabled={recordLogoutMutation.isPending}
                            data-testid={`button-logout-${record.id}`}
                          >
                            <PauseCircle className="w-4 h-4 mr-1" />
                            Logout
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Attendance Record Dialog */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Manual Attendance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger data-testid="select-manual-employee">
                  <SelectValue placeholder="Choose employee..." />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff: any) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                data-testid="input-manual-date"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Login Time</Label>
                <Input type="time" data-testid="input-login-time" />
              </div>
              <div>
                <Label>Logout Time</Label>
                <Input type="time" data-testid="input-logout-time" />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select defaultValue="present">
                <SelectTrigger data-testid="select-manual-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsManualModalOpen(false)}
                data-testid="button-cancel-manual"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {/* Handle manual record creation */}}
                data-testid="button-create-manual"
              >
                Create Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Comprehensive Payroll Management Component
const PayrollManagement = () => {
  const [activePayrollTab, setActivePayrollTab] = useState("overview");
  const [isPayrollPeriodModalOpen, setIsPayrollPeriodModalOpen] = useState(false);
  const [isSalaryStructureModalOpen, setIsSalaryStructureModalOpen] = useState(false);
  const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState(false);

  // Fetch payroll data
  const { data: payrollPeriods = [], isLoading: periodsLoading } = useQuery({
    queryKey: ["/api/hr/payroll/periods"],
    refetchInterval: 30000,
  });

  const { data: salaryStructures = [], isLoading: structuresLoading } = useQuery({
    queryKey: ["/api/hr/payroll/salary-structures"],
    refetchInterval: 30000,
  });

  const { data: statutoryRates, isLoading: statutoryLoading } = useQuery({
    queryKey: ["/api/hr/payroll/statutory-rates"],
    refetchInterval: 30000,
  });

  const { data: payrollAnalytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/hr/payroll/analytics"],
    refetchInterval: 30000,
  });

  // Create payroll period mutation
  const createPeriodMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/hr/payroll/periods", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payroll period created successfully" });
      setIsPayrollPeriodModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll/periods"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Process payroll mutation
  const processPayrollMutation = useMutation({
    mutationFn: async ({ periodId, staffIds }: { periodId: string; staffIds?: string[] }) => {
      const response = await apiRequest(`/api/hr/payroll/process/${periodId}`, {
        method: "POST",
        body: JSON.stringify({ staffMemberIds: staffIds }),
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Success", 
        description: `Payroll processed for ${data.processed} employees` 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hr/payroll"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
          <p className="text-gray-600">Comprehensive payroll system with Indian compliance</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsStatutoryModalOpen(true)} 
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Settings className="w-4 h-4 mr-2" />
            Statutory Settings
          </Button>
          <Button 
            onClick={() => setIsPayrollPeriodModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Period
          </Button>
        </div>
      </div>

      {/* Payroll Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Payroll</p>
                <p className="text-2xl font-bold text-green-900">
                  ₹{(payrollAnalytics.totalPaid || 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600">This month</p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Employees Paid</p>
                <p className="text-2xl font-bold text-blue-900">
                  {payrollAnalytics.paidRecords || 0}
                </p>
                <p className="text-xs text-blue-600">Records processed</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Salary</p>
                <p className="text-2xl font-bold text-orange-900">
                  ₹{(payrollAnalytics.averagePayment || 0).toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">Per employee</p>
              </div>
              <Calculator className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-purple-900">98.5%</p>
                <p className="text-xs text-purple-600">PF, ESI, TDS</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Management Tabs */}
      <Tabs value={activePayrollTab} onValueChange={setActivePayrollTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="periods">Periods</TabsTrigger>
          <TabsTrigger value="structures">Salary Structures</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Payroll Periods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Payroll Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payrollPeriods.slice(0, 5).map((period: any) => (
                    <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{period.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={period.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                       period.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                       'bg-gray-100 text-gray-800'}>
                          {period.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statutory Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Statutory Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">PF Compliance</p>
                        <p className="text-sm text-green-600">Employee: 12% | Employer: 12%</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">ESI Compliance</p>
                        <p className="text-sm text-blue-600">Employee: 0.75% | Employer: 3.25%</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-900">TDS Compliance</p>
                        <p className="text-sm text-orange-600">As per Income Tax Act</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Periods Tab */}
        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Periods</CardTitle>
              <p className="text-sm text-gray-600">Manage monthly, quarterly, and annual payroll periods</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {periodsLoading ? (
                  <div className="text-center py-8">Loading periods...</div>
                ) : payrollPeriods.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No payroll periods found</p>
                    <Button 
                      onClick={() => setIsPayrollPeriodModalOpen(true)}
                      className="mt-4"
                    >
                      Create First Period
                    </Button>
                  </div>
                ) : (
                  payrollPeriods.map((period: any) => (
                    <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{period.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {period.totalEmployees || 0} employees | ₹{(period.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={period.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                       period.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                       'bg-gray-100 text-gray-800'}>
                          {period.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {period.status === 'draft' && (
                            <Button 
                              size="sm" 
                              onClick={() => processPayrollMutation.mutate({ periodId: period.id })}
                              disabled={processPayrollMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Structures Tab */}
        <TabsContent value="structures" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Salary Structures</CardTitle>
                  <p className="text-sm text-gray-600">Define salary components and benefits</p>
                </div>
                <Button onClick={() => setIsSalaryStructureModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Structure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {structuresLoading ? (
                  <div className="text-center py-8">Loading structures...</div>
                ) : salaryStructures.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No salary structures found</p>
                  </div>
                ) : (
                  salaryStructures.map((structure: any) => (
                    <div key={structure.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">{structure.employeeName}</p>
                          <p className="text-sm text-gray-600">
                            Basic: ₹{structure.basicSalary?.toLocaleString()} | 
                            HRA: ₹{structure.hra?.toLocaleString()} | 
                            Gross: ₹{structure.grossSalary?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Effective from: {new Date(structure.effectiveFrom).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={structure.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {structure.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing</CardTitle>
              <p className="text-sm text-gray-600">Process monthly salary calculations with statutory compliance</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Payroll Calculation Process</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span>Attendance Integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Statutory Deductions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-blue-600" />
                      <span>Tax Calculations</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Quick Process Current Month</h4>
                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={() => {
                        const currentPeriod = payrollPeriods.find((p: any) => p.status === 'draft');
                        if (currentPeriod) {
                          processPayrollMutation.mutate({ periodId: currentPeriod.id });
                        } else {
                          toast({ 
                            title: "No Active Period", 
                            description: "Please create a payroll period first",
                            variant: "destructive" 
                          });
                        }
                      }}
                      disabled={processPayrollMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processPayrollMutation.isPending ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Process All Employees
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-600">
                      This will calculate salaries for all active employees including PF, ESI, and TDS deductions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Payroll Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="w-4 h-4 mr-2" />
                  Monthly Payroll Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  PF & ESI Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Percent className="w-4 h-4 mr-2" />
                  TDS Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Cost Center Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Excel Export
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Salary Slips
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Bank Transfer File
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Period
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payroll Period Modal */}
      <Dialog open={isPayrollPeriodModalOpen} onOpenChange={setIsPayrollPeriodModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payroll Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Period Name</Label>
              <Input placeholder="e.g., January 2024" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Monthly payroll for January 2024" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPayrollPeriodModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Handle period creation
                  toast({ title: "Success", description: "Payroll period created" });
                  setIsPayrollPeriodModalOpen(false);
                }}
              >
                Create Period
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};