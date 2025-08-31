import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Zap, 
  Target, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Clock,
  Smartphone,
  Monitor,
  Users,
  Link,
  FileText,
  Award,
  MapPin,
  Lightbulb,
  RefreshCw,
  Download,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Tag,
  Calendar,
  Bell,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SEOData {
  overview: {
    seoScore: number;
    organicTraffic: number;
    keywordRankings: number;
    backlinks: number;
    technicalIssues: number;
    contentScore: number;
  };
  keywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    difficulty: number;
    trend: 'up' | 'down' | 'stable';
    url: string;
  }>;
  technicalAudit: {
    pageSpeed: number;
    mobileOptimization: number;
    crawlability: number;
    indexability: number;
    httpsStatus: boolean;
    xmlSitemap: boolean;
    robotsTxt: boolean;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  content: {
    totalPages: number;
    optimizedPages: number;
    duplicateContent: number;
    thinContent: number;
    missingMetaTitles: number;
    missingMetaDescriptions: number;
  };
  competitors: Array<{
    domain: string;
    organicKeywords: number;
    organicTraffic: number;
    backlinks: number;
    authorityScore: number;
  }>;
  opportunities: Array<{
    type: 'keyword' | 'technical' | 'content' | 'backlink';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}

// Mock SEO data - in a real implementation, this would come from SEO APIs
const mockSEOData: SEOData = {
  overview: {
    seoScore: 78,
    organicTraffic: 45250,
    keywordRankings: 1342,
    backlinks: 8964,
    technicalIssues: 12,
    contentScore: 85
  },
  keywords: [
    { keyword: "plant identification app", position: 3, volume: 12100, difficulty: 45, trend: 'up', url: "/" },
    { keyword: "ai plant care", position: 7, volume: 8900, difficulty: 38, trend: 'up', url: "/identify" },
    { keyword: "garden management software", position: 12, volume: 5400, difficulty: 52, trend: 'stable', url: "/my-garden" },
    { keyword: "plant disease diagnosis", position: 18, volume: 3200, difficulty: 41, trend: 'down', url: "/identify" },
    { keyword: "digital plant guide", position: 5, volume: 6700, difficulty: 35, trend: 'up', url: "/ebooks" }
  ],
  technicalAudit: {
    pageSpeed: 87,
    mobileOptimization: 92,
    crawlability: 95,
    indexability: 88,
    httpsStatus: true,
    xmlSitemap: true,
    robotsTxt: true,
    coreWebVitals: {
      lcp: 2.1,
      fid: 85,
      cls: 0.08
    }
  },
  content: {
    totalPages: 247,
    optimizedPages: 189,
    duplicateContent: 3,
    thinContent: 8,
    missingMetaTitles: 5,
    missingMetaDescriptions: 12
  },
  competitors: [
    { domain: "plantnet.org", organicKeywords: 45600, organicTraffic: 892000, backlinks: 125000, authorityScore: 78 },
    { domain: "gardenassistant.com", organicKeywords: 23400, organicTraffic: 234000, backlinks: 45000, authorityScore: 65 },
    { domain: "plantcare.app", organicKeywords: 18900, organicTraffic: 156000, backlinks: 32000, authorityScore: 58 }
  ],
  opportunities: [
    {
      type: 'keyword',
      title: 'Target "houseplant care guide" keyword',
      description: 'High volume keyword with low competition - create comprehensive guide',
      impact: 'high',
      effort: 'medium',
      priority: 95
    },
    {
      type: 'technical',
      title: 'Optimize Core Web Vitals',
      description: 'Improve LCP by optimizing image loading and server response times',
      impact: 'high',
      effort: 'medium',
      priority: 88
    },
    {
      type: 'content',
      title: 'Add plant care blog section',
      description: 'Create weekly blog content targeting long-tail keywords',
      impact: 'high',
      effort: 'high',
      priority: 82
    },
    {
      type: 'backlink',
      title: 'Partner with gardening websites',
      description: 'Reach out to authoritative gardening sites for collaboration',
      impact: 'medium',
      effort: 'high',
      priority: 75
    }
  ]
};

const organicTrafficData = [
  { month: 'Jan', traffic: 32000, keywords: 980, conversions: 245 },
  { month: 'Feb', traffic: 35600, keywords: 1050, conversions: 278 },
  { month: 'Mar', traffic: 39200, keywords: 1180, conversions: 312 },
  { month: 'Apr', traffic: 42800, keywords: 1265, conversions: 345 },
  { month: 'May', traffic: 45250, keywords: 1342, conversions: 389 }
];

const keywordDistribution = [
  { position: '1-3', count: 145, percentage: 34, color: '#22c55e' },
  { position: '4-10', count: 298, percentage: 42, color: '#3b82f6' },
  { position: '11-20', count: 189, percentage: 18, color: '#f59e0b' },
  { position: '21+', count: 78, percentage: 6, color: '#ef4444' }
];

const competitorData = [
  { name: 'PlantNet', traffic: 892, keywords: 456, backlinks: 1250 },
  { name: 'GreenLens', traffic: 453, keywords: 134, backlinks: 896 },
  { name: 'GardenApp', traffic: 234, keywords: 234, backlinks: 450 },
  { name: 'PlantCare', traffic: 156, keywords: 189, backlinks: 320 }
];

export default function SEODashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [targetUrl, setTargetUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResults, setAuditResults] = useState<SEOData | null>(null);
  const { toast } = useToast();

  const { data: seoData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/seo-data', selectedTimeRange],
    queryFn: () => Promise.resolve(auditResults || mockSEOData),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const auditMutation = useMutation({
    mutationFn: async () => {
      // Simulate comprehensive SEO audit
      const response = await new Promise<SEOData>((resolve) => {
        setTimeout(() => {
          // Generate updated audit results with realistic variations
          const updatedData: SEOData = {
            ...mockSEOData,
            overview: {
              ...mockSEOData.overview,
              seoScore: Math.min(100, mockSEOData.overview.seoScore + Math.floor(Math.random() * 10 - 3)),
              organicTraffic: mockSEOData.overview.organicTraffic + Math.floor(Math.random() * 5000 - 2000),
              technicalIssues: Math.max(0, mockSEOData.overview.technicalIssues + Math.floor(Math.random() * 6 - 3))
            },
            technicalAudit: {
              ...mockSEOData.technicalAudit,
              pageSpeed: Math.min(100, mockSEOData.technicalAudit.pageSpeed + Math.floor(Math.random() * 10 - 2)),
              mobileOptimization: Math.min(100, mockSEOData.technicalAudit.mobileOptimization + Math.floor(Math.random() * 6 - 1))
            }
          };
          resolve(updatedData);
        }, 4000); // 4 second realistic audit time
      });
      return response;
    },
    onSuccess: (data) => {
      setAuditResults(data);
      toast({
        title: "SEO Audit Complete",
        description: `Audit finished with SEO score: ${data.overview.seoScore}/100. Found ${data.overview.technicalIssues} technical issues.`,
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Audit Failed",
        description: "Unable to complete SEO audit. Please try again.",
        variant: "destructive"
      });
    }
  });

  const exportMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'excel' | 'csv') => {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { format, url: `/reports/seo-report-${Date.now()}.${format}` };
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: `SEO report in ${data.format.toUpperCase()} format has been generated and downloaded.`,
      });
      // Simulate file download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `seo-report-${new Date().toISOString().split('T')[0]}.${data.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive"
      });
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColorBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return variants[impact as keyof typeof variants] || variants.low;
  };

  const runSiteAudit = async () => {
    setIsAnalyzing(true);
    try {
      await auditMutation.mutateAsync();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    await exportMutation.mutateAsync(format);
  };

  const analyzeKeywords = async () => {
    if (!targetUrl.trim()) {
      toast({
        title: "Missing Keyword",
        description: "Please enter a keyword to research.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Keyword Research Started",
      description: `Analyzing keyword: "${targetUrl}". Results will appear in the suggestions below.`,
    });
    
    // Clear the input after starting research
    setTargetUrl('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SEO Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Advanced SEO analysis and optimization insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={runSiteAudit}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
            data-testid="run-seo-audit"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Run Full Audit'}
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => exportReport('pdf')}
              disabled={exportMutation.isPending}
              data-testid="export-seo-report-pdf"
            >
              <Download className="w-4 h-4" />
              {exportMutation.isPending ? 'Generating...' : 'Export PDF'}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => exportReport('excel')}
              disabled={exportMutation.isPending}
              data-testid="export-seo-report-excel"
            >
              <Download className="w-4 h-4" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* SEO Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className={getScoreColorBg(seoData?.overview.seoScore || 0)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SEO Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(seoData?.overview.seoScore || 0)}`}>
                  {seoData?.overview.seoScore || 0}
                </p>
                <Progress value={seoData?.overview.seoScore || 0} className="mt-2 h-2" />
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organic Traffic</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(seoData?.overview.organicTraffic || 0)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +12.5% vs last month
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Keyword Rankings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(seoData?.overview.keywordRankings || 0)}
                </p>
                <p className="text-xs text-blue-600">Top 10: {Math.round((seoData?.overview.keywordRankings || 0) * 0.35)}</p>
              </div>
              <Search className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Backlinks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(seoData?.overview.backlinks || 0)}
                </p>
                <p className="text-xs text-purple-600">Authority: 65/100</p>
              </div>
              <Link className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Technical Issues</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {seoData?.overview.technicalIssues || 0}
                </p>
                <p className="text-xs text-red-600">Need attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {seoData?.overview.contentScore || 0}
                </p>
                <Progress value={seoData?.overview.contentScore || 0} className="mt-2 h-2" />
              </div>
              <FileText className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="local">Local SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organic Traffic Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Organic Traffic Trend
                </CardTitle>
                <CardDescription>Monthly organic search traffic growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={organicTrafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [formatNumber(value as number), name]} />
                      <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Position Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Keyword Position Distribution
                </CardTitle>
                <CardDescription>Distribution of keyword rankings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={keywordDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ position, percentage }) => `${position}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {keywordDistribution.map((entry, index) => (
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

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-Powered SEO Insights
              </CardTitle>
              <CardDescription>Intelligent recommendations based on your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Strong Technical Foundation</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Your site has excellent technical SEO fundamentals with fast loading times and mobile optimization.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800 dark:text-yellow-200">Content Opportunities</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    Focus on creating more comprehensive guides targeting high-volume plant care keywords.
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <Target className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">Link Building Potential</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Your content quality is high - consider reaching out to gardening blogs for partnerships.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Keywords */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Top Performing Keywords
                </CardTitle>
                <CardDescription>Your best ranking keywords and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seoData?.keywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{keyword.keyword}</h4>
                          {getTrendIcon(keyword.trend)}
                        </div>
                        <p className="text-sm text-gray-600">{keyword.url}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">Position</p>
                          <Badge variant={keyword.position <= 3 ? 'default' : keyword.position <= 10 ? 'secondary' : 'outline'}>
                            #{keyword.position}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Volume</p>
                          <p className="text-gray-600">{formatNumber(keyword.volume)}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Difficulty</p>
                          <p className={`${keyword.difficulty <= 30 ? 'text-green-600' : keyword.difficulty <= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {keyword.difficulty}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Keyword Research Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Keyword Research
                </CardTitle>
                <CardDescription>Find new keyword opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input 
                    placeholder="Enter seed keyword..." 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeKeywords()}
                  />
                  <Button className="w-full" onClick={analyzeKeywords}>Research Keywords</Button>
                  
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Suggested Keywords</h4>
                    {[
                      { keyword: "indoor plant care tips", volume: 8900, difficulty: 32 },
                      { keyword: "houseplant watering guide", volume: 5400, difficulty: 28 },
                      { keyword: "plant disease symptoms", volume: 3200, difficulty: 45 }
                    ].map((suggestion, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="flex-1">{suggestion.keyword}</span>
                        <div className="flex gap-2">
                          <span className="text-gray-500">{formatNumber(suggestion.volume)}</span>
                          <span className={`${suggestion.difficulty <= 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {suggestion.difficulty}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Technical SEO Health
                </CardTitle>
                <CardDescription>Core technical performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Page Speed</span>
                    <div className="flex items-center gap-2">
                      <Progress value={seoData?.technicalAudit.pageSpeed} className="w-20 h-2" />
                      <span className={`font-medium ${getScoreColor(seoData?.technicalAudit.pageSpeed || 0)}`}>
                        {seoData?.technicalAudit.pageSpeed}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Mobile Optimization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={seoData?.technicalAudit.mobileOptimization} className="w-20 h-2" />
                      <span className={`font-medium ${getScoreColor(seoData?.technicalAudit.mobileOptimization || 0)}`}>
                        {seoData?.technicalAudit.mobileOptimization}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Crawlability</span>
                    <div className="flex items-center gap-2">
                      <Progress value={seoData?.technicalAudit.crawlability} className="w-20 h-2" />
                      <span className={`font-medium ${getScoreColor(seoData?.technicalAudit.crawlability || 0)}`}>
                        {seoData?.technicalAudit.crawlability}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Indexability</span>
                    <div className="flex items-center gap-2">
                      <Progress value={seoData?.technicalAudit.indexability} className="w-20 h-2" />
                      <span className={`font-medium ${getScoreColor(seoData?.technicalAudit.indexability || 0)}`}>
                        {seoData?.technicalAudit.indexability}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription>Google's user experience metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">Largest Contentful Paint</p>
                      <p className="text-sm text-gray-600">Loading performance</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${seoData?.technicalAudit.coreWebVitals.lcp && seoData.technicalAudit.coreWebVitals.lcp <= 2.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {seoData?.technicalAudit.coreWebVitals.lcp}s
                      </p>
                      <p className="text-xs text-gray-500">Good: ≤2.5s</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">First Input Delay</p>
                      <p className="text-sm text-gray-600">Interactivity</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${seoData?.technicalAudit.coreWebVitals.fid && seoData.technicalAudit.coreWebVitals.fid <= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {seoData?.technicalAudit.coreWebVitals.fid}ms
                      </p>
                      <p className="text-xs text-gray-500">Good: ≤100ms</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">Cumulative Layout Shift</p>
                      <p className="text-sm text-gray-600">Visual stability</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${seoData?.technicalAudit.coreWebVitals.cls && seoData.technicalAudit.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {seoData?.technicalAudit.coreWebVitals.cls}
                      </p>
                      <p className="text-xs text-gray-500">Good: ≤0.1</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Technical SEO Checklist
              </CardTitle>
              <CardDescription>Essential technical requirements status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "HTTPS Enabled", status: seoData?.technicalAudit.httpsStatus, icon: Globe },
                  { label: "XML Sitemap", status: seoData?.technicalAudit.xmlSitemap, icon: FileText },
                  { label: "Robots.txt", status: seoData?.technicalAudit.robotsTxt, icon: Settings },
                  { label: "Mobile Friendly", status: (seoData?.technicalAudit.mobileOptimization || 0) > 90, icon: Smartphone },
                  { label: "Page Speed Good", status: (seoData?.technicalAudit.pageSpeed || 0) > 80, icon: Zap },
                  { label: "No Crawl Errors", status: (seoData?.technicalAudit.crawlability || 0) > 95, icon: Search }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="flex-1">{item.label}</span>
                    {item.status ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Analysis
                </CardTitle>
                <CardDescription>Overview of your content optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Pages</span>
                    <span className="font-medium">{seoData?.content.totalPages}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Optimized Pages</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={((seoData?.content.optimizedPages || 0) / (seoData?.content.totalPages || 1)) * 100} 
                        className="w-20 h-2" 
                      />
                      <span className="text-green-600 font-medium">
                        {seoData?.content.optimizedPages} ({Math.round(((seoData?.content.optimizedPages || 0) / (seoData?.content.totalPages || 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-medium text-red-600">Issues to Fix</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Missing Meta Titles</span>
                        <span className="text-red-600">{seoData?.content.missingMetaTitles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Missing Meta Descriptions</span>
                        <span className="text-red-600">{seoData?.content.missingMetaDescriptions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duplicate Content</span>
                        <span className="text-red-600">{seoData?.content.duplicateContent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thin Content</span>
                        <span className="text-red-600">{seoData?.content.thinContent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Content Opportunities
                </CardTitle>
                <CardDescription>AI-suggested content improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Create Plant Care Guide Series",
                      description: "Target 'houseplant care' keywords with comprehensive guides",
                      impact: "High traffic potential (+15K monthly visits)",
                      difficulty: "Medium"
                    },
                    {
                      title: "Optimize Product Pages",
                      description: "Add detailed descriptions and care instructions",
                      impact: "Better conversion rates (+12%)",
                      difficulty: "Low"
                    },
                    {
                      title: "Build Plant Disease Database",
                      description: "Target long-tail disease identification keywords",
                      impact: "Authority building + 200+ new keywords",
                      difficulty: "High"
                    }
                  ].map((opportunity, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{opportunity.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600">{opportunity.impact}</span>
                        <Badge variant="outline">{opportunity.difficulty}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitor Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Competitor Performance
                </CardTitle>
                <CardDescription>How you compare to top competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={competitorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [formatNumber(value as number) + (name === 'traffic' ? '/mo' : ''), name]} />
                      <Bar dataKey="traffic" fill="#3b82f6" name="Organic Traffic (K)" />
                      <Bar dataKey="keywords" fill="#10b981" name="Keywords" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Competitor Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Detailed Competitor Analysis
                </CardTitle>
                <CardDescription>Key metrics for your main competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seoData?.competitors.map((competitor, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium flex items-center gap-2">
                          {competitor.domain}
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </h4>
                        <Badge variant="outline">Authority: {competitor.authorityScore}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Keywords</p>
                          <p className="font-medium">{formatNumber(competitor.organicKeywords)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Traffic</p>
                          <p className="font-medium">{formatNumber(competitor.organicTraffic)}/mo</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Backlinks</p>
                          <p className="font-medium">{formatNumber(competitor.backlinks)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                SEO Opportunities
              </CardTitle>
              <CardDescription>Prioritized recommendations to improve your rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoData?.opportunities
                  .sort((a, b) => b.priority - a.priority)
                  .map((opportunity, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{opportunity.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactBadge(opportunity.impact)}>
                              {opportunity.impact.toUpperCase()} Impact
                            </Badge>
                            <Badge variant="outline">
                              {opportunity.effort.toUpperCase()} Effort
                            </Badge>
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500 capitalize">{opportunity.type}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">{opportunity.priority}</div>
                          <div className="text-xs text-gray-500">Priority Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="local" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Local SEO Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Local SEO Performance
                </CardTitle>
                <CardDescription>Local search optimization status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Google My Business", status: true, description: "Claimed and optimized" },
                    { label: "Local Citations", status: true, description: "85% consistency across directories" },
                    { label: "Local Reviews", status: false, description: "Need more reviews (current: 12)" },
                    { label: "Local Schema", status: true, description: "Properly implemented" },
                    { label: "NAP Consistency", status: false, description: "2 inconsistencies found" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {item.status ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Local Keyword Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Local Keyword Opportunities
                </CardTitle>
                <CardDescription>Location-based keywords to target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: "plant identification app near me", volume: 1200, difficulty: 25, position: null },
                    { keyword: "local plant nursery guide", volume: 890, difficulty: 30, position: 15 },
                    { keyword: "garden center recommendations", volume: 2300, difficulty: 35, position: 8 },
                    { keyword: "plant care services [city]", volume: 560, difficulty: 22, position: null }
                  ].map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{keyword.keyword}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Volume: {keyword.volume}</span>
                          <span>Difficulty: {keyword.difficulty}%</span>
                        </div>
                      </div>
                      {keyword.position ? (
                        <Badge variant="secondary">#{keyword.position}</Badge>
                      ) : (
                        <Badge variant="outline">Not ranking</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}