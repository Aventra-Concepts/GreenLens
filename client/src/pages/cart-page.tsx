import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CartSummary } from "@/components/cart/CartSummary";
import { ShoppingCart, Trash2, Plus, Minus, BookOpen, Package } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: string;
  quantity: number;
  productType: 'ebook' | 'physical';
  authorName?: string;
  category?: string;
}

export default function CartPage() {
  const { toast } = useToast();
  const [sessionId] = useState(() => 
    sessionStorage.getItem('cart_session_id') || 
    (() => {
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('cart_session_id', newId);
      return newId;
    })()
  );

  // Fetch cart items
  const { data: cartItems = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/cart', sessionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/cart?sessionId=${sessionId}`);
      return response.json();
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest('PATCH', `/api/cart/${itemId}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart Updated",
        description: "Item quantity updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update item quantity",
        variant: "destructive",
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest('DELETE', `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item Removed",
        description: "Item removed from cart successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/cart?sessionId=${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clear Failed",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItemMutation.mutate(itemId);
    } else {
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      clearCartMutation.mutate();
    }
  };

  const handleCheckout = (totals: any) => {
    // This will be called if checkout doesn't redirect to payment provider
    console.log('Checkout totals:', totals);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartItems.length === 0 
              ? "Your cart is empty" 
              : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Discover amazing e-books and gardening tools in our shop
              </p>
              <Link href="/shop">
                <Button data-testid="button-browse-shop">
                  Browse Shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Cart with Items */
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Items</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={clearCartMutation.isPending}
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              {cartItems.map((item: CartItem) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-muted-foreground">
                            {item.productType === 'ebook' ? (
                              <BookOpen className="h-6 w-6" />
                            ) : (
                              <Package className="h-6 w-6" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">
                              {item.productName}
                            </h3>
                            {item.authorName && (
                              <p className="text-sm text-muted-foreground">
                                by {item.authorName}
                              </p>
                            )}
                            {item.category && (
                              <Badge variant="secondary" className="mt-1">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${item.price}</p>
                            <Badge variant={item.productType === 'ebook' ? 'default' : 'outline'}>
                              {item.productType === 'ebook' ? 'Digital' : 'Physical'}
                            </Badge>
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={updateQuantityMutation.isPending}
                                data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 1;
                                  handleUpdateQuantity(item.id, newQuantity);
                                }}
                                className="w-16 text-center border-0"
                                min="1"
                                data-testid={`input-quantity-${item.id}`}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={updateQuantityMutation.isPending}
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            <div>
              <CartSummary cartItems={cartItems} onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}