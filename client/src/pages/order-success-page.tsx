import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Package, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrderSuccessPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Extract session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  const completeOrderMutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const response = await apiRequest('POST', '/api/ecommerce/complete-order', {
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setOrder(data.order);
        toast({
          title: "Order Completed",
          description: "Your order has been successfully processed!",
        });
      }
      setIsProcessing(false);
    },
    onError: (error: any) => {
      console.error('Error completing order:', error);
      toast({
        title: "Processing Error",
        description: "There was an issue processing your order. Please contact support.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  useEffect(() => {
    if (sessionId) {
      completeOrderMutation.mutate({ sessionId });
    } else {
      setIsProcessing(false);
      toast({
        title: "Invalid Order",
        description: "No session ID found. Please try again.",
        variant: "destructive",
      });
    }
  }, [sessionId]);

  const handleDownloadEbook = async (productId: string, productName: string) => {
    try {
      const response = await apiRequest('GET', `/api/ebooks/${productId}/download`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `${productName} is downloading...`,
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download the ebook. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
            <p className="text-lg font-medium">Processing your order...</p>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-lg font-medium">Order Not Found</p>
            <p className="text-sm text-muted-foreground mb-4">We couldn't process your order. Please try again.</p>
            <Button onClick={() => navigate('/shop')} variant="outline">
              Return to Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
            <p className="text-lg text-muted-foreground">Thank you for your purchase</p>
            <p className="text-sm text-muted-foreground mt-2">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Order Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ${item.price}
                      </p>
                      {item.productType === 'ebook' && (
                        <Badge variant="secondary" className="mt-2">
                          <Download className="h-3 w-3 mr-1" />
                          Digital Download
                        </Badge>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                      {item.productType === 'ebook' && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadEbook(item.productId, item.productName)}
                          data-testid={`button-download-${item.productId}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Student Discount</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${order.shippingAmount?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.taxAmount?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    Payment Status: {order.paymentStatus}
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center">
                    Order Status: {order.status || 'Processing'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <Button 
                onClick={() => navigate('/orders')} 
                variant="outline" 
                className="w-full"
                data-testid="button-view-orders"
              >
                View All Orders
              </Button>
              <Button 
                onClick={() => navigate('/shop')} 
                className="w-full"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}