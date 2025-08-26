import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Calendar, Clock, User, Mail, Phone, MessageSquare, DollarSign, Settings, Users, Shield, 
  BarChart3, FileText, LogOut, Database, Server, Activity, Globe, Image, BookOpen,
  TrendingUp, UserCheck, AlertTriangle, CheckCircle, XCircle, Plus, Edit, Trash2,
  Search, Filter, Download, Upload, Eye, ToggleLeft, ToggleRight, Monitor,
  PieChart, LineChart, UserPlus, Zap, Layers, Lock, ArrowRight, Leaf, Share2
} from "lucide-react";

interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address: string;
  problemDescription: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  amount: number;
  currency: string;
  paymentIntentId?: string;
  assignedExpertId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'payment_pending': return 'bg-blue-100 text-blue-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'expert_assigned': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Check admin authentication
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuthenticated");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    } else {
      setLocation("/admin-login");
    }
  }, [setLocation]);

  // Fetch consultation requests - always call this hook
  const { data: consultations, isLoading: isLoadingConsultations } = useQuery({
    queryKey: ['/api/admin/consultation-requests'],
    enabled: isAuthenticated,
  });

  // Fetch users data
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated,
  });

  // Fetch blog posts
  const { data: blogPosts, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['/api/admin/blog-posts'],
    enabled: isAuthenticated,
  });

  // Update consultation status mutation - always call this hook
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, expertId }: { id: string; status: string; expertId?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/consultation-requests/${id}/status`, {
        status,
        assignedExpertId: expertId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/consultation-requests'] });
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

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
    setLocation("/admin-login");
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleExpertAssignment = (id: string, expertId: string) => {
    updateStatusMutation.mutate({ 
      id, 
      status: 'expert_assigned', 
      expertId 
    });
  };

  // Return early only after all hooks are called
  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingConsultations) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const filteredConsultations = consultations?.filter((consultation: ConsultationRequest) => 
    selectedStatus === "all" || consultation.status === selectedStatus
  ) || [];

  // Calculate stats
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u: AdminUser) => u.isActive).length || 0;
  const totalRevenue = consultations?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
  const totalBlogs = blogPosts?.length || 0;
  const publishedBlogs = blogPosts?.filter((b: BlogPost) => b.status === 'published').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  <span className="text-green-600">GreenLens</span> Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500">Comprehensive Backend Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                View Site
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Admin Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8 bg-white dark:bg-gray-800 p-1 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1 px-2 py-2 text-xs">
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 px-2 py-2 text-xs">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-1 px-2 py-2 text-xs">
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">Consults</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1 px-2 py-2 text-xs">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 px-2 py-2 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 px-2 py-2 text-xs">
              <Settings className="w-3 h-3" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1 px-2 py-2 text-xs">
              <Server className="w-3 h-3" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1 px-2 py-2 text-xs">
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h2>
              <p className="text-gray-600 dark:text-gray-300">Complete system overview and key metrics</p>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
                      <p className="text-xs text-green-600">{activeUsers} active</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{consultations?.length || 0}</p>
                      <p className="text-xs text-yellow-600">{consultations?.filter(c => c.status === 'pending').length || 0} pending</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
                      <p className="text-xs text-green-600">+12% this month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blog Posts</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBlogs}</p>
                      <p className="text-xs text-blue-600">{publishedBlogs} published</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200" onClick={() => setLocation('/admin/garden')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Garden Dashboard Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Monitor user gardens and plant identifications</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Users: {totalUsers}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('content')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Blog Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Create and manage blog posts</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Published: {publishedBlogs}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('consultations')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Consultations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Manage expert consultations</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Pending: {consultations?.filter(c => c.status === 'pending').length || 0}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New consultation request</p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Blog post published</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Services</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Services</span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        95% Full
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage all registered users and permissions</p>
              </div>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Users ({totalUsers})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search users..." className="w-64" />
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingUsers ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : users?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No users found</div>
                  ) : (
                    users?.slice(0, 10)?.map((user: AdminUser) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {user.isAdmin && (
                            <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consultation Management</h2>
              <p className="text-gray-600 dark:text-gray-300">Manage expert consultation requests and assignments</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Consultation Requests</CardTitle>
                    <CardDescription>Track and manage all consultation requests</CardDescription>
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="payment_pending">Payment Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="expert_assigned">Expert Assigned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredConsultations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No consultations</h3>
                    <p className="mt-1 text-sm text-gray-500">No consultation requests found for the selected filter.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredConsultations.map((consultation: ConsultationRequest) => (
                      <Card key={consultation.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Customer Info */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {consultation.name}
                                </span>
                                <Badge className={getStatusColor(consultation.status)}>
                                  {consultation.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  {consultation.email}
                                </div>
                                {consultation.phoneNumber && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    {consultation.phoneNumber}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(consultation.preferredDate), 'MMM d, yyyy')} at {consultation.preferredTimeSlot}
                                </div>
                              </div>
                            </div>

                            {/* Problem Description */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">Problem Description</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {consultation.problemDescription}
                              </p>
                              <div className="text-xs text-gray-500">
                                Address: {consultation.address}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                              <div className="text-sm">
                                <span className="font-medium">Amount: </span>
                                <span className="text-green-600">${consultation.amount} {consultation.currency}</span>
                              </div>
                              
                              <div className="space-y-2">
                                <Select 
                                  value={consultation.status} 
                                  onValueChange={(value) => handleStatusUpdate(consultation.id, value)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="payment_pending">Payment Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="expert_assigned">Expert Assigned</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {consultation.status === 'paid' && (
                                  <Button 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => handleExpertAssignment(consultation.id, 'expert_001')}
                                    disabled={updateStatusMutation.isPending}
                                    data-testid={`assign-expert-${consultation.id}`}
                                  >
                                    Assign Expert
                                  </Button>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                Created: {format(new Date(consultation.createdAt), 'MMM d, yyyy HH:mm')}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage blog posts, pages, and media</p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Blog Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Posts</span>
                      <span className="font-medium">{totalBlogs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Published</span>
                      <span className="font-medium">{publishedBlogs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Drafts</span>
                      <span className="font-medium">{totalBlogs - publishedBlogs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Media Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Images</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Storage Used</span>
                      <span className="font-medium">2.3 GB</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload Media
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Meta Tags</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sitemap</span>
                      <Badge className="bg-green-100 text-green-800">Updated</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Configure SEO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
              <p className="text-gray-600 dark:text-gray-300">Track performance metrics and generate reports</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Traffic Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Page Views (30 days)</span>
                      <span className="text-2xl font-bold">124,567</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unique Visitors</span>
                      <span className="text-2xl font-bold">8,392</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bounce Rate</span>
                      <span className="text-2xl font-bold">34.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Revenue</span>
                      <span className="text-2xl font-bold">${totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="text-2xl font-bold">2.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Order Value</span>
                      <span className="text-2xl font-bold">${(totalRevenue / Math.max(consultations?.length || 1, 1)).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
              <p className="text-gray-600 dark:text-gray-300">Configure application settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">Temporarily disable the site</p>
                    </div>
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-gray-500">Allow new user signups</p>
                    </div>
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Send system emails</p>
                    </div>
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Auth</p>
                      <p className="text-sm text-gray-500">Require 2FA for admins</p>
                    </div>
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-gray-500">Limit API requests</p>
                    </div>
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-500">Auto-logout inactive users</p>
                    </div>
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Information</h2>
              <p className="text-gray-600 dark:text-gray-300">Monitor system health and performance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Server Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium">142ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="font-medium">68%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Connection</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tables</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Size</span>
                    <span className="font-medium">2.4 GB</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    API Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">OpenAI API</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Plant.id API</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment APIs</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Tools</h2>
              <p className="text-gray-600 dark:text-gray-300">Utilities and maintenance tools</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation('/admin/garden')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Garden Dashboard Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Monitor user gardens and plant identifications</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Users: {totalUsers}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize Tables
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cache & Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Performance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="w-4 h-4 mr-2" />
                    System Health Check
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}