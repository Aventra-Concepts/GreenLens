import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  ShoppingCart, 
  BookOpen, 
  Upload, 
  GraduationCap,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Leaf,
  DollarSign,
  Star,
  MessageCircle,
  Settings,
  Store
} from "lucide-react";

export default function NavigationClean() {
  const [location] = useLocation();
  const { user, isAuthenticated, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkScreenSize = () => {
      const isDesktopSize = window.innerWidth >= 1024;
      setIsDesktop(isDesktopSize);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get cart item count
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = Array.isArray(cartItems) ? cartItems.reduce((total: number, item: any) => total + item.quantity, 0) : 0;

  const navigationItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Identify Plants", href: "/identify", icon: Leaf },
    { name: "E-book Marketplace", href: "/ebook-marketplace", icon: BookOpen },
    { name: "Shop", href: "/shop", icon: Store },
    { name: "Pricing", href: "/pricing", icon: DollarSign },
    { name: "Reviews", href: "/reviews", icon: Star },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-700/50 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 sm:h-16 w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center transition-all group-hover:scale-105">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight whitespace-nowrap">
                GreenLens
              </span>
            </Link>
          </div>

          {/* Center - Clean spacer for both desktop and mobile */}
          <div className="flex-1"></div>

          {/* Right - Desktop and Mobile Cart and Menu */}
          <div className="flex-shrink-0">
            {/* Desktop version */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Shopping Cart */}
              <Link href="/shop">
                <button
                  className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                  data-testid="nav-cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs font-medium bg-red-500 text-white rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </Link>
              
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                data-testid="nav-menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile version - Clean and minimal */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Mobile Cart */}
              <Link href="/shop">
                <button
                  className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50/80 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
                  data-testid="nav-mobile-cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs font-semibold bg-red-500 text-white rounded-full shadow-sm">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50/80 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
                data-testid="nav-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Side Menu - Different content for mobile vs desktop */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="right" className="w-[300px] sm:w-80 overflow-y-auto">
              <div className="flex flex-col space-y-4 mt-6">
                {/* Navigation Items - ONLY VISIBLE ON MOBILE SCREENS - JAVASCRIPT CONDITIONAL */}
                {isClient && !isDesktop && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Navigation
                    </h3>
                    {navigationItems.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className={`w-full justify-start text-left ${
                            isActive(item.href)
                              ? "bg-green-600 text-white"
                              : "text-gray-700 dark:text-gray-200"
                          }`}
                          onClick={closeMobileMenu}
                          data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                    
                    {/* Expert Consultation Links - Mobile Only */}
                    <div className="border-t pt-2 space-y-2">
                      <Link href="/expert-onboarding">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-blue-600 dark:text-blue-400"
                          onClick={closeMobileMenu}
                          data-testid="mobile-nav-expert-registration"
                        >
                          <GraduationCap className="w-4 h-4 mr-3" />
                          Experts Registration
                        </Button>
                      </Link>
                      <Link href="/talk-to-expert">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-green-600 dark:text-green-400"
                          onClick={closeMobileMenu}
                          data-testid="mobile-nav-talk-to-expert"
                        >
                          <MessageCircle className="w-4 h-4 mr-3" />
                          Talk to Expert
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Authentication Section - ALL AUTH BUTTONS HERE */}
                <div className={`space-y-2 ${isClient && !isDesktop ? 'border-t pt-4' : 'pt-0'}`}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account
                  </h3>
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        Welcome, {(user as any)?.firstName || (user as any)?.email}
                      </div>
                      <Link href="/account">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={closeMobileMenu}
                          data-testid="menu-account"
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Account
                        </Button>
                      </Link>
                      {(user as any)?.isAdmin && (
                        <Link href="/admin/dashboard">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={closeMobileMenu}
                            data-testid="menu-admin"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-red-600 dark:text-red-400"
                        disabled={logoutMutation.isPending}
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        data-testid="menu-logout"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/auth">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={closeMobileMenu}
                          data-testid="menu-login"
                        >
                          <LogIn className="w-4 h-4 mr-3" />
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button
                          className="w-full justify-start text-left bg-green-600 hover:bg-green-700 text-white"
                          onClick={closeMobileMenu}
                          data-testid="menu-signup"
                        >
                          <UserPlus className="w-4 h-4 mr-3" />
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}