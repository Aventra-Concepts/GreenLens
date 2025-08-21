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
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Garden</h2>
            <p className="text-gray-600 mt-2">
              {hasActiveSubscription 
                ? "Track and manage your identified plants" 
                : "Premium plant tracking and management"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm">
              <span className="text-gray-600">Subscription:</span>
              <span className={`font-semibold ml-2 ${hasActiveSubscription ? 'text-green-600' : 'text-gray-600'}`}>
                {(subscription as any)?.planName || 'Free Plan'}
              </span>
            </div>
            <Link href="/account">
              <Button className="bg-green-500 hover:bg-green-600" data-testid="account-settings-button">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>




      </div>
    </section>
  );
}
