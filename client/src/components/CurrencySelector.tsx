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
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

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

  // Priority currencies (top section) - as requested by user
  const priorityCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'SGD', 'AED', 'CAD', 'INR'];

  // Comprehensive currency names mapping
  const currencyNames: Record<string, string> = {
    // Priority currencies
    USD: '$ USD - US Dollar',
    EUR: '€ EUR - Euro', 
    GBP: '£ GBP - British Pound',
    AUD: 'A$ AUD - Australian Dollar',
    SGD: 'S$ SGD - Singapore Dollar',
    AED: 'د.إ AED - UAE Dirham',
    CAD: 'C$ CAD - Canadian Dollar',
    INR: '₹ INR - Indian Rupee',
    
    // Other major currencies
    JPY: '¥ JPY - Japanese Yen',
    CNY: '¥ CNY - Chinese Yuan',
    CHF: 'CHF CHF - Swiss Franc',
    SEK: 'kr SEK - Swedish Krona',
    NOK: 'kr NOK - Norwegian Krone',
    DKK: 'kr DKK - Danish Krone',
    PLN: 'zł PLN - Polish Zloty',
    CZK: 'Kč CZK - Czech Koruna',
    HUF: 'Ft HUF - Hungarian Forint',
    RON: 'lei RON - Romanian Leu',
    BGN: 'лв BGN - Bulgarian Lev',
    HRK: 'kn HRK - Croatian Kuna',
    RUB: '₽ RUB - Russian Ruble',
    BRL: 'R$ BRL - Brazilian Real',
    MXN: 'MX$ MXN - Mexican Peso',
    ARS: '$ ARS - Argentine Peso',
    CLP: '$ CLP - Chilean Peso',
    COP: '$ COP - Colombian Peso',
    PEN: 'S/ PEN - Peruvian Sol',
    UYU: '$U UYU - Uruguayan Peso',
    NZD: 'NZ$ NZD - New Zealand Dollar',
    ZAR: 'R ZAR - South African Rand',
    KRW: '₩ KRW - South Korean Won',
    THB: '฿ THB - Thai Baht',
    MYR: 'RM MYR - Malaysian Ringgit',
    PHP: '₱ PHP - Philippine Peso',
    IDR: 'Rp IDR - Indonesian Rupiah',
    VND: '₫ VND - Vietnamese Dong',
    HKD: 'HK$ HKD - Hong Kong Dollar',
    TWD: 'NT$ TWD - Taiwan Dollar',
    SAR: '﷼ SAR - Saudi Riyal',
    QAR: '﷼ QAR - Qatari Riyal',
    KWD: 'د.ك KWD - Kuwaiti Dinar',
    BHD: '.د.ب BHD - Bahraini Dinar',
    OMR: '﷼ OMR - Omani Rial',
    JOD: 'د.ا JOD - Jordanian Dinar',
    LBP: '£ LBP - Lebanese Pound',
    EGP: '£ EGP - Egyptian Pound',
    TRY: '₺ TRY - Turkish Lira',
    ILS: '₪ ILS - Israeli Shekel',
    PKR: '₨ PKR - Pakistani Rupee',
    BDT: '৳ BDT - Bangladeshi Taka',
    LKR: '₨ LKR - Sri Lankan Rupee',
    NPR: '₨ NPR - Nepalese Rupee',
    AFN: '؋ AFN - Afghan Afghani',
    KES: 'KSh KES - Kenyan Shilling',
    UGX: 'USh UGX - Ugandan Shilling',
    TZS: 'TSh TZS - Tanzanian Shilling',
    GHS: '₵ GHS - Ghanaian Cedi',
    NGN: '₦ NGN - Nigerian Naira',
    MAD: 'د.م. MAD - Moroccan Dirham',
    ETB: 'Br ETB - Ethiopian Birr',
    XOF: 'CFA XOF - West African CFA Franc',
    XAF: 'FCFA XAF - Central African CFA Franc',
  };

  // Sort currencies: priority first, then others alphabetically
  const sortedCurrencies = availableCurrencies.sort((a, b) => {
    const aIsPriority = priorityCurrencies.includes(a);
    const bIsPriority = priorityCurrencies.includes(b);
    
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    
    if (aIsPriority && bIsPriority) {
      return priorityCurrencies.indexOf(a) - priorityCurrencies.indexOf(b);
    }
    
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Currency
      </label>
      <Select value={value} onValueChange={onChange} data-testid="select-currency">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="max-h-96 overflow-y-auto">
          {sortedCurrencies.filter(currency => typeof currency === 'string' && currency).map((currency, index) => {
            const isPriority = priorityCurrencies.includes(currency);
            const showSeparator = index > 0 && isPriority && !priorityCurrencies.includes(sortedCurrencies[index - 1]);
            
            return (
              <div key={currency}>
                {showSeparator && (
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                )}
                <SelectItem value={currency} data-testid={`option-currency-${currency.toLowerCase()}`}>
                  {currencyNames[currency] || currency}
                </SelectItem>
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}