import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PricingSection() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: async ({ provider, planId }: { provider: string; planId: string }) => {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
        return;
      }

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

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    
    // Determine payment provider based on environment or user location
    // For now, we'll default to the first available provider
    let provider = 'stripe'; // Default fallback
    
    // Try to determine the best provider
    if (process.env.NODE_ENV === 'production') {
      // You could add logic here to determine provider based on user location
      provider = 'stripe';
    }

    checkoutMutation.mutate({ provider, planId });
  };

  const features = {
    free: [
      "5 identifications per month",
      "Basic plant information",
      "Community support"
    ],
    pro: [
      "Unlimited identifications",
      "AI-powered care plans", 
      "Disease diagnosis",
      "PDF care reports",
      "Priority support"
    ],
    premium: [
      "Everything in Pro",
      "Expert consultation",
      "Garden management tools", 
      "Advanced analytics",
      "API access"
    ]
  };

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-lg text-gray-600">Get unlimited plant identifications and personalized care plans</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center space-y-4 pb-8">
              <h3 className="text-xl font-bold text-gray-900">Free</h3>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-gray-900">$0</div>
                <div className="text-sm text-gray-600">Forever free</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => !isAuthenticated && (window.location.href = '/api/login')}
                data-testid="free-plan-button"
              >
                {isAuthenticated ? 'Current Plan' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative transform scale-105 shadow-xl border-2 border-green-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-400 text-yellow-900 px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center space-y-4 pb-8 bg-green-500 text-white">
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="space-y-1">
                <div className="text-4xl font-bold">$9</div>
                <div className="text-sm text-green-100">per month</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {features.pro.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={() => handleUpgrade('pro')}
                disabled={checkoutMutation.isPending && selectedPlan === 'pro'}
                data-testid="pro-plan-button"
              >
                {checkoutMutation.isPending && selectedPlan === 'pro' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Pro Trial'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative">
            <CardHeader className="text-center space-y-4 pb-8">
              <h3 className="text-xl font-bold text-gray-900">Premium</h3>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-gray-900">$19</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={() => handleUpgrade('premium')}
                disabled={checkoutMutation.isPending && selectedPlan === 'premium'}
                data-testid="premium-plan-button"
              >
                {checkoutMutation.isPending && selectedPlan === 'premium' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Premium'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-6">Secure payment powered by</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-800">Stripe</div>
            <div className="text-2xl font-bold text-gray-800">Razorpay</div>
            <div className="text-2xl font-bold text-gray-800">Cashfree</div>
          </div>
        </div>
      </div>
    </section>
  );
}
