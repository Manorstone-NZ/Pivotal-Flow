import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn, focus } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface DialogProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void; // For compatibility with shadcn/ui pattern
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Additional Dialog components for composition
interface DialogContentProps extends BaseComponentProps {
  children: React.ReactNode;
}

interface DialogHeaderProps extends BaseComponentProps {
  children: React.ReactNode;
}

interface DialogFooterProps extends BaseComponentProps {
  children: React.ReactNode;
}

interface DialogTitleProps extends BaseComponentProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps extends BaseComponentProps {
  children: React.ReactNode;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
    {children}
  </div>
);

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props}>
    {children}
  </div>
);

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  onOpenChange,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  className,
  'data-testid': testId,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };
  
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      const cleanup = focus.trapFocus(dialogRef.current!);
      
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        cleanup();
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
        if (previousActiveElement.current) {
          focus.restoreFocus(previousActiveElement.current);
        }
      };
    }
    
    return undefined;
  }, [open, onClose, closeOnEscape]);
  
  const handleClose = () => {
    onClose();
    onOpenChange?.(false);
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      handleClose();
    }
  };
  
  if (!open) return null;
  
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-overlay"
      onClick={handleOverlayClick}
      data-testid={testId}
    >
      <div
        ref={dialogRef}
        className={cn(
          'relative bg-surface-card rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col',
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        <div className="flex flex-col h-full">
          {(title || description) && (
            <div className="p-6 pb-0 flex-shrink-0">
              {title && (
                <h2 id="dialog-title" className="text-lg font-semibold text-text-primary mb-2">
                  {title}
                </h2>
              )}
              
              {description && (
                <p id="dialog-description" className="text-sm text-text-secondary mb-4">
                  {description}
                </p>
              )}
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            {children}
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-lg"
          aria-label="Close dialog"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
};
