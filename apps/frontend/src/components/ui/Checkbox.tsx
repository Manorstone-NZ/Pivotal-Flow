import React, { forwardRef } from 'react';
import { cn, a11y } from '../../lib/utils';
import type { BaseComponentProps, FormFieldProps } from '../../lib/utils';

interface CheckboxProps extends BaseComponentProps, Omit<FormFieldProps, 'children'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  indeterminate?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
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
  className,
  'data-testid': testId,
}, ref) => {
  const id = React.useId();
  const checkboxId = `checkbox-${id}`;
  
  const checkboxClasses = cn(
    'h-4 w-4 rounded border-surface-border text-brand-primary focus:ring-brand-primary focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
    error && 'border-semantic-error focus:ring-semantic-error',
    className
  );
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            autoFocus={autoFocus}
            className={checkboxClasses}
            data-testid={testId}
            {...a11y.getFieldProps(checkboxId, error, required)}
          />
        </div>
        
        {label && (
          <div className="flex-1">
            <label
              htmlFor={checkboxId}
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
          {...a11y.getErrorProps(checkboxId)}
        >
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-text-secondary ml-7">
          {helpText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
