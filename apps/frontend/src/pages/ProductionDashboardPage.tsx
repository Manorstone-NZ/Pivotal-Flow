import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/Button';
import { 
  ProductionMonitor, 
  ErrorTracker, 
  DeploymentMonitor
} from '../components/production';
import { ErrorBoundary } from '../components/performance/ErrorBoundary';
import { PerformanceMarks } from '../components/performance/PerformanceMarks';

export const ProductionDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'errors' | 'deployments'>('monitor');
  const [metrics, setMetrics] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [deploymentStats, setDeploymentStats] = useState<any>(null);

  const handleMetricsUpdate = (newMetrics: any) => {
    setMetrics(newMetrics);
  };

  const handleErrorStats = (newStats: any) => {
    setErrorStats(newStats);
  };

  const handleDeploymentStats = (newStats: any) => {
    setDeploymentStats(newStats);
  };

  const handleErrorReport = (error: any) => {
    console.log('New error reported:', error);
    // Here you would typically send to error tracking service
  };

  const handleDeploymentUpdate = (deployment: any) => {
    console.log('Deployment updated:', deployment);
    // Here you would typically update deployment tracking
  };

  const tabs = [
    { id: 'monitor', label: 'Production Monitor', icon: '📊' },
    { id: 'errors', label: 'Error Tracking', icon: '🚨' },
    { id: 'deployments', label: 'Deployment Monitor', icon: '🚀' }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface-background">
        <PerformanceMarks routeName="production-dashboard">
          <div className="max-w-7xl mx-auto p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Production Dashboard
              </h1>
              <p className="text-text-secondary">
                Comprehensive production monitoring, error tracking, and deployment management
              </p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">System Health</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {metrics?.errorRate && metrics.errorRate < 2 ? 'Healthy' : 'Degraded'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💚</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Active Errors</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {errorStats?.totalErrors || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🚨</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Current Version</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {deploymentStats?.currentVersion || 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Uptime</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {metrics?.uptime ? `${Math.floor(metrics.uptime / 3600)}h` : 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⏱️</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tab Navigation */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="flex border-b">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-brand-primary text-brand-primary'
                          : 'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'monitor' && (
                <ProductionMonitor 
                  onMetricsUpdate={handleMetricsUpdate}
                  autoStart={true}
                />
              )}

              {activeTab === 'errors' && (
                <ErrorTracker 
                  onErrorStats={handleErrorStats}
                  onErrorReport={handleErrorReport}
                  autoStart={true}
                />
              )}

              {activeTab === 'deployments' && (
                <DeploymentMonitor 
                  onDeploymentStats={handleDeploymentStats}
                  onDeploymentUpdate={handleDeploymentUpdate}
                  autoStart={true}
                />
              )}
            </div>

            {/* Production Best Practices */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Production Best Practices</CardTitle>
                <CardDescription>
                  Key principles for maintaining production systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">📊</span>
                      <h3 className="font-semibold">Monitoring</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Real-time metrics tracking</li>
                      <li>• Automated alerting</li>
                      <li>• Performance monitoring</li>
                      <li>• Health check endpoints</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🚨</span>
                      <h3 className="font-semibold">Error Handling</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Comprehensive error tracking</li>
                      <li>• Automated error reporting</li>
                      <li>• Error categorization</li>
                      <li>• Resolution workflows</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🚀</span>
                      <h3 className="font-semibold">Deployment</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Automated deployments</li>
                      <li>• Blue-green deployments</li>
                      <li>• Rollback capabilities</li>
                      <li>• Environment management</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🔒</span>
                      <h3 className="font-semibold">Security</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Security monitoring</li>
                      <li>• Access controls</li>
                      <li>• Vulnerability scanning</li>
                      <li>• Incident response</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">📈</span>
                      <h3 className="font-semibold">Performance</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Core Web Vitals</li>
                      <li>• Resource optimization</li>
                      <li>• Caching strategies</li>
                      <li>• Load balancing</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🔄</span>
                      <h3 className="font-semibold">Reliability</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• High availability</li>
                      <li>• Disaster recovery</li>
                      <li>• Backup strategies</li>
                      <li>• SLA monitoring</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common production management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => setActiveTab('monitor')}>
                    View System Health
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('errors')}>
                    Check Error Reports
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('deployments')}>
                    Monitor Deployments
                  </Button>
                  <Button variant="outline" onClick={() => window.open('https://docs.example.com/production', '_blank')}>
                    Production Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PerformanceMarks>
      </div>
    </ErrorBoundary>
  );
};
