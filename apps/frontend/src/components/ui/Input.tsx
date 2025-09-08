import React, { forwardRef } from 'react';
import { cn, type BaseComponentProps, type FormFieldProps, a11y } from '../../lib/utils';

interface InputProps extends BaseComponentProps, Omit<FormFieldProps, 'children'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void | undefined;
  onBlur?: () => void;
  onFocus?: () => void;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  disabled?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  label,
  error,
  required = false,
  helpText,
  disabled = false,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  maxLength,
  minLength,
  pattern,
  className,
  'data-testid': testId,
}, ref) => {
  const id = React.useId();
  const inputId = `input-${id}`;
  
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateClasses = error
    ? 'border-semantic-error focus:ring-semantic-error focus:border-semantic-error'
    : 'border-surface-border focus:ring-brand-primary focus:border-brand-primary';
  
  const inputClasses = cn(
    baseClasses,
    stateClasses,
    className
  );
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-semantic-error ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value ?? ''}
        defaultValue={defaultValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        readOnly={readOnly}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        className={inputClasses}
        data-testid={testId}
        {...a11y.getFieldProps(inputId, error, required)}
      />
      
      {error && (
        <p
          className="text-sm text-semantic-error"
          {...a11y.getErrorProps(inputId)}
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

Input.displayName = 'Input';