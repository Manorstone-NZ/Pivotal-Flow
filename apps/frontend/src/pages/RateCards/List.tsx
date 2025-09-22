/**
 * F2 Rate Cards List Page
 * Displays and manages service rate cards
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { RateCardCreateDialog } from '../../components/rate-cards/RateCardCreateDialog';
import { RateCardEditDialog } from '../../components/rate-cards/RateCardEditDialog';
import { useTenantId } from '../../features/tenancy/context';

interface RateCard {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  isActive: boolean;
  services?: Array<{
    id: string;
    name: string;
    unitOfMeasure: 'hour' | 'day' | 'fixed';
    buyPrice: string;
    sellPrice: string;
    taxClass: string;
    isActive: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

// The API returns an array directly, not an object with rateCards property
type RateCardListResponse = RateCard[];

export function RateCardsList() {
  const tenantId = useTenantId();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRateCard, setEditingRateCard] = useState<RateCard | null>(null);

  // Fetch rate cards
  const { data, isLoading, error, refetch } = useQuery<RateCardListResponse>({
    queryKey: ['rateCards', tenantId, page, limit, search, isActiveFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(isActiveFilter !== undefined && { isActive: isActiveFilter.toString() })
      });

      const response = await fetch(`http://localhost:3000/api/v1/rate-cards?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rate cards');
      }

      return response.json();
    },
    enabled: !!tenantId
  });

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingRateCard(null);
    refetch();
  };

  const handleDelete = async (rateCardId: string) => {
    if (!confirm('Are you sure you want to delete this rate card?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/rate-cards/${rateCardId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete rate card');
      }

      refetch();
    } catch (error) {
      alert('Failed to delete rate card');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Rate Cards</h3>
          <p className="text-gray-500 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Cards</h1>
          <p className="text-muted-foreground">
            Manage service rate cards and pricing
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rate Card
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Search and filter rate cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search rate cards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setIsActiveFilter(undefined);
                  } else {
                    setIsActiveFilter(value === 'active');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="limit" className="text-sm font-medium">
                Per Page
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Cards</CardTitle>
          <CardDescription>
            {data ? `${data.length} rate card${data.length !== 1 ? 's' : ''} found` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : data?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rate Cards</h3>
              <p className="text-gray-500 mb-4">
                {search || isActiveFilter !== undefined 
                  ? 'No rate cards match your current filters.'
                  : 'Get started by creating your first rate card.'
                }
              </p>
              {!search && isActiveFilter === undefined && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rate Card
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((rateCard) => (
                    <TableRow key={rateCard.id}>
                      <TableCell className="font-medium">
                        {rateCard.name}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {rateCard.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {rateCard.services?.length || 0}
                          </span>
                          <span className="text-sm text-gray-500">
                            service{(rateCard.services?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rateCard.currency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rateCard.isActive ? 'default' : 'secondary'}>
                          {rateCard.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(rateCard.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingRateCard(rateCard)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(rateCard.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination - TODO: Implement when backend supports pagination */}
              {data && data.length > limit && (
                <div className="flex items-center justify-center">
                  <div className="text-sm text-gray-500">
                    Showing {data.length} rate cards (pagination not yet implemented)
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RateCardCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {editingRateCard && (
        <RateCardEditDialog
          rateCard={editingRateCard}
          open={!!editingRateCard}
          onOpenChange={(open) => !open && setEditingRateCard(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}