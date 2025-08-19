import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, Star, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionSuccess() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your subscription status.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 py-12">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-green-300 dark:border-green-600 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800 dark:text-green-200">
              Welcome to Garden Monitoring Premium!
            </CardTitle>
            <CardDescription className="text-lg text-green-600 dark:text-green-300">
              Your subscription is now active. Let's start your premium gardening journey!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* What's Next */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">What's Available Now:</h3>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Star className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-medium">AI Plant Health Predictions</h4>
                    <p className="text-sm text-muted-foreground">
                      Advanced algorithms monitor your plants and predict health issues
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-medium">Achievement System</h4>
                    <p className="text-sm text-muted-foreground">
                      Earn badges and track milestones as you grow your garden
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-medium">Personalized Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      Custom care plans and weather-integrated recommendations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/garden">
                <Button 
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
                  data-testid="go-to-dashboard"
                >
                  <span className="flex items-center gap-2">
                    Go to Your Garden Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </Link>

              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300"
                  data-testid="go-to-home"
                >
                  Return to Home
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-2 pt-4 border-t border-green-200 dark:border-green-700">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Your subscription is valid for 365 days
              </p>
              <p className="text-xs text-muted-foreground">
                You'll receive email notifications about your subscription status and renewals
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}