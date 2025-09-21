import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/Button';

export const RateCardsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Rate Cards</h1>
          <p className="text-text-secondary">Manage your pricing and rate structures</p>
        </div>
        <Button>Create Rate Card</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Standard Rates</CardTitle>
            <CardDescription>Default hourly rates for common services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Development</span>
                <span className="font-medium">$150/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Design</span>
                <span className="font-medium">$120/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Consulting</span>
                <span className="font-medium">$200/hr</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Premium Rates</CardTitle>
            <CardDescription>Higher rates for specialized services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Architecture</span>
                <span className="font-medium">$250/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Security</span>
                <span className="font-medium">$300/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">DevOps</span>
                <span className="font-medium">$180/hr</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Deals</CardTitle>
            <CardDescription>Fixed-price packages for common projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Landing Page</span>
                <span className="font-medium">$2,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">E-commerce</span>
                <span className="font-medium">$8,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Mobile App</span>
                <span className="font-medium">$15,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
