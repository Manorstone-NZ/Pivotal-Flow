/**
 * Users List Screen - E4 SDK Integration Example
 * Demonstrates search, sort, pagination, and column preferences
 */

import React, { useState, useMemo } from 'react';
import { useUsersList, useCreateUser } from '@/lib/api/queries';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
}

interface ColumnPreferences {
  email: boolean;
  name: boolean;
  role: boolean;
  status: boolean;
  createdAt: boolean;
  lastLoginAt: boolean;
}

const defaultColumnPreferences: ColumnPreferences = {
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
  lastLoginAt: true,
};

export const UsersListScreen: React.FC = () => {
  const { success, error: showError } = useToast();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [columnPreferences, setColumnPreferences] = useState<ColumnPreferences>(defaultColumnPreferences);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  // API queries
  const { data: usersData, isLoading, error } = useUsersList({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    sort: sortBy,
    order: sortOrder,
    page,
    limit: pageSize,
  });

  const createUserMutation = useCreateUser();

  // Computed values
  const users = usersData?.data || [];
  const pagination = usersData?.pagination;
  const totalUsers = pagination?.total || 0;

  // Column definitions
  const columns = useMemo(() => {
    const cols = [
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }: { row: { original: User } }) => (
          <div className="font-medium text-text-primary">
            {row.original.email}
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }: { row: { original: User } }) => (
          <div className="text-text-primary">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }: { row: { original: User } }) => (
          <Badge variant="secondary" className="text-xs">
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: { row: { original: User } }) => {
          const status = row.original.status;
          const variant = status === 'active' ? 'success' : 
                         status === 'inactive' ? 'error' : 'warning';
          return (
            <Badge variant={variant} className="text-xs">
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }: { row: { original: User } }) => (
          <div className="text-text-secondary text-sm">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: 'lastLoginAt',
        header: 'Last Login',
        cell: ({ row }: { row: { original: User } }) => (
          <div className="text-text-secondary text-sm">
            {row.original.lastLoginAt 
              ? new Date(row.original.lastLoginAt).toLocaleDateString()
              : 'Never'
            }
          </div>
        ),
      },
    ];

    // Filter columns based on preferences
    return cols.filter(col => columnPreferences[col.accessorKey as keyof ColumnPreferences]);
  }, [columnPreferences]);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string | number) => {
    setStatusFilter(String(value));
    setPage(1);
  };

  const handleRoleFilter = (value: string | number) => {
    setRoleFilter(String(value));
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string | number) => {
    const size = typeof newPageSize === 'string' ? parseInt(newPageSize, 10) : newPageSize;
    setPageSize(size);
    setPage(1);
  };

  const handleColumnToggle = (column: keyof ColumnPreferences) => {
    setColumnPreferences(prev => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
        status: 'pending',
      });
      success('User created successfully');
    } catch (err) {
      showError('Failed to create user');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Error Loading Users
            </h2>
            <p className="text-text-secondary mb-4">
              {error.message || 'An error occurred while loading users'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            Columns
          </Button>
          <Button onClick={handleCreateUser}>
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                label="Search"
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onChange={handleStatusFilter}
                label="Status"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
            </div>
            <div>
              <Select
                value={roleFilter}
                onChange={handleRoleFilter}
                label="Role"
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'user', label: 'User' },
                ]}
              />
            </div>
            <div>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                label="Page Size"
                options={[
                  { value: 10, label: '10 per page' },
                  { value: 25, label: '25 per page' },
                  { value: 50, label: '50 per page' },
                  { value: 100, label: '100 per page' },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Settings */}
      {showColumnSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Column Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(columnPreferences).map(([column, visible]) => (
                <label key={column} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => handleColumnToggle(column as keyof ColumnPreferences)}
                    className="rounded border-surface-border"
                  />
                  <span className="text-sm text-text-primary capitalize">
                    {column.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={users}
            columns={columns}
            isLoading={isLoading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalUsers)} of {totalUsers} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <span className="text-sm text-text-primary">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
