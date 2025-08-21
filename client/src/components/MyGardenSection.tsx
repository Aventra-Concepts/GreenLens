import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Eye, Trash2 } from "lucide-react";


export default function MyGardenSection() {
  const { user } = useAuth();

  // Check subscription status to determine access to My Garden features
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/subscription/status'],
    retry: false,
  });

  const { data: userPlants, isLoading } = useQuery({
    queryKey: ['/api/my-garden'],
    retry: false,
    enabled: (subscription as any)?.hasActiveSubscription === true, // Only load if subscribed
  });

  const hasActiveSubscription = (subscription as any)?.hasActiveSubscription === true;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'canceled': return 'text-red-600';
      case 'past_due': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

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
              <span className={`font-semibold ml-2 ${getStatusColor((subscription as any)?.status || 'none')}`}>
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

        {/* Plant Collection */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userPlants && Array.isArray(userPlants) && userPlants.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(userPlants || []).map((plant: any) => (
              <Card key={plant.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <div className="text-4xl">🌱</div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate" data-testid={`plant-name-${plant.id}`}>
                      {plant.species?.commonName || 'Unknown Plant'}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((parseFloat(plant.confidence) || 0) * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 italic mb-3 truncate">
                    {plant.species?.scientificName || 'Unknown species'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{plant.createdAt ? new Date(plant.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                    <div className="flex items-center space-x-2">
                      <Link href={`/result/${plant.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:text-green-600"
                          data-testid={`view-plant-${plant.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:text-red-600"
                        data-testid={`delete-plant-${plant.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Plant Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
              <Link href="/identify">
                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer">
                  <div className="w-12 h-12 bg-gray-200 hover:bg-green-100 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400 hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Add New Plant</h3>
                  <p className="text-sm text-gray-600">Identify a new plant to add to your garden</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl">🌱</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plants Yet</h3>
            <p className="text-gray-600 mb-6">Start identifying plants to build your digital garden!</p>
            <Link href="/identify">
              <Button className="bg-green-500 hover:bg-green-600" data-testid="identify-first-plant-button">
                Identify Your First Plant
              </Button>
            </Link>
          </div>
        )}


      </div>
    </section>
  );
}
