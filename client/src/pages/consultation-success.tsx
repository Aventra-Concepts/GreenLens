import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface ConsultationSuccessProps {
  consultationId: string;
}

export default function ConsultationSuccess({ consultationId }: ConsultationSuccessProps) {
  const { user, isLoading } = useAuth();

  // Fetch consultation details
  const { data: consultation, isLoading: isLoadingConsultation } = useQuery({
    queryKey: ['/api/consultation-requests', consultationId],
    enabled: !!consultationId,
  });

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
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your expert consultation has been confirmed and booked successfully.
          </p>
        </div>

        {/* Consultation Details */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="text-green-800 dark:text-green-200">
              Consultation Confirmed
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              Consultation ID: {consultation.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Date</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {format(new Date(consultation.preferredDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {consultation.preferredTimeSlot}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {consultation.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Contact</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {consultation.phoneNumber || 'Will be contacted via email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
            <CardDescription>
              Here's what you can expect after your payment confirmation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Confirmation Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    You'll receive a confirmation email with all consultation details within the next few minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Expert Assignment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    A certified plant expert will be assigned to your case within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Expert Contact</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The expert will contact you at your scheduled date and time for the consultation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Follow-up Report</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    After the consultation, you'll receive a detailed care plan and recommendations via email.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => window.location.href = '/account'}
            className="flex items-center gap-2"
            data-testid="button-view-account"
          >
            View My Account
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            data-testid="button-back-home"
          >
            Back to Home
          </Button>
        </div>

        {/* Support Information */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              If you have any questions about your consultation or need to make changes, please contact our support team at{' '}
              <a href="mailto:support@greenlens.app" className="text-blue-600 hover:underline">
                support@greenlens.app
              </a>
              {' '}or include your consultation ID: <strong>{consultation.id}</strong> in your message.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}