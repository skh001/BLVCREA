import { type ClassValue, clsx } from 'clsx';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a price in EUR */
export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Truncate a string to maxLength with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}…`;
}

/** Format a date in French */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
