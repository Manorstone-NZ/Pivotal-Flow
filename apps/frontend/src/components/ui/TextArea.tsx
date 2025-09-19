import React, { forwardRef } from 'react';
import { cn, a11y } from '../../lib/utils';
import type { BaseComponentProps, FormFieldProps } from '../../lib/utils';

interface TextAreaProps extends BaseComponentProps, Omit<FormFieldProps, 'children'> {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void | undefined;
  onBlur?: () => void;
  onFocus?: () => void;
  rows?: number;
  cols?: number;
  autoResize?: boolean;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  // Allow additional props for react-hook-form compatibility
  [key: string]: any;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  rows = 3,
  cols,
  autoResize = false,
  maxLength,
  minLength,
  label,
  error,
  required = false,
  helpText,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  className,
  'data-testid': testId,
  ...restProps
}, ref) => {
  const id = React.useId();
  const textareaId = `textarea-${id}`;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Combine refs
  React.useImperativeHandle(ref, () => textareaRef.current!);
  
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-none';
  
  const stateClasses = error
    ? 'border-semantic-error focus:ring-semantic-error focus:border-semantic-error'
    : 'border-surface-border focus:ring-brand-primary focus:border-brand-primary';
  
  const textareaClasses = cn(
    baseClasses,
    stateClasses,
    !autoResize && 'resize-vertical',
    className
  );
  
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.target.value);
    
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  
  React.useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize]);
  
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-semantic-error ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        minLength={minLength}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        className={textareaClasses}
        data-testid={testId}
        {...a11y.getFieldProps(textareaId, error, required)}
        {...restProps}
      />
      
      {error && (
        <p
          className="text-sm text-semantic-error"
          {...a11y.getErrorProps(textareaId)}
        >
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-text-secondary">
          {helpText}
        </p>
      )}
      
      {maxLength && (
        <p className="text-xs text-text-secondary text-right">
          {value?.length || 0} / {maxLength}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
