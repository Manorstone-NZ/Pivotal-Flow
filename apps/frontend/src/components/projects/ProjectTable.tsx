/**
 * ProjectTable Component
 * Displays projects in a data table with sorting, filtering, and accessibility features
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { StatusChip } from './StatusChip';
import type { Project, ProjectFilters } from '../../features/projects/types';

interface ProjectTableProps {
  projects: Project[];
  filters: ProjectFilters;
  onSort: (field: string) => void;
  onProjectClick: (project: Project) => void;
  isLoading?: boolean;
  className?: string;
}

interface SortableHeaderProps {
  field: string;
  label: string;
  currentSort: string | undefined;
  sortOrder: 'asc' | 'desc' | undefined;
  onSort: (field: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  currentSort,
  sortOrder,
  onSort
}) => {
  const isActive = currentSort === field;
  
  const handleClick = () => {
    onSort(field);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="columnheader"
      aria-sort={isActive ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
      aria-label={`Sort by ${label}`}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive && (
          <span className="text-xs" aria-hidden="true">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
};

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  filters,
  onSort,
  onProjectClick,
  isLoading = false,
  className
}) => {
  const handleProjectClick = (project: Project) => {
    onProjectClick(project);
  };

  const handleProjectKeyDown = (event: React.KeyboardEvent, project: Project) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleProjectClick(project);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('bg-surface-card rounded-lg border border-surface-border overflow-hidden', className)}>
        <div className="animate-pulse">
          <div className="px-6 py-3 bg-surface-header border-b border-surface-border">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 h-4 bg-surface-border rounded"></div>
              <div className="col-span-2 h-4 bg-surface-border rounded"></div>
              <div className="col-span-2 h-4 bg-surface-border rounded"></div>
              <div className="col-span-2 h-4 bg-surface-border rounded"></div>
              <div className="col-span-2 h-4 bg-surface-border rounded"></div>
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-surface-border">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 h-4 bg-surface-border rounded"></div>
                <div className="col-span-2 h-4 bg-surface-border rounded"></div>
                <div className="col-span-2 h-4 bg-surface-border rounded"></div>
                <div className="col-span-2 h-4 bg-surface-border rounded"></div>
                <div className="col-span-2 h-4 bg-surface-border rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-surface-card rounded-lg border border-surface-border overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-border" role="table" aria-label="Projects table">
          <thead className="bg-surface-header">
            <tr role="row">
              <SortableHeader
                field="name"
                label="Name"
                currentSort={filters.sort}
                sortOrder={filters.sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                field="status"
                label="Status"
                currentSort={filters.sort}
                sortOrder={filters.sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                field="startDate"
                label="Start Date"
                currentSort={filters.sort}
                sortOrder={filters.sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                field="endDate"
                label="End Date"
                currentSort={filters.sort}
                sortOrder={filters.sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                field="createdAt"
                label="Created"
                currentSort={filters.sort}
                sortOrder={filters.sortOrder}
                onSort={onSort}
              />
            </tr>
          </thead>
          <tbody className="bg-surface-card divide-y divide-surface-border" role="rowgroup">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-surface-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-inset"
                onClick={() => handleProjectClick(project)}
                onKeyDown={(e) => handleProjectKeyDown(e, project)}
                tabIndex={0}
                role="row"
                aria-label={`Project ${project.name}, status ${project.status}`}
              >
                <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-text-primary truncate max-w-xs">
                      {project.name}
                    </div>
                    {project.code && (
                      <div className="text-sm text-text-secondary truncate max-w-xs">
                        {project.code}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" role="gridcell">
                  <StatusChip status={project.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary" role="gridcell">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary" role="gridcell">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary" role="gridcell">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

