import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Crown, Check, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface SubscriptionPlan {
  planId: string;
  name: string;
  price: number;
  formattedPrice: string;
  features: string[];
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    planId: 'premium',
    name: 'Premium Plan',
    price: 19,
    formattedPrice: '$19.00',
    popular: true,
    features: [
      'Unlimited plant identifications',
      'Advanced AI health diagnostics',
      'Weather integration & alerts',
      'Personalized care recommendations',
      'Premium garden analytics',
      'Disease prediction & prevention',
      'Expert consultation priority',
      'PDF garden reports',
      'Ad-free experience'
    ]
  },
  {
    planId: 'pro',
    name: 'Pro Plan',
    price: 9,
    formattedPrice: '$9.00',
    features: [
      '50 plant identifications/month',
      'Basic health assessments',
      'Care plan recommendations',
      'Garden level tracking',
      'Community access',
      'Email support'
    ]
  }
];

const CheckoutForm = ({ selectedPlan }: { selectedPlan: SubscriptionPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success?plan=${selectedPlan.planId}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: `Welcome to ${selectedPlan.name}!`,
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 py-3"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Crown className="h-4 w-4 mr-2" />
            Subscribe to {selectedPlan.name} - {selectedPlan.formattedPrice}/month
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Your subscription will automatically renew monthly. Cancel anytime from your account settings.
      </p>
    </form>
  );
};

export default function SubscriptionCheckout() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const { toast } = useToast();

  const createSubscription = async (planId: string) => {
    setIsLoadingPayment(true);
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { planId });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Unable to setup payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  useEffect(() => {
    createSubscription(selectedPlan.planId);
  }, [selectedPlan.planId]);

  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-yellow-600 mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Payment Setup Required</h3>
              <p className="text-gray-600">
                Stripe payment integration is not configured. Please contact support to enable subscriptions.
              </p>
              <Link href="/">
                <Button className="mt-4" variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="text-gray-600 mt-2">Unlock the full potential of your garden with GreenLens Premium</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Select Plan</h2>
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.planId} 
                className={`cursor-pointer transition-all ${
                  selectedPlan.planId === plan.planId 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : 'hover:shadow-md'
                } ${plan.popular ? 'border-yellow-400' : ''}`}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {plan.name}
                        {plan.popular && (
                          <Badge className="bg-yellow-400 text-yellow-900">Most Popular</Badge>
                        )}
                      </CardTitle>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        {plan.formattedPrice}<span className="text-sm font-normal text-gray-500">/month</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPlan.planId === plan.planId 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan.planId === plan.planId && (
                        <Check className="w-3 h-3 text-white ml-0.5 mt-0.5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Complete Your Subscription</h2>
              
              {/* Order Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span>{selectedPlan.name}</span>
                    <span className="font-semibold">{selectedPlan.formattedPrice}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total per month</span>
                    <span className="text-green-600">{selectedPlan.formattedPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Billed monthly. Cancel anytime from your account settings.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stripe Payment Form */}
            {isLoadingPayment ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Setting up payment...</p>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm selectedPlan={selectedPlan} />
              </Elements>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-red-600 mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold mb-2">Payment Setup Failed</h3>
                  <p className="text-gray-600 mb-4">
                    Unable to initialize payment. Please try refreshing the page or contact support.
                  </p>
                  <Button 
                    onClick={() => createSubscription(selectedPlan.planId)}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}