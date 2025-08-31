import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Users, 
  BarChart, 
  Settings, 
  FileText, 
  Palette, 
  UserPlus,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Monitor,
  Database,
  Globe,
  Lock,
  Eye,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  Image,
  Megaphone,
  Paintbrush,
  Upload,
  Download,
  RefreshCw,
  Leaf
} from "lucide-react";

// Import specialized admin components
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import ModerationCenter from "@/components/admin/ModerationCenter";
import BrandingStudio from "@/components/admin/BrandingStudio";
import UserManagement from "@/components/admin/UserManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import { AdvancedPremiumDashboard } from "@/components/AdvancedPremiumDashboard";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
}

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    pendingModerations: number;
    systemAlerts: number;
    revenue: number;
    plantIdentifications: number;
  };
  realTime: {
    onlineUsers: number;
    activeIdentifications: number;
    pendingOrders: number;
    serverLoad: number;
  };
  security: {
    failedLogins: number;
    suspiciousActivity: number;
    activeAdminSessions: number;
  };
}

export default function SuperAdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Check admin authentication
  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    const user = sessionStorage.getItem("adminUser");
    
    if (!token || !user) {
      setLocation("/super-admin-login");
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch {
      setLocation("/super-admin-login");
    }
  }, [setLocation]);

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!adminUser
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("adminToken");
      await apiRequest('POST', '/api/admin/auth/logout', { token });
    },
    onSuccess: () => {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminUser");
      toast({
        title: "Logged Out",
        description: "You have been safely logged out",
      });
      setLocation("/super-admin-login");
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Admin Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    GreenLens Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome back, {adminUser.firstName} {adminUser.lastName}
                    {adminUser.isSuperAdmin && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Super Admin
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchStats()}
                  className="flex items-center gap-2"
                  data-testid="refresh-dashboard"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                  data-testid="admin-logout"
                >
                  <Lock className="w-4 h-4" />
                  Secure Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="premium-view" className="flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Premium View
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Moderation
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-8 bg-gray-200 rounded w-1/2" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats?.overview.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardStats?.overview.activeUsers || 0} active
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plant IDs</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats?.overview.plantIdentifications || 0}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${dashboardStats?.overview.revenue || 0}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Moderation Queue</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats?.overview.pendingModerations || 0}</div>
                        <p className="text-xs text-muted-foreground">Pending review</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats?.overview.systemAlerts || 0}</div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Server Load</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardStats?.realTime.serverLoad || 0}%</div>
                        <p className="text-xs text-muted-foreground">Current usage</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Real-time Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Real-time Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Online Users</span>
                          <span className="font-semibold">{dashboardStats?.realTime.onlineUsers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Active Identifications</span>
                          <span className="font-semibold">{dashboardStats?.realTime.activeIdentifications || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pending Orders</span>
                          <span className="font-semibold">{dashboardStats?.realTime.pendingOrders || 0}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Security Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Failed Logins (24h)</span>
                          <span className="font-semibold text-red-600">{dashboardStats?.security.failedLogins || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Suspicious Activity</span>
                          <span className="font-semibold text-yellow-600">{dashboardStats?.security.suspiciousActivity || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Active Admin Sessions</span>
                          <span className="font-semibold text-green-600">{dashboardStats?.security.activeAdminSessions || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Premium User View Tab */}
            <TabsContent value="premium-view" className="space-y-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium User Experience</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This is exactly what your premium subscribers see when they access their dashboard.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <AdvancedPremiumDashboard />
              </div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            {/* Employee Management Tab */}
            <TabsContent value="employees">
              <EmployeeManagement />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation">
              <ModerationCenter />
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding">
              <BrandingStudio />
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Center
                  </CardTitle>
                  <CardDescription>
                    Monitor and manage system security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Security Center implementation coming soon...
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