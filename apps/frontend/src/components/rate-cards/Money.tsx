/**
 * Money Component
 * Centralized currency formatting with internationalization support
 */

import React from 'react';
import { CURRENCY_CONFIGS } from '../../features/rate-cards/types';

interface MoneyProps {
  amount: string | number;
  currency: string;
  className?: string;
  showCurrency?: boolean;
  precision?: number;
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  currency,
  className = '',
  showCurrency = false,
  precision,
}) => {
  const formatMoney = (value: string | number, currencyCode: string): string => {
    const config = CURRENCY_CONFIGS[currencyCode.toUpperCase()];
    
    if (!config) {
      // Fallback for unsupported currencies
      return `${value} ${currencyCode}`;
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
      return `${config.symbol}0.${'0'.repeat(config.decimals)}`;
    }

    const decimals = precision !== undefined ? precision : config.decimals;
    const formattedNumber = numericValue.toFixed(decimals);
    
    // Add thousand separators
    const [integerPart, decimalPart] = formattedNumber.split('.');
    const formattedInteger = (integerPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const finalNumber = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    
    if (config.position === 'before') {
      const result = `${config.symbol}${finalNumber}`;
      return showCurrency ? `${result} ${currencyCode}` : result;
    } else {
      const result = `${finalNumber}${config.symbol}`;
      return showCurrency ? `${result} ${currencyCode}` : result;
    }
  };

  const formattedValue = formatMoney(amount, currency);

  return (
    <span 
      className={`font-medium tabular-nums ${className}`}
      title={showCurrency ? undefined : `${formattedValue} ${currency}`}
    >
      {formattedValue}
    </span>
  );
};

// Hook for currency formatting logic
export const useCurrencyFormatter = () => {
  const formatCurrency = React.useCallback((amount: string | number, currency: string, options?: {
    showCurrency?: boolean;
    precision?: number;
  }) => {
    const config = CURRENCY_CONFIGS[currency.toUpperCase()];
    
    if (!config) {
      return `${amount} ${currency}`;
    }

    const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericValue)) {
      return `${config.symbol}0.${'0'.repeat(config.decimals)}`;
    }

    const decimals = options?.precision !== undefined ? options.precision : config.decimals;
    const formattedNumber = numericValue.toFixed(decimals);
    
    // Add thousand separators
    const [integerPart, decimalPart] = formattedNumber.split('.');
    const formattedInteger = (integerPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const finalNumber = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    
    if (config.position === 'before') {
      const result = `${config.symbol}${finalNumber}`;
      return options?.showCurrency ? `${result} ${currency}` : result;
    } else {
      const result = `${finalNumber}${config.symbol}`;
      return options?.showCurrency ? `${result} ${currency}` : result;
    }
  }, []);

  const parseCurrencyInput = React.useCallback((input: string, currency: string): string => {
    const config = CURRENCY_CONFIGS[currency.toUpperCase()];
    
    // Remove currency symbols and separators
    let cleanInput = input.replace(/[^\d.-]/g, '');
    
    // Handle negative numbers
    const isNegative = cleanInput.startsWith('-');
    if (isNegative) {
      cleanInput = cleanInput.substring(1);
    }
    
    // Parse as float and validate
    const numericValue = parseFloat(cleanInput);
    
    if (isNaN(numericValue)) {
      return '0';
    }
    
    // Apply currency precision
    const decimals = config?.decimals || 2;
    const finalValue = isNegative ? -numericValue : numericValue;
    
    return finalValue.toFixed(decimals);
  }, []);

  const validateCurrencyInput = React.useCallback((input: string, currency: string): {
    isValid: boolean;
    error?: string;
    value?: string;
  } => {
    if (!input.trim()) {
      return { isValid: false, error: 'Amount is required' };
    }

    const config = CURRENCY_CONFIGS[currency.toUpperCase()];
    
    if (!config) {
      return { isValid: false, error: `Unsupported currency: ${currency}` };
    }

    try {
      const cleanValue = parseCurrencyInput(input, currency);
      const numericValue = parseFloat(cleanValue);
      
      if (isNaN(numericValue)) {
        return { isValid: false, error: 'Invalid number format' };
      }
      
      if (numericValue < 0) {
        return { isValid: false, error: 'Amount cannot be negative' };
      }
      
      if (numericValue > 999999.99) {
        return { isValid: false, error: 'Amount exceeds maximum value' };
      }
      
      return { isValid: true, value: cleanValue };
    } catch (error) {
      return { isValid: false, error: 'Invalid input format' };
    }
  }, [parseCurrencyInput]);

  return {
    formatCurrency,
    parseCurrencyInput,
    validateCurrencyInput,
  };
};

// Currency input component with validation
interface CurrencyInputProps {
  value: string;
  currency: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | undefined;
  className?: string;
  'data-testid'?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  currency,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  error,
  className = '',
  'data-testid': testId,
}) => {
  const { formatCurrency, parseCurrencyInput, validateCurrencyInput } = useCurrencyFormatter();
  const [displayValue, setDisplayValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  // Update display value when value prop changes
  React.useEffect(() => {
    if (!isFocused && value) {
      setDisplayValue(formatCurrency(value, currency));
    }
  }, [value, currency, formatCurrency, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw numeric value when focused
    setDisplayValue(value || '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    if (displayValue.trim()) {
      const validation = validateCurrencyInput(displayValue, currency);
      if (validation.isValid && validation.value) {
        onChange(validation.value);
        setDisplayValue(formatCurrency(validation.value, currency));
      }
    }
    
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    if (isFocused) {
      // Only update parent with clean numeric value
      const cleanValue = parseCurrencyInput(inputValue, currency);
      if (cleanValue !== value) {
        onChange(cleanValue);
      }
    }
  };

  const config = CURRENCY_CONFIGS[currency.toUpperCase()];
  const currencySymbol = config?.symbol || currency;

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none">
        {currencySymbol}
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || `0.${'0'.repeat(config?.decimals || 2)}`}
        disabled={disabled}
        data-testid={testId}
        className={`
          pl-8 pr-3 py-2 w-full border rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-surface-card text-text-primary border-surface-border
          tabular-nums
          ${error ? 'border-semantic-error focus:ring-semantic-error' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-semantic-error">{error}</p>
      )}
    </div>
  );
};
