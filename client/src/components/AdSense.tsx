import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

// Google AdSense configuration
const ADSENSE_CLIENT_ID = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || "";

// AdSense initialization hook
function useAdSenseInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasAdsRunning, setHasAdsRunning] = useState(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID) {
      console.warn("Google AdSense client ID not configured");
      return;
    }

    // Check if AdSense script is already loaded
    if (window.adsbygoogle) {
      setIsInitialized(true);
      setHasAdsRunning(true);
      return;
    }

    // Load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
      setIsInitialized(true);
      setHasAdsRunning(true);
    };
    
    script.onerror = () => {
      console.warn("Failed to load Google AdSense");
      setHasAdsRunning(false);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return { isInitialized, hasAdsRunning };
}

interface AdSenseAdProps {
  slot: string;
  style?: React.CSSProperties;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  className?: string;
}

function AdSenseAd({ 
  slot, 
  style = { display: 'block' }, 
  format = "auto", 
  responsive = true,
  className = ""
}: AdSenseAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const { isInitialized, hasAdsRunning } = useAdSenseInit();
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (!isInitialized || !hasAdsRunning || !ADSENSE_CLIENT_ID) {
      return;
    }

    const loadAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          window.adsbygoogle.push({});
          setAdLoaded(true);
        }
      } catch (error) {
        console.warn("AdSense loading error:", error);
        setAdLoaded(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [isInitialized, hasAdsRunning]);

  // Don't render if no ads are running or client ID is missing
  if (!hasAdsRunning || !ADSENSE_CLIENT_ID) {
    return null;
  }

  return (
    <div className={className} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}

// Specific ad components for different placements

export function SidebarAd() {
  const { hasAdsRunning } = useAdSenseInit();
  
  if (!hasAdsRunning) return null;

  return (
    <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Advertisement
      </div>
      <AdSenseAd
        slot="1234567890" // Replace with actual slot ID
        style={{ 
          display: 'block',
          minHeight: '250px',
          width: '100%'
        }}
        format="rectangle"
        responsive={true}
        className="w-full"
      />
    </Card>
  );
}

export function InArticleAd() {
  const { hasAdsRunning } = useAdSenseInit();
  
  if (!hasAdsRunning) return null;

  return (
    <div className="my-8 flex justify-center">
      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-2xl w-full">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          Advertisement
        </div>
        <AdSenseAd
          slot="0987654321" // Replace with actual slot ID
          style={{ 
            display: 'block',
            minHeight: '200px',
            width: '100%'
          }}
          format="auto"
          responsive={true}
          className="w-full"
        />
      </Card>
    </div>
  );
}

export function BannerAd() {
  const { hasAdsRunning } = useAdSenseInit();
  
  if (!hasAdsRunning) return null;

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">
          Advertisement
        </div>
        <AdSenseAd
          slot="5678901234" // Replace with actual slot ID
          style={{ 
            display: 'block',
            minHeight: '100px',
            width: '100%'
          }}
          format="horizontal"
          responsive={true}
          className="w-full"
        />
      </div>
    </div>
  );
}

export function MobileAd() {
  const { hasAdsRunning } = useAdSenseInit();
  
  if (!hasAdsRunning) return null;

  return (
    <div className="lg:hidden my-4 flex justify-center">
      <Card className="p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full max-w-sm">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          Advertisement
        </div>
        <AdSenseAd
          slot="3456789012" // Replace with actual slot ID
          style={{ 
            display: 'block',
            minHeight: '150px',
            width: '100%'
          }}
          format="auto"
          responsive={true}
          className="w-full"
        />
      </Card>
    </div>
  );
}

// Global AdSense types
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}