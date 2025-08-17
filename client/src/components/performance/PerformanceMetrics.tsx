import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Database, Network } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  ttfb: number; // Time to First Byte
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  cls: number;  // Cumulative Layout Shift
  fid: number;  // First Input Delay
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode
    if (import.meta.env.MODE === 'development') {
      collectMetrics();
      collectNetworkInfo();
    }
  }, []);

  const collectMetrics = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const ttfb = navigation.responseStart - navigation.requestStart;

      // Web Vitals (if available)
      let fcp = 0, lcp = 0, cls = 0, fid = 0;

      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        fcp = fcpEntry.startTime;
      }

      // Use Performance Observer for more accurate metrics
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.startTime;
          updateMetrics({ loadTime, ttfb, fcp, lcp, cls, fid });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
          updateMetrics({ loadTime, ttfb, fcp, lcp, cls, fid });
        }).observe({ entryTypes: ['layout-shift'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            fid = (entry as any).processingStart - entry.startTime;
            updateMetrics({ loadTime, ttfb, fcp, lcp, cls, fid });
          }
        }).observe({ entryTypes: ['first-input'] });
      }

      setMetrics({ loadTime, ttfb, fcp, lcp, cls, fid });
    }
  };

  const updateMetrics = (newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  };

  const collectNetworkInfo = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      });
    }
  };

  const getScoreColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.needs) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${time.toFixed(0)}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  // Only render in development mode
  if (import.meta.env.MODE !== 'development' || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg"
          title="Show Performance Metrics"
        >
          <Zap className="w-5 h-5" />
        </button>
      ) : (
        <Card className="w-80 max-h-96 overflow-auto bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Core Web Vitals */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Core Web Vitals
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>LCP:</span>
                  <Badge className={`${getScoreColor(metrics.lcp, { good: 2500, needs: 4000 })} text-white text-xs px-1`}>
                    {formatTime(metrics.lcp)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>FID:</span>
                  <Badge className={`${getScoreColor(metrics.fid, { good: 100, needs: 300 })} text-white text-xs px-1`}>
                    {formatTime(metrics.fid)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>CLS:</span>
                  <Badge className={`${getScoreColor(metrics.cls, { good: 0.1, needs: 0.25 })} text-white text-xs px-1`}>
                    {metrics.cls.toFixed(3)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>FCP:</span>
                  <Badge className={`${getScoreColor(metrics.fcp, { good: 1800, needs: 3000 })} text-white text-xs px-1`}>
                    {formatTime(metrics.fcp)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Loading Metrics */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                <Database className="w-3 h-3 mr-1" />
                Loading Times
              </h4>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>TTFB:</span>
                  <span>{formatTime(metrics.ttfb)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>{formatTime(metrics.loadTime)}</span>
                </div>
              </div>
            </div>

            {/* Network Info */}
            {networkInfo && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                  <Network className="w-3 h-3 mr-1" />
                  Network
                </h4>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{networkInfo.effectiveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span>{networkInfo.downlink} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RTT:</span>
                    <span>{networkInfo.rtt}ms</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}