/**
 * Projects List Page
 * Displays a table of projects with search, filters, and pagination
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../features/projects/api';
import type { ProjectFilters } from '../../features/projects/types';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/input';
import { MemoizedProjectTable } from '../../components/projects/optimizations';
import { ProjectCreateDialog } from '../../components/projects/ProjectCreateDialog';

// Empty state component
const EmptyState: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => (
  <div className="text-center py-12" role="region" aria-labelledby="empty-state-heading">
    <svg className="mx-auto h-12 w-12 text-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
    <h3 id="empty-state-heading" className="mt-2 text-sm font-medium text-text-primary">No projects</h3>
    <p className="mt-1 text-sm text-text-secondary">Get started by creating a new project.</p>
    <div className="mt-6">
      <Button className="bg-primary-600 text-white hover:bg-primary-700" aria-describedby="empty-state-heading" onClick={onCreateClick}>
        Create Project
      </Button>
    </div>
  </div>
);


export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    size: 25,
    sort: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, error } = useProjects(filters);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1, // Reset to first page on search
    }));
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status as any,
      page: 1,
    }));
  }, []);

  const handleOwnerFilter = useCallback((ownerId: string) => {
    setFilters(prev => ({
      ...prev,
      ownerId: ownerId || undefined,
      page: 1,
    }) as ProjectFilters);
  }, []);

  const handleCustomerFilter = useCallback((customerId: string) => {
    setFilters(prev => ({
      ...prev,
      customerId: customerId || undefined,
      page: 1,
    }) as ProjectFilters);
  }, []);


  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleSort = useCallback((field: string) => {
    setFilters(prev => ({
      ...prev,
      sort: field as any,
      sortOrder: prev.sort === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleProjectClick = useCallback((project: any) => {
    navigate(`/projects/${project.id}`);
  }, [navigate]);

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    // The useCreateProject mutation will automatically invalidate the projects list
    setIsCreateDialogOpen(false);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Error Loading Projects</h2>
        <p className="text-text-secondary mb-6">There was a problem loading the projects. Please try again.</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Projects</h1>
        <p className="text-text-secondary mt-2">Manage and track your projects</p>
      </header>

      {/* Filters and Search */}
      <section className="bg-surface-card rounded-lg border border-surface-border p-4 mb-4" aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">Search and Filter Projects</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="project-search" className="sr-only">Search projects</label>
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Type to search for projects by name or description
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-surface-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-surface-card text-text-primary"
              aria-label="Filter projects by status"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <label htmlFor="owner-filter" className="sr-only">Filter by owner</label>
            <select
              id="owner-filter"
              value={filters.ownerId || ''}
              onChange={(e) => handleOwnerFilter(e.target.value)}
              className="px-3 py-2 border border-surface-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-surface-card text-text-primary"
              aria-label="Filter projects by owner"
            >
              <option value="">All Owners</option>
              <option value="user-admin">Admin User</option>
            </select>

            <label htmlFor="customer-filter" className="sr-only">Filter by customer</label>
            <select
              id="customer-filter"
              value={filters.customerId || ''}
              onChange={(e) => handleCustomerFilter(e.target.value)}
              className="px-3 py-2 border border-surface-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary bg-surface-card text-text-primary"
              aria-label="Filter projects by customer"
            >
              <option value="">All Customers</option>
              <option value="customer-1">Sample Customer</option>
            </select>

            <Button className="bg-primary-600 text-white hover:bg-primary-700" aria-label="Create a new project" onClick={handleCreateClick}>
              Create Project
            </Button>
          </div>
        </div>
      </section>

      {/* Projects Table */}
      {!data?.data.length && !isLoading ? (
        <EmptyState onCreateClick={handleCreateClick} />
      ) : (
        <>
          <MemoizedProjectTable
            projects={data?.data || []}
            filters={filters}
            onSort={handleSort}
            onProjectClick={handleProjectClick}
            isLoading={isLoading}
          />
          
          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <nav className="bg-surface-card rounded-lg border border-surface-border px-6 py-3 mt-4" aria-label="Projects pagination">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary" aria-live="polite">
                  Showing {((data.meta.page - 1) * data.meta.size) + 1} to{' '}
                  {Math.min(data.meta.page * data.meta.size, data.meta.total)} of{' '}
                  {data.meta.total} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!data.meta.hasPrev}
                    onClick={() => handlePageChange(data.meta.page - 1)}
                    aria-label={`Go to page ${data.meta.page - 1}`}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!data.meta.hasNext}
                    onClick={() => handlePageChange(data.meta.page + 1)}
                    aria-label={`Go to page ${data.meta.page + 1}`}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </nav>
          )}
        </>
      )}

      {/* Create Dialog */}
      <ProjectCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
