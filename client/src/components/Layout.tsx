import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { ImageUploadBanner } from "@/components/ImageUploadBanner";
import { SidebarAd } from "@/components/AdSense";

interface LayoutProps {
  children: ReactNode;
  showImageBanner?: boolean;
  showSidebarAds?: boolean;
  className?: string;
}

export function Layout({ 
  children, 
  showImageBanner = false, 
  showSidebarAds = false, 
  className = "" 
}: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <Navigation />
      
      {/* Top Menu Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-8">
            <a href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Home
            </a>
            <a href="/identify" className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Identify Plant
            </a>
            <a href="/account" className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              My Garden
            </a>
            <a href="/pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Pricing
            </a>
            <a href="/blog" className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Blog
            </a>
            <a href="/expert-onboarding" className="text-sm bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors font-medium">
              Become an Expert
            </a>
          </nav>
        </div>
      </div>

      {/* Image Upload Banner - 2.5 inches height */}
      {showImageBanner && (
        <div className="h-60 sm:h-64 lg:h-72">
          <ImageUploadBanner />
        </div>
      )}
      
      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 ${showSidebarAds ? 'lg:pr-64' : ''}`}>
          {children}
        </main>
        
        {/* Sidebar with Ads */}
        {showSidebarAds && (
          <aside className="hidden lg:block fixed right-0 top-0 w-64 h-screen overflow-y-auto bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="p-4 space-y-6">
              {/* Multiple sidebar ad placements */}
              <SidebarAd />
              
              {/* Second ad placement with some spacing */}
              <div className="pt-8">
                <SidebarAd />
              </div>
              
              {/* Third ad placement */}
              <div className="pt-8">
                <SidebarAd />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}