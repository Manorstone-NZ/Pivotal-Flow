// Prisma types for backend use

export interface UserWhereInput {
  organizationId?: string;
  deletedAt?: null;
  status?: 'active' | 'inactive';
  OR?: Array<{
    email?: { contains: string; mode: 'insensitive' };
    displayName?: { contains: string; mode: 'insensitive' };
  }>;
  userRoles?: {
    some: {
      roleId: string;
      isActive: boolean;
      role: { isActive: boolean };
    };
  };
}

export interface UserOrderByWithRelationInput {
  email?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
}

export interface UserUpdateInput {
  email?: string;
  displayName?: string;
  status?: 'active' | 'inactive';
  mfaEnabled?: boolean;
  updatedAt?: Date;
}
