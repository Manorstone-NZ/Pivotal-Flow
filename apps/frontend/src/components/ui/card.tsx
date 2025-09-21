import React from 'react';
import { cn } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps extends BaseComponentProps {
  children: React.ReactNode;
}

interface CardContentProps extends BaseComponentProps {
  children: React.ReactNode;
}

interface CardFooterProps extends BaseComponentProps {
  children: React.ReactNode;
}

interface CardTitleProps extends BaseComponentProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface CardDescriptionProps extends BaseComponentProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
  className,
  'data-testid': testId,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'border border-surface-border bg-surface-card';
      case 'elevated':
        return 'bg-surface-card shadow-lg';
      case 'flat':
        return 'bg-surface-background';
      default:
        return 'bg-surface-card border border-surface-border';
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const cardClasses = cn(
    'rounded-lg transition-all duration-200',
    getVariantClasses(),
    getPaddingClasses(),
    {
      'hover:shadow-md': hover,
      'cursor-pointer hover:shadow-md hover:scale-[1.02]': clickable,
    },
    className
  );

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      data-testid={testId}
      type={clickable ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  'data-testid': testId,
}) => {
  return (
    <div
      className={cn('mb-4', className)}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  'data-testid': testId,
}) => {
  return (
    <div
      className={cn('text-text-secondary', className)}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  'data-testid': testId,
}) => {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-surface-border', className)}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  as: Component = 'h3',
  className,
  'data-testid': testId,
}) => {
  return (
    <Component
      className={cn('text-lg font-semibold text-text-primary mb-2', className)}
      data-testid={testId}
    >
      {children}
    </Component>
  );
};

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
  'data-testid': testId,
}) => {
  return (
    <p
      className={cn('text-sm text-text-secondary', className)}
      data-testid={testId}
    >
      {children}
    </p>
  );
};
