import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThemedTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'title' | 'subtitle' | 'label' | 'small';
  color?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'danger' | 'white';
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
}

export function ThemedText({
  children,
  className,
  variant = 'default',
  color = 'default',
  as: Component = 'p'
}: ThemedTextProps) {
  const variantClasses = {
    'default': 'text-base',
    'title': 'text-2xl font-bold tracking-tight md:text-3xl',
    'subtitle': 'text-xl font-semibold',
    'label': 'text-sm font-medium',
    'small': 'text-xs'
  };

  const colorClasses = {
    'default': 'text-gray-900 dark:text-gray-100',
    'muted': 'text-gray-500 dark:text-gray-400',
    'accent': 'text-teal-600 dark:text-teal-400',
    'success': 'text-green-600 dark:text-green-400',
    'warning': 'text-amber-600 dark:text-amber-400',
    'danger': 'text-red-600 dark:text-red-400',
    'white': 'text-white'
  };

  return (
    <Component
      className={cn(
        variantClasses[variant],
        colorClasses[color],
        className
      )}
    >
      {children}
    </Component>
  );
}