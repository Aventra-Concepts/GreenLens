import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { Leaf, Menu, X } from "lucide-react";


export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 lg:max-w-5xl lg:mx-auto lg:px-8">
          {/* Brand logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">GreenLens</span>
            </Link>
          </div>

          {/* Right section - tools and user actions */}
          <div className="flex items-center space-x-4">
            {/* Tools Link */}
            <Link href="/tools">
              <Button variant="ghost" data-testid="tools-link">
                Buy The Best Gardening Tools
              </Button>
            </Link>
            

            
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => setLocation('/account')}
                      data-testid="account-button"
                    >
                      Account
                    </Button>
                    {user.isAdmin && (
                      <Button 
                        variant="ghost"
                        onClick={() => setLocation('/admin/dashboard')}
                        data-testid="admin-dashboard-button"
                      >
                        Admin
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          await fetch('/api/logout', { method: 'POST' });
                          // Clear cached user data
                          queryClient.setQueryData(["/api/auth/user"], null);
                          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                          // Force redirect to home page
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Logout failed:', error);
                          window.location.href = '/';
                        }
                      }}
                      data-testid="sign-out-button"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => setLocation('/auth')}
                      data-testid="sign-in-button"
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => setLocation('/auth')}
                      data-testid="get-started-button"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                data-testid="mobile-menu-button"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white dark:bg-gray-900">
            <div className="flex flex-col space-y-4">
              {user && (
                <Link 
                  href="/identify" 
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Identify
                </Link>
              )}
              <Link 
                href="/features" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/blog" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/tools" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Buy The Best Gardening Tools
              </Link>
              
              {/* E-book Marketplace - Mobile Menu */}
              <Link 
                href="/ebook-marketplace" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📚 E-books
              </Link>
              

              
              {/* Experts Register - Mobile Menu */}
              <Link 
                href="/experts-register" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Experts Register
              </Link>
              
              {/* Tools Link - Mobile Menu */}
              <Link 
                href="/tools"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Buy The Best Gardening Tools
              </Link>
              
              {user && (
                <Link 
                  href="/account" 
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Garden
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
