import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

interface ProductionMetrics {
  // Application Health
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  
  // User Metrics
  activeUsers: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  
  // System Metrics
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  
  // Business Metrics
  revenue: number;
  orders: number;
  supportTickets: number;
  satisfactionScore: number;
  
  timestamp: Date;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'security' | 'business' | 'system';
  resolved: boolean;
  actions?: AlertAction[];
}

interface AlertAction {
  id: string;
  label: string;
  action: () => void;
  variant: 'primary' | 'secondary' | 'outline';
}

interface ProductionMonitorProps {
  className?: string;
  onMetricsUpdate?: (metrics: ProductionMetrics) => void;
  onAlert?: (alert: Alert) => void;
  autoStart?: boolean;
  interval?: number;
}

export const ProductionMonitor: React.FC<ProductionMonitorProps> = ({
  className = '',
  onMetricsUpdate,
  onAlert,
  autoStart = true,
  interval = 10000
}) => {
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    uptime: 0,
    responseTime: 0,
    errorRate: 0,
    throughput: 0,
    activeUsers: 0,
    sessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    revenue: 0,
    orders: 0,
    supportTickets: 0,
    satisfactionScore: 0,
    timestamp: new Date()
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockMetrics = useCallback((): ProductionMetrics => {
    const baseTime = Date.now();
    const uptime = Math.floor((baseTime - (baseTime - Math.random() * 86400000)) / 1000);
    
    return {
      uptime,
      responseTime: Math.random() * 200 + 50, // 50-250ms
      errorRate: Math.random() * 5, // 0-5%
      throughput: Math.random() * 1000 + 100, // 100-1100 req/s
      activeUsers: Math.floor(Math.random() * 500 + 50), // 50-550 users
      sessionDuration: Math.random() * 1800 + 300, // 5-35 minutes
      bounceRate: Math.random() * 30 + 20, // 20-50%
      conversionRate: Math.random() * 10 + 2, // 2-12%
      memoryUsage: Math.random() * 80 + 20, // 20-100%
      cpuUsage: Math.random() * 70 + 10, // 10-80%
      diskUsage: Math.random() * 60 + 30, // 30-90%
      networkLatency: Math.random() * 100 + 20, // 20-120ms
      revenue: Math.random() * 50000 + 10000, // $10k-$60k
      orders: Math.floor(Math.random() * 200 + 50), // 50-250 orders
      supportTickets: Math.floor(Math.random() * 20 + 5), // 5-25 tickets
      satisfactionScore: Math.random() * 2 + 3, // 3-5 stars
      timestamp: new Date()
    };
  }, []);

  const generateAlerts = useCallback((metrics: ProductionMetrics): Alert[] => {
    const newAlerts: Alert[] = [];
    
    // Performance alerts
    if (metrics.responseTime > 200) {
      newAlerts.push({
        id: 'high-response-time',
        type: 'warning',
        title: 'High Response Time',
        message: `Response time is ${Math.round(metrics.responseTime)}ms, above the 200ms threshold`,
        timestamp: new Date(),
        severity: 'medium',
        category: 'performance',
        resolved: false,
        actions: [
          {
            id: 'optimize-performance',
            label: 'Optimize Performance',
            action: () => console.log('Optimizing performance...'),
            variant: 'primary'
          }
        ]
      });
    }
    
    if (metrics.errorRate > 2) {
      newAlerts.push({
        id: 'high-error-rate',
        type: 'error',
        title: 'High Error Rate',
        message: `Error rate is ${metrics.errorRate.toFixed(2)}%, above the 2% threshold`,
        timestamp: new Date(),
        severity: 'high',
        category: 'performance',
        resolved: false,
        actions: [
          {
            id: 'investigate-errors',
            label: 'Investigate Errors',
            action: () => console.log('Investigating errors...'),
            variant: 'primary'
          }
        ]
      });
    }
    
    // System alerts
    if (metrics.memoryUsage > 80) {
      newAlerts.push({
        id: 'high-memory-usage',
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is ${metrics.memoryUsage.toFixed(1)}%, above the 80% threshold`,
        timestamp: new Date(),
        severity: 'medium',
        category: 'system',
        resolved: false,
        actions: [
          {
            id: 'restart-service',
            label: 'Restart Service',
            action: () => console.log('Restarting service...'),
            variant: 'outline'
          }
        ]
      });
    }
    
    if (metrics.cpuUsage > 70) {
      newAlerts.push({
        id: 'high-cpu-usage',
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is ${metrics.cpuUsage.toFixed(1)}%, above the 70% threshold`,
        timestamp: new Date(),
        severity: 'medium',
        category: 'system',
        resolved: false,
        actions: [
          {
            id: 'scale-resources',
            label: 'Scale Resources',
            action: () => console.log('Scaling resources...'),
            variant: 'primary'
          }
        ]
      });
    }
    
    // Business alerts
    if (metrics.satisfactionScore < 4) {
      newAlerts.push({
        id: 'low-satisfaction',
        type: 'warning',
        title: 'Low Satisfaction Score',
        message: `Customer satisfaction is ${metrics.satisfactionScore.toFixed(1)}/5, below the 4.0 threshold`,
        timestamp: new Date(),
        severity: 'medium',
        category: 'business',
        resolved: false,
        actions: [
          {
            id: 'review-feedback',
            label: 'Review Feedback',
            action: () => console.log('Reviewing feedback...'),
            variant: 'primary'
          }
        ]
      });
    }
    
    if (metrics.supportTickets > 15) {
      newAlerts.push({
        id: 'high-support-tickets',
        type: 'info',
        title: 'High Support Volume',
        message: `${metrics.supportTickets} support tickets open, above the 15 ticket threshold`,
        timestamp: new Date(),
        severity: 'low',
        category: 'business',
        resolved: false,
        actions: [
          {
            id: 'assign-more-staff',
            label: 'Assign More Staff',
            action: () => console.log('Assigning more staff...'),
            variant: 'outline'
          }
        ]
      });
    }
    
    return newAlerts;
  }, []);

  const collectMetrics = useCallback(async (): Promise<ProductionMetrics> => {
    const newMetrics = generateMockMetrics();
    const newAlerts = generateAlerts(newMetrics);
    
    setMetrics(newMetrics);
    setAlerts(prevAlerts => {
      // Add new alerts that don't already exist
      const existingAlertIds = prevAlerts.map(alert => alert.id);
      const uniqueNewAlerts = newAlerts.filter(alert => !existingAlertIds.includes(alert.id));
      return [...prevAlerts, ...uniqueNewAlerts];
    });
    
    if (onMetricsUpdate) {
      onMetricsUpdate(newMetrics);
    }
    
    if (onAlert && newAlerts.length > 0) {
      newAlerts.forEach(alert => onAlert(alert));
    }
    
    return newMetrics;
  }, [generateMockMetrics, generateAlerts, onMetricsUpdate, onAlert]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Initial collection
    collectMetrics();
    
    // Set up interval
    intervalRef.current = setInterval(collectMetrics, interval);
  }, [collectMetrics, interval]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.filter(alert => alert.id !== alertId)
    );
  }, []);

  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [autoStart, startMonitoring, stopMonitoring]);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Real-time production monitoring and health metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
                </span>
              </div>
              <Badge variant="success">
                Uptime: {formatUptime(metrics.uptime)}
              </Badge>
            </div>
            <div className="space-x-2">
              <Button 
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                variant={isMonitoring ? 'outline' : 'primary'}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
              <Button 
                onClick={() => collectMetrics()}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Response Time</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {Math.round(metrics.responseTime)}ms
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={Math.min(100, (metrics.responseTime / 200) * 100)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Error Rate</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {metrics.errorRate.toFixed(2)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={Math.min(100, (metrics.errorRate / 5) * 100)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Users</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {metrics.activeUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={Math.min(100, (metrics.activeUsers / 500) * 100)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Revenue</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {formatCurrency(metrics.revenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={Math.min(100, (metrics.revenue / 50000) * 100)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>
            Server resource utilization and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Memory Usage</span>
                <span className="text-sm text-text-secondary">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memoryUsage} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">CPU Usage</span>
                <span className="text-sm text-text-secondary">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cpuUsage} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Disk Usage</span>
                <span className="text-sm text-text-secondary">{metrics.diskUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.diskUsage} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Network Latency</span>
                <span className="text-sm text-text-secondary">{Math.round(metrics.networkLatency)}ms</span>
              </div>
              <Progress value={Math.min(100, (metrics.networkLatency / 100) * 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Business Metrics</CardTitle>
          <CardDescription>
            Key performance indicators and business health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="text-2xl font-bold text-blue-800">
                {metrics.orders}
              </div>
              <div className="text-sm text-blue-700">Orders Today</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-2xl font-bold text-green-800">
                {metrics.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700">Conversion Rate</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-2xl font-bold text-yellow-800">
                {metrics.supportTickets}
              </div>
              <div className="text-sm text-yellow-700">Support Tickets</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded">
              <div className="text-2xl font-bold text-purple-800">
                {metrics.satisfactionScore.toFixed(1)}/5
              </div>
              <div className="text-sm text-purple-700">Satisfaction Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>
              System alerts and notifications requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.filter(alert => !alert.resolved).map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getAlertColor(alert.type)}>
                        {alert.type}
                      </Badge>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity} severity
                      </Badge>
                      <Badge variant="default">
                        {alert.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => resolveAlert(alert.id)}
                        variant="outline"
                        size="sm"
                      >
                        Resolve
                      </Button>
                      <Button 
                        onClick={() => dismissAlert(alert.id)}
                        variant="outline"
                        size="sm"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-text-primary mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {alert.message}
                    </p>
                  </div>
                  
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="flex space-x-2">
                      {alert.actions.map((action) => (
                        <Button
                          key={action.id}
                          onClick={action.action}
                          variant={action.variant}
                          size="sm"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-text-secondary mt-2">
                    {alert.timestamp.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
