import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Button } from '../Button';

interface Customer {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
}

interface CustomerSelectorProps {
  value: string;
  onChange: (customerId: string, customer?: Customer) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// Mock customer data - in real implementation, this would come from an API
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'customer-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    company: 'Tech Solutions Ltd',
    phone: '+64 21 123 4567',
  },
  {
    id: 'customer-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@innovate.co.nz',
    company: 'Innovate NZ',
    phone: '+64 9 555 0123',
  },
  {
    id: 'customer-3',
    name: 'Mike Wilson',
    email: 'mike.wilson@buildcorp.com',
    company: 'BuildCorp Limited',
    phone: '+64 4 888 9999',
  },
  {
    id: 'customer-4',
    name: 'Emma Davis',
    email: 'emma.davis@digitalflow.nz',
    company: 'Digital Flow Agency',
    phone: '+64 3 777 5555',
  },
  {
    id: 'customer-5',
    name: 'David Brown',
    email: 'david.brown@greenenergy.co.nz',
    company: 'Green Energy Solutions',
    phone: '+64 7 666 3333',
  },
];

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Search customers...',
  disabled = false,
  error,
  label,
  required = false,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected customer
  useEffect(() => {
    const customer = MOCK_CUSTOMERS.find(c => c.id === value);
    setSelectedCustomer(customer || null);
    setSearchTerm(customer?.name || '');
  }, [value]);

  // Filter customers based on search term
  const filteredCustomers = MOCK_CUSTOMERS.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return undefined;
  }, [isOpen, onBlur]);

  const handleSearchChange = useCallback((searchValue: string) => {
    setSearchTerm(searchValue);
    setIsOpen(true);
    
    // If search term is cleared, clear selection
    if (!searchValue) {
      onChange('');
      setSelectedCustomer(null);
    }
  }, [onChange]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setIsOpen(false);
    onChange(customer.id, customer);
    onBlur?.();
  }, [onChange, onBlur]);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Removed handleKeyDown as Input component doesn't support onKeyDown

  const handleOptionKeyDown = useCallback((e: React.KeyboardEvent, customer: Customer) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCustomerSelect(customer);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.focus();
    }
  }, [handleCustomerSelect]);

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <Input
        ref={inputRef}
        label={label}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        required={required}
        autoComplete="off"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />

      {/* Dropdown */}
      {isOpen && !disabled && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          <div role="listbox" className="py-2">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  role="option"
                  tabIndex={0}
                  aria-selected={customer.id === value}
                  className="px-4 py-3 cursor-pointer hover:bg-surface-background focus:bg-surface-background focus:outline-none transition-colors"
                  onClick={() => handleCustomerSelect(customer)}
                  onKeyDown={(e) => handleOptionKeyDown(e, customer)}
                >
                  <div className="flex flex-col">
                    <div className="font-medium text-text-primary">{customer.name}</div>
                    {customer.company && (
                      <div className="text-sm text-text-secondary">{customer.company}</div>
                    )}
                    {customer.email && (
                      <div className="text-xs text-text-secondary">{customer.email}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-text-secondary text-sm">
                No customers found matching "{searchTerm}"
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Selected customer display */}
      {selectedCustomer && !isOpen && (
        <div className="mt-2 p-3 bg-surface-background rounded-lg border border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">{selectedCustomer.name}</div>
              {selectedCustomer.company && (
                <div className="text-sm text-text-secondary">{selectedCustomer.company}</div>
              )}
              {selectedCustomer.email && (
                <div className="text-xs text-text-secondary">{selectedCustomer.email}</div>
              )}
            </div>
            {!disabled && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(true)}
                disabled={disabled}
              >
                Change
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
