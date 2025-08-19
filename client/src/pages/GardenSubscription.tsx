import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Star, Zap, Target, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

interface SubscriptionStatus {
  isActive: boolean;
  expiresAt?: string;
  subscriptionId?: string;
  daysRemaining?: number;
}

interface Pricing {
  USD: string;
  INR: string;
  EUR: string;
  GBP: string;
}

interface SubscriptionData {
  subscription: SubscriptionStatus;
  pricing: Pricing;
  availableProviders: string[];
}

export default function GardenSubscription() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'INR' | 'EUR' | 'GBP'>('USD');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to view subscription options.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    if (isAuthenticated) {
      fetchSubscriptionStatus();
    }
  }, [isAuthenticated, isLoading, toast]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/garden/subscription/status');
      const data = await response.json();
      setSubscriptionData(data);
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      console.error('Failed to fetch subscription status:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase a subscription.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/garden/subscription/create', {
        currency: selectedCurrency,
        returnUrl: `${window.location.origin}/garden/subscription/success`,
        cancelUrl: `${window.location.origin}/garden/subscription`,
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to payment gateway
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      console.error('Subscription creation failed:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to access Garden Monitoring subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full"
              data-testid="login-button"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscription = subscriptionData?.subscription;
  const pricing = subscriptionData?.pricing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-200 mb-4">
            Garden Monitoring Premium
          </h1>
          <p className="text-xl text-green-600 dark:text-green-300 max-w-2xl mx-auto">
            Transform your gardening with AI-powered plant care, personalized recommendations, 
            and gamified achievement tracking.
          </p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <Card className="mb-8 border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {subscription.isActive ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Active Subscription
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-orange-500" />
                    No Active Subscription
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription.isActive ? (
                <div className="space-y-2">
                  <p className="text-green-600 dark:text-green-400">
                    Your Garden Monitoring subscription is active!
                  </p>
                  {subscription.expiresAt && (
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  {subscription.daysRemaining && (
                    <Badge variant="secondary">
                      {subscription.daysRemaining} days remaining
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Subscribe now to unlock advanced garden monitoring features.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing Card */}
        {!subscription?.isActive && (
          <Card className="mb-8 border-2 border-green-300 dark:border-green-600 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                  Annual Plan - Save 30%
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold">
                {pricing ? pricing[selectedCurrency] : '$95'}
                <span className="text-lg font-normal text-muted-foreground">/year</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Everything you need for professional garden management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency Selection */}
              <div className="flex justify-center gap-2">
                {pricing && Object.keys(pricing).map((currency) => (
                  <Button
                    key={currency}
                    variant={selectedCurrency === currency ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCurrency(currency as typeof selectedCurrency)}
                    data-testid={`currency-${currency}`}
                  >
                    {currency}
                  </Button>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">What's Included:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-green-500" />
                      <span>AI-powered plant health predictions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-green-500" />
                      <span>Personalized care dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-green-500" />
                      <span>Achievement & milestone tracking</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-green-500" />
                      <span>Weather integration & alerts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Unlimited plant monitoring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span>Smart watering reminders</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
                data-testid="subscribe-button"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </div>
                ) : (
                  'Start Your Garden Journey - Subscribe Now'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Secure payment • Cancel anytime • 365-day access
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-green-200 dark:border-green-700">
            <CardHeader className="text-center">
              <Zap className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">AI Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Advanced machine learning algorithms predict plant health issues before they become visible.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-700">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Gamification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Earn achievements, unlock badges, and track your gardening milestones with our reward system.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-700">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Smart Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Get personalized recommendations based on your location, climate, and plant preferences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}