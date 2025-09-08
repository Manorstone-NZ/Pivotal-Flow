import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button } from '../../../components/ui';

/**
 * Health Status Interface
 */
interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      message: string;
      timestamp: string;
    };
    redis: {
      status: 'ok' | 'error';
      message: string;
      timestamp: string;
    };
    metrics: {
      status: 'ok' | 'error';
      message: string;
      timestamp: string;
    };
  };
}

/**
 * Live Status Component
 * 
 * Features:
 * - Fetches GET /api/v1/health from backend
 * - Shows aggregated status (OK/degraded) with tooltip breakdown
 * - 30s in-memory cache to avoid spam
 * - Graceful error handling with non-PII messages
 * - aria-live announcements for status changes
 * - Respects error envelope pattern
 */
export const LiveStatus: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const cacheRef = useRef<{ data: HealthStatus | null; timestamp: number }>({
    data: null,
    timestamp: 0,
  });
  
  const statusRef = useRef<string>('');

  const fetchHealthStatus = async (): Promise<void> => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    // Use cache if less than 30 seconds old
    if (cache.data && (now - cache.timestamp) < 30000) {
      setHealthStatus(cache.data);
      setIsLoading(false);
      setError(null);
      setLastUpdated(new Date(cache.timestamp));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data: HealthStatus = await response.json();
      
      // Update cache
      cacheRef.current = {
        data,
        timestamp: now,
      };
      
      setHealthStatus(data);
      setLastUpdated(new Date(now));
      
      // Announce status change to screen readers
      const newStatus = data.status;
      if (statusRef.current !== newStatus) {
        statusRef.current = newStatus;
        // The aria-live region will automatically announce the change
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health status';
      setError(errorMessage);
      setHealthStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchHealthStatus();
    
    // Update every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeVariant = (status: 'ok' | 'error'): 'success' | 'error' => {
    return status === 'ok' ? 'success' : 'error';
  };

  const getOverallStatusText = (): string => {
    if (isLoading) return 'Checking...';
    if (error) return 'Service Unavailable';
    if (!healthStatus) return 'Unknown';
    return healthStatus.status === 'ok' ? 'All Systems Operational' : 'Service Degraded';
  };

  const getOverallStatusVariant = (): 'success' | 'error' | 'warning' => {
    if (isLoading) return 'warning';
    if (error) return 'error';
    if (!healthStatus) return 'warning';
    return healthStatus.status === 'ok' ? 'success' : 'error';
  };

  return (
    <section 
      className="px-4 py-8 sm:px-6 lg:px-8 bg-neutral-50"
      aria-labelledby="status-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-card rounded-lg p-6 shadow-sm border border-surface-border">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 
              id="status-heading"
              className="text-xl font-semibold text-text-primary"
            >
              System Status
            </h2>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              aria-expanded={showDetails}
              aria-controls="status-details"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {/* Overall Status */}
          <div className="flex items-center gap-3 mb-4">
            <Badge 
              variant={getOverallStatusVariant()}
              className="text-sm"
            >
              {getOverallStatusText()}
            </Badge>
            
            {lastUpdated && (
              <span className="text-sm text-text-secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              onClick={fetchHealthStatus}
              variant="outline"
              size="sm"
              disabled={isLoading}
              aria-label="Refresh system status"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Status Announcement for Screen Readers */}
          <div 
            role="status"
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {healthStatus && (
              <p>
                System status: {healthStatus.status === 'ok' ? 'All systems operational' : 'Service degraded'}
              </p>
            )}
            {error && (
              <p>System status check failed: {error}</p>
            )}
          </div>

          {/* Detailed Status */}
          {showDetails && (
            <div id="status-details" className="mt-4">
              {error ? (
                <div className="text-error text-sm">
                  <p>Unable to fetch system status: {error}</p>
                  <p className="mt-2 text-text-secondary">
                    This may be due to network issues or service maintenance.
                  </p>
                </div>
              ) : healthStatus ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Database Status */}
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(healthStatus.checks.database.status)}>
                        Database
                      </Badge>
                      <span className="text-sm text-text-secondary">
                        {healthStatus.checks.database.message}
                      </span>
                    </div>
                    
                    {/* Redis Status */}
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(healthStatus.checks.redis.status)}>
                        Redis
                      </Badge>
                      <span className="text-sm text-text-secondary">
                        {healthStatus.checks.redis.message}
                      </span>
                    </div>
                    
                    {/* Metrics Status */}
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(healthStatus.checks.metrics.status)}>
                        Metrics
                      </Badge>
                      <span className="text-sm text-text-secondary">
                        {healthStatus.checks.metrics.message}
                      </span>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="text-sm text-text-secondary pt-2 border-t border-surface-border">
                    <p>Version: {healthStatus.version}</p>
                    <p>Uptime: {healthStatus.uptime} seconds</p>
                    <p>Last checked: {new Date(healthStatus.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-text-secondary text-sm">
                  No status information available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
