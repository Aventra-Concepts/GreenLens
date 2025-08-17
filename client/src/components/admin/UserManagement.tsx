import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Crown,
  User,
  GraduationCap,
  BookOpen,
  RefreshCw,
  Download,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  phone?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isActive: boolean;
  emailVerified: boolean;
  isStudent: boolean;
  isAuthor: boolean;
  studentDetails?: {
    universityName: string;
    studentId: string;
    graduationYear: number;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  authorDetails?: {
    bio: string;
    expertise: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  subscriptionStatus: 'free' | 'pro' | 'premium';
  plantIdentifications: number;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'pending';
  role: 'all' | 'user' | 'student' | 'author' | 'admin';
  subscription: 'all' | 'free' | 'pro' | 'premium';
  verification: 'all' | 'verified' | 'pending' | 'rejected';
}

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    subscription: 'all',
    verification: 'all'
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch users with filters
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/users", filters, page, pageSize],
    queryFn: async () => {
      const token = sessionStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        adminToken: token || '',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== 'all' && v !== ''))
      });
      const response = await fetch(`/api/admin/users?${params}`);
      return response.json();
    }
  });

  // Update user status
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string, updates: Partial<AdminUser> }) => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('PUT', `/api/admin/users/${userId}`, {
        ...updates,
        adminToken: token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Updated",
        description: "User status has been successfully updated",
      });
      setShowUserDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('DELETE', `/api/admin/users/${userId}`, {
        adminToken: token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  });

  // Export users
  const exportUsersMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("adminToken");
      const response = await fetch('/api/admin/users/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminToken: token, filters })
      });
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Complete",
        description: "Users have been exported to CSV",
      });
    }
  });

  const handleUserUpdate = (userId: string, updates: Partial<AdminUser>) => {
    updateUserMutation.mutate({ userId, updates });
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const getUserRoleBadge = (user: AdminUser) => {
    if (user.isSuperAdmin) return <Badge variant="destructive"><Crown className="w-3 h-3 mr-1" />Super Admin</Badge>;
    if (user.isAdmin) return <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
    if (user.isAuthor) return <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" />Author</Badge>;
    if (user.isStudent) return <Badge variant="outline"><GraduationCap className="w-3 h-3 mr-1" />Student</Badge>;
    return <Badge variant="outline"><User className="w-3 h-3 mr-1" />User</Badge>;
  };

  const getStatusBadge = (user: AdminUser) => {
    if (!user.isActive) return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Inactive</Badge>;
    if (!user.emailVerified) return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Unverified</Badge>;
    return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => exportUsersMutation.mutate()}
            disabled={exportUsersMutation.isPending}
            className="flex items-center gap-2"
            data-testid="export-users"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="refresh-users"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Name, email, or ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                  data-testid="input-search-users"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subscription</Label>
              <Select value={filters.subscription} onValueChange={(value) => handleFilterChange('subscription', value)}>
                <SelectTrigger data-testid="select-subscription">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Verification</Label>
              <Select value={filters.verification} onValueChange={(value) => handleFilterChange('verification', value)}>
                <SelectTrigger data-testid="select-verification">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({usersData?.total || 0})
            </div>
            <div className="text-sm text-gray-600">
              Page {page} of {Math.ceil((usersData?.total || 0) / pageSize)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData?.users?.map((user: AdminUser) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      {user.location && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.location}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getUserRoleBadge(user)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    <Badge variant={user.subscriptionStatus === 'free' ? 'outline' : 'default'}>
                      {user.subscriptionStatus.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.plantIdentifications} IDs
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDialog(true);
                        }}
                        data-testid={`view-user-${user.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserUpdate(user.id, { isActive: !user.isActive })}
                        data-testid={`toggle-user-${user.id}`}
                      >
                        {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, usersData?.total || 0)} of {usersData?.total || 0} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                data-testid="prev-page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil((usersData?.total || 0) / pageSize)}
                data-testid="next-page"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              View and manage user account information
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={selectedUser.firstName} 
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={selectedUser.lastName} 
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    data-testid="input-last-name"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Email</Label>
                  <Input 
                    value={selectedUser.email} 
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    value={selectedUser.location} 
                    onChange={(e) => setSelectedUser({...selectedUser, location: e.target.value})}
                    data-testid="input-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={selectedUser.phone || ''} 
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    data-testid="input-phone"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="font-medium">Permissions & Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Active Account</Label>
                    <Switch
                      checked={selectedUser.isActive}
                      onCheckedChange={(checked) => setSelectedUser({...selectedUser, isActive: checked})}
                      data-testid="switch-active"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Email Verified</Label>
                    <Switch
                      checked={selectedUser.emailVerified}
                      onCheckedChange={(checked) => setSelectedUser({...selectedUser, emailVerified: checked})}
                      data-testid="switch-verified"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Admin Access</Label>
                    <Switch
                      checked={selectedUser.isAdmin}
                      onCheckedChange={(checked) => setSelectedUser({...selectedUser, isAdmin: checked})}
                      data-testid="switch-admin"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Student Status</Label>
                    <Switch
                      checked={selectedUser.isStudent}
                      onCheckedChange={(checked) => setSelectedUser({...selectedUser, isStudent: checked})}
                      data-testid="switch-student"
                    />
                  </div>
                </div>
              </div>

              {/* Student Details */}
              {selectedUser.isStudent && selectedUser.studentDetails && (
                <div className="space-y-4">
                  <h4 className="font-medium">Student Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>University</Label>
                      <p className="text-sm text-gray-600">{selectedUser.studentDetails.universityName}</p>
                    </div>
                    <div>
                      <Label>Student ID</Label>
                      <p className="text-sm text-gray-600">{selectedUser.studentDetails.studentId}</p>
                    </div>
                    <div>
                      <Label>Graduation Year</Label>
                      <p className="text-sm text-gray-600">{selectedUser.studentDetails.graduationYear}</p>
                    </div>
                    <div>
                      <Label>Verification Status</Label>
                      <Badge variant={selectedUser.studentDetails.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                        {selectedUser.studentDetails.verificationStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Author Details */}
              {selectedUser.isAuthor && selectedUser.authorDetails && (
                <div className="space-y-4">
                  <h4 className="font-medium">Author Information</h4>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <p className="text-sm text-gray-600">{selectedUser.authorDetails.bio}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Expertise</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.authorDetails.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Verification Status</Label>
                    <Badge variant={selectedUser.authorDetails.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                      {selectedUser.authorDetails.verificationStatus}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Account Stats */}
              <div className="space-y-4">
                <h4 className="font-medium">Account Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedUser.plantIdentifications}</div>
                    <div className="text-sm text-gray-600">Plant IDs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.subscriptionStatus.toUpperCase()}</div>
                    <div className="text-sm text-gray-600">Subscription</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.floor((Date.now() - new Date(selectedUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-600">Days Active</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedUser && handleUserUpdate(selectedUser.id, selectedUser)}
              disabled={updateUserMutation.isPending}
              data-testid="save-user-changes"
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}