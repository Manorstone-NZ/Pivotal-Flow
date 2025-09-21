import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/Button';
import { 
  PerformanceMonitor, 
  PerformanceOptimizer, 
  BundleAnalyzer,
  ErrorBoundary,
  PerformanceMarks
} from '../components/performance';

export const PerformanceDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'optimizer' | 'bundle'>('monitor');
  const [metrics, setMetrics] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleMetricsUpdate = (newMetrics: any) => {
    setMetrics(newMetrics);
  };

  const handleAnalysisComplete = (newAnalysis: any) => {
    setAnalysis(newAnalysis);
  };

  const handleOptimizationSelect = (optimization: any) => {
    console.log('Selected optimization:', optimization);
    // Here you would typically implement the optimization
  };

  const tabs = [
    { id: 'monitor', label: 'Performance Monitor', icon: '📊' },
    { id: 'optimizer', label: 'Optimization Recommendations', icon: '⚡' },
    { id: 'bundle', label: 'Bundle Analysis', icon: '📦' }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface-background">
        <PerformanceMarks routeName="performance-dashboard">
          <div className="max-w-7xl mx-auto p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Performance Dashboard
              </h1>
              <p className="text-text-secondary">
                Comprehensive performance monitoring, optimization, and analysis tools
              </p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Performance Score</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {metrics?.score || 0}/100
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">LCP</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {metrics?.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Bundle Size</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {analysis?.totalSize ? `${Math.round(analysis.totalSize / 1024)}KB` : 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Optimizations</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {analysis?.recommendations?.length || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔧</span>
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
                <PerformanceMonitor 
                  onMetricsUpdate={handleMetricsUpdate}
                  autoStart={true}
                />
              )}

              {activeTab === 'optimizer' && (
                <PerformanceOptimizer 
                  onOptimizationSelect={handleOptimizationSelect}
                />
              )}

              {activeTab === 'bundle' && (
                <BundleAnalyzer 
                  onAnalysisComplete={handleAnalysisComplete}
                />
              )}
            </div>

            {/* Performance Tips */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Performance Best Practices</CardTitle>
                <CardDescription>
                  Key principles for maintaining optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">⚡</span>
                      <h3 className="font-semibold">Core Web Vitals</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• LCP &lt; 2.5s</li>
                      <li>• FID &lt; 100ms</li>
                      <li>• CLS &lt; 0.1</li>
                      <li>• Monitor continuously</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">📦</span>
                      <h3 className="font-semibold">Bundle Optimization</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Code splitting</li>
                      <li>• Tree shaking</li>
                      <li>• Compression</li>
                      <li>• Remove duplicates</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🖼️</span>
                      <h3 className="font-semibold">Asset Optimization</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• WebP images</li>
                      <li>• Lazy loading</li>
                      <li>• Responsive images</li>
                      <li>• CDN delivery</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🎨</span>
                      <h3 className="font-semibold">Rendering</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• React.memo</li>
                      <li>• useMemo/useCallback</li>
                      <li>• Virtual scrolling</li>
                      <li>• Avoid unnecessary re-renders</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🌐</span>
                      <h3 className="font-semibold">Network</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• HTTP/2</li>
                      <li>• Resource hints</li>
                      <li>• Request deduplication</li>
                      <li>• Caching strategies</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">🔍</span>
                      <h3 className="font-semibold">Monitoring</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• Real User Monitoring</li>
                      <li>• Performance budgets</li>
                      <li>• Automated testing</li>
                      <li>• Continuous optimization</li>
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
                  Common performance optimization tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => setActiveTab('monitor')}>
                    Run Performance Audit
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('optimizer')}>
                    View Optimization Tips
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('bundle')}>
                    Analyze Bundle Size
                  </Button>
                  <Button variant="outline" onClick={() => window.open('https://web.dev/vitals/', '_blank')}>
                    Learn Core Web Vitals
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
