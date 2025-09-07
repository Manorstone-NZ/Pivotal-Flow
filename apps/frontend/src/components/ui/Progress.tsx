import React from 'react';
import { cn } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showPercentage = true,
  animated = false,
  striped = false,
  className,
  'data-testid': testId,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-3';
      case 'lg':
        return 'h-4';
      default:
        return 'h-3';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-brand-primary';
    }
  };

  const getAnimationClasses = () => {
    if (animated) {
      return 'animate-pulse';
    }
    if (striped) {
      return 'bg-stripes';
    }
    return '';
  };

  const progressClasses = cn(
    'w-full bg-gray-200 rounded-full overflow-hidden',
    getSizeClasses(),
    className
  );

  const barClasses = cn(
    'h-full transition-all duration-300 ease-in-out',
    getVariantClasses(),
    getAnimationClasses()
  );

  return (
    <div className="w-full" data-testid={testId}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && (
            <span className="text-sm font-medium text-gray-700">
              Progress
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={progressClasses}>
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Progress: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  );
};

// Circular progress component
interface CircularProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showPercentage?: boolean;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showPercentage = true,
  strokeWidth,
  className,
  'data-testid': testId,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { size: 40, strokeWidth: strokeWidth || 4 };
      case 'md':
        return { size: 60, strokeWidth: strokeWidth || 6 };
      case 'lg':
        return { size: 80, strokeWidth: strokeWidth || 8 };
      default:
        return { size: 60, strokeWidth: strokeWidth || 6 };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'stroke-green-500';
      case 'warning':
        return 'stroke-yellow-500';
      case 'error':
        return 'stroke-red-500';
      case 'info':
        return 'stroke-blue-500';
      default:
        return 'stroke-brand-primary';
    }
  };

  const { size: circleSize, strokeWidth: stroke } = getSizeClasses();
  const radius = (circleSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" data-testid={testId}>
      <svg
        width={circleSize}
        height={circleSize}
        className={cn('transform -rotate-90', className)}
      >
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-in-out',
            getVariantClasses()
          )}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Step progress component
interface StepProgressProps extends BaseComponentProps {
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabels?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  variant = 'default',
  showLabels = true,
  className,
  'data-testid': testId,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-brand-primary';
    }
  };

  return (
    <div className={cn('w-full', className)} data-testid={testId}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div className="flex items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className={cn(
                      'h-0.5 w-8',
                      isCompleted ? getVariantClasses() : 'bg-gray-300'
                    )}
                  />
                )}
                
                {/* Step circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    isCompleted
                      ? cn('text-white', getVariantClasses())
                      : isCurrent
                      ? cn('text-white', getVariantClasses())
                      : 'bg-gray-300 text-gray-600'
                  )}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
              </div>
              
              {showLabels && (
                <span
                  className={cn(
                    'mt-2 text-xs text-center',
                    isCurrent ? 'text-gray-900 font-medium' : 'text-gray-600'
                  )}
                >
                  {step}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
