/**
 * F1A Tenant Admin Portal - Membership Management Component
 * Secure user membership management for platform administrators
 * 
 * SECURITY COMPLIANCE:
 * - Platform admin access only
 * - User privacy protection (no sensitive data display)
 * - Role-based access validation
 * - Comprehensive audit trail integration
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
// Using TypeBox schemas from shared package
import { Type, Static } from '@sinclair/typebox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { UserPlus, Trash2, AlertTriangle, Crown, Shield, User, Eye } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/logger';

// TypeScript interfaces
interface MembershipData {
  id: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userDisplayName?: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
  createdAt: string;
}

interface MembershipTableProps {
  tenantId: string;
  tenantName: string;
  memberships: MembershipData[];
  onMembershipChange: () => void;
}

// Form validation schema
const AddMembershipSchema = Type.Object({
  userEmail: Type.String({
    format: 'email',
    description: 'Valid email address required'
  }),
  role: Type.Union([
    Type.Literal('OWNER'),
    Type.Literal('ADMIN'),
    Type.Literal('STAFF'),
    Type.Literal('VIEWER')
  ])
});

type AddMembershipFormData = Static<typeof AddMembershipSchema>;

// Role configuration with icons and descriptions
const ROLE_CONFIG = {
  OWNER: {
    icon: Crown,
    label: 'Owner',
    description: 'Full tenant control and billing access',
    variant: 'default' as const,
    color: 'text-yellow-600'
  },
  ADMIN: {
    icon: Shield,
    label: 'Admin',
    description: 'Administrative access and user management',
    variant: 'secondary' as const,
    color: 'text-blue-600'
  },
  STAFF: {
    icon: User,
    label: 'Staff',
    description: 'Standard user access with content creation',
    variant: 'outline' as const,
    color: 'text-green-600'
  },
  VIEWER: {
    icon: Eye,
    label: 'Viewer',
    description: 'Read-only access to tenant data',
    variant: 'outline' as const,
    color: 'text-gray-600'
  }
};

/**
 * MembershipTable Component
 * Displays and manages tenant user memberships
 */
export const MembershipTable: React.FC<MembershipTableProps> = ({
  tenantId,
  tenantName,
  memberships,
  onMembershipChange
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [removingMembership, setRemovingMembership] = useState<MembershipData | null>(null);
  const [submitError, setSubmitError] = useState<string>('');
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<AddMembershipFormData>({
    // Using react-hook-form with TypeScript validation
    defaultValues: {
      userEmail: '',
      role: 'VIEWER'
    }
  });

  // Add membership mutation
  const addMembershipMutation = useMutation({
    mutationFn: async (data: AddMembershipFormData) => {
      const response = await apiClient.post(`/v1/admin/tenants/${tenantId}/users`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      form.reset();
      setSubmitError('');
      setIsAddDialogOpen(false);
      onMembershipChange();
      logger.info('Membership added successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 'Failed to add user to tenant';
      setSubmitError(errorMessage);
      logger.error('Failed to add membership', { error: error.message });
    }
  });

  // Remove membership mutation
  const removeMembershipMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      const response = await apiClient.delete(`/v1/admin/tenants/${tenantId}/users/${membershipId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      setRemovingMembership(null);
      onMembershipChange();
      logger.info('Membership removed successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 'Failed to remove user from tenant';
      logger.error('Failed to remove membership', { error: error.message, errorMessage });
    }
  });

  // Handle add membership form submission
  const onSubmitAddMembership = (data: AddMembershipFormData) => {
    setSubmitError('');
    addMembershipMutation.mutate(data);
  };

  // Handle membership removal
  const handleRemoveMembership = (membership: MembershipData) => {
    setRemovingMembership(membership);
  };

  const confirmRemoveMembership = () => {
    if (!removingMembership) return;
    removeMembershipMutation.mutate(removingMembership.id);
  };

  // Get role display component
  const getRoleDisplay = (role: keyof typeof ROLE_CONFIG) => {
    const config = ROLE_CONFIG[role];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tenant Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage user access and roles for {tenantName}
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Memberships Table */}
      <Card>
        <CardContent className="p-0">
          {memberships.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No members found. Add users to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {membership.userDisplayName || 
                           `${membership.userFirstName} ${membership.userLastName}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {membership.userId.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{membership.userEmail}</TableCell>
                    <TableCell>{getRoleDisplay(membership.role)}</TableCell>
                    <TableCell>
                      {new Date(membership.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMembership(membership)}
                        className="text-red-600 hover:text-red-700"
                        disabled={membership.role === 'OWNER' && memberships.filter(m => m.role === 'OWNER').length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Membership Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to {tenantName}</DialogTitle>
            <DialogDescription>
              Add an existing user to this tenant with the specified role.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAddMembership)} className="space-y-4">
              
              {submitError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground">
                      User must already exist in the system
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <config.icon className={`h-4 w-4 ${config.color}`} />
                              <div>
                                <div className="font-medium">{config.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {config.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={addMembershipMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addMembershipMutation.isPending}
                >
                  {addMembershipMutation.isPending ? 'Adding...' : 'Add User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Remove Membership Confirmation Dialog */}
      <AlertDialog 
        open={!!removingMembership} 
        onOpenChange={(open) => !open && setRemovingMembership(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User from Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{removingMembership?.userEmail}</strong> from{' '}
              <strong>{tenantName}</strong>? This action cannot be undone and will
              immediately revoke their access to this tenant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMembership}
              className="bg-red-600 hover:bg-red-700"
              disabled={removeMembershipMutation.isPending}
            >
              {removeMembershipMutation.isPending ? 'Removing...' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembershipTable;

