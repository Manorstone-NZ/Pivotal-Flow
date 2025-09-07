import React, { forwardRef } from 'react';
import { cn, a11y } from '../../lib/utils';
import type { BaseComponentProps, FormFieldProps } from '../../lib/utils';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends BaseComponentProps, Omit<FormFieldProps, 'children'> {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  placeholder = 'Select an option...',
  multiple = false,
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
  const selectId = `select-${id}`;
  
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateClasses = error
    ? 'border-semantic-error focus:ring-semantic-error focus:border-semantic-error'
    : 'border-surface-border focus:ring-brand-primary focus:border-brand-primary';
  
  const selectClasses = cn(
    baseClasses,
    stateClasses,
    className
  );
  
  const filteredOptions = options;
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-semantic-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          autoFocus={autoFocus}
          multiple={multiple}
          className={selectClasses}
          data-testid={testId}
          {...a11y.getFieldProps(selectId, error, required)}
        >
          {!multiple && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {filteredOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {!multiple && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>
      
      {error && (
        <p
          className="text-sm text-semantic-error"
          {...a11y.getErrorProps(selectId)}
        >
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-text-secondary">
          {helpText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
