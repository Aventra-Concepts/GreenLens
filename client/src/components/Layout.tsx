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
      
      {/* Image Upload Banner - 3-4 inch height as requested */}
      {showImageBanner && (
        <div className="h-24 sm:h-28 lg:h-32">
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