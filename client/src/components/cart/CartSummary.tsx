import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CreditCard, Percent, Truck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: string;
  quantity: number;
  productType: 'ebook' | 'physical';
}

interface CartSummaryProps {
  cartItems: CartItem[];
  onCheckout: (totals: any) => void;
}

export function CartSummary({ cartItems, onCheckout }: CartSummaryProps) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate cart totals with discounts
  const { data: cartTotals, isLoading: isLoadingTotals } = useQuery({
    queryKey: ['/api/cart/calculate', cartItems],
    queryFn: async () => {
      if (cartItems.length === 0) return null;
      
      const response = await apiRequest('POST', '/api/cart/calculate', {
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
      return response.json();
    },
    enabled: cartItems.length > 0,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData: any) => {
      const response = await apiRequest('POST', '/api/ecommerce/checkout', checkoutData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to payment provider
        window.location.href = data.checkoutUrl;
      } else {
        onCheckout(data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (!cartItems.length) return;

    const checkoutData = {
      cartItems: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      shippingAddress: {
        // You would collect this from a form
        country: 'US',
        state: 'CA',
        city: 'San Francisco',
        postalCode: '94102',
        address: '123 Main St'
      },
      billingAddress: {
        // Same as shipping or separate
        country: 'US',
        state: 'CA', 
        city: 'San Francisco',
        postalCode: '94102',
        address: '123 Main St'
      },
      currency: 'USD'
    };

    checkoutMutation.mutate(checkoutData);
  };

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">Add some items to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.productName}</h4>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × ${item.price}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        {cartTotals && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotals.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            
            {cartTotals.studentDiscountApplied && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  Student Discount (10%)
                </span>
                <span>-${cartTotals.discountAmount?.toFixed(2) || '0.00'}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                Shipping
              </span>
              <span>
                {cartTotals.shippingAmount > 0 
                  ? `$${cartTotals.shippingAmount.toFixed(2)}`
                  : 'Free'
                }
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${cartTotals.taxAmount?.toFixed(2) || '0.00'}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${cartTotals.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        )}

        {/* Student Discount Badge */}
        {cartTotals?.studentDiscountApplied && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Percent className="h-3 w-3 mr-1" />
                Student Discount
              </Badge>
              <span className="text-sm text-green-700 dark:text-green-300">
                10% discount applied!
              </span>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <Button 
          onClick={handleCheckout}
          disabled={checkoutMutation.isPending || isLoadingTotals}
          className="w-full"
          data-testid="button-checkout"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {checkoutMutation.isPending ? 'Processing...' : 'Proceed to Checkout'}
        </Button>

        {/* Free Shipping Notice */}
        {cartTotals && cartTotals.subtotal < 50 && (
          <div className="text-sm text-muted-foreground text-center p-2 bg-muted rounded">
            Add ${(50 - cartTotals.subtotal).toFixed(2)} more for free shipping!
          </div>
        )}
      </CardContent>
    </Card>
  );
}