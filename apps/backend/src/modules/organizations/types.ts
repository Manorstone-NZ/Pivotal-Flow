/**
 * Organization module types
 * TypeScript interfaces for organization management
 */

// Core organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  industry?: string;
  size?: string;
  timezone: string;
  currency: string;
  taxId?: string;
  // Address fields
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  // Contact fields
  phone?: string;
  email?: string;
  website?: string;
  // Metadata
  contactExtras?: any;
  settings: any;
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NewOrganization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  industry?: string;
  size?: string;
  timezone?: string;
  currency?: string;
  taxId?: string;
  // Address fields
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  // Contact fields
  phone?: string;
  email?: string;
  website?: string;
  // Metadata
  contactExtras?: any;
  settings?: any;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string;
}

// API DTOs
export interface CreateOrganizationData {
  name: string;
  slug?: string;
  domain?: string;
  industry?: string;
  size?: string;
  timezone?: string;
  currency?: string;
  taxId?: string;
  // Address
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  // Settings
  settings?: any;
  subscriptionPlan?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  domain?: string;
  industry?: string;
  size?: string;
  timezone?: string;
  currency?: string;
  taxId?: string;
  // Address
  street?: string;
  suburb?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  // Contact
  phone?: string;
  email?: string;
  website?: string;
  // Settings
  settings?: any;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

export interface InviteUserData {
  email: string;
  roleIds: string[];
  firstName?: string;
  lastName?: string;
}

export interface OrganizationSettings {
  [key: string]: any;
}

// Filter and pagination types
export interface OrganizationFilters {
  search?: string;
  industry?: string;
  size?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Response types
export interface OrganizationListResponse {
  data: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrganizationDetailResponse {
  data: Organization;
}

export interface OrganizationSettingsResponse {
  data: OrganizationSettings;
}

