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
import AdminDashboard from "@/pages/admin-dashboard";
import ExpertsRegister from "@/pages/experts-register";
import Features from "@/pages/features";
import BlogPage from "@/pages/blog-page";
import BlogPost from "@/pages/blog-post";
import Reviews from "@/pages/Reviews";
import AuthPage from "@/pages/auth-page";
import ShopPage from "@/pages/shop";
import CheckoutPage from "@/pages/checkout";
import ExpertOnboarding from "@/pages/expert-onboarding";
import TalkToExpert from "@/pages/talk-to-expert";
import ConsultationPayment from "@/pages/consultation-payment";
import ConsultationSuccess from "@/pages/consultation-success";

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
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/expert-onboarding" component={ExpertOnboarding} />
      <Route path="/talk-to-expert" component={TalkToExpert} />
      <Route path="/payment/consultation/:id">
        {(params) => <ConsultationPayment consultationId={params.id} />}
      </Route>
      <Route path="/consultation-success">
        {({ search }) => {
          const params = new URLSearchParams(search);
          const id = params.get('id');
          return id ? <ConsultationSuccess consultationId={id} /> : <NotFound />;
        }}
      </Route>
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/experts-register" component={ExpertsRegister} />
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
