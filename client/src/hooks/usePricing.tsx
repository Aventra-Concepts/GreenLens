import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface PlanPricing {
  planId: string;
  amount: number;
  formattedPrice: string;
  supportedProviders: string[];
}

interface PricingData {
  currency: string;
  plans: Record<string, PlanPricing>;
  supportedCurrencies: string[];
}

export function usePricing(initialCurrency = 'USD', userLocation?: string) {
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);

  const { data, isLoading, error } = useQuery<PricingData>({
    queryKey: ['/api/pricing', selectedCurrency, userLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('currency', selectedCurrency);
      if (userLocation) params.append('location', userLocation);
      
      const response = await fetch(`/api/pricing?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pricing');
      }
      return response.json();
    },
  });

  // Auto-update selected currency if location-based detection differs
  useEffect(() => {
    if (data?.currency && data.currency !== selectedCurrency && userLocation) {
      setSelectedCurrency(data.currency);
    }
  }, [data?.currency, selectedCurrency, userLocation]);

  const getPlanPrice = (planId: string) => {
    const result = data?.plans[planId];
    console.log(`🔍 getPlanPrice(${planId}) for currency ${selectedCurrency}:`, {
      hasData: !!data,
      plansAvailable: data?.plans ? Object.keys(data.plans) : [],
      result,
      fullPricingData: data
    });
    return result;
  };

  const getOptimalProvider = (planId: string) => {
    const plan = getPlanPrice(planId);
    return plan?.supportedProviders[0]; // Return first available provider
  };

  const formatPrice = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  return {
    pricing: data,
    selectedCurrency,
    setSelectedCurrency,
    isLoading,
    error,
    getPlanPrice,
    getOptimalProvider,
    formatPrice,
    supportedCurrencies: data?.supportedCurrencies || [],
  };
}