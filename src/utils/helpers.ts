import type { Plan } from '../types';

/**
 * Formats a number to currency string (US locale representation).
 */
export const formatCurrency = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Extracts first 2 initials from a person's name.
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Gets a plan's name by its ID.
 */
export const getPlanName = (planId: string, plans: Plan[]): string => {
  const plan = plans.find((p) => p.id === planId);
  return plan ? plan.name : 'خطة غير معروفة';
};

/**
 * Translation helpers for payment methods.
 */
export const PAYMENT_METHODS: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة ائتمان',
  bank: 'تحويل بنكي',
  instapay: 'إنستاباي',
};

export const translateMethod = (method: string): string => {
  return PAYMENT_METHODS[method] || method;
};
