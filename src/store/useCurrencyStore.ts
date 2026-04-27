import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'RWF' | 'USD' | 'EUR' | 'CNY';

// Fixed exchange rates relative to RWF (updated periodically)
export const RATES: Record<Currency, number> = {
  RWF: 1,
  USD: 0.00072,   // 1 RWF ≈ 0.00072 USD
  EUR: 0.00066,   // 1 RWF ≈ 0.00066 EUR
  CNY: 0.0052,    // 1 RWF ≈ 0.0052 CNY
};

export const SYMBOLS: Record<Currency, string> = {
  RWF: 'RWF',
  USD: '$',
  EUR: '€',
  CNY: '¥',
};

export const FLAGS: Record<Currency, string> = {
  RWF: '🇷🇼',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  CNY: '🇨🇳',
};

interface CurrencyStore {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'RWF',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'simba-currency' }
  )
);

/** Convert a RWF price to the selected currency and format it */
export function formatPrice(rwfAmount: number, currency: Currency): string {
  if (currency === 'RWF') return `${rwfAmount.toLocaleString()} RWF`;
  const converted = rwfAmount * RATES[currency];
  const symbol = SYMBOLS[currency];
  if (currency === 'CNY') return `${symbol}${converted.toFixed(0)}`;
  return `${symbol}${converted.toFixed(2)}`;
}
