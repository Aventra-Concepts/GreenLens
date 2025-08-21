import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationClean from "@/components/NavigationClean";
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
  // Fetch feature settings to control navigation visibility
  const { data: featureSettings } = useQuery<{
    gardeningShopEnabled?: boolean;
    ebookMarketplaceEnabled?: boolean;
  }>({
    queryKey: ["/api/admin/feature-settings"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const showEbookMarketplace = featureSettings?.ebookMarketplaceEnabled ?? true; // Default to true if not loaded
  const showGardeningShop = featureSettings?.gardeningShopEnabled ?? true; // Default to true if not loaded

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <NavigationClean />
      
      {/* Top Menu Bar - Sticky - Hidden on small screens */}
      <div className="hidden sm:block sticky top-12 sm:top-14 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-4 sm:space-x-6 text-sm overflow-x-auto pb-1">
            <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors whitespace-nowrap" data-testid="link-home">
              Home
            </a>
            <a href="/identify" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors whitespace-nowrap" data-testid="link-identify">
              Identify Plant
            </a>
            <a href="/my-garden" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors whitespace-nowrap" data-testid="link-my-garden">
              🌱 My Garden
            </a>
            
            {/* E-Books Section - Only show if enabled */}
            {showEbookMarketplace && (
              <div className="relative group">
                <a href="/ebook-marketplace" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium" data-testid="link-ebooks">
                  📚 E-Books
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
            )}
            


            <a href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-testid="link-pricing">
              Pricing
            </a>
            <a href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors" data-testid="link-blog">
              Blog
            </a>

            <a href="/talk-to-expert" className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors font-medium mr-3" data-testid="link-talk-to-expert">
              Talk to Expert
            </a>
            <a href="/expert-onboarding" className="bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors font-medium" data-testid="link-expert-register">
              Experts Register
            </a>
          </nav>
        </div>
      </div>

      {/* Image Upload Banner - Responsive height */}
      {showImageBanner && (
        <div className="h-40 sm:h-48 lg:h-56 py-2 sm:py-4">
          <div className="flex">
            {/* Left Spacer to balance the right sidebar */}
            {showSidebarAds && (
              <div className="hidden lg:block w-64 flex-shrink-0"></div>
            )}
            
            <div className="flex-1">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <ImageUploadBanner />
              </div>
            </div>
            
            {/* Right spacer equivalent to sidebar width */}
            {showSidebarAds && (
              <div className="hidden lg:block w-64 flex-shrink-0"></div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex">
        {/* Left Spacer to balance the right sidebar */}
        {showSidebarAds && (
          <div className="hidden lg:block w-64 flex-shrink-0"></div>
        )}
        
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-2">
            {children}
          </div>
        </main>
        
        {/* Right spacer equivalent to sidebar width */}
        {showSidebarAds && (
          <div className="hidden lg:block w-64 flex-shrink-0"></div>
        )}
        
        {/* Right Sidebar with Ads - Fixed Position */}
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