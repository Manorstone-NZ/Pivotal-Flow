/**
 * Performance Optimizations for Projects
 * Additional performance enhancements for the Projects UI
 */

import { memo, useMemo, useCallback } from 'react';
import { ProjectTable } from './ProjectTable';
import { ProjectCard } from './ProjectCard';
import { StatusChip } from './StatusChip';
import type { Project, ProjectFilters } from '../../features/projects/types';

// Memoized ProjectTable to prevent unnecessary re-renders
export const MemoizedProjectTable = memo(ProjectTable) as typeof ProjectTable;

// Memoized ProjectCard to prevent unnecessary re-renders
export const MemoizedProjectCard = memo(ProjectCard) as typeof ProjectCard;

// Memoized StatusChip to prevent unnecessary re-renders
export const MemoizedStatusChip = memo(StatusChip) as typeof StatusChip;

// Hook for optimized project filtering
export const useOptimizedProjects = (projects: Project[], filters: ProjectFilters) => {
  return useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.code?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Apply sorting
    if (filters.sort) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[filters.sort as keyof Project];
        const bValue = b[filters.sort as keyof Project];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'desc' 
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return filters.sortOrder === 'desc'
            ? bValue.getTime() - aValue.getTime()
            : aValue.getTime() - bValue.getTime();
        }
        
        return 0;
      });
    }

    return filtered;
  }, [projects, filters]);
};

// Hook for optimized pagination
export const useOptimizedPagination = (projects: Project[], page: number, size: number) => {
  return useMemo(() => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return projects.slice(startIndex, endIndex);
  }, [projects, page, size]);
};

// Optimized project click handler
export const useOptimizedProjectClick = (onProjectClick: (project: Project) => void) => {
  return useCallback((project: Project) => {
    onProjectClick(project);
  }, [onProjectClick]);
};

// Optimized sort handler
export const useOptimizedSort = (onSort: (field: string) => void) => {
  return useCallback((field: string) => {
    onSort(field);
  }, [onSort]);
};
