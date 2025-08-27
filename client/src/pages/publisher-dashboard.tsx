import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  Upload,
  Eye,
  Edit,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Star,
  Download,
  Plus,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Search
} from "lucide-react";
import Layout from "@/components/Layout";

interface PublisherEbook {
  id: string;
  title: string;
  description: string;
  category: string;
  basePrice: string;
  currency: string;
  status: string;
  downloadCount: number;
  ratingAverage: number;
  ratingCount: number;
  totalRevenue: string;
  royaltyRate: string;
  platformCommissionRate: string;
  publicationDate: string | null;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  coverImageUrl?: string;
  fileUrl?: string;
  previewUrl?: string;
  tags: string[];
  pageCount?: number;
  language: string;
  isbn?: string;
}

interface PublisherStats {
  totalEbooks: number;
  publishedEbooks: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  pendingReviews: number;
}

const getStatusColor = (status: string) => {
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft': return <FileText className="w-4 h-4" />;
    case 'submitted': return <Clock className="w-4 h-4" />;
    case 'under_review': return <RefreshCw className="w-4 h-4" />;
    case 'published': return <CheckCircle className="w-4 h-4" />;
    case 'rejected': return <XCircle className="w-4 h-4" />;
    case 'suspended': return <AlertCircle className="w-4 h-4" />;
    case 'returned_for_revision': return <Edit className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export default function PublisherDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch publisher's e-books
  const { data: publisherEbooks = [], isLoading: isLoadingEbooks, refetch: refetchEbooks } = useQuery<PublisherEbook[]>({
    queryKey: ['/api/publisher/ebooks'],
    retry: false,
  });

  // Fetch publisher stats
  const { data: publisherStats, isLoading: isLoadingStats } = useQuery<PublisherStats>({
    queryKey: ['/api/publisher/stats'],
    retry: false,
  });

  // Filter e-books based on search and status
  const filteredEbooks = publisherEbooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ebook.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const response = await apiRequest("PUT", `/api/publisher/ebooks/${id}/action`, { action });
      return response.json();
    },
    onSuccess: () => {
      refetchEbooks();
      toast({
        title: "E-book Updated",
        description: "Your e-book has been updated successfully.",
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

  const handleAction = (ebookId: string, action: string) => {
    updateStatusMutation.mutate({ id: ebookId, action });
  };

  if (isLoadingEbooks || isLoadingStats) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Publisher Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage your e-books, track performance, and grow your audience
                </p>
              </div>
              <Button
                onClick={() => setLocation("/author-upload")}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-new-ebook"
              >
                <Plus className="w-4 h-4 mr-2" />
                New E-book
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total E-books</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {publisherStats?.totalEbooks || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {publisherStats?.publishedEbooks || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Download className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {publisherStats?.totalDownloads || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${publisherStats?.totalRevenue || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {publisherStats?.averageRating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {publisherStats?.pendingReviews || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">E-books</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search e-books..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-ebooks"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="returned_for_revision">Needs Revision</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* E-books List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEbooks.map((ebook) => (
                  <Card key={ebook.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Status and Actions */}
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(ebook.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(ebook.status)}
                              {ebook.status.replace('_', ' ')}
                            </div>
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" data-testid={`button-view-${ebook.id}`}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-edit-${ebook.id}`}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* E-book Info */}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {ebook.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {ebook.category}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-3">
                            {ebook.description}
                          </p>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Price</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ebook.currency} {ebook.basePrice}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Downloads</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ebook.downloadCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Rating</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              {ebook.ratingAverage.toFixed(1)} ({ebook.ratingCount})
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Revenue</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {ebook.currency} {ebook.totalRevenue}
                            </p>
                          </div>
                        </div>

                        {/* Rejection Reason */}
                        {ebook.status === 'rejected' && ebook.rejectionReason && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-xs text-red-700 dark:text-red-400">
                              <strong>Rejection Reason:</strong> {ebook.rejectionReason}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {ebook.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(ebook.id, 'submit')}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              data-testid={`button-submit-${ebook.id}`}
                            >
                              Submit for Review
                            </Button>
                          )}
                          {ebook.status === 'returned_for_revision' && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(ebook.id, 'resubmit')}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              data-testid={`button-resubmit-${ebook.id}`}
                            >
                              Resubmit
                            </Button>
                          )}
                          {ebook.status === 'published' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/ebooks/${ebook.id}`)}
                              className="flex-1"
                              data-testid={`button-view-marketplace-${ebook.id}`}
                            >
                              View in Store
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEbooks.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No e-books found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by publishing your first e-book."
                      }
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Button
                        onClick={() => setLocation("/author-upload")}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-create-first-ebook"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First E-book
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Earnings dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}