import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  userLocation?: string;
}

interface PricingResponse {
  currency: string;
  plans: Record<string, any>;
  supportedCurrencies: string[];
}

export function CurrencySelector({ value, onChange, userLocation }: CurrencySelectorProps) {
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'INR']);

  const { data: pricingData } = useQuery<PricingResponse>({
    queryKey: ['/api/pricing', userLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('currency', value || 'USD');
      if (userLocation) params.append('location', userLocation);
      const response = await fetch(`/api/pricing?${params}`);
      return response.json();
    },
  });

  useEffect(() => {
    if (pricingData?.supportedCurrencies) {
      setAvailableCurrencies(pricingData.supportedCurrencies);
      // Auto-detect currency if available
      if (pricingData.currency && pricingData.currency !== value) {
        onChange(pricingData.currency);
      }
    }
  }, [pricingData, value, onChange]);

  const currencyNames = {
    USD: '$ USD - US Dollar',
    EUR: '€ EUR - Euro',
    GBP: '£ GBP - British Pound',
    INR: '₹ INR - Indian Rupee',
    CAD: '$ CAD - Canadian Dollar',
    AUD: '$ AUD - Australian Dollar',
    JPY: '¥ JPY - Japanese Yen',
    SGD: '$ SGD - Singapore Dollar',
    BRL: 'R$ BRL - Brazilian Real',
    MXN: '$ MXN - Mexican Peso',
    NZD: '$ NZD - New Zealand Dollar',
    ZAR: 'R ZAR - South African Rand',
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Currency
      </label>
      <Select value={value} onValueChange={onChange} data-testid="select-currency">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {availableCurrencies.filter(currency => typeof currency === 'string' && currency).map((currency) => (
            <SelectItem key={currency} value={currency} data-testid={`option-currency-${currency.toLowerCase()}`}>
              {currencyNames[currency as keyof typeof currencyNames] || currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}