import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, User, Calendar, MessageSquare, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface ConsultationPaymentPageProps {
  consultationId: string;
}

export default function ConsultationPayment({ consultationId }: ConsultationPaymentPageProps) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch consultation details
  const { data: consultation, isLoading: isLoadingConsultation } = useQuery({
    queryKey: ['/api/consultation-requests', consultationId],
    enabled: !!consultationId,
  });

  useEffect(() => {
    if (isLoading || isLoadingConsultation) return;

    if (!user) {
      setLocation("/auth");
      return;
    }
  }, [user, isLoading, isLoadingConsultation]);

  const handleContactSupport = () => {
    window.open("mailto:support@example.com?subject=Consultation Payment&body=I need help with setting up payment for consultation " + consultationId, "_blank");
  };

  if (isLoading || isLoadingConsultation) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!consultation) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Consultation Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The consultation request could not be found.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-home">
              Return Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consultation Payment</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Complete your payment to confirm your expert consultation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review your consultation details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Details */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{(consultation as any)?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{(consultation as any)?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(new Date((consultation as any)?.preferredDate), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(consultation as any)?.preferredTimeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Problem Description</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(consultation as any)?.problemDescription}
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
                    <span className="text-sm">Follow-up support</span>
                    <span className="text-sm">✓ Included</span>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">${(consultation as any)?.amount || 29.99} USD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Payment processing is currently being set up
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Payment Setup in Progress
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      We're currently setting up secure payment processing for consultations. 
                      Our team will contact you directly to arrange payment and confirm your consultation.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleContactSupport}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-contact-support"
                    >
                      Contact Support for Payment
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/talk-to-expert")}
                      className="w-full"
                      data-testid="button-back-expert"
                    >
                      Back to Expert Consultation
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>
                    Your consultation request has been received. We'll contact you within 24 hours to arrange payment and confirm your appointment.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}