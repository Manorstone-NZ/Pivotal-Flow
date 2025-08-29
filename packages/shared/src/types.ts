// Common types used across the application

// Note: Most types are now defined in validation.ts using Zod schemas
// This file contains only types that are not Zod-based

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
