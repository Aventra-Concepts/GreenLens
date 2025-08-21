import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";


export default function MyGardenSection() {
  const { user } = useAuth();

  // Check subscription status to determine access to My Garden features
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscription/status'],
    retry: false,
  });

  const hasActiveSubscription = (subscription as any)?.hasActiveSubscription === true;

  if (subscriptionLoading) {
    return (
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-6 sm:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Garden</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {hasActiveSubscription 
                ? "Track and manage your identified plants" 
                : "Premium plant tracking and management"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-3 sm:gap-4">
            <div className="bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm w-full sm:w-auto">
              <span className="text-gray-600">Subscription:</span>
              <span className={`font-semibold ml-2 ${hasActiveSubscription ? 'text-green-600' : 'text-gray-600'}`}>
                {(subscription as any)?.planName || 'Free Plan'}
              </span>
            </div>
            <Link href="/account" className="w-full sm:w-auto">
              <Button className="bg-green-500 hover:bg-green-600 w-full sm:w-auto text-sm sm:text-base" data-testid="account-settings-button">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>




      </div>
    </section>
  );
}
