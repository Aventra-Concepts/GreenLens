import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO, isValid } from "date-fns";
import { 
  Calendar, Clock, User, Mail, Phone, MessageSquare, DollarSign, Settings, Users, 
  BarChart3, Search, Filter, Download, Upload, Eye, Edit, Trash2, Plus,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Star, Target, Globe,
  Activity, PieChart as PieChartIcon, LineChart as LineChartIcon, FileText, Send, Archive, RefreshCw,
  MapPin, CreditCard, Zap, Award, Timer, Bell, Hash, Tag, UserCheck,
  ChevronDown, ChevronUp, ExternalLink, Copy, Phone as PhoneIcon,
  Video, Calendar as CalendarIcon, Clock as ClockIcon
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  houseNumber?: string;
  buildingName?: string;
  roadNumber?: string;
  colony?: string;
  area?: string;
  city: string;
  state: string;
  country: string;
  pinZip: string;
  problemDescription: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  amount: number;
  currency: string;
  paymentStatus?: string;
  paymentIntentId?: string;
  assignedExpertId?: string;
  consultationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Expert {
  id: string;
  name: string;
  email: string;
  specialization: string[];
  rating: number;
  totalConsultations: number;
  isAvailable: boolean;
  hourlyRate: number;
}

interface ConsultationMetrics {
  totalRequests: number;
  pendingRequests: number;
  completedConsultations: number;
  totalRevenue: number;
  avgRating: number;
  responseTime: number;
  conversionRate: number;
  expertUtilization: number;
}

const mockExperts: Expert[] = [
  {
    id: 'exp-1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@greenlens.ai',
    specialization: ['Plant Diseases', 'Indoor Gardens', 'Succulents'],
    rating: 4.9,
    totalConsultations: 245,
    isAvailable: true,
    hourlyRate: 75
  },
  {
    id: 'exp-2',
    name: 'Mark Peterson',
    email: 'mark@greenlens.ai',
    specialization: ['Outdoor Gardens', 'Vegetables', 'Soil Health'],
    rating: 4.7,
    totalConsultations: 189,
    isAvailable: false,
    hourlyRate: 65
  },
  {
    id: 'exp-3',
    name: 'Emma Rodriguez',
    email: 'emma@greenlens.ai',
    specialization: ['Herbs', 'Organic Farming', 'Pest Control'],
    rating: 4.8,
    totalConsultations: 156,
    isAvailable: true,
    hourlyRate: 70
  }
];

const mockMetrics: ConsultationMetrics = {
  totalRequests: 1247,
  pendingRequests: 23,
  completedConsultations: 1156,
  totalRevenue: 87650,
  avgRating: 4.7,
  responseTime: 2.4,
  conversionRate: 89.2,
  expertUtilization: 78.5
};

const revenueData = [
  { month: 'Jan', revenue: 6800, consultations: 89 },
  { month: 'Feb', revenue: 7200, consultations: 95 },
  { month: 'Mar', revenue: 8100, consultations: 108 },
  { month: 'Apr', revenue: 7900, consultations: 102 },
  { month: 'May', revenue: 8750, consultations: 115 },
  { month: 'Jun', revenue: 9200, consultations: 121 }
];

const statusDistribution = [
  { name: 'Completed', value: 78, count: 1156, color: '#22c55e' },
  { name: 'In Progress', value: 12, count: 178, color: '#3b82f6' },
  { name: 'Pending', value: 6, count: 89, color: '#f59e0b' },
  { name: 'Cancelled', value: 4, count: 59, color: '#ef4444' }
];

export default function ConsultationManagementDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expertFilter, setExpertFilter] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRequest | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch consultation requests
  const { data: consultationRequests = [], isLoading, refetch } = useQuery<ConsultationRequest[]>({
    queryKey: ['/api/consultation/admin/consultation-requests', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/consultation/admin/consultation-requests?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch consultation requests');
      const result = await response.json();
      return result.success ? result.data : [];
    },
    staleTime: 30000 // 30 seconds
  });

  // Update consultation status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes, expertId }: { 
      id: string; 
      status: string; 
      notes?: string; 
      expertId?: string;
    }) => {
      const response = await apiRequest("PUT", `/api/consultation/admin/consultation-requests/${id}/status`, {
        status,
        consultationNotes: notes,
        assignedExpertId: expertId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consultation/admin/consultation-requests'] });
      toast({
        title: "Status Updated",
        description: "Consultation status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk operations mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, action, expertId }: { 
      ids: string[]; 
      action: string; 
      expertId?: string;
    }) => {
      const promises = ids.map(id => 
        apiRequest("PUT", `/api/consultation/admin/consultation-requests/${id}/status`, {
          status: action,
          assignedExpertId: expertId,
        }).then(r => r.json())
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consultation/admin/consultation-requests'] });
      setSelectedRequests([]);
      setShowBulkActions(false);
      toast({
        title: "Bulk Update Complete",
        description: `${selectedRequests.length} consultations updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'payment_pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'scheduled': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid Date';
    } catch {
      return 'Invalid Date';
    }
  };

  const getFullAddress = (consultation: ConsultationRequest) => {
    const parts = [
      consultation.houseNumber,
      consultation.buildingName,
      consultation.roadNumber,
      consultation.colony,
      consultation.area,
      consultation.city,
      consultation.state,
      consultation.country,
      consultation.pinZip
    ].filter(Boolean);
    return parts.join(', ');
  };

  const exportConsultations = async (format: 'csv' | 'pdf') => {
    try {
      toast({
        title: "Export Started",
        description: `Generating ${format.toUpperCase()} report...`,
      });
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const filename = `consultations-${new Date().toISOString().split('T')[0]}.${format}`;
      
      toast({
        title: "Export Complete",
        description: `${format.toUpperCase()} report generated: ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = (action: string, expertId?: string) => {
    if (selectedRequests.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select consultations to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }
    
    bulkUpdateMutation.mutate({ ids: selectedRequests, action, expertId });
  };

  const filteredConsultations = consultationRequests.filter(consultation => {
    const matchesSearch = searchTerm === '' || 
      consultation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.problemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    const matchesExpert = expertFilter === 'all' || consultation.assignedExpertId === expertFilter;
    
    return matchesSearch && matchesStatus && matchesExpert;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consultation Management</h2>
          <p className="text-muted-foreground">
            Comprehensive dashboard for managing expert consultations and customer requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportConsultations('csv')} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportConsultations('pdf')} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockMetrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Avg response: {mockMetrics.responseTime}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ +8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Expert utilization: {mockMetrics.expertUtilization}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="experts">Experts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly consultation revenue and count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Consultation Status</CardTitle>
                <CardDescription>Distribution of consultation statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Eye className="w-5 h-5" />
                  Review Pending
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <UserCheck className="w-5 h-5" />
                  Assign Experts
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Sessions
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Send Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Consultation Requests</CardTitle>
              <CardDescription>Manage and track all consultation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or problem description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="payment_pending">Payment Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={expertFilter} onValueChange={setExpertFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by expert" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experts</SelectItem>
                    {mockExperts.map((expert) => (
                      <SelectItem key={expert.id} value={expert.id}>
                        {expert.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedRequests.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {selectedRequests.length} consultation(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => handleBulkAction(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Bulk Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assigned">Mark as Assigned</SelectItem>
                        <SelectItem value="scheduled">Mark as Scheduled</SelectItem>
                        <SelectItem value="completed">Mark as Completed</SelectItem>
                        <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRequests([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Consultation Requests List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2 text-muted-foreground">Loading consultations...</p>
                  </div>
                ) : filteredConsultations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No consultations found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                ) : (
                  filteredConsultations.map((consultation) => (
                    <Card key={consultation.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(consultation.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRequests([...selectedRequests, consultation.id]);
                                } else {
                                  setSelectedRequests(selectedRequests.filter(id => id !== consultation.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <div>
                              <h3 className="font-semibold">{consultation.name}</h3>
                              <p className="text-sm text-muted-foreground">{consultation.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(consultation.status)}>
                              {consultation.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {formatCurrency(consultation.amount, consultation.currency)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium">Problem Description</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {consultation.problemDescription}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Preferred Schedule</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(consultation.preferredDate)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {consultation.preferredTimeSlot}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {consultation.city}, {consultation.state}, {consultation.country}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(consultation.createdAt)}
                            </span>
                            {consultation.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {consultation.phoneNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Consultation Request Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for consultation #{consultation.id}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  {/* Customer Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">Customer Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium">Name</p>
                                        <p className="text-sm text-muted-foreground">{consultation.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{consultation.email}</p>
                                      </div>
                                      {consultation.phoneNumber && (
                                        <div>
                                          <p className="text-sm font-medium">Phone</p>
                                          <p className="text-sm text-muted-foreground">{consultation.phoneNumber}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Address Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">Address Information</h3>
                                    <p className="text-sm text-muted-foreground">{getFullAddress(consultation)}</p>
                                  </div>

                                  {/* Consultation Details */}
                                  <div>
                                    <h3 className="font-semibold mb-3">Consultation Details</h3>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-sm font-medium">Problem Description</p>
                                        <p className="text-sm text-muted-foreground">{consultation.problemDescription}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium">Preferred Date</p>
                                          <p className="text-sm text-muted-foreground">{formatDate(consultation.preferredDate)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Time Slot</p>
                                          <p className="text-sm text-muted-foreground">{consultation.preferredTimeSlot}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status and Payment */}
                                  <div>
                                    <h3 className="font-semibold mb-3">Status & Payment</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-sm font-medium">Status</p>
                                        <Badge className={getStatusColor(consultation.status)}>
                                          {consultation.status.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Amount</p>
                                        <p className="text-sm text-muted-foreground">
                                          {formatCurrency(consultation.amount, consultation.currency)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Payment Status</p>
                                        <p className="text-sm text-muted-foreground">
                                          {consultation.paymentStatus || 'Pending'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expert Assignment */}
                                  <div>
                                    <h3 className="font-semibold mb-3">Expert Assignment</h3>
                                    <div className="flex items-center gap-4">
                                      <Select 
                                        value={consultation.assignedExpertId || ''} 
                                        onValueChange={(expertId) => {
                                          updateStatusMutation.mutate({
                                            id: consultation.id,
                                            status: 'assigned',
                                            expertId
                                          });
                                        }}
                                      >
                                        <SelectTrigger className="w-64">
                                          <SelectValue placeholder="Assign an expert" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {mockExperts.filter(expert => expert.isAvailable).map((expert) => (
                                            <SelectItem key={expert.id} value={expert.id}>
                                              {expert.name} - {expert.specialization.join(', ')}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {consultation.assignedExpertId && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                          <UserCheck className="w-3 h-3" />
                                          Assigned to {mockExperts.find(e => e.id === consultation.assignedExpertId)?.name}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Consultation Notes */}
                                  <div>
                                    <h3 className="font-semibold mb-3">Consultation Notes</h3>
                                    <Textarea 
                                      placeholder="Add consultation notes..."
                                      value={consultation.consultationNotes || ''}
                                      onChange={(e) => {
                                        // This would typically update the local state
                                        // and save on blur or with a save button
                                      }}
                                      rows={4}
                                    />
                                    <Button 
                                      className="mt-2" 
                                      size="sm"
                                      onClick={() => {
                                        updateStatusMutation.mutate({
                                          id: consultation.id,
                                          status: consultation.status,
                                          notes: consultation.consultationNotes
                                        });
                                      }}
                                    >
                                      Save Notes
                                    </Button>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button 
                                      variant="outline"
                                      onClick={() => {
                                        navigator.clipboard.writeText(consultation.email);
                                        toast({
                                          title: "Email Copied",
                                          description: "Customer email copied to clipboard",
                                        });
                                      }}
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy Email
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => {
                                        window.open(`tel:${consultation.phoneNumber}`);
                                      }}
                                      disabled={!consultation.phoneNumber}
                                    >
                                      <PhoneIcon className="w-4 h-4 mr-2" />
                                      Call Customer
                                    </Button>
                                    <Button onClick={() => {
                                      updateStatusMutation.mutate({
                                        id: consultation.id,
                                        status: 'scheduled'
                                      });
                                    }}>
                                      <CalendarIcon className="w-4 h-4 mr-2" />
                                      Schedule Session
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Select 
                              value={consultation.status} 
                              onValueChange={(newStatus) => {
                                updateStatusMutation.mutate({
                                  id: consultation.id,
                                  status: newStatus
                                });
                              }}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experts Tab */}
        <TabsContent value="experts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expert Management</CardTitle>
              <CardDescription>Manage consultation experts and their availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockExperts.map((expert) => (
                  <Card key={expert.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{expert.name}</h3>
                          <p className="text-sm text-muted-foreground">{expert.email}</p>
                        </div>
                        <Badge 
                          variant={expert.isAvailable ? "default" : "secondary"}
                          className={expert.isAvailable ? "bg-green-100 text-green-800" : ""}
                        >
                          {expert.isAvailable ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Specializations</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {expert.specialization.map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Rating</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{expert.rating}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Consultations</p>
                            <p className="text-sm text-muted-foreground">{expert.totalConsultations}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Hourly Rate</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(expert.hourlyRate)}/hour
                          </p>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant={expert.isAvailable ? "outline" : "default"} 
                            size="sm" 
                            className="flex-1"
                          >
                            {expert.isAvailable ? "Set Busy" : "Set Available"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Expert
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-medium">{mockMetrics.avgRating}/5.0</span>
                  </div>
                  <Progress value={mockMetrics.avgRating * 20} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time (hours)</span>
                    <span className="text-sm font-medium">{mockMetrics.responseTime}h</span>
                  </div>
                  <Progress value={100 - (mockMetrics.responseTime * 10)} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="text-sm font-medium">{mockMetrics.conversionRate}%</span>
                  </div>
                  <Progress value={mockMetrics.conversionRate} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expert Utilization</span>
                    <span className="text-sm font-medium">{mockMetrics.expertUtilization}%</span>
                  </div>
                  <Progress value={mockMetrics.expertUtilization} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Experts */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Experts</CardTitle>
                <CardDescription>Based on ratings and consultation count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockExperts
                    .sort((a, b) => b.rating - a.rating)
                    .map((expert, index) => (
                      <div key={expert.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{expert.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {expert.totalConsultations} consultations
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{expert.rating}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Monthly revenue trends and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#22c55e" />
                  <Bar dataKey="consultations" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultation Settings</CardTitle>
              <CardDescription>Configure consultation management preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Settings */}
              <div>
                <h3 className="font-semibold mb-3">Pricing Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Default Consultation Fee</label>
                    <Input type="number" defaultValue="29.99" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Currency</label>
                    <Select defaultValue="USD">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="font-semibold mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email notifications for new requests</p>
                      <p className="text-xs text-muted-foreground">Get notified when customers submit consultation requests</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SMS alerts for urgent consultations</p>
                      <p className="text-xs text-muted-foreground">Receive SMS for high-priority or emergency consultations</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="font-semibold mb-3">Business Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Opening Time</label>
                    <Input type="time" defaultValue="09:00" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Closing Time</label>
                    <Input type="time" defaultValue="18:00" className="mt-1" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium">Working Days</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <Badge key={day} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auto-Assignment Rules */}
              <div>
                <h3 className="font-semibold mb-3">Auto-Assignment Rules</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable automatic expert assignment</p>
                      <p className="text-xs text-muted-foreground">Automatically assign experts based on specialization and availability</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Load balancing</p>
                      <p className="text-xs text-muted-foreground">Distribute consultations evenly among available experts</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}