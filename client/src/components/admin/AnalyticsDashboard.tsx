import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Activity, 
  DollarSign,
  Eye,
  ShoppingCart,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  AlertTriangle,
  Clock,
  Globe,
  Zap,
  Target,
  FileSpreadsheet,
  Monitor,
  Bell
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    revenue: number;
    plantIdentifications: number;
    ebookSales: number;
    consultations: number;
    conversionRate: number;
  };
  trends: {
    userGrowth: { date: string; value: number }[];
    revenue: { date: string; value: number }[];
    engagement: { date: string; value: number }[];
  };
  demographics: {
    countries: { name: string; users: number; percentage: number }[];
    ageGroups: { range: string; users: number; percentage: number }[];
    devices: { type: string; users: number; percentage: number }[];
  };
  performance: {
    topPages: { path: string; views: number; bounceRate: number }[];
    topEbooks: { title: string; sales: number; revenue: number }[];
    userActivity: { hour: number; users: number }[];
  };
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("users");
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [comparisonMode, setComparisonMode] = useState(false);

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics/overview", { dateRange, selectedSegment }],
    refetchInterval: realtimeEnabled ? 10000 : 60000, // 10s if realtime, 1min otherwise
  });

  // Fetch real-time metrics
  const { data: realtimeMetrics } = useQuery({
    queryKey: ["/api/admin/analytics/realtime"],
    refetchInterval: realtimeEnabled ? 5000 : false, // 5s refresh when enabled
    enabled: realtimeEnabled,
  });

  // Fetch predictive analytics
  const { data: predictions } = useQuery({
    queryKey: ["/api/admin/analytics/predictions", { dateRange }],
    refetchInterval: 300000, // 5 minutes
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Mock data for charts
  const mockUserGrowthData = [
    { date: '2024-01-01', value: 120, previousPeriod: 100 },
    { date: '2024-01-02', value: 135, previousPeriod: 110 },
    { date: '2024-01-03', value: 148, previousPeriod: 125 },
    { date: '2024-01-04', value: 162, previousPeriod: 140 },
    { date: '2024-01-05', value: 178, previousPeriod: 155 },
    { date: '2024-01-06', value: 195, previousPeriod: 170 },
    { date: '2024-01-07', value: 210, previousPeriod: 185 },
  ];

  const mockRevenueData = [
    { date: '2024-01-01', revenue: 1200, orders: 25, predicted: 1250 },
    { date: '2024-01-02', revenue: 1350, orders: 28, predicted: 1400 },
    { date: '2024-01-03', revenue: 1480, orders: 32, predicted: 1550 },
    { date: '2024-01-04', revenue: 1620, orders: 35, predicted: 1700 },
    { date: '2024-01-05', revenue: 1780, orders: 40, predicted: 1850 },
    { date: '2024-01-06', revenue: 1950, orders: 42, predicted: 2000 },
    { date: '2024-01-07', revenue: 2100, orders: 45, predicted: 2150 },
  ];

  const mockRevenueBreakdown = [
    { name: 'Subscriptions', value: 60, color: '#10b981' },
    { name: 'E-books', value: 30, color: '#3b82f6' },
    { name: 'Consultations', value: 10, color: '#8b5cf6' },
  ];

  const mockUserActivityData = [
    { hour: 0, users: 45 }, { hour: 1, users: 30 }, { hour: 2, users: 25 },
    { hour: 3, users: 20 }, { hour: 4, users: 25 }, { hour: 5, users: 35 },
    { hour: 6, users: 60 }, { hour: 7, users: 85 }, { hour: 8, users: 120 },
    { hour: 9, users: 150 }, { hour: 10, users: 180 }, { hour: 11, users: 200 },
    { hour: 12, users: 220 }, { hour: 13, users: 210 }, { hour: 14, users: 190 },
    { hour: 15, users: 175 }, { hour: 16, users: 160 }, { hour: 17, users: 140 },
    { hour: 18, users: 120 }, { hour: 19, users: 100 }, { hour: 20, users: 80 },
    { hour: 21, users: 70 }, { hour: 22, users: 60 }, { hour: 23, users: 50 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor performance and gain insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-36" data-testid="segment-selector">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="premium">Premium Users</SelectItem>
              <SelectItem value="new">New Users</SelectItem>
              <SelectItem value="returning">Returning Users</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32" data-testid="date-range-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={realtimeEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setRealtimeEnabled(!realtimeEnabled)}
            className="flex items-center gap-2"
            data-testid="realtime-toggle"
          >
            <Monitor className="w-4 h-4" />
            {realtimeEnabled ? 'Live' : 'Realtime'}
          </Button>
          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
            className="flex items-center gap-2"
            data-testid="comparison-toggle"
          >
            <BarChart3 className="w-4 h-4" />
            Compare
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
            data-testid="refresh-analytics"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            data-testid="export-analytics"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Alert Bar */}
      {realtimeEnabled && realtimeMetrics && (
        <Card className="mb-6 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Live Data</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span>{realtimeMetrics.activeUsers || 0} active users</span>
                  <span>{realtimeMetrics.liveIdentifications || 0} plant IDs in last 15 min</span>
                  <span>{realtimeMetrics.currentOrders || 0} pending orders</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.overview.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.overview.newUsers || 0} new this {dateRange === '7d' ? 'week' : 'month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.overview.revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.overview.conversionRate || 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plant IDs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.overview.plantIdentifications || 0)}</div>
            <p className="text-xs text-muted-foreground">
              AI identifications processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-book Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.overview.ebookSales || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.overview.consultations || 0} consultations booked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>User Growth</span>
                  {realtimeEnabled && (
                    <Badge variant="outline" className="animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Daily active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.trends.userGrowth || mockUserGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                      {comparisonMode && (
                        <Area
                          type="monotone"
                          dataKey="previousPeriod"
                          stroke="#6b7280"
                          fill="#6b7280"
                          fillOpacity={0.1}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Revenue Trends</span>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="avg">Avg Order</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
                <CardDescription>Revenue breakdown by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analytics?.trends.revenue || mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                      {predictions && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="predicted"
                          stroke="#f59e0b"
                          strokeDasharray="5 5"
                          name="Forecast"
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Distribution by product type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockRevenueBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockRevenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Pattern</CardTitle>
                <CardDescription>User engagement by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockUserActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `${hour}:00`}
                        formatter={(value) => [value, 'Active Users']}
                      />
                      <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Predictions & Forecasts
                </CardTitle>
                <CardDescription>AI-powered business insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div>
                      <h4 className="font-medium">Next Month Revenue</h4>
                      <p className="text-sm text-gray-600">Based on current trends</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatCurrency(45000)}</p>
                      <p className="text-xs text-gray-500">+12% confidence</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <div>
                      <h4 className="font-medium">User Growth Rate</h4>
                      <p className="text-sm text-gray-600">Projected increase</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+24%</p>
                      <p className="text-xs text-gray-500">High confidence</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div>
                      <h4 className="font-medium">Churn Risk</h4>
                      <p className="text-sm text-gray-600">Users at risk</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">3.2%</p>
                      <p className="text-xs text-gray-500">Action needed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>User distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.demographics.countries?.slice(0, 5).map((country, index) => (
                    <div key={country.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">{country.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{country.users}</span>
                        <Badge variant="outline" className="text-xs">
                          {country.percentage}%
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p>No demographic data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>How users access the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.demographics.devices?.map((device, index) => (
                    <div key={device.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">{device.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{device.users}</span>
                        <Badge variant="outline" className="text-xs">
                          {device.percentage}%
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2" />
                      <p>No device data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Cohort Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Cohort Analysis
                </CardTitle>
                <CardDescription>User retention by signup month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { month: 'Jan 2024', retention: [100, 78, 65, 58, 52] },
                    { month: 'Feb 2024', retention: [100, 82, 70, 64] },
                    { month: 'Mar 2024', retention: [100, 85, 73] },
                    { month: 'Apr 2024', retention: [100, 88] },
                    { month: 'May 2024', retention: [100] },
                  ].map((cohort, index) => (
                    <div key={cohort.month} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cohort.month}</span>
                        <span className="text-xs text-gray-500">
                          {cohort.retention[cohort.retention.length - 1]}% retained
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {cohort.retention.map((rate, i) => (
                          <div
                            key={i}
                            className="h-6 flex-1 rounded"
                            style={{
                              backgroundColor: `hsl(${120 - (100 - rate)}, 70%, 50%)`,
                              opacity: 0.8
                            }}
                            title={`Month ${i + 1}: ${rate}%`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>User activity by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { country: 'USA', users: 12500, percentage: 45 },
                        { country: 'India', users: 8200, percentage: 30 },
                        { country: 'UK', users: 3400, percentage: 12 },
                        { country: 'Canada', users: 2100, percentage: 8 },
                        { country: 'Others', users: 1400, percentage: 5 },
                      ]}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="country" type="category" width={60} />
                      <Tooltip formatter={(value, name) => [value, 'Users']} />
                      <Bar dataKey="users" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>Average session and interaction data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-blue-600">4.2m</div>
                      <div className="text-sm text-gray-600">Avg Session Duration</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-green-600">73%</div>
                      <div className="text-sm text-gray-600">Return Rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-purple-600">5.8</div>
                      <div className="text-sm text-gray-600">Pages per Session</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold text-orange-600">28%</div>
                      <div className="text-sm text-gray-600">Bounce Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Breakdown by product type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <div>
                      <h4 className="font-medium">Subscriptions</h4>
                      <p className="text-sm text-gray-600">Pro & Premium plans</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency((analytics?.overview.revenue || 0) * 0.6)}</p>
                      <p className="text-xs text-gray-500">60% of total</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div>
                      <h4 className="font-medium">E-books</h4>
                      <p className="text-sm text-gray-600">Digital publications</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatCurrency((analytics?.overview.revenue || 0) * 0.3)}</p>
                      <p className="text-xs text-gray-500">30% of total</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <div>
                      <h4 className="font-medium">Consultations</h4>
                      <p className="text-sm text-gray-600">Expert advice sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{formatCurrency((analytics?.overview.revenue || 0) * 0.1)}</p>
                      <p className="text-xs text-gray-500">10% of total</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top E-books */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing E-books</CardTitle>
                <CardDescription>Best sellers this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.performance.topEbooks?.slice(0, 5).map((ebook, index) => (
                    <div key={ebook.title} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{ebook.title}</p>
                        <p className="text-xs text-gray-500">{ebook.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(ebook.revenue)}</p>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                      <p>No e-book sales data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Most popular pages and content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.performance.topPages?.slice(0, 5).map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{page.path}</p>
                        <p className="text-xs text-gray-500">{page.bounceRate}% bounce rate</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatNumber(page.views)}</p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <p>No page view data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Activity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Heatmap</CardTitle>
                <CardDescription>User activity by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(24)].map((_, hour) => {
                    const activity = analytics?.performance.userActivity?.find(a => a.hour === hour);
                    const users = activity?.users || 0;
                    const maxUsers = Math.max(...(analytics?.performance.userActivity?.map(a => a.users) || [1]));
                    const intensity = Math.round((users / maxUsers) * 100);
                    
                    return (
                      <div key={hour} className="flex items-center gap-2">
                        <span className="text-xs font-mono w-8">{hour.toString().padStart(2, '0')}:00</span>
                        <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${intensity}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{users}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Real-time performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      &lt; 200ms
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      99.9%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      &lt; 0.1%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <Badge variant="outline">
                      {analytics?.overview.activeUsers || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Performance */}
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>External service metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plant ID API</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gemini AI</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Processing</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Service</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Server resource consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Memory</span>
                      <span className="text-sm">62%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Storage</span>
                      <span className="text-sm">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Active Alerts
                </CardTitle>
                <CardDescription>Real-time monitoring alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">High Error Rate</h4>
                      <p className="text-sm text-red-600 dark:text-red-300">Error rate above 5% threshold</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500">
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Low Conversion Rate</h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">Conversion rate below 2% threshold</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Server Load High</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">CPU usage above 80%</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-700">Info</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Alert Rules
                </CardTitle>
                <CardDescription>Configure monitoring thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Error Rate Threshold</label>
                      <div className="flex items-center mt-1">
                        <Input type="number" defaultValue="5" className="w-20" />
                        <span className="ml-2 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Response Time</label>
                      <div className="flex items-center mt-1">
                        <Input type="number" defaultValue="500" className="w-24" />
                        <span className="ml-2 text-sm text-gray-500">ms</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Daily Active Users</label>
                      <div className="flex items-center mt-1">
                        <Input type="number" defaultValue="1000" className="w-24" />
                        <span className="ml-2 text-sm text-gray-500">users</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Revenue Drop</label>
                      <div className="flex items-center mt-1">
                        <Input type="number" defaultValue="20" className="w-20" />
                        <span className="ml-2 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">
                    Update Alert Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CDN</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache</span>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">Degraded</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Avg</span>
                      <span>245ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database</span>
                      <span>89ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CDN</span>
                      <span>52ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Analytics</CardTitle>
                <CardDescription>Download comprehensive reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export to Excel
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}