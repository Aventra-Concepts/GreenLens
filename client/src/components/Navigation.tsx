import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Leaf, Menu, X } from "lucide-react";
import { ShoppingCart } from "@/components/ecommerce/ShoppingCart";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">GreenLens</span>
            </Link>
            
            {/* Navigation links removed from header */}
          </div>

          <div className="flex items-center space-x-4">
            {/* Shop Link */}
            <Link href="/shop">
              <Button variant="ghost" data-testid="shop-link">
                Shop
              </Button>
            </Link>
            
            {/* Shopping Cart */}
            <ShoppingCart />
            
            {/* Talk to Our Expert - Available for all users */}
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/talk-to-expert'}
              data-testid="talk-to-expert-button"
            >
              Talk to Our Expert
            </Button>
            
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => window.location.href = '/account'}
                      data-testid="account-button"
                    >
                      Account
                    </Button>
                    {user.isAdmin && (
                      <Button 
                        variant="ghost"
                        onClick={() => window.location.href = '/admin/dashboard'}
                        data-testid="admin-dashboard-button"
                      >
                        Admin
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/api/logout'}
                      data-testid="sign-out-button"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => window.location.href = '/auth'}
                      data-testid="sign-in-button"
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => window.location.href = '/auth'}
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
          <div className="md:hidden border-t border-gray-200 py-4">
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
                href="/shop" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              
              {/* E-book Marketplace - Mobile Menu */}
              <Link 
                href="/ebook-marketplace" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📚 E-books
              </Link>
              
              {/* Student Registration - Mobile Menu */}
              <Link 
                href="/student-registration" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🎓 Student Registration
              </Link>
              
              {/* Author Registration - Mobile Menu */}
              <Link 
                href="/author-registration" 
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ✍️ Author Registration
              </Link>
              
              {/* Talk to Our Expert - Mobile Menu */}
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full justify-start"
                onClick={() => {
                  window.location.href = '/talk-to-expert';
                  setIsMenuOpen(false);
                }}
                data-testid="mobile-talk-to-expert-button"
              >
                Talk to Our Expert
              </Button>
              
              {/* Experts Register - Mobile Menu */}
              <Link 
                href="/experts-register" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Experts Register
              </Link>
              
              {/* Shopping Cart - Mobile Menu */}
              <div className="pt-2 flex items-center">
                <span className="text-gray-700 font-medium mr-3">Cart:</span>
                <ShoppingCart />
              </div>
              
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
