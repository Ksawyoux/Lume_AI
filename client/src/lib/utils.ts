import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'exceptZero'
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    income: '#10B981',
    expense: '#EF4444',
    grocery: '#8B5CF6',
    restaurant: '#F97316',
    entertainment: '#3B82F6',
    shopping: '#EC4899',
    transport: '#6366F1',
    housing: '#14B8A6',
    utilities: '#F59E0B',
    health: '#10B981',
    education: '#6366F1',
    other: '#6B7280'
  };
  
  return categoryColors[category] || categoryColors.other;
}
