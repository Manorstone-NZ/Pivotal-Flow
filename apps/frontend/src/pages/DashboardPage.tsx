import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../features/auth/store';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Welcome back, {user?.name || user?.email}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">Create Quote</Button>
            <Button className="w-full" variant="outline">View Rate Cards</Button>
            <Button className="w-full" variant="outline">Manage Users</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">No recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-text-secondary">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Name</label>
              <p className="text-text-secondary">{user?.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Email</label>
              <p className="text-text-secondary">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Organization</label>
              <p className="text-text-secondary">{user?.organizationId || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Permissions</label>
              <p className="text-text-secondary">
                {user?.permissions?.length || 0} permissions assigned
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
