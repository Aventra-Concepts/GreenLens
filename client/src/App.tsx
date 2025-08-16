import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Identify from "@/pages/identify";
import Result from "@/pages/result";
import Pricing from "@/pages/pricing";
import Account from "@/pages/account";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import Features from "@/pages/features";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Reviews from "@/pages/Reviews";
import AuthPage from "@/pages/auth-page";
import ShopPage from "@/pages/shop";
import CheckoutPage from "@/pages/checkout";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !user ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/account" component={Account} />
          {user.isAdmin && <Route path="/admin" component={Admin} />}
        </>
      )}
      {/* Public routes available to all users */}
      <Route path="/identify" component={Identify} />
      <Route path="/result/:id" component={Result} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/features" component={Features} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
