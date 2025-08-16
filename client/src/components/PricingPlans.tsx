import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Loader2, Star, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

export default function PricingPlans() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/pricing-plans'],
    queryFn: () => apiRequest('GET', '/api/pricing-plans?activeOnly=true').then(res => res.json()),
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
        return;
      }

      // Use the first available payment provider
      const provider = 'stripe'; // This could be made dynamic based on user location

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, planId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
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
      // For free plan, just redirect to signup/login
      if (!isAuthenticated) {
        window.location.href = '/api/login';
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
      <section id="pricing" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get unlimited plant identifications and personalized care plans
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  // Sort plans by display order
  const sortedPlans = plans.sort((a: PricingPlan, b: PricingPlan) => a.displayOrder - b.displayOrder);

  return (
    <section id="pricing" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get unlimited plant identifications and personalized care plans
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sortedPlans.map((plan: PricingPlan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.isPopular
                  ? 'ring-2 ring-primary border-primary scale-105 shadow-xl'
                  : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-800`}
              data-testid={`pricing-plan-${plan.planId}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4 pb-8">
                <div className="flex items-center justify-center gap-2">
                  {plan.isPopular && <Zap className="w-5 h-5 text-primary" />}
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </CardTitle>
                </div>
                
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.currency === 'USD' && '$'}
                    {plan.price}
                    {plan.currency !== 'USD' && ` ${plan.currency}`}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.billingInterval === 'monthly' ? 'per month' : 'per year'}
                  </p>
                </div>
                
                {plan.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {plan.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
                      }`}
                    >
                      <CheckCircle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          feature.included ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <div>
                        <span className={feature.included ? '' : 'line-through'}>
                          {feature.name}
                        </span>
                        {feature.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.isPopular
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                  }`}
                  size="lg"
                  onClick={() => handleChoosePlan(plan.planId)}
                  disabled={checkoutMutation.isPending && selectedPlan === plan.planId}
                  data-testid={`choose-plan-${plan.planId}`}
                >
                  {checkoutMutation.isPending && selectedPlan === plan.planId ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
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