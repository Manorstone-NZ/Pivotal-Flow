import React, { forwardRef } from 'react';
import { cn, a11y } from '../../lib/utils';
import type { BaseComponentProps, FormFieldProps } from '../../lib/utils';

interface ToggleProps extends BaseComponentProps, Omit<FormFieldProps, 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({
  checked,
  defaultChecked,
  onChange,
  onBlur,
  onFocus,
  label,
  error,
  required = false,
  helpText,
  disabled = false,
  autoFocus = false,
  size = 'md',
  className,
  'data-testid': testId,
}, ref) => {
  const id = React.useId();
  const toggleId = `toggle-${id}`;
  
  const sizeClasses = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11',
  };
  
  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const translateClasses = {
    sm: 'translate-x-3',
    md: 'translate-x-4',
    lg: 'translate-x-5',
  };
  
  const toggleClasses = cn(
    'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    checked
      ? 'bg-brand-primary focus:ring-brand-primary'
      : 'bg-neutral-300 focus:ring-brand-primary',
    error && 'focus:ring-semantic-error',
    className
  );
  
  const thumbClasses = cn(
    'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
    thumbSizeClasses[size],
    checked ? translateClasses[size] : 'translate-x-0'
  );
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={label ? `${toggleId}-label` : undefined}
            aria-describedby={error ? `${toggleId}-error` : helpText ? `${toggleId}-help` : undefined}
            disabled={disabled}
            className={toggleClasses}
            onClick={() => onChange?.(!checked)}
            onBlur={onBlur}
            onFocus={onFocus}
            autoFocus={autoFocus}
            data-testid={testId}
          >
            <span className="sr-only">
              {checked ? 'On' : 'Off'}
            </span>
            <span className={thumbClasses} />
          </button>
          
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={handleChange}
            className="sr-only"
            {...a11y.getFieldProps(toggleId, error, required)}
          />
        </div>
        
        {label && (
          <div className="flex-1">
            <label
              id={`${toggleId}-label`}
              htmlFor={toggleId}
              className="text-sm font-medium text-text-primary cursor-pointer"
            >
              {label}
              {required && <span className="text-semantic-error ml-1">*</span>}
            </label>
          </div>
        )}
      </div>
      
      {error && (
        <p
          className="text-sm text-semantic-error ml-7"
          {...a11y.getErrorProps(toggleId)}
        >
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${toggleId}-help`} className="text-sm text-text-secondary ml-7">
          {helpText}
        </p>
      )}
    </div>
  );
});

Toggle.displayName = 'Toggle';
