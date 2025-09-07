import React from 'react';
import { cn } from '../../lib/utils';
import type { BaseComponentProps, VariantProps } from '../../lib/utils';

interface IconButtonProps extends BaseComponentProps, Omit<VariantProps, 'size'> {
  icon: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string; // Required for accessibility
  'aria-describedby'?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  'data-testid': testId,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-brand-primary text-text-inverse hover:bg-brand-secondary focus:ring-brand-primary',
    secondary: 'bg-neutral-200 text-text-primary hover:bg-neutral-300 focus:ring-neutral-500',
    outline: 'border border-surface-border bg-transparent text-text-primary hover:bg-neutral-50 focus:ring-brand-primary',
    ghost: 'bg-transparent text-text-primary hover:bg-neutral-100 focus:ring-brand-primary',
  };
  
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClasses}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={isDisabled}
    >
      {loading ? (
        <svg
          className={cn('animate-spin', iconSizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <span className={iconSizeClasses[size]} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};
