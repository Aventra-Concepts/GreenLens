import { Switch, Route, useLocation } from "wouter";
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
import AuthorDashboard from "@/pages/author-dashboard";
import MyGarden from "@/pages/my-garden";
import GardenMonitoring from "@/pages/garden-monitoring";
import PlantCareDashboard from "@/pages/PlantCareDashboard";
import GardenSubscription from "@/pages/GardenSubscription";
import GardenSubscriptionSuccess from "@/pages/SubscriptionSuccess";
import Tools from "@/pages/tools";
import Disclosure from "@/pages/disclosure";
import FAQ from "@/pages/faq";
import PlantDatabase from "@/pages/plant-database";
import Community from "@/pages/community";
import CarePlans from "@/pages/care-plans";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import About from "@/pages/about";
import RefundPolicy from "@/pages/refund-policy";
import SoilTestingCenters from "@/pages/soil-testing-centers";
import Disclaimer from "@/pages/disclaimer";
import Contact from "@/pages/contact";
import AdminGarden from "@/pages/admin-garden";
import UserGardenView from "@/pages/user-garden-view";
import EbookUpload from "@/pages/ebook-upload";
import SubscriptionCheckout from "@/pages/subscription-checkout";
import SubscriptionSuccess from "@/pages/subscription-success";
import { PerformanceMetrics } from "@/components/performance/PerformanceMetrics";
import { Chatbot } from "@/components/Chatbot";
import Footer from "@/components/Footer";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

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
import DiseaseDiagnosis from '@/pages/disease-diagnosis';
import CareersPage from '@/pages/careers';
import DocumentationDownload from '@/pages/documentation-download';
import AdminHRDashboard from '@/pages/admin-hr-dashboard';

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      {/* Landing/Home page - show Home for all users */}
      <Route path="/" component={Home} />
      <Route path="/landing" component={Landing} />
      
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
      <Route path="/my-garden" component={MyGarden} />
      <Route path="/garden/subscription" component={GardenSubscription} />
      <Route path="/garden/subscription/success" component={GardenSubscriptionSuccess} />
      <Route path="/subscription/checkout" component={SubscriptionCheckout} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
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
      <Route path="/ebook-upload" component={EbookUpload} />
      <Route path="/author-dashboard" component={AuthorDashboard} />
      <Route path="/student-registration" component={StudentRegistration} />
      <Route path="/author-registration" component={AuthorRegistration} />
      <Route path="/student-verification" component={StudentVerification} />
      <Route path="/student-dashboard" component={StudentDashboard} />
      <Route path="/experts-register" component={ExpertsRegister} />
      <Route path="/tools" component={Tools} />
      <Route path="/disclosure" component={Disclosure} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/about" component={About} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/soil-testing-centers" component={SoilTestingCenters} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/plant-database" component={PlantDatabase} />
      <Route path="/community" component={Community} />
      <Route path="/care-plans" component={CarePlans} />
      <Route path="/disease-diagnosis" component={DiseaseDiagnosis} />
      <Route path="/documentation" component={DocumentationDownload} />
      <Route path="/careers" component={CareersPage} />
      
      {/* Admin login should be public - accessible before logging in */}
      <Route path="/admin-login">
        {() => <AdminLogin />}
      </Route>
      
      {/* Admin routes - accessible with session-based auth */}
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/blog" component={AdminBlogManager} />
      <Route path="/admin/social-media" component={AdminSocialMedia} />
      <Route path="/admin/garden" component={AdminGarden} />
      <Route path="/admin-garden" component={AdminGarden} />
      <Route path="/admin/user-garden/:userId">
        {(params) => <UserGardenView />}
      </Route>
      <Route path="/admin/hr" component={AdminHRDashboard} />
      
      {/* Protected routes that require authentication */}
      {user && (
        <>
          <Route path="/account" component={Account} />
          <Route path="/garden-monitoring" component={GardenMonitoring} />
          <Route path="/garden/monitoring" component={GardenMonitoring} />
          <Route path="/garden/dashboard" component={PlantCareDashboard} />
          {user.isAdmin && (
            <>
              <Route path="/admin" component={Admin} />
            </>
          )}
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Toaster />
            <main className="flex-1">
              <Router />
            </main>
            {!isAdminPage && <Footer />}
            {!isAdminPage && <CookieConsentBanner />}
            <Chatbot />
            <PerformanceMetrics />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
