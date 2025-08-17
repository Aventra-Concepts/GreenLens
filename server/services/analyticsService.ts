import { storage } from '../storage';
import { AnalyticsEvent } from '@shared/schema';

export interface AnalyticsDashboard {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    revenue: number;
    plantIdentifications: number;
    blogViews: number;
  };
  trends: {
    userGrowth: any[];
    orderTrends: any[];
    plantIdTrends: any[];
    revenueTrends: any[];
  };
  demographics: {
    usersByCountry: any[];
    usersByLanguage: any[];
    deviceTypes: any[];
  };
  content: {
    popularBlogs: any[];
    topPlants: any[];
    ebookSales: any[];
  };
  performance: {
    serverMetrics: any;
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export class AnalyticsService {
  /**
   * Get comprehensive admin dashboard analytics
   */
  static async getAdminDashboard(dateRange?: { start: Date; end: Date }): Promise<AnalyticsDashboard> {
    const range = dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    const [
      overview,
      trends,
      demographics,
      content,
      performance
    ] = await Promise.all([
      this.getOverviewStats(range),
      this.getTrends(range),
      this.getDemographics(range),
      this.getContentStats(range),
      this.getPerformanceMetrics(range)
    ]);

    return {
      overview,
      trends,
      demographics,
      content,
      performance
    };
  }

  /**
   * Get overview statistics
   */
  private static async getOverviewStats(range: { start: Date; end: Date }) {
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      revenue,
      plantIdentifications,
      blogViews
    ] = await Promise.all([
      storage.getTotalUsers(),
      storage.getActiveUsers(range),
      storage.getTotalOrders(range),
      storage.getTotalRevenue(range),
      storage.getPlantIdentificationCount(range),
      storage.getBlogViewCount(range)
    ]);

    return {
      totalUsers,
      activeUsers,
      totalOrders,
      revenue,
      plantIdentifications,
      blogViews
    };
  }

  /**
   * Get trend data for charts
   */
  private static async getTrends(range: { start: Date; end: Date }) {
    const [
      userGrowth,
      orderTrends,
      plantIdTrends,
      revenueTrends
    ] = await Promise.all([
      storage.getUserGrowthTrend(range),
      storage.getOrderTrends(range),
      storage.getPlantIdTrends(range),
      storage.getRevenueTrends(range)
    ]);

    return {
      userGrowth,
      orderTrends,
      plantIdTrends,
      revenueTrends
    };
  }

  /**
   * Get demographic data
   */
  private static async getDemographics(range: { start: Date; end: Date }) {
    const [
      usersByCountry,
      usersByLanguage,
      deviceTypes
    ] = await Promise.all([
      storage.getUsersByCountry(range),
      storage.getUsersByLanguage(range),
      storage.getDeviceTypes(range)
    ]);

    return {
      usersByCountry,
      usersByLanguage,
      deviceTypes
    };
  }

  /**
   * Get content statistics
   */
  private static async getContentStats(range: { start: Date; end: Date }) {
    const [
      popularBlogs,
      topPlants,
      ebookSales
    ] = await Promise.all([
      storage.getPopularBlogs(range),
      storage.getTopIdentifiedPlants(range),
      storage.getEbookSalesStats(range)
    ]);

    return {
      popularBlogs,
      topPlants,
      ebookSales
    };
  }

  /**
   * Get performance metrics
   */
  private static async getPerformanceMetrics(range: { start: Date; end: Date }) {
    // Mock data - in production, this would come from monitoring tools
    return {
      serverMetrics: {
        cpuUsage: 65,
        memoryUsage: 78,
        diskUsage: 45,
        networkTraffic: 1250
      },
      responseTime: 245, // ms
      errorRate: 0.8, // percentage
      uptime: 99.9 // percentage
    };
  }

  /**
   * Track custom analytics event
   */
  static async trackEvent(event: {
    eventType: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    properties?: any;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await storage.logAnalyticsEvent({
      ...event,
      properties: event.properties || {}
    });
  }

  /**
   * Get real-time metrics
   */
  static async getRealTimeMetrics(): Promise<any> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      activeUsers,
      currentOrders,
      liveIdentifications,
      serverLoad
    ] = await Promise.all([
      storage.getActiveUsers({ start: oneHourAgo, end: now }),
      storage.getPendingOrders(),
      storage.getRecentPlantIdentifications(15), // Last 15 minutes
      this.getCurrentServerLoad()
    ]);

    return {
      activeUsers,
      currentOrders,
      liveIdentifications,
      serverLoad,
      timestamp: now
    };
  }

  /**
   * Generate analytics report for export
   */
  static async generateReport(
    type: 'users' | 'orders' | 'content' | 'performance',
    range: { start: Date; end: Date },
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    let data: any;

    switch (type) {
      case 'users':
        data = await this.getUserReport(range);
        break;
      case 'orders':
        data = await this.getOrderReport(range);
        break;
      case 'content':
        data = await this.getContentReport(range);
        break;
      case 'performance':
        data = await this.getPerformanceReport(range);
        break;
      default:
        throw new Error('Invalid report type');
    }

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  /**
   * Get user analytics report
   */
  private static async getUserReport(range: { start: Date; end: Date }) {
    return {
      summary: await this.getOverviewStats(range),
      demographics: await this.getDemographics(range),
      trends: await storage.getUserGrowthTrend(range),
      engagement: await storage.getUserEngagementMetrics(range)
    };
  }

  /**
   * Get order analytics report
   */
  private static async getOrderReport(range: { start: Date; end: Date }) {
    return {
      sales: await storage.getOrderTrends(range),
      revenue: await storage.getRevenueTrends(range),
      products: await storage.getTopSellingProducts(range),
      customers: await storage.getTopCustomers(range)
    };
  }

  /**
   * Get content analytics report
   */
  private static async getContentReport(range: { start: Date; end: Date }) {
    return {
      blogs: await storage.getPopularBlogs(range),
      plants: await storage.getTopIdentifiedPlants(range),
      ebooks: await storage.getEbookSalesStats(range),
      engagement: await storage.getContentEngagementMetrics(range)
    };
  }

  /**
   * Get performance analytics report
   */
  private static async getPerformanceReport(range: { start: Date; end: Date }) {
    return {
      metrics: await this.getPerformanceMetrics(range),
      errors: await storage.getErrorAnalytics(range),
      slowQueries: await storage.getSlowQueryAnalytics(range),
      apiUsage: await storage.getApiUsageAnalytics(range)
    };
  }

  /**
   * Convert data to CSV format
   */
  private static convertToCSV(data: any): string {
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  /**
   * Get current server load (mock implementation)
   */
  private static async getCurrentServerLoad(): Promise<any> {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      connections: Math.floor(Math.random() * 1000)
    };
  }

  /**
   * Set up analytics alerts
   */
  static async setupAlert(config: {
    name: string;
    metric: string;
    threshold: number;
    condition: 'above' | 'below';
    email: string;
  }): Promise<void> {
    // Implementation would store alert configuration
    // and set up monitoring to check conditions
    await storage.createAnalyticsAlert(config);
  }
}