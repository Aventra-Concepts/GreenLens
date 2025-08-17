import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get cart item count
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  const navigationItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Identify Plants", href: "/identify", icon: Leaf },
    { name: "E-book Marketplace", href: "/ebook-marketplace", icon: BookOpen },
    { name: "Shop", href: "/shop", icon: Store },
    { name: "Pricing", href: "/pricing", icon: DollarSign },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Talk to Expert", href: "/talk-to-expert", icon: MessageCircle },
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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/98 backdrop-blur-md supports-[backdrop-filter]:bg-white/95 dark:bg-gray-950/98 dark:supports-[backdrop-filter]:bg-gray-950/95 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              GreenLens
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-0.5">
            {navigationItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs font-medium px-3 py-2 h-8 transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-green-50/50 dark:hover:text-green-400 dark:hover:bg-green-950/30"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-3.5 h-3.5 mr-1.5" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Shopping Cart */}
            <Link href="/shop">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 px-2 text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-green-50/50 dark:hover:text-green-400 dark:hover:bg-green-950/30 transition-all duration-200"
                data-testid="nav-cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs p-0 min-w-0"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
                  {user?.firstName || user?.email}
                </span>
                {user?.isAdmin && (
                  <Link href="/admin/dashboard">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2.5 text-xs border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600" 
                      data-testid="nav-admin"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/account">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2.5 text-xs border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600" 
                    data-testid="nav-account"
                  >
                    <User className="w-3 h-3 mr-1" />
                    Account
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 px-2.5 text-xs border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-600 dark:hover:border-red-600 dark:hover:text-red-400"
                  data-testid="nav-logout"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link href="/auth">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-3 text-xs border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600" 
                    data-testid="nav-login"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    data-testid="nav-signup"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-gray-600 dark:text-gray-300 hover:bg-green-50/50 dark:hover:bg-green-950/30" 
                  data-testid="nav-mobile-menu"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
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
                          Welcome, {user?.firstName || user?.email}
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
                        {user?.isAdmin && (
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
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                          data-testid="mobile-nav-logout"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
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