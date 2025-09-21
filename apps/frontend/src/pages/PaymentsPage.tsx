import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/Button';

export const PaymentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Payments</h1>
          <p className="text-text-secondary">Track and manage payment transactions</p>
        </div>
        <Button>Record Payment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$45,250</div>
            <p className="text-sm text-text-secondary">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">$8,500</div>
            <p className="text-sm text-text-secondary">3 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$2,100</div>
            <p className="text-sm text-text-secondary">2 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$12,800</div>
            <p className="text-sm text-text-secondary">5 payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Latest payment transactions and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Acme Corp - Website Project</h4>
                <p className="text-sm text-text-secondary">Invoice #INV-001</p>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">$15,000</div>
                <p className="text-sm text-text-secondary">Jan 15, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">TechStart Inc - Mobile App</h4>
                <p className="text-sm text-text-secondary">Invoice #INV-002</p>
              </div>
              <div className="text-right">
                <div className="font-medium text-yellow-600">$8,500</div>
                <p className="text-sm text-text-secondary">Jan 14, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Global Solutions - API</h4>
                <p className="text-sm text-text-secondary">Invoice #INV-003</p>
              </div>
              <div className="text-right">
                <div className="font-medium text-red-600">$2,100</div>
                <p className="text-sm text-text-secondary">Jan 10, 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
