import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Layout } from "@/components/Layout";
import MyGardenSection from "@/components/MyGardenSection";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Calendar, Clock, CheckCircle, DollarSign, User } from "lucide-react";
import { format } from "date-fns";

export default function Account() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Temporarily remove subscription query to prevent auth loops
  const subscription = { status: 'none', planName: 'Free Plan' };
  const subscriptionLoading = false;

  // Fetch user's consultation requests
  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ['/api/consultation-requests'],
    retry: false,
  });

  const getConsultationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'payment_pending': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'expert_assigned': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/auth');
      }, 500);
      return;
    }
  }, [user, isLoading, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your subscription and account preferences</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  {user?.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : subscription && (subscription as any)?.status !== 'none' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{(subscription as any)?.planName}</span>
                      <Badge className={getStatusColor((subscription as any)?.status)}>
                        {(subscription as any)?.status}
                      </Badge>
                    </div>
                    {(subscription as any)?.currentPeriodEnd && (
                      <p className="text-sm text-gray-600">
                        {(subscription as any)?.status === 'active' ? 'Renews' : 'Expires'} on{' '}
                        {new Date((subscription as any)?.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">Free Plan</p>
                    <p className="text-sm text-gray-500">5 identifications per month</p>
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      Upgrade to Pro
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Download Data
                </Button>
                <Button variant="outline" className="w-full">
                  Privacy Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      await fetch('/api/logout', { method: 'POST' });
                      // Clear cached user data
                      queryClient.setQueryData(["/api/auth/user"], null);
                      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                      // Force redirect to home page
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout failed:', error);
                      window.location.href = '/';
                    }
                  }}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Consultation History Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Consultation History
              </CardTitle>
              <CardDescription>
                View your expert consultation requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Loading consultations...</p>
                </div>
              ) : !consultations || (consultations as any[])?.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-2">No consultations yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Book your first expert consultation to get personalized plant care advice
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setLocation('/talk-to-expert')}
                    >
                      Book Expert Consultation
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(consultations as any[])?.map((consultation: any) => (
                    <Card key={consultation.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{consultation.name}</span>
                              <Badge className={getConsultationStatusColor(consultation.status)}>
                                {consultation.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(consultation.preferredDate), 'MMM d, yyyy')} at {consultation.preferredTimeSlot}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3" />
                                <span>${consultation.amount} {consultation.currency}</span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 leading-relaxed">
                              <span className="font-medium">Problem:</span> {consultation.problemDescription}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2 md:text-right">
                            <div className="text-xs text-gray-500">
                              Requested: {format(new Date(consultation.createdAt), 'MMM d, yyyy')}
                            </div>
                            
                            {consultation.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.location.href = `/payment/consultation/${consultation.id}`}
                              >
                                Complete Payment
                              </Button>
                            )}
                            
                            {consultation.status === 'expert_assigned' && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                <span>Expert Assigned</span>
                              </div>
                            )}
                            
                            {consultation.status === 'completed' && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <CheckCircle className="h-3 w-3" />
                                <span>Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/talk-to-expert'}
                    >
                      Book Another Consultation
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <MyGardenSection />
      <Footer />
    </Layout>
  );
}
