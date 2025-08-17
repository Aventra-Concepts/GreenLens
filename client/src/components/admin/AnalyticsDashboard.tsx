import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Download,
  RefreshCw,
  Calendar,
  PieChart,
  LineChart
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    revenue: number;
    plantIdentifications: number;
    blogViews: number;
  };
  trends: {
    userGrowth: Array<{ date: string; value: number }>;
    orderTrends: Array<{ date: string; value: number }>;
    plantIdTrends: Array<{ date: string; value: number }>;
    revenueTrends: Array<{ date: string; value: number }>;
  };
  demographics: {
    usersByCountry: Array<{ country: string; count: number }>;
    usersByLanguage: Array<{ language: string; count: number }>;
    deviceTypes: Array<{ device: string; count: number }>;
  };
  content: {
    popularBlogs: Array<{ title: string; views: number }>;
    topPlants: Array<{ species: string; identifications: number }>;
    ebookSales: Array<{ title: string; sales: number }>;
  };
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  // Calculate date range
  const getDateRange = (days: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(days));
    return { start, end };
  };

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", dateRange],
    refetchInterval: 60000, // Refresh every minute
  });

  // Export report
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const range = getDateRange(dateRange);
      const response = await fetch(`/api/admin/analytics/export?type=${reportType}&format=${format}&start=${range.start.toISOString()}&end=${range.end.toISOString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${reportType}-${dateRange}days.${format}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive analytics and reporting</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
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
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2"
            data-testid="export-analytics"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics?.overview.totalUsers || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analytics?.overview.activeUsers || 0)} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plant Identifications</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics?.overview.plantIdentifications || 0)}</div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics?.overview.totalOrders || 0)}</div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics?.overview.revenue || 0)}</div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blog Views</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analytics?.overview.blogViews || 0)}</div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12.5%</div>
                <p className="text-xs text-muted-foreground">vs previous period</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="demographics" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Demographics
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Real-time
              </TabsTrigger>
            </TabsList>

            {/* Trends Analysis */}
            <TabsContent value="trends">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Trend</CardTitle>
                    <CardDescription>New user registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>User growth chart</p>
                        <p className="text-sm">Integration with charting library needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Revenue performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Revenue trend chart</p>
                        <p className="text-sm">Integration with charting library needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Plant Identification Trends</CardTitle>
                    <CardDescription>Daily plant identification volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Plant ID trend chart</p>
                        <p className="text-sm">Integration with charting library needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Trends</CardTitle>
                    <CardDescription>E-commerce order volume trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Order trend chart</p>
                        <p className="text-sm">Integration with charting library needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Demographics */}
            <TabsContent value="demographics">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Users by Country
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.demographics.usersByCountry.map((item, index) => (
                        <div key={item.country} className="flex items-center justify-between">
                          <span className="text-sm">{item.country}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${(item.count / (analytics?.demographics.usersByCountry[0]?.count || 1)) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[40px]">{formatNumber(item.count)}</span>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No demographic data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Device Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.demographics.deviceTypes.map((item) => (
                        <div key={item.device} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.device === 'mobile' && <Smartphone className="w-4 h-4" />}
                            {item.device === 'desktop' && <Monitor className="w-4 h-4" />}
                            <span className="text-sm capitalize">{item.device}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${(item.count / (analytics?.demographics.deviceTypes[0]?.count || 1)) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[40px]">{formatNumber(item.count)}</span>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No device data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.demographics.usersByLanguage.map((item) => (
                        <div key={item.language} className="flex items-center justify-between">
                          <span className="text-sm">{item.language.toUpperCase()}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${(item.count / (analytics?.demographics.usersByLanguage[0]?.count || 1)) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[40px]">{formatNumber(item.count)}</span>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No language data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Content Analytics */}
            <TabsContent value="content">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Blog Posts</CardTitle>
                    <CardDescription>Most viewed content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.content.popularBlogs.map((blog, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{blog.title}</p>
                            <p className="text-xs text-gray-500">{formatNumber(blog.views)} views</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            #{index + 1}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No blog data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Identified Plants</CardTitle>
                    <CardDescription>Most popular plant species</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.content.topPlants.map((plant, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{plant.species}</p>
                            <p className="text-xs text-gray-500">{formatNumber(plant.identifications)} IDs</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            #{index + 1}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No plant data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>E-book Sales</CardTitle>
                    <CardDescription>Best selling publications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.content.ebookSales.map((ebook, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ebook.title}</p>
                            <p className="text-xs text-gray-500">{formatNumber(ebook.sales)} sales</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            #{index + 1}
                          </Badge>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No e-book data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Real-time Monitoring */}
            <TabsContent value="realtime">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Live Activity Feed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      Real-time activity monitoring coming soon...
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      Performance metrics coming soon...
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}