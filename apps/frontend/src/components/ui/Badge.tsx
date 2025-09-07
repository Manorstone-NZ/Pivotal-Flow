import React from 'react';
import { cn } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface BadgeProps extends BaseComponentProps {
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  dot?: boolean;
  max?: number;
  showZero?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  dot = false,
  max,
  showZero = false,
  className,
  'data-testid': testId,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-primary text-text-inverse';
      case 'secondary':
        return 'bg-neutral-200 text-text-primary';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-xs';
      case 'md':
        return 'px-2 py-1 text-sm';
      case 'lg':
        return 'px-3 py-1.5 text-base';
      default:
        return 'px-2 py-1 text-sm';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'pill':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      default:
        return 'rounded-md';
    }
  };

  const getDotClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'md':
        return 'w-2.5 h-2.5';
      case 'lg':
        return 'w-3 h-3';
      default:
        return 'w-2.5 h-2.5';
    }
  };

  const formatValue = (value: number) => {
    if (max && value > max) {
      return `${max}+`;
    }
    return value.toString();
  };

  const badgeClasses = cn(
    'inline-flex items-center justify-center font-medium',
    getVariantClasses(),
    getSizeClasses(),
    getShapeClasses(),
    className
  );

  const dotClasses = cn(
    'rounded-full',
    getVariantClasses(),
    getDotClasses()
  );

  // If it's a dot badge, render just the dot
  if (dot) {
    return (
      <span
        className={dotClasses}
        data-testid={testId}
        aria-label="Badge indicator"
      />
    );
  }

  // If children is a number, handle max and showZero logic
  if (typeof children === 'number') {
    if (!showZero && children === 0) {
      return null;
    }
    
    return (
      <span className={badgeClasses} data-testid={testId}>
        {formatValue(children)}
      </span>
    );
  }

  // For string or other content
  return (
    <span className={badgeClasses} data-testid={testId}>
      {children}
    </span>
  );
};
