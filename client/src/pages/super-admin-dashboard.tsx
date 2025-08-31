import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Leaf,
  Mail
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

  // Test subscription email notifications
  const testSubscriptionEmailMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/system/test-subscription-email');
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Subscription reminder test email has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Email Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    }
  });

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
                  onClick={() => setLocation("/admin-dashboard")}
                  className="flex items-center gap-2"
                  data-testid="back-to-admin"
                >
                  <Shield className="w-4 h-4" />
                  Back to Admin
                </Button>
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
            <TabsList className="grid w-full grid-cols-10">
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
              <TabsTrigger value="email" className="flex items-center gap-2 bg-green-100 text-green-800 font-bold">
                <Mail className="w-4 h-4" />
                📧 Email
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

            {/* Email & Subscriptions Tab */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    Email & Subscription Management
                  </CardTitle>
                  <CardDescription>
                    Configure email notifications and subscription reminders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subscription Email Notifications */}
                  <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50">
                    <h3 className="text-lg font-semibold text-green-800">Subscription Email Notifications</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">15-Day Expiry Reminders</Label>
                          <p className="text-xs text-gray-600">Send reminders 15 days before subscription expires</p>
                        </div>
                        <Switch data-testid="switch-15-day-reminders" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">7-Day Expiry Reminders</Label>
                          <p className="text-xs text-gray-600">Send urgent reminders 7 days before expiry</p>
                        </div>
                        <Switch data-testid="switch-7-day-reminders" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Renewal Confirmations</Label>
                          <p className="text-xs text-gray-600">Send confirmation emails after payment renewal</p>
                        </div>
                        <Switch data-testid="switch-renewal-confirmations" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">SendGrid Status</Label>
                          <p className="text-xs text-gray-600">Email service provider status</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-600">Not Configured</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => testSubscriptionEmailMutation.mutate()}
                        disabled={testSubscriptionEmailMutation.isPending}
                        className="flex items-center gap-2"
                        data-testid="test-subscription-email"
                      >
                        <Mail className="w-4 h-4" />
                        {testSubscriptionEmailMutation.isPending ? "Sending..." : "Test Subscription Email"}
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex items-center gap-2"
                        data-testid="save-email-settings"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Save Settings
                      </Button>
                    </div>
                  </div>
                  
                  {/* Email Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Email Configuration</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email Provider</Label>
                        <Select>
                          <SelectTrigger data-testid="select-email-provider">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smtp">SMTP</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="mailgun">Mailgun</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="from-email">From Email</Label>
                        <Input
                          id="from-email"
                          type="email"
                          placeholder="noreply@greenlens.com"
                          data-testid="input-from-email"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="from-name">From Name</Label>
                        <Input
                          id="from-name"
                          placeholder="GreenLens"
                          data-testid="input-from-name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          placeholder="smtp.gmail.com"
                          data-testid="input-smtp-host"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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