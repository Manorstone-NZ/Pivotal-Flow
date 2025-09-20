/**
 * Organization module types
 * TypeScript interfaces for organization management
 */
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
    street?: string;
    suburb?: string;
    city?: string;
    region?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
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
    street?: string;
    suburb?: string;
    city?: string;
    region?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    contactExtras?: any;
    settings?: any;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    trialEndsAt?: string;
}
export interface CreateOrganizationData {
    name: string;
    slug?: string;
    domain?: string;
    industry?: string;
    size?: string;
    timezone?: string;
    currency?: string;
    taxId?: string;
    street?: string;
    suburb?: string;
    city?: string;
    region?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
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
    street?: string;
    suburb?: string;
    city?: string;
    region?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
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
//# sourceMappingURL=types.d.ts.map