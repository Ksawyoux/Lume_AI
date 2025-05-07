import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemedCardProps {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  cardContentClassName?: string;
}

export function ThemedCard({
  children,
  className,
  title,
  description,
  footer,
  variant = 'default',
  cardContentClassName
}: ThemedCardProps) {
  const variantClasses = {
    'default': 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    'outlined': 'bg-transparent border border-gray-200 dark:border-gray-700',
    'elevated': 'bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30'
  };

  return (
    <Card className={cn(variantClasses[variant], 'rounded-xl', className)}>
      {(title || description) && (
        <CardHeader>
          {title && (typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title)}
          {description && (typeof description === 'string' ? <CardDescription>{description}</CardDescription> : description)}
        </CardHeader>
      )}
      <CardContent className={cardContentClassName}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter>{footer}</CardFooter>
      )}
    </Card>
  );
}