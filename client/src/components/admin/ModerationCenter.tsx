import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  FileText,
  MessageSquare,
  Search,
  Filter,
  Flag
} from "lucide-react";

interface ModerationItem {
  id: string;
  entityType: 'user' | 'blog_post' | 'review' | 'ebook' | 'comment';
  entityId: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reportReason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  reviewedAt?: string;
  moderatorId?: string;
  moderatorNotes?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  reports: {
    id: string;
    reason: string;
    details: string;
    reporterId: string;
    createdAt: string;
  }[];
}

export default function ModerationCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [moderationNotes, setModerationNotes] = useState("");

  // Fetch moderation queue
  const { data: moderationQueue = [], isLoading } = useQuery<ModerationItem[]>({
    queryKey: ["/api/admin/moderation/queue", { status: statusFilter, entityType: entityTypeFilter }],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Moderate item mutation
  const moderateItemMutation = useMutation({
    mutationFn: async ({ itemId, status, reason, notes }: { 
      itemId: string; 
      status: 'approved' | 'rejected'; 
      reason?: string; 
      notes?: string; 
    }) => {
      const response = await apiRequest('PATCH', `/api/admin/moderation/${itemId}`, {
        status,
        reason,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/queue"] });
      setSelectedItem(null);
      setModerationNotes("");
      toast({
        title: "Moderation Complete",
        description: "Item has been successfully moderated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to moderate item",
        variant: "destructive",
      });
    }
  });

  const handleModerate = (action: 'approved' | 'rejected', reason?: string) => {
    if (!selectedItem) return;
    
    moderateItemMutation.mutate({
      itemId: selectedItem.id,
      status: action,
      reason,
      notes: moderationNotes
    });
  };

  const filteredItems = moderationQueue.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntityType = entityTypeFilter === "all" || item.entityType === entityTypeFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    
    return matchesSearch && matchesEntityType && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'blog_post': return <FileText className="w-4 h-4" />;
      case 'ebook': return <FileText className="w-4 h-4" />;
      case 'review': return <MessageSquare className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Moderation Center</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and moderate community content</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-orange-600">
            {filteredItems.filter(i => i.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="text-red-600">
            {filteredItems.filter(i => i.priority === 'urgent').length} Urgent
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search content, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="moderation-search"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entityType">Content Type</Label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger data-testid="entity-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="blog_post">Blog Posts</SelectItem>
                  <SelectItem value="ebook">E-books</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="priority-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("pending");
                  setEntityTypeFilter("all");
                  setPriorityFilter("all");
                }}
                data-testid="clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Queue */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items to moderate</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== "pending" || entityTypeFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters" 
                  : "All content has been reviewed"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getEntityIcon(item.entityType)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By: {item.author.name}</span>
                        <span>•</span>
                        <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{item.reports.length} report(s)</span>
                        {item.reportReason && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              {item.reportReason}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedItem(item)}
                        data-testid={`review-item-${item.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              setSelectedItem(item);
                              handleModerate('approved');
                            }}
                            data-testid={`approve-item-${item.id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setSelectedItem(item)}
                            data-testid={`reject-item-${item.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getEntityIcon(selectedItem.entityType)}
              Review Content: {selectedItem?.title}
            </DialogTitle>
            <DialogDescription>
              Submitted by {selectedItem?.author.name} on {selectedItem && new Date(selectedItem.submittedAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Content Preview */}
              <div>
                <Label className="text-base font-medium">Content</Label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedItem.content}</p>
                </div>
              </div>

              {/* Reports */}
              {selectedItem.reports.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Reports ({selectedItem.reports.length})</Label>
                  <div className="mt-2 space-y-3">
                    {selectedItem.reports.map((report) => (
                      <div key={report.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-red-600">
                            {report.reason}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{report.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Information */}
              <div>
                <Label className="text-base font-medium">Author Information</Label>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{selectedItem.author.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{selectedItem.author.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moderation Notes */}
              <div>
                <Label htmlFor="moderationNotes" className="text-base font-medium">
                  Moderation Notes
                </Label>
                <Textarea
                  id="moderationNotes"
                  placeholder="Add notes about your moderation decision..."
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                  data-testid="moderation-notes"
                />
              </div>

              {/* Action Buttons */}
              {selectedItem.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleModerate('approved')}
                    disabled={moderateItemMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    data-testid="approve-button"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {moderateItemMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    onClick={() => handleModerate('rejected', 'Inappropriate content')}
                    disabled={moderateItemMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                    data-testid="reject-button"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {moderateItemMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}