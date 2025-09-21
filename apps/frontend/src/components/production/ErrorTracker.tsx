import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../Button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/Progress';

interface ErrorReport {
  id: string;
  message: string;
  stack: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'rendering' | 'user' | 'system';
  resolved: boolean;
  occurrences: number;
  lastOccurrence: Date;
  context?: Record<string, unknown>;
}

interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByHour: Record<string, number>;
  topErrors: ErrorReport[];
  errorRate: number;
  resolutionRate: number;
}

interface ErrorTrackerProps {
  className?: string;
  onErrorReport?: (error: ErrorReport) => void;
  onErrorStats?: (stats: ErrorStats) => void;
  autoStart?: boolean;
  interval?: number;
}

export const ErrorTracker: React.FC<ErrorTrackerProps> = ({
  className = '',
  onErrorReport,
  onErrorStats,
  autoStart = true,
  interval = 30000
}) => {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    totalErrors: 0,
    errorsByCategory: {},
    errorsBySeverity: {},
    errorsByHour: {},
    topErrors: [],
    errorRate: 0,
    resolutionRate: 0
  });
  const [isTracking, setIsTracking] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockErrors = useCallback((): ErrorReport[] => {
    const mockErrors: ErrorReport[] = [
      {
        id: 'error-1',
        message: 'TypeError: Cannot read property "length" of undefined',
        stack: 'TypeError: Cannot read property "length" of undefined\n    at UserList.render (UserList.tsx:45:12)\n    at React.createElement (react-dom.js:1234:56)',
        url: 'https://app.example.com/users',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        userId: 'user-123',
        sessionId: 'session-456',
        severity: 'high',
        category: 'javascript',
        resolved: false,
        occurrences: Math.floor(Math.random() * 50 + 1),
        lastOccurrence: new Date(),
        context: { component: 'UserList', action: 'render' }
      },
      {
        id: 'error-2',
        message: 'Network request failed: 500 Internal Server Error',
        stack: 'Error: Network request failed\n    at fetchData (api.ts:23:15)\n    at loadUserData (UserPage.tsx:12:8)',
        url: 'https://app.example.com/user/123',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - Math.random() * 7200000),
        userId: 'user-789',
        sessionId: 'session-101',
        severity: 'medium',
        category: 'network',
        resolved: true,
        occurrences: Math.floor(Math.random() * 20 + 1),
        lastOccurrence: new Date(Date.now() - Math.random() * 1800000),
        context: { endpoint: '/api/users/123', method: 'GET' }
      },
      {
        id: 'error-3',
        message: 'Failed to load resource: the server responded with a status of 404',
        stack: 'Error: Failed to load resource\n    at loadImage (ImageLoader.tsx:34:22)\n    at ProductCard.render (ProductCard.tsx:67:15)',
        url: 'https://app.example.com/products',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        timestamp: new Date(Date.now() - Math.random() * 10800000),
        userId: 'user-456',
        sessionId: 'session-202',
        severity: 'low',
        category: 'rendering',
        resolved: false,
        occurrences: Math.floor(Math.random() * 10 + 1),
        lastOccurrence: new Date(),
        context: { imageUrl: '/images/product-123.jpg', component: 'ProductCard' }
      },
      {
        id: 'error-4',
        message: 'Uncaught ReferenceError: variable is not defined',
        stack: 'ReferenceError: variable is not defined\n    at handleSubmit (Form.tsx:89:12)\n    at onClick (Button.tsx:23:8)',
        url: 'https://app.example.com/contact',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - Math.random() * 14400000),
        userId: 'user-321',
        sessionId: 'session-303',
        severity: 'critical',
        category: 'javascript',
        resolved: false,
        occurrences: Math.floor(Math.random() * 100 + 1),
        lastOccurrence: new Date(),
        context: { form: 'contact', field: 'email' }
      },
      {
        id: 'error-5',
        message: 'TimeoutError: Request timeout after 30 seconds',
        stack: 'TimeoutError: Request timeout\n    at fetchWithTimeout (api.ts:45:20)\n    at loadDashboardData (Dashboard.tsx:15:12)',
        url: 'https://app.example.com/dashboard',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - Math.random() * 21600000),
        userId: 'user-654',
        sessionId: 'session-404',
        severity: 'medium',
        category: 'network',
        resolved: true,
        occurrences: Math.floor(Math.random() * 30 + 1),
        lastOccurrence: new Date(Date.now() - Math.random() * 3600000),
        context: { endpoint: '/api/dashboard', timeout: 30000 }
      }
    ];
    
    return mockErrors;
  }, []);

  const calculateStats = useCallback((errorList: ErrorReport[]): ErrorStats => {
    const totalErrors = errorList.length;
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorsByHour: Record<string, number> = {};
    
    errorList.forEach(error => {
      // Count by category
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      
      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // Count by hour
      const hour = error.timestamp.getHours().toString();
      errorsByHour[hour] = (errorsByHour[hour] || 0) + 1;
    });
    
    // Get top errors by occurrences
    const topErrors = [...errorList]
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5);
    
    // Calculate error rate (errors per hour)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const recentErrors = errorList.filter(error => error.timestamp > oneHourAgo);
    const errorRate = recentErrors.length;
    
    // Calculate resolution rate
    const resolvedErrors = errorList.filter(error => error.resolved);
    const resolutionRate = totalErrors > 0 ? (resolvedErrors.length / totalErrors) * 100 : 0;
    
    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      errorsByHour,
      topErrors,
      errorRate,
      resolutionRate
    };
  }, []);

  const collectErrors = useCallback(async (): Promise<ErrorReport[]> => {
    const newErrors = generateMockErrors();
    setErrors(newErrors);
    
    const newStats = calculateStats(newErrors);
    setStats(newStats);
    
    if (onErrorStats) {
      onErrorStats(newStats);
    }
    
    // Report new errors
    if (onErrorReport) {
      newErrors.forEach(error => onErrorReport(error));
    }
    
    return newErrors;
  }, [generateMockErrors, calculateStats, onErrorStats, onErrorReport]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    
    // Initial collection
    collectErrors();
    
    // Set up interval
    intervalRef.current = setInterval(collectErrors, interval);
  }, [collectErrors, interval]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resolveError = useCallback((errorId: string) => {
    setErrors(prevErrors => 
      prevErrors.map(error => 
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );
  }, []);

  const dismissError = useCallback((errorId: string) => {
    setErrors(prevErrors => 
      prevErrors.filter(error => error.id !== errorId)
    );
  }, []);

  useEffect(() => {
    if (autoStart) {
      startTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [autoStart, startTracking, stopTracking]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'javascript': return 'primary';
      case 'network': return 'warning';
      case 'rendering': return 'info';
      case 'user': return 'success';
      case 'system': return 'error';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  const formatStack = (stack: string) => {
    return stack.split('\n').slice(0, 3).join('\n');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Error Statistics</CardTitle>
          <CardDescription>
            Comprehensive error tracking and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {isTracking ? 'Tracking Active' : 'Tracking Stopped'}
                </span>
              </div>
              <Badge variant="error">
                {stats.totalErrors} Total Errors
              </Badge>
              <Badge variant="warning">
                {stats.errorRate} Errors/Hour
              </Badge>
            </div>
            <div className="space-x-2">
              <Button 
                onClick={isTracking ? stopTracking : startTracking}
                variant={isTracking ? 'outline' : 'primary'}
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Button>
              <Button 
                onClick={() => collectErrors()}
                variant="outline"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Errors</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {stats.totalErrors}
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
                <p className="text-sm font-medium text-text-secondary">Error Rate</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {stats.errorRate}/hr
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Resolution Rate</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {stats.resolutionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={stats.resolutionRate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Unresolved</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {errors.filter(e => !e.resolved).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Errors by Category</CardTitle>
            <CardDescription>
              Distribution of errors by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.errorsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getCategoryColor(category)}>
                      {category}
                    </Badge>
                    <span className="text-sm text-text-primary">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <Progress 
                      value={(count / stats.totalErrors) * 100} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errors by Severity</CardTitle>
            <CardDescription>
              Distribution of errors by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.errorsBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityColor(severity)}>
                      {severity}
                    </Badge>
                    <span className="text-sm text-text-primary">{severity}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <Progress 
                      value={(count / stats.totalErrors) * 100} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Errors</CardTitle>
          <CardDescription>
            Most frequently occurring errors requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topErrors.map((error) => (
              <div key={error.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getSeverityColor(error.severity)}>
                      {error.severity}
                    </Badge>
                    <Badge variant={getCategoryColor(error.category)}>
                      {error.category}
                    </Badge>
                    <Badge variant={error.resolved ? 'success' : 'warning'}>
                      {error.resolved ? 'Resolved' : 'Unresolved'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={() => resolveError(error.id)}
                      variant="outline"
                      size="sm"
                      disabled={error.resolved}
                    >
                      Resolve
                    </Button>
                    <Button 
                      onClick={() => dismissError(error.id)}
                      variant="outline"
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-semibold text-text-primary mb-2">
                    {error.message}
                  </h4>
                  <p className="text-sm text-text-secondary mb-2">
                    Occurrences: {error.occurrences} | Last: {formatTimestamp(error.lastOccurrence)}
                  </p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {formatStack(error.stack)}
                  </pre>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">URL:</p>
                    <p className="text-text-primary">{error.url}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">User Agent:</p>
                    <p className="text-text-primary truncate">{error.userAgent}</p>
                  </div>
                </div>
                
                {error.context && (
                  <div className="mt-3">
                    <p className="text-sm text-text-secondary mb-1">Context:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
