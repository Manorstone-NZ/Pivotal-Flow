import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../ui/DataTable';
import { StatusBadge } from './StatusBadge';
import { InvoiceTotalsSummary } from './InvoiceTotals';
import { PaymentSummary } from './PaymentTimeline';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { Invoice, InvoiceListFilters } from '../../features/invoices/api';

export interface InvoiceTableProps {
  invoices: Invoice[];
  loading?: boolean;
  onRowClick?: (invoice: Invoice) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  showCustomer?: boolean;
  showProject?: boolean;
  showPayments?: boolean;
}

/**
 * Format currency value for display
 */
const formatCurrency = (amount: number, currency: string = 'NZD'): string => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date for display
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get priority class for overdue invoices
 */
const getRowPriorityClass = (invoice: Invoice): string => {
  if (invoice.status === 'overdue') {
    return 'bg-red-50 border-red-200';
  }
  
  if (invoice.status === 'sent' && invoice.dueAt) {
    const dueDate = new Date(invoice.dueAt);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 3) {
      return 'bg-yellow-50 border-yellow-200';
    }
  }
  
  return '';
};

/**
 * InvoiceTable component for displaying invoices in a data table
 */
export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  loading = false,
  onRowClick,
  onSort,
  sortField,
  sortDirection,
  className,
  showCustomer = true,
  showProject = false,
  showPayments = true,
}) => {
  const navigate = useNavigate();

  // Handle row click
  const handleRowClick = (invoice: Invoice) => {
    if (onRowClick) {
      onRowClick(invoice);
    } else {
      navigate(`/invoices/${invoice.id}`);
    }
  };

  // Column definitions
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <div className="font-medium text-primary-600">
            {row.original.invoiceNumber}
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <div className="max-w-xs">
            <div className="font-medium text-text-primary truncate">
              {row.original.title}
            </div>
            {row.original.description && (
              <div className="text-sm text-text-secondary truncate">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
    ];

    // Add customer column if requested
    if (showCustomer) {
      baseColumns.push({
        accessorKey: 'customer.name',
        header: 'Customer',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <div>
            <div className="font-medium text-text-primary">
              {row.original.customer?.name || 'Unknown Customer'}
            </div>
            {row.original.customer?.email && (
              <div className="text-sm text-text-secondary">
                {row.original.customer.email}
              </div>
            )}
          </div>
        ),
      });
    }

    // Add project column if requested
    if (showProject && invoices.some(inv => inv.projectId)) {
      baseColumns.push({
        accessorKey: 'projectId',
        header: 'Project',
        sortable: false,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <div className="text-sm">
            {row.original.projectId ? (
              <Badge variant="secondary" size="sm">
                {row.original.projectId}
              </Badge>
            ) : (
              <span className="text-text-secondary">—</span>
            )}
          </div>
        ),
      });
    }

    // Add remaining columns
    baseColumns.push(
      {
        accessorKey: 'status',
        header: 'Status',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <StatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Amount',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <InvoiceTotalsSummary 
            invoice={row.original}
            className="text-right"
          />
        ),
      }
    );

    // Add payments column if requested
    if (showPayments) {
      baseColumns.push({
        accessorKey: 'payments',
        header: 'Payments',
        sortable: false,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <PaymentSummary
            payments={row.original.payments || []}
            currency={row.original.currency}
          />
        ),
      });
    }

    // Add dates columns
    baseColumns.push(
      {
        accessorKey: 'issuedAt',
        header: 'Issued',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <div className="text-sm">
            {formatDate(row.original.issuedAt)}
          </div>
        ),
      },
      {
        accessorKey: 'dueAt',
        header: 'Due Date',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => {
          const dueDate = row.original.dueAt;
          if (!dueDate) return <span className="text-text-secondary">—</span>;
          
          const isOverdue = new Date(dueDate) < new Date() && 
                           !['paid', 'void', 'written_off'].includes(row.original.status);
          
          return (
            <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              {formatDate(dueDate)}
              {isOverdue && (
                <div className="text-xs text-red-500">
                  Overdue
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        sortable: true,
        cell: ({ row }: { row: { original: Invoice } }) => (
          <div className="text-sm text-text-secondary">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      }
    );

    return baseColumns;
  }, [showCustomer, showProject, showPayments, invoices]);

  return (
    <DataTable
      data={invoices}
      columns={columns}
      loading={loading}
      onRowClick={handleRowClick}
      onSort={onSort}
      sortField={sortField}
      sortDirection={sortDirection}
      className={className}
      getRowClassName={(invoice: Invoice) => cn(
        'cursor-pointer hover:bg-surface-secondary transition-colors',
        getRowPriorityClass(invoice)
      )}
      emptyState={{
        title: 'No invoices found',
        description: 'Create your first invoice to get started',
        icon: '📄',
      }}
      rowProps={(invoice: Invoice) => ({
        'data-testid': `invoice-row-${invoice.id}`,
        'aria-label': `Invoice ${invoice.invoiceNumber} - ${invoice.title} - ${invoice.status}`,
      })}
    />
  );
};

/**
 * Simplified invoice table for embedded use
 */
export const InvoiceTableCompact: React.FC<{
  invoices: Invoice[];
  onRowClick?: (invoice: Invoice) => void;
  maxRows?: number;
  className?: string;
}> = ({ invoices, onRowClick, maxRows = 5, className }) => {
  const displayInvoices = invoices.slice(0, maxRows);
  
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {displayInvoices.map((invoice) => (
        <div
          key={invoice.id}
          className={cn(
            'p-3 border rounded-lg cursor-pointer hover:bg-surface-secondary transition-colors',
            getRowPriorityClass(invoice)
          )}
          onClick={() => onRowClick?.(invoice)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-primary-600">
                  {invoice.invoiceNumber}
                </span>
                <StatusBadge status={invoice.status} size="sm" />
              </div>
              <div className="text-sm text-text-secondary truncate">
                {invoice.title}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </div>
              <div className="text-sm text-text-secondary">
                Due {formatDate(invoice.dueAt)}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {invoices.length > maxRows && (
        <div className="text-center py-2">
          <span className="text-sm text-text-secondary">
            +{invoices.length - maxRows} more invoices
          </span>
        </div>
      )}
    </div>
  );
};
