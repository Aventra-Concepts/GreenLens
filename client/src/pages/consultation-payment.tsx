import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, User, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

// Load Stripe (with fallback when keys are not yet configured)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface ConsultationPaymentPageProps {
  consultationId: string;
}

const PaymentForm = ({ consultationId, consultation }: { consultationId: string; consultation: any }) => {
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

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/consultation-success?id=${consultationId}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
        <PaymentElement />
      </div>
      
      <Button
        type="submit"
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={!stripe || !elements || isProcessing}
        data-testid="button-pay-consultation"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Processing Payment...
          </div>
        ) : (
          `Pay $${consultation?.amount || 29.99} - Confirm Consultation`
        )}
      </Button>
    </form>
  );
};

export default function ConsultationPayment({ consultationId }: ConsultationPaymentPageProps) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  // Fetch consultation details
  const { data: consultation, isLoading: isLoadingConsultation } = useQuery({
    queryKey: ['/api/consultation-requests', consultationId],
    enabled: !!consultationId,
  });

  // Create payment intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-consultation-payment-intent", {
        consultationId,
        amount: consultation?.amount || 29.99,
        currency: consultation?.currency || 'USD',
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (consultation && !clientSecret) {
      createPaymentIntentMutation.mutate();
    }
  }, [consultation, clientSecret]);

  // Redirect if not logged in
  if (!isLoading && !user) {
    window.location.href = '/auth';
    return null;
  }

  if (isLoading || isLoadingConsultation) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!consultation) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Consultation Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The consultation request you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Payment
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Secure your expert consultation session
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Consultation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Consultation Summary
              </CardTitle>
              <CardDescription>
                Review your consultation details before payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{consultation.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{consultation.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(consultation.preferredDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {consultation.preferredTimeSlot}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Problem Description</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {consultation.problemDescription}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Service Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Service Details</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">30-minute consultation</span>
                  </div>
                  <Badge variant="secondary">Premium</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expert phone consultation</span>
                  <span className="text-sm">✓ Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Personalized care plan</span>
                  <span className="text-sm">✓ Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Follow-up email report</span>
                  <span className="text-sm">✓ Included</span>
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Consultation fee</span>
                  <span className="text-sm">${consultation.amount}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">${consultation.amount} {consultation.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Enter your payment details to confirm the consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!import.meta.env.VITE_STRIPE_PUBLIC_KEY ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-gray-600 dark:text-gray-300">
                    Payment system is being configured. Please contact support to complete your consultation booking.
                  </div>
                  <Button
                    onClick={() => window.location.href = `/consultation-success?id=${consultationId}`}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-skip-payment"
                  >
                    Continue (Demo Mode)
                  </Button>
                </div>
              ) : clientSecret && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                      },
                    },
                  }}
                >
                  <PaymentForm consultationId={consultationId} consultation={consultation} />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Setting up payment...
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>
                Your payment is secure and encrypted. We use Stripe for payment processing and never store your card details.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}