import type { Meta, StoryObj } from '@storybook/react';
import { ProductionMonitor } from '../components/production/ProductionMonitor';
import { ErrorTracker } from '../components/production/ErrorTracker';
import { DeploymentMonitor } from '../components/production/DeploymentMonitor';
import { Card } from '../components/ui/Card';
import { useState } from 'react';

// ProductionMonitor Stories
const ProductionMonitorMeta: Meta<typeof ProductionMonitor> = {
  title: 'Production/ProductionMonitor',
  component: ProductionMonitor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real-time production monitoring component for system health, metrics, and alerts.',
      },
    },
  },
  tags: ['autodocs'],
};

export default ProductionMonitorMeta;

export const Default: StoryObj = {
  render: () => (
    <div className="w-full max-w-6xl">
      <ProductionMonitor />
    </div>
  ),
};

export const WithCallbacks: StoryObj = {
  render: () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);

    const handleMetricsUpdate = (newMetrics: any) => {
      setMetrics(newMetrics);
      console.log('Metrics updated:', newMetrics);
    };

    const handleAlert = (alert: any) => {
      setAlerts(prev => [...prev, alert]);
      console.log('New alert:', alert);
    };

    return (
      <div className="w-full max-w-6xl space-y-6">
        <ProductionMonitor 
          onMetricsUpdate={handleMetricsUpdate}
          onAlert={handleAlert}
        />
        
        {metrics && (
          <Card>
            <Card.Header>
              <Card.Title>Latest Metrics</Card.Title>
            </Card.Header>
            <Card.Content>
              <pre className="text-sm bg-gray-100 p-4 rounded">
                {JSON.stringify(metrics, null, 2)}
              </pre>
            </Card.Content>
          </Card>
        )}
        
        {alerts.length > 0 && (
          <Card>
            <Card.Header>
              <Card.Title>Recent Alerts</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {alerts.slice(-3).map((alert, index) => (
                  <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <strong>{alert.title}:</strong> {alert.message}
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    );
  },
};

export const ManualControl: StoryObj = {
  render: () => {
    const [isMonitoring, setIsMonitoring] = useState(false);

    return (
      <div className="w-full max-w-6xl">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-2">Manual Control Example</h3>
          <p className="text-sm text-gray-600 mb-2">
            This example shows how to control monitoring programmatically.
          </p>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
        <ProductionMonitor 
          autoStart={isMonitoring}
          interval={5000}
        />
      </div>
    );
  },
};

// ErrorTracker Stories
const ErrorTrackerMeta: Meta<typeof ErrorTracker> = {
  title: 'Production/ErrorTracker',
  component: ErrorTracker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Comprehensive error tracking and analysis component for production monitoring.',
      },
    },
  },
  tags: ['autodocs'],
};

export const ErrorTrackerDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-6xl">
      <ErrorTracker />
    </div>
  ),
};

export const ErrorTrackerWithCallbacks: StoryObj = {
  render: () => {
    const [errorStats, setErrorStats] = useState<any>(null);
    const [errors, setErrors] = useState<any[]>([]);

    const handleErrorStats = (stats: any) => {
      setErrorStats(stats);
      console.log('Error stats updated:', stats);
    };

    const handleErrorReport = (error: any) => {
      setErrors(prev => [...prev, error]);
      console.log('New error reported:', error);
    };

    return (
      <div className="w-full max-w-6xl space-y-6">
        <ErrorTracker 
          onErrorStats={handleErrorStats}
          onErrorReport={handleErrorReport}
        />
        
        {errorStats && (
          <Card>
            <Card.Header>
              <Card.Title>Error Statistics</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-2xl font-bold text-red-800">
                    {errorStats.totalErrors}
                  </div>
                  <div className="text-sm text-red-700">Total Errors</div>
                </div>
                <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="text-2xl font-bold text-orange-800">
                    {errorStats.errorRate}
                  </div>
                  <div className="text-sm text-orange-700">Errors/Hour</div>
                </div>
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-2xl font-bold text-green-800">
                    {errorStats.resolutionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700">Resolution Rate</div>
                </div>
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-2xl font-bold text-blue-800">
                    {Object.keys(errorStats.errorsByCategory).length}
                  </div>
                  <div className="text-sm text-blue-700">Categories</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}
        
        {errors.length > 0 && (
          <Card>
            <Card.Header>
              <Card.Title>Recent Error Reports</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {errors.slice(-3).map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="font-semibold text-red-800">{error.message}</div>
                    <div className="text-sm text-red-600">
                      {error.category} • {error.severity} • {error.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    );
  },
};

// DeploymentMonitor Stories
const DeploymentMonitorMeta: Meta<typeof DeploymentMonitor> = {
  title: 'Production/DeploymentMonitor',
  component: DeploymentMonitor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Deployment monitoring and management component for tracking releases and health.',
      },
    },
  },
  tags: ['autodocs'],
};

export const DeploymentMonitorDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-6xl">
      <DeploymentMonitor />
    </div>
  ),
};

export const DeploymentMonitorWithCallbacks: StoryObj = {
  render: () => {
    const [deploymentStats, setDeploymentStats] = useState<any>(null);
    const [deployments, setDeployments] = useState<any[]>([]);

    const handleDeploymentStats = (stats: any) => {
      setDeploymentStats(stats);
      console.log('Deployment stats updated:', stats);
    };

    const handleDeploymentUpdate = (deployment: any) => {
      setDeployments(prev => [...prev, deployment]);
      console.log('Deployment updated:', deployment);
    };

    return (
      <div className="w-full max-w-6xl space-y-6">
        <DeploymentMonitor 
          onDeploymentStats={handleDeploymentStats}
          onDeploymentUpdate={handleDeploymentUpdate}
        />
        
        {deploymentStats && (
          <Card>
            <Card.Header>
              <Card.Title>Deployment Statistics</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-2xl font-bold text-blue-800">
                    {deploymentStats.totalDeployments}
                  </div>
                  <div className="text-sm text-blue-700">Total Deployments</div>
                </div>
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-2xl font-bold text-green-800">
                    {deploymentStats.successfulDeployments}
                  </div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-2xl font-bold text-red-800">
                    {deploymentStats.failedDeployments}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="text-2xl font-bold text-purple-800">
                    {deploymentStats.currentVersion}
                  </div>
                  <div className="text-sm text-purple-700">Current Version</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}
        
        {deployments.length > 0 && (
          <Card>
            <Card.Header>
              <Card.Title>Recent Deployment Updates</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                {deployments.slice(-3).map((deployment, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-semibold text-blue-800">
                      {deployment.version} - {deployment.commitMessage}
                    </div>
                    <div className="text-sm text-blue-600">
                      {deployment.environment} • {deployment.status} • {deployment.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    );
  },
};

// Combined Production Dashboard Story
export const ProductionDashboard: StoryObj = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'monitor' | 'errors' | 'deployments'>('monitor');

    const tabs = [
      { id: 'monitor', label: 'Production Monitor', icon: '📊' },
      { id: 'errors', label: 'Error Tracking', icon: '🚨' },
      { id: 'deployments', label: 'Deployment Monitor', icon: '🚀' }
    ];

    return (
      <div className="w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Production Dashboard</h1>
          <p className="text-gray-600">Comprehensive production monitoring and management</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'monitor' && <ProductionMonitor />}
          {activeTab === 'errors' && <ErrorTracker />}
          {activeTab === 'deployments' && <DeploymentMonitor />}
        </div>
      </div>
    );
  },
};