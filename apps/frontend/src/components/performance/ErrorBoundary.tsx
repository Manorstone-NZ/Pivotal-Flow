import { Component, type ErrorInfo, type ReactNode } from 'react';

// Extend Window interface for OpenTelemetry
// Browser API type definitions
interface OpenTelemetrySpan {
  setAttributes: (attrs: Record<string, string | number | boolean>) => void;
  addEvent: (name: string, attributes?: Record<string, unknown>) => void;
  recordException: (error: Error) => void;
}

interface SentryScope {
  setTag: (key: string, value: string) => void;
  setContext: (key: string, context: Record<string, unknown>) => void;
  setLevel: (level: string) => void;
}

declare global {
  interface Window {
    otel?: {
      trace: {
        getActiveSpan: () => OpenTelemetrySpan | undefined;
      };
    };
    Sentry?: {
      withScope: (callback: (scope: SentryScope) => void) => void;
      captureException: (error: Error) => void;
      captureMessage: (message: string, level?: string) => void;
    };
  }
}

interface ErrorContext {
  error: Error;
  errorInfo: ErrorInfo;
  userId?: string;
  sessionId?: string;
  timestamp: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | undefined;
  errorInfo?: ErrorInfo | undefined;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Generate error ID for tracking
    const errorId = this.state.errorId || `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Enhanced error reporting with source map support
    this.reportError(error, errorInfo, errorId);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    // Collect error context (no PII)
    const errorContext: ErrorContext = {
      error: error,
      errorInfo: errorInfo,
      userId: this.getUserId(), // Non-PII user identifier
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
    };

    // Send to Sentry (if configured)
    if (window.Sentry) {
      window.Sentry.withScope((scope: SentryScope) => {
        scope.setTag('errorId', errorId);
        scope.setContext('errorBoundary', {
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: errorContext.timestamp,
          userId: errorContext.userId,
          sessionId: errorContext.sessionId,
        });
        scope.setLevel('error');
        window.Sentry?.captureException(error);
      });
    }

    // Send to OpenTelemetry (if configured)
    if (window.otel) {
      const span = window.otel.trace.getActiveSpan();
      if (span) {
        span.recordException(error);
        span.setAttributes({
          'error.id': errorId,
          'error.message': error.message,
          'error.component_stack': errorInfo.componentStack || 'unknown',
        });
      }
    }

    // Send to Google Analytics (if configured)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_id: errorId,
          error_component: errorInfo.componentStack?.split('\n')[0] || 'unknown',
        },
      });
    }

    // Log to console in development
    if (process.env['NODE_ENV'] === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Context:', errorContext);
      console.groupEnd();
    }

    // Store error locally for debugging (development only)
    if (process.env['NODE_ENV'] === 'development') {
      this.storeErrorLocally(errorContext);
    }
  };

  private getUserId = (): string => {
    // Get non-PII user identifier from auth store or localStorage
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.userId ? `user_${parsed.userId.slice(-8)}` : 'anonymous';
      }
    } catch {
      // Ignore parsing errors
    }
    return 'anonymous';
  };

  private getSessionId = (): string => {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  private storeErrorLocally = (errorContext: ErrorContext) => {
    try {
      const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errors.push(errorContext);
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('errorLog', JSON.stringify(errors));
    } catch {
      // Ignore storage errors
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-elevated rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-error-light rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-error-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-text-primary mb-2">
                Something went wrong
              </h1>
              <p className="text-text-secondary mb-4">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-3 bg-error-light rounded text-left">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-error-dark mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-xs text-error-dark space-y-2">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-brand-primary text-text-inverse rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-surface-secondary text-text-primary rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                Reload Page
              </button>
            </div>

            {process.env['NODE_ENV'] === 'development' && (
              <div className="mt-4 text-xs text-text-tertiary">
                Error ID: {this.state.errorId}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for unhandled errors
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Report to error tracking services
    if (window.Sentry) {
      window.Sentry.captureException(event.reason);
    }
    
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Unhandled promise rejection: ${event.reason}`,
        fatal: false,
      });
    }
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Report to error tracking services
    if (window.Sentry) {
      window.Sentry.captureException(event.error);
    }
    
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: event.error?.message || 'Unknown error',
        fatal: true,
      });
    }
  });
};

// Error reporting utilities
export const ErrorReporter = {
  // Report custom errors
  reportError: (error: Error, context?: Record<string, unknown>) => {
    if (window.Sentry) {
      window.Sentry.withScope((scope: SentryScope) => {
        if (context) {
          scope.setContext('custom', context);
        }
        window.Sentry?.captureException(error);
      });
    }
  },

  // Report custom messages
  reportMessage: (message: string, level: 'info' | 'warning' | 'error' = 'error') => {
    if (window.Sentry) {
      window.Sentry.captureMessage(message, level);
    }
  },

  // Get stored errors (development only)
  getStoredErrors: () => {
    if (process.env['NODE_ENV'] === 'development') {
      try {
        return JSON.parse(localStorage.getItem('errorLog') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  },

  // Clear stored errors
  clearStoredErrors: () => {
    if (process.env['NODE_ENV'] === 'development') {
      localStorage.removeItem('errorLog');
    }
  },
};
