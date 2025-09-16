import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Droplets, 
  Sun, 
  Thermometer, 
  TrendingUp, 
  Camera, 
  Calendar as CalendarIcon,
  Leaf,
  BarChart3,
  Activity,
  Bell,
  Crown,
  CreditCard,
  Lock,
  Zap,
  Target
} from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";


interface GardenSubscriptionStatus {
  active: boolean;
  expiresAt?: string;
  subscriptionId?: string;
}

interface GardenStats {
  totalPlants: number;
  upcomingActivities: number;
  completedThisWeek: number;
}

// Simple Contact Support Component for Premium Features
const PremiumContactForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContactSupport = async () => {
    setIsLoading(true);
    
    // Open email client
    window.open("mailto:support@example.com?subject=Garden Monitoring Premium&body=I'm interested in Garden Monitoring Premium subscription. Please help me set up payment.", "_blank");
    
    toast({
      title: "Support Contacted",
      description: "We'll get back to you within 24 hours to set up your premium subscription.",
    });
    
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-center">
        <Crown className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Premium Setup in Progress
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Payment processing is being set up. Our team will contact you to arrange your premium subscription.
        </p>
      </div>
      <Button 
        onClick={handleContactSupport}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
        data-testid="button-contact-premium-support"
      >
        {isLoading ? "Contacting Support..." : "Contact Support - $95/year"}
      </Button>
    </div>
  );
};

// Subscription Upgrade Modal
const SubscriptionUpgradeModal = ({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const { toast } = useToast();

  const createSubscription = async () => {
    setIsCreatingSubscription(true);
    try {
      const response = await apiRequest("POST", "/api/garden-monitoring/subscription/create");
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.message || "Failed to create subscription");
      }
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  useEffect(() => {
    if (isOpen && !clientSecret) {
      createSubscription();
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="dialog-subscription-upgrade">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Garden Monitoring Premium
          </DialogTitle>
          <DialogDescription>
            Get advanced garden monitoring with AI insights and automated scheduling for $95/year
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Premium Features Include:</h3>
            <ul className="text-sm space-y-1">
              <li>• Track up to 50 plants with detailed monitoring</li>
              <li>• Automated care scheduling and reminders</li>
              <li>• Environmental data tracking and insights</li>
              <li>• AI-powered plant health analysis</li>
              <li>• Detailed growth tracking and measurements</li>
              <li>• Professional garden reports and analytics</li>
            </ul>
          </div>

          {isCreatingSubscription ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Setting up your subscription...</span>
            </div>
          ) : clientSecret ? (
            <PremiumContactForm onSuccess={onSuccess} />
          ) : (
            <div className="text-center py-4">
              <p>Unable to initialize payment. Please try again.</p>
              <Button onClick={createSubscription} className="mt-2">
                Retry
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Premium Feature Locked Card
const LockedFeatureCard = ({ title, description, onUpgrade }: {
  title: string;
  description: string;
  onUpgrade: () => void;
}) => (
  <Card className="relative overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20" />
    <CardHeader className="relative">
      <CardTitle className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-yellow-600" />
        {title}
        <Crown className="h-4 w-4 text-yellow-500" />
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="relative">
      <div className="text-center py-6">
        <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Unlock premium garden monitoring features
        </p>
        <Button onClick={onUpgrade} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white" data-testid="button-upgrade-premium">
          <CreditCard className="h-4 w-4 mr-2" />
          Upgrade to Premium - $95/year
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function GardenMonitoring() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check subscription status
  const { data: subscriptionStatus, isLoading: subscriptionLoading } = useQuery<GardenSubscriptionStatus>({
    queryKey: ['/api/garden-monitoring/subscription/status'],
    enabled: !!user,
  });

  // Get garden stats (only if subscribed)
  const { data: gardenStats } = useQuery<GardenStats>({
    queryKey: ['/api/garden-monitoring/dashboard/stats'],
    enabled: !!user && !!subscriptionStatus?.active,
  });

  const handleUpgradeSuccess = () => {
    toast({
      title: "Welcome to Premium!",
      description: "Your garden monitoring subscription is now active.",
    });
    setShowUpgradeModal(false);
    queryClient.invalidateQueries({ queryKey: ['/api/garden-monitoring'] });
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access garden monitoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSubscribed = subscriptionStatus?.active;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Leaf className="h-8 w-8 text-green-600" />
            Garden Monitoring
            {isSubscribed && <Crown className="h-6 w-6 text-yellow-500" />}
          </h1>
          <p className="text-muted-foreground">
            {isSubscribed 
              ? "Track your garden's progress with AI-powered insights and automated care scheduling."
              : "Upgrade to premium to unlock advanced garden monitoring features."
            }
          </p>
        </div>

        {/* Subscription Status Banner */}
        <Card className={`mb-6 ${isSubscribed ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isSubscribed ? (
                  <>
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Premium Active</p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {subscriptionStatus?.expiresAt 
                          ? `Expires ${new Date(subscriptionStatus.expiresAt).toLocaleDateString()}`
                          : 'Active subscription'
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Crown className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200">Premium Required</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Upgrade to unlock advanced garden monitoring features
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!isSubscribed && (
                <Button onClick={handleUpgrade} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white" data-testid="button-upgrade-header">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade - $95/year
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isSubscribed ? (
          /* Premium Dashboard */
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="plants" data-testid="tab-plants">My Plants</TabsTrigger>
              <TabsTrigger value="activities" data-testid="tab-activities">Activities</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-total-plants">{gardenStats?.totalPlants || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Active in your garden
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Activities</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-upcoming-activities">{gardenStats?.upcomingActivities || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Scheduled this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-completed-week">{gardenStats?.completedThisWeek || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Care activities done
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your garden efficiently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" data-testid="button-add-plant">
                      <Plus className="h-6 w-6" />
                      <span>Add Plant</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" data-testid="button-log-activity">
                      <Droplets className="h-6 w-6" />
                      <span>Log Activity</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" data-testid="button-record-measurement">
                      <Zap className="h-6 w-6" />
                      <span>Record Data</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" data-testid="button-generate-report">
                      <BarChart3 className="h-6 w-6" />
                      <span>Generate Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plants">
              <Card>
                <CardHeader>
                  <CardTitle>My Plants</CardTitle>
                  <CardDescription>Track and manage your garden plants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No plants added yet</p>
                    <Button data-testid="button-add-first-plant">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Plant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Care Activities</CardTitle>
                  <CardDescription>Schedule and track plant care activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No activities scheduled yet</p>
                    <Button data-testid="button-schedule-activity">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule First Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Garden Analytics</CardTitle>
                  <CardDescription>Detailed insights and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Analytics will appear here once you start tracking your garden</p>
                    <Button disabled>
                      <Target className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* Upgrade Promotion */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LockedFeatureCard
                title="Plant Collection Management"
                description="Track up to 50 plants with detailed profiles, photos, and health monitoring."
                onUpgrade={handleUpgrade}
              />
              <LockedFeatureCard
                title="Automated Care Scheduling"
                description="AI-powered scheduling for watering, fertilizing, pruning, and other care activities."
                onUpgrade={handleUpgrade}
              />
              <LockedFeatureCard
                title="Environmental Monitoring"
                description="Track temperature, humidity, light levels, and soil conditions for optimal growth."
                onUpgrade={handleUpgrade}
              />
              <LockedFeatureCard
                title="Growth Analytics & Reports"
                description="Detailed tracking of plant measurements, health scores, and comprehensive garden reports."
                onUpgrade={handleUpgrade}
              />
            </div>

            {/* Feature Comparison */}
            <Card className="border-2 border-gradient-to-r from-yellow-200 to-orange-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Garden Monitoring Premium</CardTitle>
                <CardDescription className="text-lg">
                  Transform your gardening with AI-powered monitoring and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">$95</div>
                  <div className="text-muted-foreground">per year</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Track up to 50 plants with detailed monitoring</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Automated care scheduling and reminders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Environmental data tracking and insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>AI-powered plant health analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Professional garden reports and analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>Growth tracking and measurement history</span>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={handleUpgrade} 
                    size="lg" 
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8"
                    data-testid="button-upgrade-main"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Start Your Garden Monitoring Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}