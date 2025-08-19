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
    { name: "Buy The Best Gardening Tools", href: "/tools", icon: Store },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center transition-all group-hover:scale-105">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight whitespace-nowrap">
                GreenLens
              </span>
            </Link>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <button
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="flex items-center space-x-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </span>
                  </button>
                </Link>
              ))}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="flex items-center space-x-3">
            {/* Tools Link */}
            <Link href="/tools">
              <button
                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                data-testid="nav-tools"
              >
                <Store className="w-5 h-5" />
              </button>
            </Link>
            
              {/* Menu Button for Account Access */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                data-testid="nav-menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Right Section */}
          <div className="flex lg:hidden items-center space-x-2 flex-shrink-0 ml-auto">
            {/* Mobile Tools */}
            <Link href="/tools">
              <button
                className="relative p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
                data-testid="nav-mobile-tools"
              >
                <Store className="w-4 h-4" />
              </button>
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all duration-200"
              data-testid="nav-mobile-menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Unified Side Menu for both Desktop and Mobile */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
    </header>
  );
}