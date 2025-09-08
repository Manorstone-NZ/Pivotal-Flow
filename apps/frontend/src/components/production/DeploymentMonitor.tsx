import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

interface Deployment {
  id: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back';
  timestamp: Date;
  duration?: number;
  commitHash: string;
  commitMessage: string;
  author: string;
  branch: string;
  buildNumber: string;
  healthCheck: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    uptime: number;
    lastCheck: Date;
  };
  metrics: {
    errorRate: number;
    responseTime: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  rollbackAvailable: boolean;
}

interface DeploymentStats {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDeploymentTime: number;
  deploymentsByEnvironment: Record<string, number>;
  deploymentsByDay: Record<string, number>;
  currentVersion: string;
  lastDeployment: Date;
}

interface DeploymentMonitorProps {
  className?: string;
  onDeploymentUpdate?: (deployment: Deployment) => void;
  onDeploymentStats?: (stats: DeploymentStats) => void;
  autoStart?: boolean;
  interval?: number;
}

export const DeploymentMonitor: React.FC<DeploymentMonitorProps> = ({
  className = '',
  onDeploymentUpdate,
  onDeploymentStats,
  autoStart = true,
  interval = 15000
}) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [stats, setStats] = useState<DeploymentStats>({
    totalDeployments: 0,
    successfulDeployments: 0,
    failedDeployments: 0,
    averageDeploymentTime: 0,
    deploymentsByEnvironment: {},
    deploymentsByDay: {},
    currentVersion: '1.0.0',
    lastDeployment: new Date()
  });
  const [isMonitoring, setIsMonitoring] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockDeployments = useCallback((): Deployment[] => {
    const mockDeployments: Deployment[] = [
      {
        id: 'deploy-1',
        version: '1.2.3',
        environment: 'production',
        status: 'success',
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        duration: Math.floor(Math.random() * 300 + 60), // 1-6 minutes
        commitHash: 'a1b2c3d4e5f6',
        commitMessage: 'Fix user authentication bug',
        author: 'John Doe',
        branch: 'main',
        buildNumber: '1234',
        healthCheck: {
          status: 'healthy',
          responseTime: Math.random() * 100 + 50,
          uptime: 99.9,
          lastCheck: new Date()
        },
        metrics: {
          errorRate: Math.random() * 2,
          responseTime: Math.random() * 200 + 100,
          throughput: Math.random() * 500 + 200,
          memoryUsage: Math.random() * 60 + 30,
          cpuUsage: Math.random() * 50 + 20
        },
        rollbackAvailable: true
      },
      {
        id: 'deploy-2',
        version: '1.2.2',
        environment: 'staging',
        status: 'success',
        timestamp: new Date(Date.now() - Math.random() * 7200000),
        duration: Math.floor(Math.random() * 200 + 40),
        commitHash: 'b2c3d4e5f6g7',
        commitMessage: 'Add new dashboard features',
        author: 'Jane Smith',
        branch: 'feature/dashboard',
        buildNumber: '1233',
        healthCheck: {
          status: 'healthy',
          responseTime: Math.random() * 80 + 40,
          uptime: 99.8,
          lastCheck: new Date()
        },
        metrics: {
          errorRate: Math.random() * 1.5,
          responseTime: Math.random() * 150 + 80,
          throughput: Math.random() * 400 + 150,
          memoryUsage: Math.random() * 50 + 25,
          cpuUsage: Math.random() * 40 + 15
        },
        rollbackAvailable: true
      },
      {
        id: 'deploy-3',
        version: '1.2.1',
        environment: 'production',
        status: 'failed',
        timestamp: new Date(Date.now() - Math.random() * 10800000),
        duration: Math.floor(Math.random() * 180 + 30),
        commitHash: 'c3d4e5f6g7h8',
        commitMessage: 'Update payment processing',
        author: 'Mike Johnson',
        branch: 'main',
        buildNumber: '1232',
        healthCheck: {
          status: 'unhealthy',
          responseTime: Math.random() * 500 + 200,
          uptime: 95.2,
          lastCheck: new Date()
        },
        metrics: {
          errorRate: Math.random() * 10 + 5,
          responseTime: Math.random() * 1000 + 500,
          throughput: Math.random() * 100 + 50,
          memoryUsage: Math.random() * 90 + 70,
          cpuUsage: Math.random() * 80 + 60
        },
        rollbackAvailable: true
      },
      {
        id: 'deploy-4',
        version: '1.2.0',
        environment: 'production',
        status: 'rolled_back',
        timestamp: new Date(Date.now() - Math.random() * 14400000),
        duration: Math.floor(Math.random() * 120 + 20),
        commitHash: 'd4e5f6g7h8i9',
        commitMessage: 'Implement new API endpoints',
        author: 'Sarah Wilson',
        branch: 'main',
        buildNumber: '1231',
        healthCheck: {
          status: 'healthy',
          responseTime: Math.random() * 90 + 45,
          uptime: 99.5,
          lastCheck: new Date()
        },
        metrics: {
          errorRate: Math.random() * 1.8,
          responseTime: Math.random() * 180 + 90,
          throughput: Math.random() * 450 + 180,
          memoryUsage: Math.random() * 55 + 30,
          cpuUsage: Math.random() * 45 + 20
        },
        rollbackAvailable: false
      },
      {
        id: 'deploy-5',
        version: '1.1.9',
        environment: 'development',
        status: 'deploying',
        timestamp: new Date(Date.now() - Math.random() * 18000000),
        duration: Math.floor(Math.random() * 100 + 20),
        commitHash: 'e5f6g7h8i9j0',
        commitMessage: 'Fix database connection issues',
        author: 'Tom Brown',
        branch: 'bugfix/database',
        buildNumber: '1230',
        healthCheck: {
          status: 'degraded',
          responseTime: Math.random() * 200 + 100,
          uptime: 98.5,
          lastCheck: new Date()
        },
        metrics: {
          errorRate: Math.random() * 3 + 1,
          responseTime: Math.random() * 300 + 150,
          throughput: Math.random() * 300 + 100,
          memoryUsage: Math.random() * 70 + 40,
          cpuUsage: Math.random() * 60 + 30
        },
        rollbackAvailable: true
      }
    ];
    
    return mockDeployments;
  }, []);

  const calculateStats = useCallback((deploymentList: Deployment[]): DeploymentStats => {
    const totalDeployments = deploymentList.length;
    const successfulDeployments = deploymentList.filter(d => d.status === 'success').length;
    const failedDeployments = deploymentList.filter(d => d.status === 'failed').length;
    
    const successfulDeploymentsWithDuration = deploymentList.filter(d => 
      d.status === 'success' && d.duration
    );
    const averageDeploymentTime = successfulDeploymentsWithDuration.length > 0
      ? successfulDeploymentsWithDuration.reduce((sum, d) => sum + (d.duration || 0), 0) / successfulDeploymentsWithDuration.length
      : 0;
    
    const deploymentsByEnvironment: Record<string, number> = {};
    const deploymentsByDay: Record<string, number> = {};
    
    deploymentList.forEach(deployment => {
      // Count by environment
      deploymentsByEnvironment[deployment.environment] = 
        (deploymentsByEnvironment[deployment.environment] || 0) + 1;
      
      // Count by day
      const day = deployment.timestamp.toDateString();
      deploymentsByDay[day] = (deploymentsByDay[day] || 0) + 1;
    });
    
    const currentVersion = deploymentList
      .filter(d => d.environment === 'production' && d.status === 'success')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.version || '1.0.0';
    
    const lastDeployment = deploymentList
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp || new Date();
    
    return {
      totalDeployments,
      successfulDeployments,
      failedDeployments,
      averageDeploymentTime,
      deploymentsByEnvironment,
      deploymentsByDay,
      currentVersion,
      lastDeployment
    };
  }, []);

  const collectDeployments = useCallback(async (): Promise<Deployment[]> => {
    const newDeployments = generateMockDeployments();
    setDeployments(newDeployments);
    
    const newStats = calculateStats(newDeployments);
    setStats(newStats);
    
    if (onDeploymentStats) {
      onDeploymentStats(newStats);
    }
    
    // Report new deployments
    if (onDeploymentUpdate) {
      newDeployments.forEach(deployment => onDeploymentUpdate(deployment));
    }
    
    return newDeployments;
  }, [generateMockDeployments, calculateStats, onDeploymentStats, onDeploymentUpdate]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Initial collection
    collectDeployments();
    
    // Set up interval
    intervalRef.current = setInterval(collectDeployments, interval);
  }, [collectDeployments, interval]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const rollbackDeployment = useCallback((deploymentId: string) => {
    setDeployments(prevDeployments => 
      prevDeployments.map(deployment => 
        deployment.id === deploymentId 
          ? { ...deployment, status: 'rolled_back' as const }
          : deployment
      )
    );
  }, []);

  const retryDeployment = useCallback((deploymentId: string) => {
    setDeployments(prevDeployments => 
      prevDeployments.map(deployment => 
        deployment.id === deploymentId 
          ? { ...deployment, status: 'deploying' as const }
          : deployment
      )
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'deploying': return 'warning';
      case 'rolled_back': return 'info';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production': return 'error';
      case 'staging': return 'warning';
      case 'development': return 'info';
      default: return 'default';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      default: return 'default';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Deployment Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Statistics</CardTitle>
          <CardDescription>
            Real-time deployment monitoring and health tracking
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
              <Badge variant="primary">
                Current Version: {stats.currentVersion}
              </Badge>
              <Badge variant="info">
                Last Deploy: {formatTimestamp(stats.lastDeployment)}
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
                onClick={() => collectDeployments()}
                variant="outline"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Deployments</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {stats.totalDeployments}
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
                <p className="text-sm font-medium text-text-secondary">Success Rate</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {stats.totalDeployments > 0 ? Math.round((stats.successfulDeployments / stats.totalDeployments) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={stats.totalDeployments > 0 ? (stats.successfulDeployments / stats.totalDeployments) * 100 : 0} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Avg Deploy Time</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {formatDuration(Math.round(stats.averageDeploymentTime))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Failed Deployments</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {stats.failedDeployments}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deployments by Environment</CardTitle>
            <CardDescription>
              Distribution of deployments across environments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.deploymentsByEnvironment).map(([environment, count]) => (
                <div key={environment} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getEnvironmentColor(environment)}>
                      {environment}
                    </Badge>
                    <span className="text-sm text-text-primary capitalize">{environment}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <Progress 
                      value={(count / stats.totalDeployments) * 100} 
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
            <CardTitle>Deployment Health</CardTitle>
            <CardDescription>
              Current health status of active deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deployments.filter(d => d.environment === 'production').map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusColor(deployment.status)}>
                      {deployment.status}
                    </Badge>
                    <div>
                      <div className="font-medium text-text-primary">{deployment.version}</div>
                      <div className="text-sm text-text-secondary">{deployment.commitMessage}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getHealthStatusColor(deployment.healthCheck.status)}>
                      {deployment.healthCheck.status}
                    </Badge>
                    <div className="text-sm text-text-secondary">
                      {deployment.healthCheck.uptime}% uptime
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
          <CardDescription>
            Latest deployment history and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.slice(0, 5).map((deployment) => (
              <div key={deployment.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusColor(deployment.status)}>
                      {deployment.status}
                    </Badge>
                    <Badge variant={getEnvironmentColor(deployment.environment)}>
                      {deployment.environment}
                    </Badge>
                    <Badge variant={getHealthStatusColor(deployment.healthCheck.status)}>
                      {deployment.healthCheck.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {deployment.status === 'failed' && deployment.rollbackAvailable && (
                      <Button 
                        onClick={() => rollbackDeployment(deployment.id)}
                        variant="outline"
                        size="sm"
                      >
                        Rollback
                      </Button>
                    )}
                    {deployment.status === 'failed' && (
                      <Button 
                        onClick={() => retryDeployment(deployment.id)}
                        variant="outline"
                        size="sm"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-semibold text-text-primary mb-1">
                    Version {deployment.version} - {deployment.commitMessage}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {deployment.author} • {deployment.branch} • Build #{deployment.buildNumber}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Commit:</p>
                    <p className="text-text-primary font-mono">{deployment.commitHash}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Duration:</p>
                    <p className="text-text-primary">
                      {deployment.duration ? formatDuration(deployment.duration) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Response Time:</p>
                    <p className="text-text-primary">{deployment.healthCheck.responseTime.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Uptime:</p>
                    <p className="text-text-primary">{deployment.healthCheck.uptime}%</p>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Error Rate:</p>
                    <p className="text-text-primary">{deployment.metrics.errorRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Throughput:</p>
                    <p className="text-text-primary">{deployment.metrics.throughput.toFixed(0)} req/s</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Memory:</p>
                    <p className="text-text-primary">{deployment.metrics.memoryUsage.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">CPU:</p>
                    <p className="text-text-primary">{deployment.metrics.cpuUsage.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Deployed:</p>
                    <p className="text-text-primary">{formatTimestamp(deployment.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
