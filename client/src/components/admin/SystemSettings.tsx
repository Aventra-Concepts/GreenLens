import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Database, 
  Mail, 
  Bell, 
  Shield, 
  Globe, 
  Key, 
  Upload, 
  Download, 
  RefreshCw, 
  Save, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Server,
  Monitor,
  FileText,
  Zap,
  BarChart3,
  Activity
} from "lucide-react";

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    supportEmail: string;
    timezone: string;
    dateFormat: string;
    language: string;
    enableRegistration: boolean;
    enableGuestAccess: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun';
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableEmailNotifications: boolean;
    enableWelcomeEmails: boolean;
    enable15DayReminders: boolean;
    enable7DayReminders: boolean;
    enableRenewalConfirmations: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    enableApiKeys: boolean;
    enableRateLimiting: boolean;
    rateLimit: number;
    enableSsl: boolean;
    enableCsrfProtection: boolean;
    enableCors: boolean;
    allowedOrigins: string[];
  };
  api: {
    plantIdApiKey: string;
    geminiApiKey: string;
    stripeSecretKey: string;
    stripePublicKey: string;
    paypalClientId: string;
    paypalClientSecret: string;
    enableApiLogging: boolean;
    apiTimeout: number;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  notifications: {
    enablePushNotifications: boolean;
    enableEmailAlerts: boolean;
    enableSlackIntegration: boolean;
    slackWebhookUrl: string;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      userActivity: number;
      storageUsage: number;
    };
  };
  backup: {
    enableAutoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupRetention: number;
    backupLocation: 'local' | 'cloud';
    lastBackup: string;
  };
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    connections: number;
    maxConnections: number;
    queryTime: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    uptime: number;
    requests: number;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    used: number;
    total: number;
    percentage: number;
  };
  memory: {
    status: 'healthy' | 'warning' | 'error';
    used: number;
    total: number;
    percentage: number;
  };
}

export default function SystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('email');
  const [showSecrets, setShowSecrets] = useState(false);

  // Fetch system settings
  const { data: settings, isLoading, refetch } = useQuery<SystemSettings>({
    queryKey: ["/api/admin/system/settings"],
  });

  // Fetch system health
  const { data: systemHealth, refetch: refetchHealth } = useQuery<SystemHealth>({
    queryKey: ["/api/admin/system/health"],
    refetchInterval: 30000,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<SystemSettings>) => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('PUT', '/api/admin/system/settings', {
        ...newSettings,
        adminToken: token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system"] });
      toast({
        title: "Settings Updated",
        description: "System settings have been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  // Test email configuration
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('POST', '/api/admin/system/test-email', {
        adminToken: token
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Test Sent",
        description: "Test email has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Email Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    }
  });

  // Test subscription email notifications
  const testSubscriptionEmailMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('POST', '/api/admin/system/test-subscription-email', {
        adminToken: token
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscription Email Test Sent",
        description: "Test subscription reminder email has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Email Test Failed",
        description: error.message || "Failed to send test subscription email",
        variant: "destructive",
      });
    }
  });

  // Backup system
  const backupMutation = useMutation({
    mutationFn: async () => {
      const token = sessionStorage.getItem("adminToken");
      return await apiRequest('POST', '/api/admin/system/backup', {
        adminToken: token
      });
    },
    onSuccess: () => {
      toast({
        title: "Backup Created",
        description: "System backup has been created successfully",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Backup Failed",
        description: error.message || "Failed to create backup",
        variant: "destructive",
      });
    }
  });

  const handleSettingUpdate = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    };
    
    updateSettingsMutation.mutate({ [section]: updatedSettings[section] });
  };

  const getHealthStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system-wide settings and monitor health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetch();
              refetchHealth();
            }}
            className="flex items-center gap-2"
            data-testid="refresh-settings"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth && getHealthStatusBadge(systemHealth.database.status)}
              <div className="text-xs text-muted-foreground">
                {systemHealth?.database.connections || 0}/{systemHealth?.database.maxConnections || 0} connections
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth && getHealthStatusBadge(systemHealth.api.status)}
              <div className="text-xs text-muted-foreground">
                {systemHealth?.api.responseTime || 0}ms avg response
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth && getHealthStatusBadge(systemHealth.storage.status)}
              <div className="text-xs text-muted-foreground">
                {systemHealth?.storage.percentage || 0}% used
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth && getHealthStatusBadge(systemHealth.memory.status)}
              <div className="text-xs text-muted-foreground">
                {systemHealth?.memory.percentage || 0}% used
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 font-semibold bg-green-50 hover:bg-green-100 border border-green-200 text-green-700">
            <Mail className="w-4 h-4" />
            📧 Email & Subscriptions
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Site Configuration
              </CardTitle>
              <CardDescription>
                Basic site settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={settings?.general.siteName || ""}
                    onChange={(e) => handleSettingUpdate('general', 'siteName', e.target.value)}
                    placeholder="GreenLens"
                    data-testid="input-site-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input
                    id="site-url"
                    value={settings?.general.siteUrl || ""}
                    onChange={(e) => handleSettingUpdate('general', 'siteUrl', e.target.value)}
                    placeholder="https://greenlens.com"
                    data-testid="input-site-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={settings?.general.adminEmail || ""}
                    onChange={(e) => handleSettingUpdate('general', 'adminEmail', e.target.value)}
                    placeholder="admin@greenlens.com"
                    data-testid="input-admin-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings?.general.supportEmail || ""}
                    onChange={(e) => handleSettingUpdate('general', 'supportEmail', e.target.value)}
                    placeholder="support@greenlens.com"
                    data-testid="input-support-email"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-gray-600">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings?.general.enableRegistration || false}
                    onCheckedChange={(checked) => handleSettingUpdate('general', 'enableRegistration', checked)}
                    data-testid="switch-registration"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Guest Access</Label>
                    <p className="text-sm text-gray-600">Allow guest users to browse</p>
                  </div>
                  <Switch
                    checked={settings?.general.enableGuestAccess || false}
                    onCheckedChange={(checked) => handleSettingUpdate('general', 'enableGuestAccess', checked)}
                    data-testid="switch-guest-access"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Put site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings?.general.maintenanceMode || false}
                    onCheckedChange={(checked) => handleSettingUpdate('general', 'maintenanceMode', checked)}
                    data-testid="switch-maintenance"
                  />
                </div>

                {settings?.general.maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance-message"
                      value={settings?.general.maintenanceMessage || ""}
                      onChange={(e) => handleSettingUpdate('general', 'maintenanceMessage', e.target.value)}
                      placeholder="We're currently performing maintenance..."
                      rows={3}
                      data-testid="textarea-maintenance"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email settings and SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Provider</Label>
                <Select 
                  value={settings?.email.provider || 'smtp'} 
                  onValueChange={(value) => handleSettingUpdate('email', 'provider', value)}
                >
                  <SelectTrigger data-testid="select-email-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={settings?.email.smtpHost || ""}
                    onChange={(e) => handleSettingUpdate('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                    data-testid="input-smtp-host"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={settings?.email.smtpPort || 587}
                    onChange={(e) => handleSettingUpdate('email', 'smtpPort', parseInt(e.target.value))}
                    data-testid="input-smtp-port"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={settings?.email.fromEmail || ""}
                    onChange={(e) => handleSettingUpdate('email', 'fromEmail', e.target.value)}
                    placeholder="noreply@greenlens.com"
                    data-testid="input-from-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={settings?.email.fromName || ""}
                    onChange={(e) => handleSettingUpdate('email', 'fromName', e.target.value)}
                    placeholder="GreenLens"
                    data-testid="input-from-name"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Enable automatic email notifications</p>
                  </div>
                  <Switch
                    checked={settings?.email.enableEmailNotifications || false}
                    onCheckedChange={(checked) => handleSettingUpdate('email', 'enableEmailNotifications', checked)}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Welcome Emails</Label>
                    <p className="text-sm text-gray-600">Send welcome emails to new users</p>
                  </div>
                  <Switch
                    checked={settings?.email.enableWelcomeEmails || false}
                    onCheckedChange={(checked) => handleSettingUpdate('email', 'enableWelcomeEmails', checked)}
                    data-testid="switch-welcome-emails"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => testEmailMutation.mutate()}
                  disabled={testEmailMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="test-email"
                >
                  <Mail className="w-4 h-4" />
                  {testEmailMutation.isPending ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Email Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Subscription Email Notifications
              </CardTitle>
              <CardDescription>
                Configure automated subscription reminder and renewal emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>15-Day Expiry Reminders</Label>
                    <p className="text-sm text-gray-600">Send reminders 15 days before subscription expires</p>
                  </div>
                  <Switch
                    checked={settings?.email.enable15DayReminders !== false}
                    onCheckedChange={(checked) => handleSettingUpdate('email', 'enable15DayReminders', checked)}
                    data-testid="switch-15day-reminders"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>7-Day Expiry Reminders</Label>
                    <p className="text-sm text-gray-600">Send reminders 7 days before subscription expires</p>
                  </div>
                  <Switch
                    checked={settings?.email.enable7DayReminders !== false}
                    onCheckedChange={(checked) => handleSettingUpdate('email', 'enable7DayReminders', checked)}
                    data-testid="switch-7day-reminders"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Renewal Confirmations</Label>
                    <p className="text-sm text-gray-600">Send confirmation emails when subscriptions are renewed</p>
                  </div>
                  <Switch
                    checked={settings?.email.enableRenewalConfirmations !== false}
                    onCheckedChange={(checked) => handleSettingUpdate('email', 'enableRenewalConfirmations', checked)}
                    data-testid="switch-renewal-confirmations"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Service Status</Label>
                    <p className="text-sm text-gray-600">SendGrid API configuration status</p>
                  </div>
                  <Badge variant={process.env.SENDGRID_API_KEY ? "default" : "destructive"}>
                    {process.env.SENDGRID_API_KEY ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testSubscriptionEmailMutation.mutate()}
                    disabled={testSubscriptionEmailMutation.isPending}
                    className="flex items-center gap-2"
                    data-testid="test-subscription-email"
                  >
                    <Bell className="w-4 h-4" />
                    {testSubscriptionEmailMutation.isPending ? "Sending..." : "Test Subscription Email"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure security settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings?.security.sessionTimeout || 30}
                    onChange={(e) => handleSettingUpdate('security', 'sessionTimeout', parseInt(e.target.value))}
                    data-testid="input-session-timeout"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={settings?.security.maxLoginAttempts || 5}
                    onChange={(e) => handleSettingUpdate('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    data-testid="input-max-login"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings?.security.enableTwoFactor || false}
                    onCheckedChange={(checked) => handleSettingUpdate('security', 'enableTwoFactor', checked)}
                    data-testid="switch-2fa"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-gray-600">Enable API rate limiting</p>
                  </div>
                  <Switch
                    checked={settings?.security.enableRateLimiting || false}
                    onCheckedChange={(checked) => handleSettingUpdate('security', 'enableRateLimiting', checked)}
                    data-testid="switch-rate-limiting"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>CSRF Protection</Label>
                    <p className="text-sm text-gray-600">Enable CSRF token validation</p>
                  </div>
                  <Switch
                    checked={settings?.security.enableCsrfProtection || false}
                    onCheckedChange={(checked) => handleSettingUpdate('security', 'enableCsrfProtection', checked)}
                    data-testid="switch-csrf"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys & Integrations
              </CardTitle>
              <CardDescription>
                Manage external API keys and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Show API Keys</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="flex items-center gap-2"
                  data-testid="toggle-secrets"
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showSecrets ? "Hide" : "Show"}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plant-id-key">Plant.id API Key</Label>
                  <Input
                    id="plant-id-key"
                    type={showSecrets ? "text" : "password"}
                    value={settings?.api.plantIdApiKey || ""}
                    onChange={(e) => handleSettingUpdate('api', 'plantIdApiKey', e.target.value)}
                    placeholder="Enter Plant.id API key"
                    data-testid="input-plant-id-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                  <Input
                    id="gemini-key"
                    type={showSecrets ? "text" : "password"}
                    value={settings?.api.geminiApiKey || ""}
                    onChange={(e) => handleSettingUpdate('api', 'geminiApiKey', e.target.value)}
                    placeholder="Enter Gemini API key"
                    data-testid="input-gemini-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                  <Input
                    id="stripe-secret"
                    type={showSecrets ? "text" : "password"}
                    value={settings?.api.stripeSecretKey || ""}
                    onChange={(e) => handleSettingUpdate('api', 'stripeSecretKey', e.target.value)}
                    placeholder="sk_..."
                    data-testid="input-stripe-secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-public">Stripe Public Key</Label>
                  <Input
                    id="stripe-public"
                    value={settings?.api.stripePublicKey || ""}
                    onChange={(e) => handleSettingUpdate('api', 'stripePublicKey', e.target.value)}
                    placeholder="pk_..."
                    data-testid="input-stripe-public"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Configuration
              </CardTitle>
              <CardDescription>
                Configure system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-gray-600">Send alerts via email</p>
                  </div>
                  <Switch
                    checked={settings?.notifications.enableEmailAlerts || false}
                    onCheckedChange={(checked) => handleSettingUpdate('notifications', 'enableEmailAlerts', checked)}
                    data-testid="switch-email-alerts"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Integration</Label>
                    <p className="text-sm text-gray-600">Send alerts to Slack</p>
                  </div>
                  <Switch
                    checked={settings?.notifications.enableSlackIntegration || false}
                    onCheckedChange={(checked) => handleSettingUpdate('notifications', 'enableSlackIntegration', checked)}
                    data-testid="switch-slack"
                  />
                </div>

                {settings?.notifications.enableSlackIntegration && (
                  <div className="space-y-2">
                    <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      value={settings?.notifications.slackWebhookUrl || ""}
                      onChange={(e) => handleSettingUpdate('notifications', 'slackWebhookUrl', e.target.value)}
                      placeholder="https://hooks.slack.com/..."
                      data-testid="input-slack-webhook"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Alert Thresholds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="error-rate">Error Rate (%)</Label>
                    <Input
                      id="error-rate"
                      type="number"
                      value={settings?.notifications.alertThresholds.errorRate || 5}
                      onChange={(e) => handleSettingUpdate('notifications', 'alertThresholds', {
                        ...settings?.notifications.alertThresholds,
                        errorRate: parseInt(e.target.value)
                      })}
                      data-testid="input-error-rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="response-time">Response Time (ms)</Label>
                    <Input
                      id="response-time"
                      type="number"
                      value={settings?.notifications.alertThresholds.responseTime || 2000}
                      onChange={(e) => handleSettingUpdate('notifications', 'alertThresholds', {
                        ...settings?.notifications.alertThresholds,
                        responseTime: parseInt(e.target.value)
                      })}
                      data-testid="input-response-time"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup Configuration
              </CardTitle>
              <CardDescription>
                Configure automated backups and recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-gray-600">Enable scheduled backups</p>
                </div>
                <Switch
                  checked={settings?.backup.enableAutoBackup || false}
                  onCheckedChange={(checked) => handleSettingUpdate('backup', 'enableAutoBackup', checked)}
                  data-testid="switch-auto-backup"
                />
              </div>

              {settings?.backup.enableAutoBackup && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select 
                      value={settings?.backup.backupFrequency || 'daily'} 
                      onValueChange={(value) => handleSettingUpdate('backup', 'backupFrequency', value)}
                    >
                      <SelectTrigger data-testid="select-backup-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-retention">Retention Period (days)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      value={settings?.backup.backupRetention || 30}
                      onChange={(e) => handleSettingUpdate('backup', 'backupRetention', parseInt(e.target.value))}
                      data-testid="input-backup-retention"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="font-medium">Last Backup</div>
                  <div className="text-sm text-gray-600">
                    {settings?.backup.lastBackup ? 
                      new Date(settings.backup.lastBackup).toLocaleString() : 
                      "Never"
                    }
                  </div>
                </div>
                <Button
                  onClick={() => backupMutation.mutate()}
                  disabled={backupMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="create-backup"
                >
                  <Upload className="w-4 h-4" />
                  {backupMutation.isPending ? "Creating..." : "Create Backup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}