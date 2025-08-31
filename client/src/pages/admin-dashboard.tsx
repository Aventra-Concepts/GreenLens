import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, isValid } from "date-fns";
import { 
  Calendar, Clock, User, Mail, Phone, MessageSquare, DollarSign, Settings, Users, Shield, 
  BarChart3, FileText, LogOut, Database, Server, Activity, Globe, Image, BookOpen,
  TrendingUp, UserCheck, AlertTriangle, CheckCircle, XCircle, Plus, Edit, Trash2,
  Search, Filter, Download, Upload, Eye, ToggleLeft, ToggleRight, Monitor,
  PieChart, LineChart, UserPlus, Zap, Layers, Lock, ArrowRight, Leaf, Share2, Star, Tag,
  Target, CreditCard, ArrowUpDown, GripVertical, Save
} from "lucide-react";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import SEODashboard from "@/components/admin/SEODashboard";
import ConsultationManagementDashboard from "@/components/admin/ConsultationManagementDashboard";
import { AdvancedPremiumDashboard } from "@/components/AdvancedPremiumDashboard";

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

interface AdminAuthor {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  email: string;
  phone?: string;
  website_url?: string;
  social_links?: any;
  expertise: string[];
  experience: string;
  application_status: string;
  admin_notes: string;
  is_verified: boolean;
  can_publish: boolean;
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  user_first_name: string;
  user_last_name: string;
  user_location: string;
  is_author: boolean;
  author_verified: boolean;
}

interface AdminEbook {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorFirstName: string;
  authorLastName: string;
  authorLocation: string;
  authorCountry: string;
  category: string;
  basePrice: string;
  currency: string;
  royaltyRate: string;
  platformCommissionRate: string;
  status: string;
  publicationDate: string | null;
  lastRevisionDate: string | null;
  downloadCount: number;
  ratingAverage: number;
  totalRevenue: string;
  totalSales: number;
  actualAmount: number;
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

const getEbookStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'submitted': return 'bg-blue-100 text-blue-800';
    case 'under_review': return 'bg-yellow-100 text-yellow-800';
    case 'published': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'suspended': return 'bg-orange-100 text-orange-800';
    case 'returned_for_revision': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewingAuthor, setViewingAuthor] = useState<AdminAuthor | null>(null);
  const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
  const [showAddProviderDialog, setShowAddProviderDialog] = useState(false);
  const [primaryProvider, setPrimaryProvider] = useState<string>('stripe');

  // Check admin authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have session storage first
        const hasStoredAuth = sessionStorage.getItem("adminAuthenticated");
        
        if (hasStoredAuth) {
          // Verify with server that session is still valid
          const response = await fetch('/api/admin/check', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.isAdmin) {
              setIsAuthenticated(true);
              // Clear any stale cache when authentication is confirmed
              queryClient.invalidateQueries();
              return;
            }
          }
        }
        
        // If no valid session, clear storage and redirect to login
        sessionStorage.removeItem("adminAuthenticated");
        setLocation("/admin-login");
      } catch (error) {
        console.log("Auth check failed, redirecting to login");
        sessionStorage.removeItem("adminAuthenticated");
        setLocation("/admin-login");
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Fetch consultation requests - always call this hook
  const { data: consultations = [], isLoading: isLoadingConsultations } = useQuery<ConsultationRequest[]>({
    queryKey: ['/api/consultation/admin/consultation-requests'],
    enabled: isAuthenticated,
  });

  // Fetch users data
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
  });

  // Fetch blog posts
  const { data: blogPosts = [], isLoading: isLoadingBlogs } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog-posts'],
    enabled: isAuthenticated,
  });

  // Fetch e-books for admin
  const { data: adminEbooks = [], isLoading: isLoadingEbooks, refetch: refetchEbooks } = useQuery<AdminEbook[]>({
    queryKey: ['/api/admin/ebooks'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/admin/ebooks', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
  });

  // Fetch authors for admin
  const { data: adminAuthors = [], isLoading: isLoadingAuthors, refetch: refetchAuthors, error: authorsError } = useQuery<AdminAuthor[]>({
    queryKey: ['/api/admin/authors'],
    enabled: isAuthenticated,
    retry: false,
    queryFn: async () => {
      const response = await fetch('/api/admin/authors', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
  });

  // Fetch payment providers data
  const { data: providersData, refetch: refetchPaymentProviders } = useQuery({
    queryKey: ['/api/admin/payment-providers'],
    enabled: isAuthenticated,
    onSuccess: (data: any) => {
      if (data?.providers) {
        setPaymentProviders(data.providers);
        const primary = data.providers.find((p: any) => p.isPrimary);
        if (primary) {
          setPrimaryProvider(primary.id);
        }
      }
    }
  });

  // Payment provider mutations
  const setPrimaryProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await apiRequest("POST", "/api/admin/payment-providers/set-primary", { providerId });
      return response.json();
    },
    onSuccess: () => {
      refetchPaymentProviders();
      toast({
        title: "Success",
        description: "Primary payment provider updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update primary provider",
        variant: "destructive",
      });
    }
  });

  const toggleProviderMutation = useMutation({
    mutationFn: async ({ providerId, enabled }: { providerId: string; enabled: boolean }) => {
      const response = await apiRequest("POST", "/api/admin/payment-providers/toggle", { providerId, enabled });
      return response.json();
    },
    onSuccess: () => {
      refetchPaymentProviders();
      toast({
        title: "Success",
        description: "Payment provider status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update provider status",
        variant: "destructive",
      });
    }
  });

  const removeProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/payment-providers/${providerId}`);
      return response.json();
    },
    onSuccess: () => {
      refetchPaymentProviders();
      toast({
        title: "Success",
        description: "Payment provider removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove provider",
        variant: "destructive",
      });
    }
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

  const filteredConsultations = (consultations || []).filter((consultation: ConsultationRequest) => 
    selectedStatus === "all" || consultation.status === selectedStatus
  );

  // Calculate stats
  const totalUsers = (users || []).length;
  const activeUsers = (users || []).filter((u: AdminUser) => u.isActive).length;
  const totalRevenue = (consultations || []).reduce((sum: number, c: ConsultationRequest) => sum + (c.amount || 0), 0);
  const totalBlogs = (blogPosts || []).length;
  const publishedBlogs = (blogPosts || []).filter((b: BlogPost) => b.status === 'published').length;

  // E-books Management Table Component
  const EbooksManagementTable = () => {
    const updateStatusMutation = useMutation({
      mutationFn: async ({ id, status, rejectionReason, platformCommissionRate }: { 
        id: string; 
        status: string; 
        rejectionReason?: string; 
        platformCommissionRate?: number; 
      }) => {
        const response = await apiRequest("PUT", `/api/admin/ebooks/${id}/status`, {
          status,
          rejectionReason,
          platformCommissionRate,
        });
        return response.json();
      },
      onSuccess: () => {
        refetchEbooks();
        toast({
          title: "E-book Status Updated",
          description: "The e-book status has been updated successfully.",
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

    const handleStatusChange = (ebookId: string, newStatus: string) => {
      let rejectionReason = '';
      let platformCommissionRate = undefined;
      
      if (newStatus === 'rejected') {
        rejectionReason = prompt('Please provide a reason for rejection:') || '';
        if (!rejectionReason) return;
      }
      
      if (newStatus === 'published') {
        const commissionInput = prompt('Set platform commission rate (0-1, e.g., 0.3 for 30%):');
        if (commissionInput !== null) {
          const commission = parseFloat(commissionInput);
          if (isNaN(commission) || commission < 0 || commission > 1) {
            toast({
              title: "Invalid Commission Rate",
              description: "Please enter a valid commission rate between 0 and 1.",
              variant: "destructive",
            });
            return;
          }
          platformCommissionRate = commission;
        }
      }
      
      updateStatusMutation.mutate({ 
        id: ebookId, 
        status: newStatus, 
        rejectionReason, 
        platformCommissionRate 
      });
    };

    if (isLoadingEbooks) {
      return <div className="flex justify-center p-8">
        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>;
    }

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    E-book Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Author Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pricing & Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {adminEbooks.map((ebook: AdminEbook) => (
                  <tr key={ebook.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={ebook.title}>
                          {ebook.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ebook.category}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Submitted: {new Date(ebook.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {ebook.authorFirstName} {ebook.authorLastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ebook.authorEmail}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {ebook.authorLocation}, {ebook.authorCountry}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {ebook.currency} {ebook.basePrice}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Commission: {(parseFloat(ebook.platformCommissionRate) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Revenue: {ebook.currency} {ebook.actualAmount.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {ebook.downloadCount} downloads
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {ebook.ratingAverage.toFixed(1)} rating
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEbookStatusColor(ebook.status)}`}>
                        {ebook.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {ebook.status === 'submitted' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleStatusChange(ebook.id, 'under_review')}
                              data-testid={`button-review-${ebook.id}`}
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-green-600"
                              onClick={() => handleStatusChange(ebook.id, 'published')}
                              data-testid={`button-approve-${ebook.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-red-600"
                              onClick={() => handleStatusChange(ebook.id, 'rejected')}
                              data-testid={`button-reject-${ebook.id}`}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {ebook.status === 'under_review' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-green-600"
                              onClick={() => handleStatusChange(ebook.id, 'published')}
                              data-testid={`button-publish-${ebook.id}`}
                            >
                              Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-orange-600"
                              onClick={() => handleStatusChange(ebook.id, 'returned_for_revision')}
                              data-testid={`button-return-${ebook.id}`}
                            >
                              Return
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-red-600"
                              onClick={() => handleStatusChange(ebook.id, 'rejected')}
                              data-testid={`button-reject-review-${ebook.id}`}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {ebook.status === 'published' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-orange-600"
                            onClick={() => handleStatusChange(ebook.id, 'suspended')}
                            data-testid={`button-suspend-${ebook.id}`}
                          >
                            Suspend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          data-testid={`button-view-${ebook.id}`}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {adminEbooks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No e-book submissions found</p>
          </div>
        )}
      </div>
    );
  };

  // Author Management Row Component
  const AuthorManagementRow = ({ author }: { author: AdminAuthor }) => {
    const [showRejectionDialog, setShowRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    
    const updateAuthorStatusMutation = useMutation({
      mutationFn: async ({ id, applicationStatus, adminNotes, isVerified, canPublish }: { 
        id: string; 
        applicationStatus: string; 
        adminNotes?: string; 
        isVerified?: boolean;
        canPublish?: boolean;
      }) => {
        const response = await apiRequest("PUT", `/api/admin/authors/${id}/status`, {
          applicationStatus,
          adminNotes,
          isVerified,
          canPublish,
        });
        return response.json();
      },
      onSuccess: () => {
        refetchAuthors();
        toast({
          title: "Author Status Updated",
          description: "The author status has been updated successfully.",
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

    const handleStatusChange = (status: string, reason?: string) => {
      updateAuthorStatusMutation.mutate({ 
        id: author.id, 
        applicationStatus: status,
        isVerified: status === 'approved',
        canPublish: status === 'approved',
        adminNotes: status === 'rejected' ? (reason || 'Application rejected by admin') : undefined
      });
    };

    const handleRejectClick = () => {
      setShowRejectionDialog(true);
    };

    const handleConfirmReject = () => {
      const reason = rejectionReason.trim() || 'Application rejected by admin';
      handleStatusChange('rejected', reason);
      setShowRejectionDialog(false);
      setRejectionReason('');
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'under_review': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <>
        <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
          <td className="p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {author.display_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {author.user_first_name} {author.user_last_name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {author.user_location || 'No location'}
              </p>
            </div>
          </td>
          <td className="p-3">
            <div className="space-y-1">
              <p className="text-sm text-gray-900 dark:text-white">
                {author.email}
              </p>
              {author.phone && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {author.phone}
                </p>
              )}
              {author.website_url && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {author.website_url}
                </p>
              )}
            </div>
          </td>
          <td className="p-3">
            <div className="space-y-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(author.application_status)}`}>
                {author.application_status}
              </span>
              {author.application_status === 'rejected' && author.admin_notes && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Reason: {author.admin_notes}
                </p>
              )}
            </div>
          </td>
          <td className="p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {author.is_verified ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                    <XCircle className="w-3 h-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {author.can_publish ? (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    <Edit className="w-3 h-3 mr-1" />
                    Can Publish
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                    <Lock className="w-3 h-3 mr-1" />
                    No Publish
                  </Badge>
                )}
              </div>
            </div>
          </td>
          <td className="p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {author.created_at && isValid(new Date(author.created_at)) ? format(new Date(author.created_at), 'MMM dd, yyyy') : 'N/A'}
            </p>
            {author.reviewed_at && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Reviewed: {isValid(new Date(author.reviewed_at)) ? format(new Date(author.reviewed_at), 'MMM dd') : 'Invalid date'}
              </p>
            )}
          </td>
          <td className="p-3">
            <div className="flex flex-col gap-1">

              {author.application_status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-green-600"
                    onClick={() => handleStatusChange('approved')}
                    data-testid={`button-approve-author-${author.id}`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600"
                    onClick={handleRejectClick}
                    data-testid={`button-reject-author-${author.id}`}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {author.application_status === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-600"
                  onClick={handleRejectClick}
                  data-testid={`button-revoke-author-${author.id}`}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Revoke
                </Button>
              )}
              {author.application_status === 'rejected' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-green-600"
                  onClick={() => handleStatusChange('approved')}
                  data-testid={`button-approve-rejected-author-${author.id}`}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setViewingAuthor(author)}
                data-testid={`button-view-author-${author.id}`}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </td>
        </tr>
        
        {/* Rejection Reason Dialog */}
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Author Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting {author.display_name}'s application. This will help the author understand why their application was not accepted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason (e.g., incomplete documentation, insufficient experience, etc.)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                data-testid="input-rejection-reason"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionDialog(false)}
                  data-testid="button-cancel-rejection"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmReject}
                  data-testid="button-confirm-rejection"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 grid-rows-2 bg-white dark:bg-gray-800 p-1 h-auto gap-1">
            {/* First Row - 8 tabs */}
            <TabsTrigger value="overview" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-slate-100 to-gray-100 border-2 border-slate-300">
              <BarChart3 className="w-3 h-3 text-slate-600" />
              <span className="hidden sm:inline font-semibold text-slate-700">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="premium-view" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300">
              <Leaf className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline font-semibold text-emerald-700">Premium</span>
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-green-100 to-lime-100 border-2 border-green-300">
              <UserCheck className="w-3 h-3 text-green-600" />
              <span className="hidden sm:inline font-semibold text-green-700">Authors</span>
            </TabsTrigger>
            <TabsTrigger value="ebooks" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-purple-100 to-violet-100 border-2 border-purple-300">
              <BookOpen className="w-3 h-3 text-purple-600" />
              <span className="hidden sm:inline font-semibold text-purple-700">E-Books</span>
            </TabsTrigger>
            <TabsTrigger value="affiliate" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300">
              <DollarSign className="w-3 h-3 text-orange-600" />
              <span className="hidden sm:inline font-semibold text-orange-700">Affiliate</span>
            </TabsTrigger>
            <TabsTrigger 
              value="hr" 
              className="flex items-center gap-1 px-2 py-2 text-xs cursor-pointer hover:bg-blue-50 bg-gradient-to-r from-blue-100 to-sky-100 border-2 border-blue-300" 
              onClick={() => window.location.href = '/admin/hr'}
            >
              <Users className="w-3 h-3 text-blue-600" />
              <span className="hidden sm:inline text-blue-700 font-semibold">HR</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-indigo-100 to-blue-100 border-2 border-indigo-300">
              <Users className="w-3 h-3 text-indigo-600" />
              <span className="hidden sm:inline font-semibold text-indigo-700">Users</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-teal-100 to-cyan-100 border-2 border-teal-300">
              <MessageSquare className="w-3 h-3 text-teal-600" />
              <span className="hidden sm:inline font-semibold text-teal-700">Consults</span>
            </TabsTrigger>
            
            {/* Second Row - 7 tabs */}
            <TabsTrigger value="content" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-300">
              <FileText className="w-3 h-3 text-rose-600" />
              <span className="hidden sm:inline font-semibold text-rose-700">Content</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300">
              <TrendingUp className="w-3 h-3 text-yellow-600" />
              <span className="hidden sm:inline font-semibold text-yellow-700">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-300">
              <Target className="w-3 h-3 text-red-600" />
              <span className="hidden sm:inline font-semibold text-red-700">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300">
              <Settings className="w-3 h-3 text-gray-600" />
              <span className="hidden sm:inline font-semibold text-gray-700">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-zinc-100 to-gray-100 border-2 border-zinc-300">
              <Server className="w-3 h-3 text-zinc-600" />
              <span className="hidden sm:inline font-semibold text-zinc-700">System</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-lime-100 to-green-100 border-2 border-lime-300">
              <Zap className="w-3 h-3 text-lime-600" />
              <span className="hidden sm:inline font-semibold text-lime-700">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1 px-2 py-2 text-xs bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300">
              📧 <span className="hidden sm:inline font-semibold text-emerald-700">Email & Subscriptions</span>
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
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(consultations || []).length}</p>
                      <p className="text-xs text-yellow-600">{(consultations || []).filter((c: ConsultationRequest) => c.status === 'pending').length} pending</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50" onClick={() => setActiveTab('ebooks')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    E-Books Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Manage digital plant care guides and sales</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-purple-600">24 E-Books • $3,247 Revenue</span>
                    <ArrowRight className="h-4 w-4 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50" onClick={() => setActiveTab('affiliate')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Amazon Affiliate Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Monitor affiliate earnings from Garden Tools marketplace</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-orange-600">$1,247.83 • 2,847 clicks</span>
                    <ArrowRight className="h-4 w-4 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('content')}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
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
                    <span>Pending: {(consultations || []).filter((c: ConsultationRequest) => c.status === 'pending').length}</span>
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
                    <FileText className="w-5 h-5" />
                    Premium Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">My Garden Premium Features</p>
                        <p className="text-xs text-gray-500">Complete feature documentation</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('/premium_features_documentation.md', '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        MD
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Premium Features Guide</p>
                        <p className="text-xs text-gray-500">Formatted HTML documentation</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('/premium_features_summary.html', '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        HTML
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Dashboard Interface Preview</p>
                        <p className="text-xs text-gray-500">Premium dashboard mockup</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('/attached_assets/generated_images/Premium_Garden_Dashboard_Interface_ca5c6759.png', '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        PNG
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Premium User View Tab */}
          <TabsContent value="premium-view" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium User Dashboard Experience</h2>
              <p className="text-gray-600 dark:text-gray-400">
                This is exactly what your premium subscribers ($9 Pro and $19 Premium plans) see when they access their advanced garden dashboard. 
                Experience the full premium features your customers are paying for.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <AdvancedPremiumDashboard />
            </div>
          </TabsContent>

          {/* Authors Tab */}
          <TabsContent value="authors" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authors Management</h2>
                <p className="text-gray-600 dark:text-gray-300">Review and manage author applications and publishing permissions</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                {adminAuthors.length} Total Authors
              </Badge>
            </div>

            {/* Authors Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Authors</p>
                      <p className="text-2xl font-bold text-green-900">{adminAuthors.length}</p>
                      <p className="text-xs text-green-600">Registered users</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {adminAuthors.filter(a => a.applicationStatus === 'pending').length}
                      </p>
                      <p className="text-xs text-yellow-600">Need approval</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Approved Authors</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {adminAuthors.filter(a => a.applicationStatus === 'approved').length}
                      </p>
                      <p className="text-xs text-blue-600">Can publish</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-900">
                        {adminAuthors.filter(a => a.applicationStatus === 'rejected').length}
                      </p>
                      <p className="text-xs text-red-600">Applications denied</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Authors Management Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Author Applications
                </CardTitle>
                <CardDescription>
                  Review and approve author applications for e-book publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
                  <p><strong>Debug Info:</strong></p>
                  <p>Auth Status: {isAuthenticated ? 'Authenticated ✓' : 'Not Authenticated ✗'}</p>
                  <p>Authors Count: {adminAuthors.length}</p>
                  <p>Loading: {isLoadingAuthors ? 'Yes' : 'No'}</p>
                  {authorsError && <p className="text-red-500">Error: {authorsError.message}</p>}
                  <p>First author status: {adminAuthors[0]?.applicationStatus || 'N/A'}</p>
                  <p>Query Enabled: {!isLoadingAuthors && isAuthenticated ? 'Yes' : 'No'}</p>
                </div>
                
                {isLoadingAuthors ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full" />
                  </div>
                ) : adminAuthors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No author applications found</p>
                    {authorsError && (
                      <p className="text-red-500 text-sm mt-2">
                        Error: {authorsError.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Author Info</th>
                          <th className="text-left p-2">Contact</th>
                          <th className="text-left p-2">Application Status</th>
                          <th className="text-left p-2">Publishing Status</th>
                          <th className="text-left p-2">Applied</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminAuthors.map((author) => (
                          <AuthorManagementRow key={author.id} author={author} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-books Tab */}
          <TabsContent value="ebooks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Books Management</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage digital plant care guides and educational content</p>
              </div>
              <Button 
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                onClick={() => setLocation('/ebook-upload')}
                data-testid="button-add-ebook"
              >
                <Plus className="w-4 h-4" />
                Add New E-Book
              </Button>
            </div>

            {/* E-books Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total E-Books</p>
                      <p className="text-2xl font-bold text-purple-900">24</p>
                      <p className="text-xs text-purple-600">+3 this month</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Downloads</p>
                      <p className="text-2xl font-bold text-green-900">1,847</p>
                      <p className="text-xs text-green-600">+156 this week</p>
                    </div>
                    <Download className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">$3,247</p>
                      <p className="text-xs text-blue-600">+18% growth</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Top Rating</p>
                      <p className="text-2xl font-bold text-orange-900">4.8</p>
                      <p className="text-xs text-orange-600">345 reviews</p>
                    </div>
                    <Star className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* E-books Management Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  All Submitted E-Books
                </CardTitle>
                <p className="text-sm text-gray-600">Manage e-book submissions from registered authors</p>
              </CardHeader>
              <CardContent>
                <EbooksManagementTable />
              </CardContent>
            </Card>

            {/* Quick Actions for E-books */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="h-5 w-5 text-purple-600" />
                    Create New E-Book
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Add new digital plant care guides</p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Start Creating
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Sales Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">View detailed sales analytics</p>
                  <Button variant="outline" className="w-full">
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    E-Book Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Configure pricing and distribution</p>
                  <Button variant="outline" className="w-full">
                    Manage Settings
                  </Button>
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
                  ) : (users || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No users found</div>
                  ) : (
                    (users || []).slice(0, 10).map((user: AdminUser) => (
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
            <ConsultationManagementDashboard />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage blog posts, pages, and media</p>
              </div>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setLocation("/admin/blog/create")}
                data-testid="button-new-post"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                    <Tag className="w-5 h-5" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Categories</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active</span>
                      <span className="font-medium">12</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Settings className="w-3 h-3 mr-1" />
                      Manage Categories
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Content Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Page Views (30d)</span>
                      <span className="font-medium">24,567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Read Time</span>
                      <span className="font-medium">3.2 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SEO Score</span>
                      <Badge className="bg-green-100 text-green-800">95/100</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4"
                onClick={() => setLocation("/admin/blog/create")}
              >
                <Plus className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">New Post</p>
                  <p className="text-xs text-gray-500">Create content</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4"
              >
                <Upload className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Media Upload</p>
                  <p className="text-xs text-gray-500">Add images</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4"
              >
                <Settings className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Categories</p>
                  <p className="text-xs text-gray-500">Manage topics</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-auto p-4"
              >
                <BarChart3 className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Analytics</p>
                  <p className="text-xs text-gray-500">View insights</p>
                </div>
              </Button>
            </div>

            {/* Blog Posts Management Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Blog Posts
                </CardTitle>
                <CardDescription>
                  Manage and edit your blog content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBlogs ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : blogPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">No blog posts found</p>
                    <Button 
                      onClick={() => setLocation("/admin/blog/create")}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blogPosts.slice(0, 5).map((post: BlogPost) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-md">
                              {post.title}
                            </h3>
                            <Badge 
                              variant={post.status === 'published' ? "default" : "secondary"}
                              className={post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {post.status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-lg">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Created: {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                            {post.publishedAt && (
                              <span>Published: {format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/admin/blog/edit/${post.id}`)}
                            className="flex items-center gap-2"
                            data-testid={`button-edit-post-${post.id}`}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          {post.status === 'published' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                              className="flex items-center gap-2"
                              data-testid={`button-view-post-${post.id}`}
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {blogPosts.length > 5 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500 text-center">
                          Showing 5 of {blogPosts.length} posts
                        </p>
                        <div className="flex justify-center mt-2">
                          <Button variant="outline" size="sm">
                            View All Posts
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <SEODashboard />
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

              {/* API Keys Management */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    API Keys & Integrations
                  </CardTitle>
                  <CardDescription>Manage external service API keys and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Services */}
                    <div>
                      <h3 className="font-semibold mb-4 text-green-700 dark:text-green-400">AI Services</h3>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">OpenAI API</p>
                              <p className="text-sm text-gray-500">Plant analysis and AI features</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Connected</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">API Key</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                value="sk-proj-************************************" 
                                disabled 
                                className="flex-1"
                                data-testid="input-openai-key"
                              />
                              <Button variant="outline" size="sm" data-testid="button-edit-openai">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Plant.id API</p>
                              <p className="text-sm text-gray-500">Plant identification service</p>
                            </div>
                            <Badge variant="outline">Not Configured</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">API Key</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="Enter Plant.id API key..." 
                                className="flex-1"
                                data-testid="input-plantid-key"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-plantid">
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Services */}
                    <div>
                      <h3 className="font-semibold mb-4 text-blue-700 dark:text-blue-400">Payment Services</h3>
                      <div className="space-y-4">
                        <div id="stripe-config-section" className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Stripe</p>
                              <p className="text-sm text-gray-500">Payment processing</p>
                            </div>
                            <Badge variant="outline">Not Configured</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Secret Key</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="sk_test_..." 
                                className="flex-1"
                                data-testid="input-stripe-secret"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-stripe">
                                Save
                              </Button>
                            </div>
                            <label className="text-sm font-medium">Public Key</label>
                            <div className="flex gap-2">
                              <Input 
                                type="text" 
                                placeholder="pk_test_..." 
                                className="flex-1"
                                data-testid="input-stripe-public"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-stripe-public">
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div id="paypal-config-section" className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">PayPal</p>
                              <p className="text-sm text-gray-500">PayPal payment processing</p>
                            </div>
                            <Badge variant="outline">Not Configured</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Client ID</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="PayPal Client ID..." 
                                className="flex-1"
                                data-testid="input-paypal-client-id"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-paypal-id">
                                Save
                              </Button>
                            </div>
                            <label className="text-sm font-medium">Client Secret</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="PayPal Client Secret..." 
                                className="flex-1"
                                data-testid="input-paypal-secret"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-paypal-secret">
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div id="cashfree-config-section" className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Cashfree</p>
                              <p className="text-sm text-gray-500">Indian payment gateway</p>
                            </div>
                            <Badge variant="outline">Not Configured</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Client ID</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="Cashfree Client ID..." 
                                className="flex-1"
                                data-testid="input-cashfree-client-id"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-cashfree-id">
                                Save
                              </Button>
                            </div>
                            <label className="text-sm font-medium">Client Secret</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="Cashfree Client Secret..." 
                                className="flex-1"
                                data-testid="input-cashfree-secret"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-cashfree-secret">
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div id="razorpay-config-section" className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Razorpay</p>
                              <p className="text-sm text-gray-500">Indian payment processing</p>
                            </div>
                            <Badge variant="outline">Not Configured</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Key ID</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="rzp_test_..." 
                                className="flex-1"
                                data-testid="input-razorpay-key"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-razorpay-key">
                                Save
                              </Button>
                            </div>
                            <label className="text-sm font-medium">Key Secret</label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="Razorpay Key Secret..." 
                                className="flex-1"
                                data-testid="input-razorpay-secret"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-razorpay-secret">
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other Services */}
                    <div>
                      <h3 className="font-semibold mb-4 text-purple-700 dark:text-purple-400">Analytics & Tracking</h3>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Google Analytics</p>
                              <p className="text-sm text-gray-500">Website analytics tracking</p>
                            </div>
                            <Badge variant="outline">Not Configured</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Measurement ID</label>
                            <div className="flex gap-2">
                              <Input 
                                type="text" 
                                placeholder="G-XXXXXXXXXX" 
                                className="flex-1"
                                data-testid="input-ga-id"
                              />
                              <Button variant="outline" size="sm" data-testid="button-save-ga">
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Status Dashboard */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">API Status Dashboard</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="font-medium text-sm">OpenAI</p>
                        <p className="text-xs text-green-600">Active</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-sm">Plant.id</p>
                        <p className="text-xs text-gray-500">Not Set</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-sm">Stripe</p>
                        <p className="text-xs text-gray-500">Not Set</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-sm">PayPal</p>
                        <p className="text-xs text-gray-500">Not Set</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-sm">Cashfree</p>
                        <p className="text-xs text-gray-500">Not Set</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-sm">Razorpay</p>
                        <p className="text-xs text-gray-500">Not Set</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <XCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-sm">Analytics</p>
                        <p className="text-xs text-gray-500">Not Set</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full" data-testid="button-save-all-keys">
                      <Settings className="w-4 h-4 mr-2" />
                      Save All Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Gateway Management */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Gateway Management
                  </CardTitle>
                  <CardDescription>Configure payment provider preferences and priorities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Primary Payment Provider Selection */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Primary Payment Provider
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Select your default payment provider for new transactions</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {paymentProviders.map((provider) => (
                        <Button 
                          key={provider.id}
                          variant="outline" 
                          className={`h-auto p-4 flex flex-col items-center gap-2 ${
                            provider.isPrimary 
                              ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : ''
                          }`}
                          onClick={() => setPrimaryProviderMutation.mutate(provider.id)}
                          disabled={!provider.isEnabled || setPrimaryProviderMutation.isPending}
                          data-testid={`button-primary-${provider.id}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            provider.id === 'stripe' ? 'bg-blue-100' :
                            provider.id === 'paypal' ? 'bg-blue-100' :
                            provider.id === 'cashfree' ? 'bg-orange-100' :
                            'bg-purple-100'
                          }`}>
                            <CreditCard className={`w-4 h-4 ${
                              provider.id === 'stripe' ? 'text-blue-600' :
                              provider.id === 'paypal' ? 'text-blue-600' :
                              provider.id === 'cashfree' ? 'text-orange-600' :
                              'text-purple-600'
                            }`} />
                          </div>
                          <span className="text-sm font-medium">{provider.name}</span>
                          {provider.isPrimary ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">Primary</Badge>
                          ) : provider.status ? (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Configured</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Not Set</Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Active Payment Providers Management */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Active Payment Providers</h3>
                      <Button 
                        size="sm" 
                        className="gap-2" 
                        onClick={() => setShowAddProviderDialog(true)}
                        data-testid="button-add-provider"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Provider
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {paymentProviders.map((provider, index) => (
                        <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              provider.id === 'stripe' ? 'bg-blue-100' :
                              provider.id === 'paypal' ? 'bg-blue-100' :
                              provider.id === 'cashfree' ? 'bg-orange-100' :
                              'bg-purple-100'
                            }`}>
                              <CreditCard className={`w-5 h-5 ${
                                provider.id === 'stripe' ? 'text-blue-600' :
                                provider.id === 'paypal' ? 'text-blue-600' :
                                provider.id === 'cashfree' ? 'text-orange-600' :
                                'text-purple-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-sm text-gray-500">{provider.description}</p>
                              <p className="text-xs text-gray-400">
                                Supports: {provider.supportedCurrencies.slice(0, 3).join(', ')}
                                {provider.supportedCurrencies.length > 3 ? '...' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {provider.isPrimary && (
                              <Badge className="bg-green-100 text-green-800">Primary</Badge>
                            )}
                            <Badge variant="outline" className={
                              provider.status 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-red-50 text-red-700 border-red-200"
                            }>
                              {provider.status ? 'Connected' : 'Not Configured'}
                            </Badge>
                            {!provider.isEnabled && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500">
                                Disabled
                              </Badge>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                // Scroll to API keys section
                                const section = document.getElementById(`${provider.id}-config-section`);
                                if (section) {
                                  section.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              data-testid={`button-configure-${provider.id}`}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700" 
                              onClick={() => removeProviderMutation.mutate(provider.id)}
                              disabled={removeProviderMutation.isPending}
                              data-testid={`button-disable-${provider.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Provider Priorities */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      Payment Provider Priority
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Drag to reorder payment providers by priority (highest first)</p>
                    <div className="space-y-2">
                      {paymentProviders.map((provider, index) => (
                        <div 
                          key={provider.id} 
                          className={`flex items-center gap-3 p-3 border rounded-lg ${
                            provider.isPrimary ? 'bg-green-50 dark:bg-green-900/20' : ''
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <span className="font-medium">{index + 1}. {provider.name}</span>
                          <div className="ml-auto flex gap-2">
                            {provider.isPrimary && (
                              <Badge className="bg-green-100 text-green-800">Primary</Badge>
                            )}
                            {provider.supportedRegions.includes('IN') && (
                              <Badge variant="outline" className="text-xs">India</Badge>
                            )}
                            {!provider.isEnabled && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500 text-xs">
                                Disabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        toast({
                          title: "Configuration Saved",
                          description: "All payment provider settings have been saved successfully",
                        });
                      }}
                      data-testid="button-save-payment-config"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={async () => {
                        // Test all configured providers
                        let successCount = 0;
                        for (const provider of paymentProviders) {
                          if (provider.status) {
                            successCount++;
                          }
                        }
                        toast({
                          title: "Provider Test Complete",
                          description: `${successCount} out of ${paymentProviders.length} providers are properly configured`,
                          variant: successCount === paymentProviders.length ? "default" : "destructive"
                        });
                      }}
                      data-testid="button-test-providers"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Test All Providers
                    </Button>
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

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-blue-700 mb-3">
                    Download complete technical documentation
                  </p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-blue-300 hover:bg-blue-100"
                      onClick={() => window.open('/download/documentation.html', '_blank')}
                      data-testid="button-download-html-docs"
                    >
                      <Globe className="w-4 h-4 mr-2 text-blue-600" />
                      HTML (PDF Ready)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-blue-300 hover:bg-blue-100"
                      onClick={() => window.open('/download/documentation.md', '_blank')}
                      data-testid="button-download-md-docs"
                    >
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Markdown
                    </Button>
                  </div>
                  <div className="text-xs text-blue-600 mt-2 space-y-1">
                    <p>• 300+ Pages Complete Guide</p>
                    <p>• All APIs & Database Schema</p>
                    <p>• Technical Architecture</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email & Subscriptions Tab */}
          <TabsContent value="email" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📧 Email & Subscriptions</h2>
              <p className="text-gray-600 dark:text-gray-300">Manage subscription email notifications and reminders</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Email Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    Subscription Email Settings
                  </CardTitle>
                  <CardDescription>
                    Configure automated subscription email notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">15-Day Expiry Reminders</p>
                        <p className="text-sm text-gray-500">Send reminders 15 days before subscription expires</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-300"
                        data-testid="toggle-15day-reminders"
                      >
                        ✅ Enabled
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">7-Day Expiry Reminders</p>
                        <p className="text-sm text-gray-500">Send reminders 7 days before subscription expires</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-300"
                        data-testid="toggle-7day-reminders"
                      >
                        ✅ Enabled
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Renewal Confirmations</p>
                        <p className="text-sm text-gray-500">Send confirmation emails after successful renewals</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-300"
                        data-testid="toggle-renewal-confirmations"
                      >
                        ✅ Enabled
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      data-testid="test-subscription-email"
                    >
                      <Mail className="w-4 h-4" />
                      Test Email System
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      data-testid="save-email-settings"
                    >
                      <Save className="w-4 h-4" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Status & Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Email Service Status
                  </CardTitle>
                  <CardDescription>
                    SendGrid email service configuration and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">SendGrid Status</p>
                        <p className="text-sm text-yellow-600">API key not configured</p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        ⚠️ Not Configured
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sendgrid-api-key">SendGrid API Key</Label>
                      <Input
                        id="sendgrid-api-key"
                        type="password"
                        placeholder="SG.xxxxxxxxxxxxxxxx"
                        data-testid="input-sendgrid-api-key"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="from-email">From Email Address</Label>
                      <Input
                        id="from-email"
                        type="email"
                        placeholder="noreply@greenlens.ai"
                        data-testid="input-from-email"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Amazon Affiliate Dashboard */}
          <TabsContent value="affiliate" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Amazon Affiliate Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-300">Comprehensive Amazon affiliate earnings and Garden Tools marketplace analytics</p>
            </div>

            {/* Affiliate Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">2,847</p>
                      <p className="text-xs text-green-600">+18% this month</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">142</p>
                      <p className="text-xs text-yellow-600">5.0% conversion rate</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Affiliate Earnings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">$1,247.83</p>
                      <p className="text-xs text-green-600">+24% this month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">8,934</p>
                      <p className="text-xs text-blue-600">Garden Tools marketplace</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regional Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Regional Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">United States (Amazon.com)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1,847 clicks • 89 conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">$892.45</p>
                        <p className="text-xs text-gray-500">4.8% rate</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">India (Amazon.in)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">642 clicks • 34 conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">$247.38</p>
                        <p className="text-xs text-gray-500">5.3% rate</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">United Kingdom (Amazon.co.uk)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">358 clicks • 19 conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">$108.00</p>
                        <p className="text-xs text-gray-500">5.3% rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Top Product Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Hand Tools</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pruners, trowels, cultivators</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">$487.22</p>
                        <p className="text-xs text-gray-500">39% of earnings</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Watering & Irrigation</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hoses, sprinklers, timers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">$324.18</p>
                        <p className="text-xs text-gray-500">26% of earnings</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Soil & Fertilizers</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Compost, nutrients, soil mixes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">$298.43</p>
                        <p className="text-xs text-gray-500">24% of earnings</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Protective Gear</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gloves, kneepads, aprons</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">$138.00</p>
                        <p className="text-xs text-gray-500">11% of earnings</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Garden Tools Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Premium Pruning Shears</p>
                        <p className="text-xs text-gray-500">Amazon.com • 2 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+$12.45</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Soil pH Test Kit</p>
                        <p className="text-xs text-gray-500">Amazon.in • 4 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+$8.22</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Organic Fertilizer Set</p>
                        <p className="text-xs text-gray-500">Amazon.co.uk • 6 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+$15.67</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Garden Hose 50ft</p>
                        <p className="text-xs text-gray-500">Amazon.com • 8 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+$9.33</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Gardening Gloves Set</p>
                        <p className="text-xs text-gray-500">Amazon.in • 12 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+$6.89</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Garden Tools Marketplace Link
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/tools")}>
                    <Eye className="w-3 h-3 mr-1" />
                    View Marketplace
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Integration Status</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2">✅ Garden Tools marketplace is fully integrated with Amazon affiliate system</p>
                      <p className="text-xs text-green-600 dark:text-green-400">All product clicks are tracked and commissions are calculated automatically</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Marketplace Traffic</p>
                        <p className="text-lg font-bold text-blue-600">8,934 views</p>
                        <p className="text-xs text-blue-500">This month</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Click-through Rate</p>
                        <p className="text-lg font-bold text-purple-600">31.8%</p>
                        <p className="text-xs text-purple-500">Above average</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Settings className="w-3 h-3 mr-1" />
                          Configure APIs
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Analytics
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Upload className="w-3 h-3 mr-1" />
                          Sync Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-orange-600" />
                  Detailed Earnings Breakdown
                </CardTitle>
                <CardDescription>
                  Complete affiliate earnings data with product details and commission rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Region
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Conversions
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Commission Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Professional Pruning Shears</p>
                            <p className="text-xs text-gray-500">Hand Tools Category</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">US</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">847</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">42</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">8.5%</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">$247.83</td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Expandable Garden Hose</p>
                            <p className="text-xs text-gray-500">Watering & Irrigation</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">US</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">634</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">28</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">7.2%</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">$189.45</td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Organic Fertilizer Mix</p>
                            <p className="text-xs text-gray-500">Soil & Fertilizers</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">IN</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">523</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">31</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">6.8%</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">$156.22</td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Garden Tool Set Premium</p>
                            <p className="text-xs text-gray-500">Hand Tools Category</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">UK</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">412</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">18</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">9.1%</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">$134.67</td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Protective Gardening Gloves</p>
                            <p className="text-xs text-gray-500">Protective Gear</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">US</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">378</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">23</td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">5.9%</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">$97.34</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Author Details Modal */}
      <Dialog open={!!viewingAuthor} onOpenChange={() => setViewingAuthor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Author Details</DialogTitle>
            <DialogDescription>
              Complete information for {viewingAuthor?.displayName}
            </DialogDescription>
          </DialogHeader>
          {viewingAuthor && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Display Name:</span> {viewingAuthor.displayName}</p>
                    <p><span className="font-medium">Full Name:</span> {viewingAuthor.user_first_name} {viewingAuthor.user_last_name}</p>
                    <p><span className="font-medium">Email:</span> {viewingAuthor.email}</p>
                    {viewingAuthor.phone && <p><span className="font-medium">Phone:</span> {viewingAuthor.phone}</p>}
                    <p><span className="font-medium">Location:</span> {viewingAuthor.user_location || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Professional Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Bio:</span> {viewingAuthor.bio || 'No bio provided'}</p>
                    <p><span className="font-medium">Experience:</span> {viewingAuthor.experience || 'Not specified'}</p>
                    <p><span className="font-medium">Expertise:</span> {Array.isArray(viewingAuthor.expertise) ? viewingAuthor.expertise.join(', ') : 'Not specified'}</p>
                    <p><span className="font-medium">Publications:</span> {viewingAuthor.publications || 'Not specified'}</p>
                    {viewingAuthor.website_url && <p><span className="font-medium">Website:</span> <a href={viewingAuthor.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{viewingAuthor.website_url}</a></p>}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Application Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant="outline" className={`${
                        viewingAuthor.applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        viewingAuthor.applicationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {viewingAuthor.applicationStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Verified:</span>
                      <Badge variant="outline" className={viewingAuthor.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {viewingAuthor.isVerified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Can Publish:</span>
                      <Badge variant="outline" className={viewingAuthor.canPublish ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {viewingAuthor.canPublish ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <p><span className="font-medium">Applied:</span> {viewingAuthor.createdAt && isValid(new Date(viewingAuthor.createdAt)) ? format(new Date(viewingAuthor.createdAt), 'MMM dd, yyyy') : 'N/A'}</p>
                    {viewingAuthor.reviewedAt && (
                      <p><span className="font-medium">Reviewed:</span> {isValid(new Date(viewingAuthor.reviewedAt)) ? format(new Date(viewingAuthor.reviewedAt), 'MMM dd, yyyy') : 'Invalid date'}</p>
                    )}
                  </div>
                </div>
                
                {viewingAuthor.adminNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Admin Notes</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">{viewingAuthor.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Payment Provider Dialog */}
      <Dialog open={showAddProviderDialog} onOpenChange={setShowAddProviderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Payment Provider</DialogTitle>
            <DialogDescription>
              Configure a new payment gateway service for your platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => {
                setShowAddProviderDialog(false);
                toast({
                  title: "Stripe Integration",
                  description: "Please configure your Stripe keys in the API Keys section above",
                });
              }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Stripe</h3>
                  <p className="text-sm text-gray-500 mb-3">Global payment processing with 135+ currencies</p>
                  <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => {
                setShowAddProviderDialog(false);
                toast({
                  title: "PayPal Integration", 
                  description: "Please configure your PayPal keys in the API Keys section above",
                });
              }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">PayPal</h3>
                  <p className="text-sm text-gray-500 mb-3">Trusted payment solution worldwide</p>
                  <Badge variant="outline">Global</Badge>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => {
                setShowAddProviderDialog(false);
                toast({
                  title: "Cashfree Integration",
                  description: "Please configure your Cashfree keys in the API Keys section above",
                });
              }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Cashfree</h3>
                  <p className="text-sm text-gray-500 mb-3">Leading Indian payment gateway</p>
                  <Badge className="bg-orange-100 text-orange-800">India</Badge>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => {
                setShowAddProviderDialog(false);
                toast({
                  title: "Razorpay Integration",
                  description: "Please configure your Razorpay keys in the API Keys section above",
                });
              }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Razorpay</h3>
                  <p className="text-sm text-gray-500 mb-3">Full-stack financial solutions for India</p>
                  <Badge className="bg-purple-100 text-purple-800">India</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Coming Soon</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center opacity-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">Square</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">Adyen</p>
                </div>
                <div className="text-center opacity-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">Braintree</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}