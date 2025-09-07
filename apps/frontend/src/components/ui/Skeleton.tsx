import React from 'react';
import { cn } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  lines = 1,
  className,
  'data-testid': testId,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      default:
        return '';
    }
  };

  const getDimensions = () => {
    const styles: React.CSSProperties = {};
    
    if (width) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }
    
    if (height) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }
    
    return styles;
  };

  const skeletonClasses = cn(
    'bg-gray-200',
    getVariantClasses(),
    getAnimationClasses(),
    className
  );

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" data-testid={testId}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              skeletonClasses,
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={getDimensions()}
          />
        ))}
      </div>
    );
  }

  // For circular variant, ensure it's square
  if (variant === 'circular') {
    const size = width || height || '40px';
    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    
    return (
      <div
        className={skeletonClasses}
        style={{ width: sizeValue, height: sizeValue }}
        data-testid={testId}
      />
    );
  }

  // Default skeleton
  return (
    <div
      className={skeletonClasses}
      style={getDimensions()}
      data-testid={testId}
    />
  );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  'data-testid'?: string;
}> = ({ lines = 3, className, 'data-testid': testId }) => (
  <Skeleton
    variant="text"
    lines={lines}
    className={cn('h-4', className)}
    {...(testId && { 'data-testid': testId })}
  />
);

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'data-testid'?: string;
}> = ({ size = 'md', className, 'data-testid': testId }) => {
  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '48px',
  };
  
  return (
    <Skeleton
      variant="circular"
      width={sizeMap[size]}
      height={sizeMap[size]}
      {...(className && { className })}
      {...(testId && { 'data-testid': testId })}
    />
  );
};

export const SkeletonButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'data-testid'?: string;
}> = ({ size = 'md', className, 'data-testid': testId }) => {
  const sizeMap = {
    sm: { width: '80px', height: '32px' },
    md: { width: '100px', height: '40px' },
    lg: { width: '120px', height: '48px' },
  };
  
  return (
    <Skeleton
      variant="rounded"
      width={sizeMap[size].width}
      height={sizeMap[size].height}
      {...(className && { className })}
      {...(testId && { 'data-testid': testId })}
    />
  );
};

export const SkeletonCard: React.FC<{
  className?: string;
  'data-testid'?: string;
}> = ({ className, 'data-testid': testId }) => (
  <div className={cn('p-4 border border-gray-200 rounded-lg', className)} data-testid={testId}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonAvatar />
      <div className="flex-1">
        <SkeletonText lines={1} className="mb-2" />
        <SkeletonText lines={1} className="w-2/3" />
      </div>
    </div>
    <SkeletonText lines={2} className="mb-4" />
    <div className="flex space-x-2">
      <SkeletonButton size="sm" />
      <SkeletonButton size="sm" />
    </div>
  </div>
);
