import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Base component props interface
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

/**
 * Component variant props interface
 */
export interface VariantProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Form field props interface
 */
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string | undefined;
  required?: boolean;
  helpText?: string;
}

/**
 * Accessibility utilities
 */
export const a11y = {
  /**
   * Generate unique ID for form elements
   */
  generateId: (prefix: string = 'pf') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  /**
   * Get ARIA attributes for form fields
   */
  getFieldProps: (id: string, error?: string, required?: boolean) => ({
    id,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-invalid': error ? true : false,
    'aria-required': required ? true : false,
  }),
  
  /**
   * Get ARIA attributes for error messages
   */
  getErrorProps: (id: string) => ({
    id: `${id}-error`,
    role: 'alert',
    'aria-live': 'polite' as const,
  }),
};

/**
 * Keyboard navigation utilities
 */
export const keyboard = {
  /**
   * Handle Enter key press
   */
  handleEnter: (callback: () => void) => (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },
  
  /**
   * Handle Escape key press
   */
  handleEscape: (callback: () => void) => (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  },
  
  /**
   * Handle arrow key navigation
   */
  handleArrowKeys: (callback: (direction: 'up' | 'down' | 'left' | 'right') => void) => (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        callback('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        callback('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        callback('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        callback('right');
        break;
    }
  },
};

/**
 * Focus management utilities
 */
export const focus = {
  /**
   * Trap focus within an element
   */
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    
    // Only focus the first element if no element within the dialog is currently focused
    if (!element.contains(document.activeElement)) {
      firstElement?.focus();
    }
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
  
  /**
   * Restore focus to previously focused element
   */
  restoreFocus: (element: HTMLElement) => {
    element.focus();
  },
};

/**
 * Validation utilities
 */
export const validation = {
  /**
   * Email validation
   */
  isEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  /**
   * Required field validation
   */
  isRequired: (value: string | number | boolean): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },
  
  /**
   * Minimum length validation
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },
  
  /**
   * Maximum length validation
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },
};
