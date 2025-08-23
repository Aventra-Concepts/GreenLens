import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, DollarSign, Settings, Users, Shield, BarChart3, FileText, LogOut } from "lucide-react";

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

  // Check admin authentication
  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuthenticated");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    } else {
      setLocation("/admin-login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
    setLocation("/admin-login");
  };

  if (!isAuthenticated) {
    return null;
  }

  // Fetch consultation requests
  const { data: consultations, isLoading: isLoadingConsultations } = useQuery({
    queryKey: ['/api/admin/consultation-requests'],
    enabled: isAuthenticated,
  });

  // Update consultation status mutation
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
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin/blog")}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Blog Manager
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin/social-media")}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Social Media
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dashboard Overview */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage consultation requests, content, and analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-500">Real-time Analytics</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Consultations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{consultations?.length || 0}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consultations?.filter(c => c.status === 'pending').length || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consultations?.filter(c => c.status === 'completed').length || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${consultations?.reduce((sum, c) => sum + (c.amount || 0), 0).toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consultation Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Consultation Requests</CardTitle>
                <CardDescription>Manage and track consultation requests</CardDescription>
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
      </div>
    </div>
  );
}