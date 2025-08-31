import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, ArrowRight, Sparkles } from "lucide-react";
import { confetti } from "@/lib/confetti";

export default function SubscriptionSuccess() {
  const [location] = useLocation();
  const [planName, setPlanName] = useState("Premium Plan");
  const [isDemo, setIsDemo] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  
  useEffect(() => {
    // Trigger confetti animation
    confetti();
    
    // Extract parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const demo = urlParams.get('demo') === 'true';
    const amt = urlParams.get('amount') || '';
    const curr = urlParams.get('currency') || 'USD';
    
    setIsDemo(demo);
    setAmount(amt);
    setCurrency(curr);
    
    if (plan === 'pro') {
      setPlanName("Pro Plan");
    } else if (plan === 'premium') {
      setPlanName("Premium Plan");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Crown className="h-8 w-8 text-yellow-500 fill-current animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isDemo ? `Exploring ${planName}! 🌟` : `Welcome to ${planName}! 🎉`}
          </h1>
          <p className="text-lg text-gray-600">
            {isDemo 
              ? 'You\'re now exploring premium features in demo mode' 
              : 'Your subscription is now active and ready to use'
            }
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                {isDemo ? (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {planName} Demo Mode
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2">
                    <Crown className="h-4 w-4 mr-2" />
                    {planName} Active
                  </Badge>
                )}
                {amount && (
                  <Badge variant="outline" className="ml-2">
                    {currency === 'USD' ? '$' : ''}{amount}{currency !== 'USD' ? ` ${currency}` : ''}/month
                  </Badge>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🌱 Your Premium Garden Journey Begins Now
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Unlocked Features
                  </h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>✅ Unlimited plant identifications</li>
                    <li>✅ Advanced AI health diagnostics</li>
                    <li>✅ Weather integration & alerts</li>
                    <li>✅ Premium garden analytics</li>
                    <li>✅ Disease prediction tools</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Premium Benefits
                  </h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>🏆 Expert consultation priority</li>
                    <li>📊 Detailed PDF garden reports</li>
                    <li>🎯 Personalized care recommendations</li>
                    <li>🚫 Ad-free experience</li>
                    <li>💬 Priority customer support</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-green-600 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  🌿
                </div>
              </div>
              <h3 className="font-semibold mb-2">Premium Garden Dashboard</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access your new premium garden dashboard with advanced analytics and insights
              </p>
              <Link href="/my-garden">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View My Garden
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-blue-600 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  📸
                </div>
              </div>
              <h3 className="font-semibold mb-2">Start Identifying Plants</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use unlimited plant identifications with advanced AI diagnostics
              </p>
              <Link href="/identify">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Identify Plants
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {isDemo ? (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  🎯
                </div>
                <h3 className="font-semibold text-blue-800">Demo Mode</h3>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                You're exploring all premium features without any payment. All functionality is available for testing. 
                To activate real subscription billing and unlock full features, configure payment providers in admin settings.
              </p>
              <div className="text-xs text-blue-600">
                <strong>Note:</strong> This is a demonstration mode - no actual subscription has been created.
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  💡
                </div>
                <h3 className="font-semibold text-yellow-800">Quick Tip</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                For the best plant identification results, take photos in good lighting from multiple angles. 
                Your premium subscription includes unlimited attempts, so experiment freely!
              </p>
              <div className="text-xs text-yellow-600">
                <strong>Need help?</strong> Visit our FAQ or contact our premium support team anytime.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            Your subscription will renew automatically. You can manage or cancel anytime from your account settings.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="ghost">
                Back to Home
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}