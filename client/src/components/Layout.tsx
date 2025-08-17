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
          <nav className="flex items-center justify-center space-x-6 text-sm">
            <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-testid="link-home">
              Home
            </a>
            <a href="/identify" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-testid="link-identify">
              Identify Plant
            </a>
            
            {/* E-book Marketplace Section */}
            <div className="relative group">
              <a href="/ebook-marketplace" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium" data-testid="link-ebooks">
                📚 E-books
              </a>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <a href="/ebook-marketplace" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600" data-testid="link-browse-ebooks">
                    Browse All E-books
                  </a>
                  <a href="/ebook-marketplace?category=gardening" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600" data-testid="link-gardening-ebooks">
                    Gardening Guides
                  </a>
                  <a href="/ebook-marketplace?category=agriculture" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600" data-testid="link-agriculture-ebooks">
                    Agriculture & Farming
                  </a>
                  <a href="/ebook-marketplace?featured=true" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600" data-testid="link-featured-ebooks">
                    Featured E-books
                  </a>
                  <a href="/ebook-marketplace?sortBy=rating" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600" data-testid="link-top-rated-ebooks">
                    Top Rated
                  </a>
                </div>
              </div>
            </div>
            
            <a href="/account" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-testid="link-account">
              My Garden
            </a>
            <a href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-testid="link-pricing">
              Pricing
            </a>
            <a href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-testid="link-blog">
              Blog
            </a>

            <a href="/expert-onboarding" className="bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors font-medium" data-testid="link-expert-register">
              Experts Register
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