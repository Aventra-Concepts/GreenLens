import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Check, 
  X, 
  RefreshCw, 
  Settings, 
  Activity,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Globe,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface PaymentGateway {
  id: string;
  provider: string;
  displayName: string;
  isEnabled: boolean;
  isTestMode: boolean;
  isPrimary: boolean;
  supportedCurrencies: string[];
  supportedCountries: string[];
  configStatus: string;
  lastStatusCheck: string;
  statusMessage: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalRevenue: string;
  webhookUrl: string | null;
  createdAt: string;
}

interface GatewayTransaction {
  id: string;
  transactionId: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string | null;
  customerEmail: string | null;
  createdAt: string;
}

export default function PaymentGatewaysPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const { data: gateways, isLoading } = useQuery<PaymentGateway[]>({
    queryKey: ['/api/admin/payment-gateways'],
  });

  const { data: selectedStats } = useQuery({
    queryKey: ['/api/admin/payment-gateways', selectedGateway],
    enabled: !!selectedGateway,
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async ({ provider, updates }: { provider: string; updates: any }) => {
      return apiRequest('PUT', `/api/admin/payment-gateways/${provider}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
      toast({
        title: 'Gateway Updated',
        description: 'Payment gateway configuration updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update payment gateway',
        variant: 'destructive',
      });
    },
  });

  const refreshStatusMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest('POST', `/api/admin/payment-gateways/${provider}/refresh`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
      toast({
        title: 'Status Refreshed',
        description: 'Gateway status has been updated.',
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest('POST', `/api/admin/payment-gateways/${provider}/test`);
    },
    onSuccess: (data: any) => {
      toast({
        title: data.success ? 'Connection Successful' : 'Connection Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
    },
  });

  const handleToggleEnabled = (gateway: PaymentGateway) => {
    updateGatewayMutation.mutate({
      provider: gateway.provider,
      updates: { isEnabled: !gateway.isEnabled },
    });
  };

  const handleToggleTestMode = (gateway: PaymentGateway) => {
    updateGatewayMutation.mutate({
      provider: gateway.provider,
      updates: { isTestMode: !gateway.isTestMode },
    });
  };

  const handleSetPrimary = (gateway: PaymentGateway) => {
    updateGatewayMutation.mutate({
      provider: gateway.provider,
      updates: { isPrimary: true },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      configured: { variant: 'default', icon: Check },
      not_configured: { variant: 'secondary', icon: AlertCircle },
      error: { variant: 'destructive', icon: X },
    };

    const config = variants[status] || variants.not_configured;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="payment-gateways-page">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/admin-dashboard')}
            className="mb-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
            data-testid="button-back-to-admin"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Payment Gateway Integration</h1>
          <p className="text-muted-foreground">
            Manage payment providers and configure integrations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] })}
          data-testid="button-refresh-all"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gateways</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-gateways">{gateways?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {gateways?.filter(g => g.isEnabled).length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-transactions">
              {gateways?.reduce((acc, g) => acc + (g.totalTransactions || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {gateways?.reduce((acc, g) => acc + (g.successfulTransactions || 0), 0) || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              ${gateways?.reduce((acc, g) => acc + parseFloat(g.totalRevenue || '0'), 0).toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Across all providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-success-rate">
              {gateways && gateways.reduce((acc, g) => acc + (g.totalTransactions || 0), 0) > 0
                ? (
                    (gateways.reduce((acc, g) => acc + (g.successfulTransactions || 0), 0) /
                      gateways.reduce((acc, g) => acc + (g.totalTransactions || 0), 0)) *
                    100
                  ).toFixed(1)
                : '0'}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average across all</p>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gateways?.map((gateway) => (
          <Card key={gateway.id} className={gateway.isPrimary ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {gateway.displayName}
                    {gateway.isPrimary && (
                      <Badge variant="default" data-testid={`badge-primary-${gateway.provider}`}>Primary</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {getStatusBadge(gateway.configStatus)}
                    {gateway.isTestMode && (
                      <Badge variant="outline" data-testid={`badge-test-${gateway.provider}`}>Test Mode</Badge>
                    )}
                  </CardDescription>
                </div>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gateway.statusMessage && gateway.configStatus === 'not_configured' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {gateway.statusMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Transactions</p>
                  <p className="font-semibold" data-testid={`text-transactions-${gateway.provider}`}>
                    {gateway.totalTransactions || 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold" data-testid={`text-revenue-${gateway.provider}`}>
                    ${parseFloat(gateway.totalRevenue || '0').toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Gateway</span>
                  <Switch
                    checked={gateway.isEnabled}
                    onCheckedChange={() => handleToggleEnabled(gateway)}
                    disabled={updateGatewayMutation.isPending}
                    data-testid={`switch-enabled-${gateway.provider}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Test Mode</span>
                  <Switch
                    checked={gateway.isTestMode}
                    onCheckedChange={() => handleToggleTestMode(gateway)}
                    disabled={updateGatewayMutation.isPending}
                    data-testid={`switch-testmode-${gateway.provider}`}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => refreshStatusMutation.mutate(gateway.provider)}
                  disabled={refreshStatusMutation.isPending}
                  data-testid={`button-refresh-${gateway.provider}`}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => testConnectionMutation.mutate(gateway.provider)}
                  disabled={testConnectionMutation.isPending}
                  data-testid={`button-test-${gateway.provider}`}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Test
                </Button>
                {!gateway.isPrimary && gateway.isEnabled && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSetPrimary(gateway)}
                    disabled={updateGatewayMutation.isPending}
                    data-testid={`button-primary-${gateway.provider}`}
                  >
                    Set Primary
                  </Button>
                )}
              </div>

              <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>{gateway.supportedCurrencies.slice(0, 5).join(', ')}</span>
                  {gateway.supportedCurrencies.length > 5 && (
                    <span>+{gateway.supportedCurrencies.length - 5} more</span>
                  )}
                </div>
                {gateway.lastStatusCheck && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Last checked: {new Date(gateway.lastStatusCheck).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
          <CardDescription>
            Add environment variables to configure payment gateways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cashfree">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cashfree" data-testid="tab-cashfree">Cashfree</TabsTrigger>
              <TabsTrigger value="razorpay" data-testid="tab-razorpay">Razorpay</TabsTrigger>
              <TabsTrigger value="paypal" data-testid="tab-paypal">PayPal</TabsTrigger>
            </TabsList>
            <TabsContent value="cashfree" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Environment Variables Required:</h4>
                <pre className="text-sm bg-background p-2 rounded">
                  CASHFREE_APP_ID=your_cashfree_app_id{'\n'}
                  CASHFREE_SECRET_KEY=your_cashfree_secret_key
                </pre>
                <p className="text-sm text-muted-foreground">
                  Supports: INR, USD, EUR, GBP for domestic and international payments
                </p>
              </div>
            </TabsContent>
            <TabsContent value="razorpay" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Environment Variables Required:</h4>
                <pre className="text-sm bg-background p-2 rounded">
                  RAZORPAY_KEY_ID=your_razorpay_key_id{'\n'}
                  RAZORPAY_KEY_SECRET=your_razorpay_key_secret
                </pre>
                <p className="text-sm text-muted-foreground">
                  Supports: INR, USD for Indian market payments
                </p>
              </div>
            </TabsContent>
            <TabsContent value="paypal" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Environment Variables Required:</h4>
                <pre className="text-sm bg-background p-2 rounded">
                  PAYPAL_CLIENT_ID=your_paypal_client_id{'\n'}
                  PAYPAL_CLIENT_SECRET=your_paypal_client_secret
                </pre>
                <p className="text-sm text-muted-foreground">
                  Supports: USD, EUR, GBP, INR for global payments
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
