import React from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            isOpen, 
            onOpenChange: handleOpenChange 
          } as { isOpen: boolean; onOpenChange: (open: boolean) => void });
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { 
  isOpen?: boolean; 
  onOpenChange?: (open: boolean) => void; 
}> = ({ 
  children,
  isOpen,
  onOpenChange
}) => {
  const handleClick = () => {
    onOpenChange?.(!isOpen);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps & { 
  isOpen?: boolean; 
}> = ({ 
  children, 
  align = 'center',
  className,
  isOpen
}) => {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(
      'absolute top-full mt-1 w-56 bg-surface-card border border-surface-border rounded-lg shadow-lg z-50',
      alignmentClasses[align],
      className
    )}>
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  onClick,
  className 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 text-left text-sm hover:bg-surface-hover transition-colors first:rounded-t-lg last:rounded-b-lg',
        className
      )}
    >
      {children}
    </button>
  );
};

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ 
  className 
}) => {
  return (
    <div className={cn('border-t border-surface-border my-1', className)} />
  );
};
