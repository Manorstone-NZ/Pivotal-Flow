import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../Button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/Progress';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  
  // Additional metrics
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  loadTime: number | null; // Page load time
  
  // Resource metrics
  resourceCount: number;
  resourceSize: number;
  
  // Performance score
  score: number;
  timestamp: Date;
}

interface PerformanceOptimization {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'loading' | 'rendering' | 'network' | 'bundle' | 'caching';
  suggestions: string[];
  estimatedImprovement: string;
}

interface PerformanceMonitorProps {
  className?: string;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  autoStart?: boolean;
  interval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = '',
  onMetricsUpdate,
  autoStart = true,
  interval = 5000
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    loadTime: null,
    resourceCount: 0,
    resourceSize: 0,
    score: 0,
    timestamp: new Date()
  });
  
  const [isMonitoring, setIsMonitoring] = useState(autoStart);
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePerformanceScore = useCallback((metrics: Partial<PerformanceMetrics>): number => {
    let score = 100;
    
    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }
    
    // FID scoring (Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }
    
    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }
    
    // FCP scoring (Good: <1.8s, Needs Improvement: 1.8-3s, Poor: >3s)
    if (metrics.fcp) {
      if (metrics.fcp > 3000) score -= 20;
      else if (metrics.fcp > 1800) score -= 10;
    }
    
    return Math.max(0, score);
  }, []);

  const generateOptimizations = useCallback((metrics: PerformanceMetrics): PerformanceOptimization[] => {
    const optimizations: PerformanceOptimization[] = [];
    
    // LCP optimizations
    if (metrics.lcp && metrics.lcp > 2500) {
      optimizations.push({
        id: 'lcp-optimization',
        title: 'Optimize Largest Contentful Paint',
        description: 'LCP is slower than recommended, affecting user experience',
        impact: 'high',
        category: 'loading',
        suggestions: [
          'Optimize images (use WebP, lazy loading)',
          'Preload critical resources',
          'Minimize render-blocking CSS',
          'Use a CDN for static assets',
          'Implement resource hints (preconnect, dns-prefetch)'
        ],
        estimatedImprovement: `${Math.round((metrics.lcp - 2500) / 1000)}s faster`
      });
    }
    
    // FID optimizations
    if (metrics.fid && metrics.fid > 100) {
      optimizations.push({
        id: 'fid-optimization',
        title: 'Reduce First Input Delay',
        description: 'FID is higher than recommended, causing input lag',
        impact: 'high',
        category: 'rendering',
        suggestions: [
          'Break up long-running JavaScript tasks',
          'Use code splitting and lazy loading',
          'Optimize third-party scripts',
          'Implement requestIdleCallback for non-critical work',
          'Use Web Workers for heavy computations'
        ],
        estimatedImprovement: `${Math.round(metrics.fid - 100)}ms faster`
      });
    }
    
    // CLS optimizations
    if (metrics.cls && metrics.cls > 0.1) {
      optimizations.push({
        id: 'cls-optimization',
        title: 'Reduce Cumulative Layout Shift',
        description: 'CLS is higher than recommended, causing visual instability',
        impact: 'medium',
        category: 'rendering',
        suggestions: [
          'Set dimensions for images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use font-display: swap carefully',
          'Preload custom fonts'
        ],
        estimatedImprovement: `${Math.round((metrics.cls - 0.1) * 100)}% less shift`
      });
    }
    
    // Bundle size optimizations
    if (metrics.resourceSize > 1000000) { // > 1MB
      optimizations.push({
        id: 'bundle-optimization',
        title: 'Reduce Bundle Size',
        description: 'Total resource size is large, affecting load times',
        impact: 'medium',
        category: 'bundle',
        suggestions: [
          'Implement code splitting',
          'Remove unused dependencies',
          'Use tree shaking',
          'Compress images and assets',
          'Consider lazy loading for non-critical components'
        ],
        estimatedImprovement: `${Math.round((metrics.resourceSize - 1000000) / 100000)}KB smaller`
      });
    }
    
    // Resource count optimizations
    if (metrics.resourceCount > 50) {
      optimizations.push({
        id: 'resource-optimization',
        title: 'Reduce Resource Count',
        description: 'High number of resources may impact performance',
        impact: 'low',
        category: 'network',
        suggestions: [
          'Combine CSS and JS files',
          'Use CSS sprites for small images',
          'Implement resource bundling',
          'Consider HTTP/2 server push',
          'Optimize third-party integrations'
        ],
        estimatedImprovement: `${metrics.resourceCount - 50} fewer requests`
      });
    }
    
    return optimizations;
  }, []);

  const collectPerformanceMetrics = useCallback(async (): Promise<PerformanceMetrics> => {
    const newMetrics: Partial<PerformanceMetrics> = {
      timestamp: new Date()
    };
    
    try {
      // Get Core Web Vitals using Performance Observer
      if ('PerformanceObserver' in window) {
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          newMetrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              newMetrics.fid = entry.processingStart - entry.startTime;
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          newMetrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // FCP
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              newMetrics.fcp = entry.startTime;
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      }
      
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        newMetrics.ttfb = navigation.responseStart - navigation.requestStart;
        newMetrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      }
      
      // Get resource information
      const resources = performance.getEntriesByType('resource');
      newMetrics.resourceCount = resources.length;
      newMetrics.resourceSize = resources.reduce((total, resource: any) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      // Calculate score
      const score = calculatePerformanceScore(newMetrics);
      newMetrics.score = score;
      
      // Generate optimizations
      const optimizations = generateOptimizations(newMetrics as PerformanceMetrics);
      setOptimizations(optimizations);
      
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
    
    return newMetrics as PerformanceMetrics;
  }, [calculatePerformanceScore, generateOptimizations]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Initial collection
    collectPerformanceMetrics().then((metrics) => {
      setMetrics(metrics);
      if (onMetricsUpdate) {
        onMetricsUpdate(metrics);
      }
    });
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      collectPerformanceMetrics().then((metrics) => {
        setMetrics(metrics);
        if (onMetricsUpdate) {
          onMetricsUpdate(metrics);
        }
      });
    }, interval);
  }, [collectPerformanceMetrics, onMetricsUpdate, interval]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [autoStart, startMonitoring, stopMonitoring]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Score</CardTitle>
          <CardDescription>
            Real-time performance monitoring and Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Overall Score</h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-brand-primary">
                  {metrics.score}/100
                </div>
                <Badge variant={getScoreColor(metrics.score)}>
                  {getScoreLabel(metrics.score)}
                </Badge>
                <Progress value={metrics.score} className="w-32" />
              </div>
            </div>
            <div className="space-x-2">
                <Button 
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  variant={isMonitoring ? 'outline' : 'primary'}
                >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
              <Button 
                onClick={() => collectPerformanceMetrics().then(setMetrics)}
                variant="outline"
              >
                Refresh Metrics
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-text-secondary">
            Last updated: {metrics.timestamp.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Google's Core Web Vitals metrics for user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">LCP</h4>
                <Badge variant={metrics.lcp && metrics.lcp > 4000 ? 'error' : metrics.lcp && metrics.lcp > 2500 ? 'warning' : 'success'}>
                  {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">Largest Contentful Paint</p>
              <p className="text-xs text-text-secondary mt-1">
                Good: &lt;2.5s, Needs Improvement: 2.5-4s, Poor: &gt;4s
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">FID</h4>
                <Badge variant={metrics.fid && metrics.fid > 300 ? 'error' : metrics.fid && metrics.fid > 100 ? 'warning' : 'success'}>
                  {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">First Input Delay</p>
              <p className="text-xs text-text-secondary mt-1">
                Good: &lt;100ms, Needs Improvement: 100-300ms, Poor: &gt;300ms
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">CLS</h4>
                <Badge variant={metrics.cls && metrics.cls > 0.25 ? 'error' : metrics.cls && metrics.cls > 0.1 ? 'warning' : 'success'}>
                  {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">Cumulative Layout Shift</p>
              <p className="text-xs text-text-secondary mt-1">
                Good: &lt;0.1, Needs Improvement: 0.1-0.25, Poor: &gt;0.25
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Metrics</CardTitle>
          <CardDescription>
            Additional performance indicators and resource information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-brand-primary">
                {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
              </div>
              <div className="text-sm text-text-secondary">First Contentful Paint</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-brand-primary">
                {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
              </div>
              <div className="text-sm text-text-secondary">Time to First Byte</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-brand-primary">
                {metrics.resourceCount}
              </div>
              <div className="text-sm text-text-secondary">Resource Count</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-brand-primary">
                {metrics.resourceSize ? `${Math.round(metrics.resourceSize / 1024)}KB` : 'N/A'}
              </div>
              <div className="text-sm text-text-secondary">Resource Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      {optimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
            <CardDescription>
              Actionable suggestions to improve performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizations.map((optimization) => (
                <div key={optimization.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {optimization.title}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1">
                        {optimization.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getImpactColor(optimization.impact)}>
                        {optimization.impact} impact
                      </Badge>
                    <Badge variant="default">
                      {optimization.category}
                    </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-text-primary mb-2">
                      Suggestions:
                    </h5>
                    <ul className="list-disc list-inside space-y-1">
                      {optimization.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-text-secondary">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3">
                    <Badge variant="info">
                      Estimated improvement: {optimization.estimatedImprovement}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};