import type { Meta, StoryObj } from '@storybook/react-vite';
import { SecurityAudit } from '../components/security/SecurityAudit';
import { Card } from '../components/ui/card';
import { Button } from '../components/Button';
import { Badge } from '../components/ui/badge';

const meta: Meta<typeof SecurityAudit> = {
  title: 'Security/SecurityAudit',
  component: SecurityAudit,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Security audit component for monitoring and validating security practices.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SecurityAudit>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <SecurityAudit />
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Audit Demo</h3>
        <p className="text-text-secondary mb-4">
          The SecurityAudit component monitors security practices and provides recommendations.
        </p>
        
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-800">✅ HTTPS Enforcement</h4>
              <Badge variant="success">Passed</Badge>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All connections are properly secured with HTTPS
            </p>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-800">✅ Content Security Policy</h4>
              <Badge variant="success">Passed</Badge>
            </div>
            <p className="text-sm text-green-700 mt-1">
              CSP headers are properly configured
            </p>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-yellow-800">⚠️ Dependency Vulnerabilities</h4>
              <Badge variant="warning">Review</Badge>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              2 minor vulnerabilities found in dependencies
            </p>
          </div>
          
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-red-800">❌ Security Headers</h4>
              <Badge variant="error">Failed</Badge>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Missing X-Frame-Options and X-Content-Type-Options headers
            </p>
          </div>
        </div>
      </Card>
    </div>
  ),
};

export const SecurityRecommendations: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-surface-card border rounded">
          <h4 className="font-medium text-text-primary mb-2">🔒 Authentication Security</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Implement multi-factor authentication</li>
            <li>• Use secure session management</li>
            <li>• Implement rate limiting on login attempts</li>
            <li>• Use strong password policies</li>
          </ul>
        </div>
        
        <div className="p-4 bg-surface-card border rounded">
          <h4 className="font-medium text-text-primary mb-2">🛡️ Data Protection</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Encrypt sensitive data at rest</li>
            <li>• Use HTTPS for all communications</li>
            <li>• Implement proper input validation</li>
            <li>• Use parameterized queries to prevent SQL injection</li>
          </ul>
        </div>
        
        <div className="p-4 bg-surface-card border rounded">
          <h4 className="font-medium text-text-primary mb-2">🔍 Monitoring & Logging</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Implement comprehensive audit logging</li>
            <li>• Monitor for suspicious activities</li>
            <li>• Set up security alerts</li>
            <li>• Regular security assessments</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-2">
        <Button>Run Security Scan</Button>
        <Button variant="outline">View Full Report</Button>
      </div>
    </Card>
  ),
};

export const SecurityChecklist: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Security Checklist</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input type="checkbox" checked className="rounded" />
          <span className="text-sm">HTTPS enforcement enabled</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="checkbox" checked className="rounded" />
          <span className="text-sm">Content Security Policy configured</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="checkbox" checked className="rounded" />
          <span className="text-sm">XSS protection headers set</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm">Rate limiting implemented</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm">Input validation on all forms</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="checkbox" checked className="rounded" />
          <span className="text-sm">Dependencies regularly updated</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm">Security headers audit completed</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="checkbox" checked className="rounded" />
          <span className="text-sm">Error handling doesn't expose sensitive data</span>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Progress:</strong> 5 of 8 security measures completed (62.5%)
        </p>
        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
        </div>
      </div>
    </Card>
  ),
};

export const SecurityDashboard: Story = {
  render: () => (
    <div className="space-y-6">
      <SecurityAudit />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SecurityRecommendations />
        <SecurityChecklist />
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
            <div className="text-2xl font-bold text-green-800">95%</div>
            <div className="text-sm text-green-700">Security Score</div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-center">
            <div className="text-2xl font-bold text-blue-800">12</div>
            <div className="text-sm text-blue-700">Security Tests Passed</div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-center">
            <div className="text-2xl font-bold text-yellow-800">2</div>
            <div className="text-sm text-yellow-700">Issues to Address</div>
          </div>
        </div>
      </Card>
    </div>
  ),
};
