import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CartItem, Product } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export function useCart() {
  const queryClient = useQueryClient();
  const [sessionId] = useState(() => {
    // Get or create session ID for guest users
    let id = localStorage.getItem('cart-session-id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cart-session-id', id);
    }
    return id;
  });

  // Fetch cart items
  const { data: items = [], isLoading, error } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart', sessionId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
          credentials: 'include',
        });
        
        // Handle 401 errors gracefully - return empty cart instead of throwing
        if (response.status === 401) {
          return [];
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch cart: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.warn('Cart fetch error:', error);
        return []; // Return empty cart on error
      }
    },
    retry: 1,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await apiRequest('POST', '/api/cart', {
        sessionId,
        productId,
        quantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/${itemId}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/cart/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/cart?sessionId=${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  // Helper functions
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
  };

  const getItemCount = (productId: string) => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  return {
    items,
    isLoading: isLoading || addToCartMutation.isPending || updateQuantityMutation.isPending || removeFromCartMutation.isPending,
    error,
    sessionId,
    addToCart: (productId: string, quantity: number = 1) => 
      addToCartMutation.mutateAsync({ productId, quantity }),
    updateQuantity: (itemId: string, quantity: number) => 
      updateQuantityMutation.mutateAsync({ itemId, quantity }),
    removeFromCart: (itemId: string) => 
      removeFromCartMutation.mutateAsync(itemId),
    clearCart: () => 
      clearCartMutation.mutateAsync(),
    getTotalItems,
    getTotalPrice,
    getItemCount,
    isInCart,
  };
}