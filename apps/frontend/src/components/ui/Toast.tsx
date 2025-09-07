import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface ToastProps extends BaseComponentProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
  className,
  'data-testid': testId,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };
  
  const typeClasses = {
    success: 'bg-semantic-success text-white border-semantic-success',
    error: 'bg-semantic-error text-white border-semantic-error',
    warning: 'bg-semantic-warning text-white border-semantic-warning',
    info: 'bg-semantic-info text-white border-semantic-info',
  };
  
  const typeIcons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };
  
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [duration, handleClose]);
  
  return createPortal(
    <div
      className={cn(
        'fixed z-50 max-w-sm w-full',
        positionClasses[position],
        'transform transition-all duration-300 ease-in-out',
        isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
      data-testid={testId}
    >
      <div
        className={cn(
          'rounded-lg border p-4 shadow-lg',
          typeClasses[type],
          className
        )}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {typeIcons[type]}
          </div>
          
          <div className="ml-3 flex-1">
            {title && (
              <h3 className="text-sm font-medium">
                {title}
              </h3>
            )}
            
            {description && (
              <p className={cn('text-sm', title && 'mt-1')}>
                {description}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded-md p-1"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      ...toast,
      id,
      onClose: (toastId: string) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      },
    };
    
    setToasts(prev => [...prev, newToast]);
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const success = (title: string, description?: string, duration?: number) => {
    addToast({ 
      title, 
      ...(description && { description }), 
      type: 'success', 
      ...(duration && { duration })
    });
  };
  
  const error = (title: string, description?: string, duration?: number) => {
    addToast({ 
      title, 
      ...(description && { description }), 
      type: 'error', 
      ...(duration && { duration })
    });
  };
  
  const warning = (title: string, description?: string, duration?: number) => {
    addToast({ 
      title, 
      ...(description && { description }), 
      type: 'warning', 
      ...(duration && { duration })
    });
  };
  
  const info = (title: string, description?: string, duration?: number) => {
    addToast({ 
      title, 
      ...(description && { description }), 
      type: 'info', 
      ...(duration && { duration })
    });
  };
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

// Toast Container Component
export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts } = useToast();
  
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} />
    </>
  );
};
