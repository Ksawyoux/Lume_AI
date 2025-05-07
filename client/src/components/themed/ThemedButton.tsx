import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({
    children,
    className,
    variant = 'default',
    size = 'default',
    isLoading = false,
    loadingText,
    iconLeft,
    iconRight,
    fullWidth = false,
    disabled,
    ...props
  }, ref) => {
    // Map our variants to shadcn button variants
    const variantMap = {
      'default': 'default',
      'primary': 'default',
      'secondary': 'secondary',
      'outline': 'outline',
      'ghost': 'ghost',
      'link': 'link',
      'destructive': 'destructive'
    } as const;
    
    // Apply special styling for primary (our teal branded style)
    const isPrimary = variant === 'primary';
    
    return (
      <Button
        ref={ref}
        variant={variantMap[variant]}
        size={size}
        disabled={isLoading || disabled}
        className={cn(
          isPrimary && 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && iconLeft && <span className="mr-2">{iconLeft}</span>}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && iconRight && <span className="ml-2">{iconRight}</span>}
      </Button>
    );
  }
);