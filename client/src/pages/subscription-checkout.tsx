import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, ArrowLeft, CreditCard, Mail } from "lucide-react";
import { Link } from "wouter";

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

const ContactSupportForm = ({ selectedPlan }: { selectedPlan: SubscriptionPlan }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContactSupport = async () => {
    setIsProcessing(true);
    
    const emailBody = encodeURIComponent(`Hi,

I'm interested in subscribing to the ${selectedPlan.name} at ${selectedPlan.formattedPrice}/month.

Please help me set up payment for this subscription.

Thank you!`);

    window.open(`mailto:support@example.com?subject=Subscription Request - ${selectedPlan.name}&body=${emailBody}`, "_blank");
    
    toast({
      title: "Support Contacted",
      description: "We'll contact you within 24 hours to set up your subscription.",
    });
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-center">
        <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Payment Setup in Progress
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          We're currently setting up secure payment processing. Our team will contact you directly to arrange payment.
        </p>
      </div>
      <Button 
        onClick={handleContactSupport}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700"
        data-testid="button-contact-support"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Contacting Support...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact Support - {selectedPlan.formattedPrice}/month
          </div>
        )}
      </Button>
    </div>
  );
};

export default function SubscriptionCheckout() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('premium');
  const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.planId === selectedPlanId) || SUBSCRIPTION_PLANS[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/pricing">
            <Button variant="outline" size="sm" className="mb-4 flex items-center gap-2" data-testid="button-back-pricing">
              <ArrowLeft className="h-4 w-4" />
              Back to Pricing
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete Your Subscription</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Choose your plan and we'll help you get set up
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Your Plan</h2>
            
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.planId} 
                className={`cursor-pointer transition-all ${
                  selectedPlanId === plan.planId 
                    ? 'ring-2 ring-blue-500 border-blue-500' 
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedPlanId(plan.planId)}
                data-testid={`card-plan-${plan.planId}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {plan.popular && <Crown className="h-5 w-5 text-yellow-500" />}
                      {plan.name}
                      {plan.popular && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Popular</Badge>}
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.formattedPrice}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Information</h2>
            
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedPlan.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Monthly subscription</p>
                  </div>
                  <p className="text-lg font-semibold">{selectedPlan.formattedPrice}</p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">{selectedPlan.formattedPrice}/month</span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  • Cancel anytime
                  • 30-day money-back guarantee
                  • Secure payment processing
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactSupportForm selectedPlan={selectedPlan} />
                
                <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>
                    Your subscription request has been received. We'll contact you within 24 hours to set up secure payment processing.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}