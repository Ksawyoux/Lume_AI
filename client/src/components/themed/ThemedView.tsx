import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThemedViewProps {
  children: ReactNode;
  className?: string;
  darkBackground?: boolean;
  fullWidth?: boolean;
  noPadding?: boolean;
}

export function ThemedView({
  children,
  className,
  darkBackground = false,
  fullWidth = false,
  noPadding = false
}: ThemedViewProps) {
  return (
    <div 
      className={cn(
        "rounded-lg",
        darkBackground ? "bg-gray-900" : "bg-white dark:bg-gray-900",
        !noPadding && "p-4",
        !fullWidth && "max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}