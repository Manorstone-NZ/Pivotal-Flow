import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../Button';

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
    metrics: 'ok' | 'error';
  };
  uptime: number;
  lastCheck: string;
}

interface SystemStatusWidgetProps {
  className?: string;
  compact?: boolean;
}

export const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({ 
  className,
  compact = false 
}) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      
      setStatus({
        status: data.status === 'ok' ? 'healthy' : 'degraded',
        services: {
          database: data.checks?.database?.status === 'ok' ? 'ok' : 'error',
          redis: data.checks?.redis?.status === 'ok' ? 'ok' : 'error',
          metrics: data.checks?.metrics?.status === 'ok' ? 'ok' : 'error',
        },
        uptime: data.uptime || 0,
        lastCheck: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to fetch system status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
      setStatus({
        status: 'down',
        services: {
          database: 'error',
          redis: 'error',
          metrics: 'error',
        },
        uptime: 0,
        lastCheck: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'All systems operational';
      case 'degraded':
        return 'Some services degraded';
      case 'down':
        return 'System unavailable';
      default:
        return 'Unknown status';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${status ? getStatusColor(status.status) : 'bg-gray-500'} ${isLoading ? 'animate-pulse' : ''}`}></div>
        <span className="text-sm text-text-secondary">
          {isLoading ? 'Checking...' : error ? 'Status unavailable' : getStatusText(status?.status || 'down')}
        </span>
      </div>
    );
  }

  return (
    <Card className={className || ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">System Status</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchSystemStatus}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${status ? getStatusColor(status.status) : 'bg-gray-500'} ${isLoading ? 'animate-pulse' : ''}`}></div>
          <div>
            <p className="font-medium text-text-primary">
              {isLoading ? 'Checking...' : error ? 'Status unavailable' : getStatusText(status?.status || 'down')}
            </p>
            {status && (
              <p className="text-sm text-text-secondary">
                Uptime: {formatUptime(status.uptime)}
              </p>
            )}
          </div>
        </div>

        {/* Service Status */}
        {status && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">Services</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(status.services).map(([service, serviceStatus]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary capitalize">{service}</span>
                  <Badge 
                    variant={serviceStatus === 'ok' ? 'default' : 'error'}
                    className="text-xs"
                  >
                    {serviceStatus === 'ok' ? 'OK' : 'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Unable to connect to health check endpoint
            </p>
          </div>
        )}

        {/* Last Check */}
        {status && (
          <div className="text-xs text-text-secondary">
            Last checked: {new Date(status.lastCheck).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
