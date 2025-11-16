import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  ArrowLeft,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { Layout } from "@/components/Layout";

export default function DemoPayment() {
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [planId, setPlanId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "failed" | null>(null);

  useEffect(() => {
    // Extract parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const amtParam = urlParams.get("amount");
    const currParam = urlParams.get("currency");
    const planParam = urlParams.get("plan");
    
    if (amtParam) setAmount(amtParam);
    if (currParam) setCurrency(currParam);
    if (planParam) setPlanId(planParam);
  }, []);

  const handlePaymentSuccess = async () => {
    setProcessing(true);
    
    try {
      // Call backend to complete payment and update subscription
      const response = await fetch('/api/demo-payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId, amount, currency })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPaymentResult("success");
        setProcessing(false);
        
        // Redirect to My Garden after 2 seconds
        setTimeout(() => {
          setLocation(data.redirectUrl || "/my-garden?subscribed=true");
        }, 2000);
      } else {
        throw new Error(data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentResult("failed");
      setProcessing(false);
    }
  };

  const handlePaymentFailed = () => {
    setProcessing(true);
    
    setTimeout(() => {
      setPaymentResult("failed");
      setProcessing(false);
    }, 1500);
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    };
    return symbols[curr] || curr;
  };

  if (paymentResult === "success") {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-4">Redirecting to confirmation page...</p>
                <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (paymentResult === "failed") {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">Something went wrong with your payment.</p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setPaymentResult(null)} 
                    className="w-full"
                    data-testid="button-retry"
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/")}
                    className="w-full"
                    data-testid="button-home"
                  >
                    Return Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Demo Mode Alert */}
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800 ml-2">
              <strong>Demo Mode:</strong> This is a simulated payment page for testing purposes. 
              No real transactions will be processed. Payment gateway API keys need to be configured for live payments.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {getCurrencySymbol(currency)}{amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency</span>
                  <Badge variant="outline">{currency}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {planId ? `${planId} Plan` : 'Premium Plan'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Demo Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Demo Payment Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Simulate different payment outcomes for testing:
                </p>
                
                <Button
                  onClick={handlePaymentSuccess}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="button-success"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Simulate Successful Payment
                    </>
                  )}
                </Button>

                <Button
                  onClick={handlePaymentFailed}
                  disabled={processing}
                  variant="destructive"
                  className="w-full"
                  data-testid="button-fail"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Simulate Failed Payment
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    In production, this page will redirect to actual payment gateways (Cashfree, PayPal, or Razorpay) 
                    based on your currency and region.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How to Enable Real Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                To process real payments, add your payment gateway credentials to Replit Secrets:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Cashfree:</span>
                  <span>CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">PayPal:</span>
                  <span>PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Razorpay:</span>
                  <span>RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
