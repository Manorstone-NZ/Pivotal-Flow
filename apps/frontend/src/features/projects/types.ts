/**
 * Projects API Types and Interfaces
 * Type-safe interfaces for projects API integration
 */

// Project status enum
export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled';

// Project filters interface
export interface ProjectFilters {
  page?: number;
  size?: number;
  sort?: 'name' | 'status' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: ProjectStatus;
  customerId?: string;
  ownerId?: string;
  serviceCategoryId?: string;
}

// Project interface
export interface Project {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  description: string | null;
  status: ProjectStatus;
  ownerId: string | null;
  startDate: string | null;
  endDate: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Project with relations interface
export interface ProjectWithRelations extends Project {
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceCategories?: Array<{
    id: string;
    name: string;
    code: string | null;
  }>;
}

// Pagination metadata interface
export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Projects list response interface
export interface ProjectsListResponse {
  data: Project[];
  meta: PaginationMeta;
}

// Project detail response interface
export interface ProjectDetailResponse extends ProjectWithRelations {}

// Create project interface
export interface CreateProject {
  name: string;
  code?: string;
  description?: string;
  status?: ProjectStatus;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

// Update project interface
export interface UpdateProject {
  name?: string;
  code?: string;
  description?: string;
  status?: ProjectStatus;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

// API error interface
export interface ProjectError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

