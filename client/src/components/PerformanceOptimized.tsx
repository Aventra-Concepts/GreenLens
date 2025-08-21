import { Suspense, lazy } from 'react';

// Lazy load heavy components for better performance
const LazyUSASeoEnhanced = lazy(() => import('./USASeoEnhanced').then(module => ({ default: module.USASeoEnhanced })));

function LoadingFallback() {
  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PerformanceOptimizedUSASection() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyUSASeoEnhanced />
    </Suspense>
  );
}