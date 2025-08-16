import { ReactNode } from "react";

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
      {children}
    </div>
  );
}