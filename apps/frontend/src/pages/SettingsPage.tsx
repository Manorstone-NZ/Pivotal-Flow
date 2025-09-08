import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              defaultValue="John Doe"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              defaultValue="john.doe@company.com"
            />
            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              defaultValue="+1 (555) 123-4567"
            />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your application experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Default Currency</label>
              <Select
                options={[
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'EUR', label: 'Euro (€)' },
                  { value: 'GBP', label: 'British Pound (£)' },
                ]}
                defaultValue="USD"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Time Zone</label>
              <Select
                options={[
                  { value: 'UTC', label: 'UTC' },
                  { value: 'EST', label: 'Eastern Time' },
                  { value: 'PST', label: 'Pacific Time' },
                ]}
                defaultValue="EST"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Notifications</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <Toggle defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS notifications</span>
                  <Toggle />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push notifications</span>
                  <Toggle defaultChecked />
                </div>
              </div>
            </div>

            <Button>Save Preferences</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Current Password</label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">New Password</label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Confirm Password</label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button>Change Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <CardDescription>
              Manage your API keys and integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">API Key</label>
              <div className="flex space-x-2">
                <Input
                  value="pk_live_51H..."
                  readOnly
                  className="font-mono text-sm"
                />
                <Button size="sm" variant="outline">Copy</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Webhook URL</label>
              <Input
                placeholder="https://your-domain.com/webhook"
                defaultValue="https://api.pivotalflow.com/webhook"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">Regenerate Key</Button>
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
