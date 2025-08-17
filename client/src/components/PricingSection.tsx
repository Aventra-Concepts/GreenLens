import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, Loader2, Star, Zap, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CurrencySelector } from "@/components/CurrencySelector";
import { usePricing } from "@/hooks/usePricing";

interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface PricingPlan {
  id: string;
  planId: string;
  name: string;
  price: string;
  currency: string;
  billingInterval: string;
  description: string;
  features: PricingFeature[];
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
}

export default function PricingSection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { 
    pricing, 
    selectedCurrency, 
    setSelectedCurrency, 
    isLoading: pricingLoading, 
    getPlanPrice,
    getOptimalProvider,
    formatPrice 
  } = usePricing('USD', user?.location || undefined);

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['/api/pricing-plans'],
    queryFn: () => apiRequest('GET', '/api/pricing-plans?activeOnly=true').then(res => res.json()),
    staleTime: 0,
    retry: 1,
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      if (!user) {
        throw new Error('Please sign in to subscribe to a plan');
      }

      const planPricing = getPlanPrice(planId);
      const provider = getOptimalProvider(planId);
      
      if (!planPricing) {
        throw new Error('Plan pricing not available for selected currency');
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId, 
          currency: selectedCurrency,
          amount: planPricing.amount,
          provider 
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message,
        variant: "destructive",
      });
      setSelectedPlan(null);
    },
  });

  const handleChoosePlan = (planId: string) => {
    if (planId === 'free') {
      if (!user) {
        setLocation('/auth');
      } else {
        toast({
          title: "Already on Free Plan",
          description: "You're already using our free tier. Start identifying plants!",
        });
      }
      return;
    }

    setSelectedPlan(planId);
    checkoutMutation.mutate({ planId });
  };

  if (isLoading) {
    return (
      <section id="pricing" className="pt-0 pb-0.5 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-0 mb-0">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Select the perfect plan for your plant identification needs
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="pricing" className="pt-0 pb-0.5 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-0">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="text-red-500">Failed to load pricing plans: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <section id="pricing" className="pt-0 pb-0.5 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-0">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-300">No pricing plans available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  // Sort plans by display order
  const sortedPlans = plans.sort((a: PricingPlan, b: PricingPlan) => a.displayOrder - b.displayOrder);

  return (
    <section id="pricing" className="pt-0 pb-0.5 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-0 mb-0">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select the perfect plan for your plant identification needs
          </p>
          
          {/* Currency Selector */}
          <div className="flex justify-center items-center gap-2 mt-0">
            <Globe className="w-4 h-4 text-gray-500" />
            <div className="w-48">
              <CurrencySelector
                value={selectedCurrency}
                onChange={setSelectedCurrency}
                userLocation={user?.location || undefined}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto justify-center items-start mt-6">
          {sortedPlans.map((plan: PricingPlan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-lg w-full sm:w-48 flex-shrink-0 h-80 flex flex-col ${
                plan.isPopular
                  ? 'ring-2 ring-primary border-primary shadow-xl'
                  : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-800`}
              data-testid={`pricing-plan-${plan.planId}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-2 pb-3 px-3">
                <div className="flex items-center justify-center gap-1">
                  {plan.isPopular && <Zap className="w-3 h-3 text-primary" />}
                  <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </CardTitle>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(() => {
                      if (plan.planId === 'free') return 'Free';
                      const planPricing = getPlanPrice(plan.planId);
                      if (pricingLoading) return '...';
                      return planPricing ? formatPrice(planPricing.amount, selectedCurrency) : plan.price;
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {plan.billingInterval === 'monthly' ? '/month' : '/year'}
                  </p>
                  {(() => {
                    const planPricing = getPlanPrice(plan.planId);
                    if (planPricing && selectedCurrency !== 'USD') {
                      return (
                        <p className="text-xs text-gray-400">
                          Provider: {planPricing.supportedProviders[0] || 'Auto-detect'}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col px-3 pb-3">
                <div className="space-y-1 flex-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-1 ${
                        feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
                      }`}
                    >
                      <CheckCircle
                        className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                          feature.included ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <div>
                        <span className={`text-xs ${feature.included ? '' : 'line-through'}`}>
                          {feature.name}
                        </span>
                      </div>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-4">
                      +{plan.features.length - 3} more
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    className={`w-full text-xs py-2 ${
                      plan.isPopular
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                    }`}
                    onClick={() => handleChoosePlan(plan.planId)}
                    disabled={checkoutMutation.isPending && selectedPlan === plan.planId}
                    data-testid={`choose-plan-${plan.planId}`}
                  >
                    {checkoutMutation.isPending && selectedPlan === plan.planId ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All plans include 30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}