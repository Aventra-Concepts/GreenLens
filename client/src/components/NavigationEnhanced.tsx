import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
  Home,
  Leaf,
  DollarSign,
  Star,
  MessageCircle,
  Settings,
  Store
} from "lucide-react";

export default function NavigationEnhanced() {
  const [location] = useLocation();
  const { user, isAuthenticated, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



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

  const authorItems = [
    { name: "Upload E-book", href: "/author-upload", icon: Upload },
  ];

  const studentItems = [
    { name: "Student Verification", href: "/student-verification", icon: Settings },
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
      <div className="container mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 group">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-md flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-medium text-gray-800 dark:text-gray-100 tracking-tight">
              GreenLens
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            {navigationItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <button
                  className={`relative px-2.5 py-1.5 mx-1 text-xs font-medium rounded-md transition-all duration-300 group ${
                    isActive(item.href)
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="flex items-center">
                    <item.icon className="w-3 h-3 mr-1" />
                    {item.name}
                  </span>
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-1/2 w-4 h-0.5 bg-emerald-500 rounded-full transform -translate-x-1/2 translate-y-1" />
                  )}
                  <div className="absolute inset-0 rounded-md bg-gray-100/0 dark:bg-gray-700/0 group-hover:bg-gray-100/60 dark:group-hover:bg-gray-700/40 transition-colors duration-200" />
                </button>
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Shopping Cart */}
            <Link href="/shop">
              <button
                className="relative p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200 group"
                data-testid="nav-cart"
              >
                <ShoppingCart className="w-4 h-4 group-hover:scale-105 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center text-xs font-medium bg-red-500 text-white rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 max-w-20 truncate mr-1">
                  {(user as any)?.firstName || (user as any)?.email}
                </span>
                {(user as any)?.isAdmin && (
                  <Link href="/admin/dashboard">
                    <button className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 rounded-md transition-all duration-200" data-testid="nav-admin">
                      <Settings className="w-3 h-3 mr-1 inline" />
                      Admin
                    </button>
                  </Link>
                )}
                <Link href="/account">
                  <button className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 rounded-md transition-all duration-200" data-testid="nav-account">
                    <User className="w-3 h-3 mr-1 inline" />
                    Account
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="nav-logout"
                >
                  <LogOut className="w-3 h-3 mr-1 inline" />
                  {logoutMutation.isPending ? "Signing out..." : "Logout"}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Link href="/auth">
                  <button className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 rounded-md transition-all duration-200" data-testid="nav-login">
                    Login
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm transition-all duration-200 hover:shadow-md" data-testid="nav-signup">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Mobile Cart */}
            <Link href="/shop">
              <button
                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                data-testid="nav-mobile-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs font-medium bg-red-500 text-white rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </Link>
            
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                  data-testid="nav-mobile-menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-80 overflow-y-auto">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Navigation Items */}
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
                  </div>

                  {/* Shopping Cart */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Shop
                    </h3>
                    <Link href="/shop">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left relative"
                        onClick={closeMobileMenu}
                        data-testid="mobile-nav-cart"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Shopping Cart
                        {cartItemCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </div>

                  {/* Author Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      For Authors
                    </h3>
                    {authorItems.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-gray-700 dark:text-gray-200"
                          onClick={closeMobileMenu}
                          data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Student Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      For Students
                    </h3>
                    {studentItems.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-gray-700 dark:text-gray-200"
                          onClick={closeMobileMenu}
                          data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Authentication */}
                  <div className="border-t pt-4 space-y-2">
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
                            data-testid="mobile-nav-account"
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
                              data-testid="mobile-nav-admin"
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
                          data-testid="mobile-nav-logout"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          {logoutMutation.isPending ? "Signing out..." : "Logout"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link href="/auth">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={closeMobileMenu}
                            data-testid="mobile-nav-login"
                          >
                            <User className="w-4 h-4 mr-3" />
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth">
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={closeMobileMenu}
                            data-testid="mobile-nav-signup"
                          >
                            <User className="w-4 h-4 mr-3" />
                            Sign Up
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
      </div>
    </header>
  );
}