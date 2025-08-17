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
import AdminBlogManager from "@/pages/admin-blog-manager";
import AdminSocialMedia from "@/pages/admin-social-media";
import ExpertsRegister from "@/pages/experts-register";
import Features from "@/pages/features";
import BlogPage from "@/pages/blog-page";
import BlogPost from "@/pages/blog-post";
import Reviews from "@/pages/Reviews";
import AuthPage from "@/pages/auth-page";
import ShopPage from "@/pages/shop-page";
import CheckoutPage from "@/pages/checkout";
import ExpertOnboarding from "@/pages/expert-onboarding";
import TalkToExpert from "@/pages/talk-to-expert";
import ConsultationPayment from "@/pages/consultation-payment";
import ConsultationSuccess from "@/pages/consultation-success";
import EbookMarketplace from "@/pages/ebook-marketplace";
import AuthorUpload from "@/pages/author-upload";
import StudentRegistration from "@/pages/student-registration";
import EbookDetail from "@/pages/ebook-detail";
import AuthorRegistration from "@/pages/author-registration";
import StudentVerification from "@/pages/student-verification-new";
import StudentDashboard from "@/pages/student-dashboard";
import CartPage from "./pages/cart-page";
import OrderSuccessPage from "./pages/order-success-page";
import { PerformanceMetrics } from "@/components/performance/PerformanceMetrics";

// E-book Category Pages
import GardeningBasicsPage from "@/pages/categories/gardening-basics";
import PlantCarePage from "@/pages/categories/plant-care";
import OrganicFarmingPage from "@/pages/categories/organic-farming";
import IndoorPlantsPage from "@/pages/categories/indoor-plants";
import HerbsAndVegetablesPage from "@/pages/categories/herbs-and-vegetables";
import FlowerGardeningPage from "@/pages/categories/flower-gardening";
import LandscapingPage from "@/pages/categories/landscaping";
import PestManagementPage from "@/pages/categories/pest-management";
import SeasonalGardeningPage from "@/pages/categories/seasonal-gardening";
import GardenToolsPage from "@/pages/categories/garden-tools";
import BotanyAndSciencePage from "@/pages/categories/botany-and-science";
import PermaculturePage from "@/pages/categories/permaculture";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      {/* Landing/Home page - different based on auth status */}
      {isLoading || !user ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      
      {/* Auth page is always available */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Public routes available to all users regardless of auth status */}
      <Route path="/identify" component={Identify} />
      <Route path="/result/:id" component={Result} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/features" component={Features} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/order-success" component={OrderSuccessPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/expert-onboarding" component={ExpertOnboarding} />
      <Route path="/talk-to-expert" component={TalkToExpert} />
      <Route path="/payment/consultation/:id">
        {(params) => <ConsultationPayment consultationId={params.id} />}
      </Route>
      <Route path="/consultation-success">
        {() => {
          const urlParams = new URLSearchParams(window.location.search);
          const id = urlParams.get('id');
          return id ? <ConsultationSuccess consultationId={id} /> : <NotFound />;
        }}
      </Route>
      <Route path="/ebook-marketplace" component={EbookMarketplace} />
      <Route path="/ebooks/:id">
        {(params) => <EbookDetail id={params.id} />}
      </Route>
      
      {/* E-book Category Routes */}
      <Route path="/categories/gardening-basics" component={GardeningBasicsPage} />
      <Route path="/categories/plant-care" component={PlantCarePage} />
      <Route path="/categories/organic-farming" component={OrganicFarmingPage} />
      <Route path="/categories/indoor-plants" component={IndoorPlantsPage} />
      <Route path="/categories/herbs-and-vegetables" component={HerbsAndVegetablesPage} />
      <Route path="/categories/flower-gardening" component={FlowerGardeningPage} />
      <Route path="/categories/landscaping" component={LandscapingPage} />
      <Route path="/categories/pest-management" component={PestManagementPage} />
      <Route path="/categories/seasonal-gardening" component={SeasonalGardeningPage} />
      <Route path="/categories/garden-tools" component={GardenToolsPage} />
      <Route path="/categories/botany-and-science" component={BotanyAndSciencePage} />
      <Route path="/categories/permaculture" component={PermaculturePage} />
      
      <Route path="/author-upload" component={AuthorUpload} />
      <Route path="/student-registration" component={StudentRegistration} />
      <Route path="/author-registration" component={AuthorRegistration} />
      <Route path="/student-verification" component={StudentVerification} />
      <Route path="/student-dashboard" component={StudentDashboard} />
      <Route path="/experts-register" component={ExpertsRegister} />
      
      {/* Protected routes that require authentication */}
      {user && (
        <>
          <Route path="/account" component={Account} />
          {user.isAdmin && (
            <>
              <Route path="/admin" component={Admin} />
              <Route path="/admin-login" component={AdminLogin} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/blog" component={AdminBlogManager} />
              <Route path="/admin/social-media" component={AdminSocialMedia} />
            </>
          )}
        </>
      )}
      
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
          <PerformanceMetrics />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
