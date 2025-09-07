import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../features/auth/RequireAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { AppLayout } from '../components/layout/AppLayout';
import { SkeletonCard } from '../components/ui/Skeleton';

// Lazy load all page components for code splitting
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const QuotesPage = lazy(() => import('../pages/QuotesPage').then(m => ({ default: m.QuotesPage })));
const QuoteDetailPage = lazy(() => import('../pages/QuoteDetailPage').then(m => ({ default: m.QuoteDetailPage })));
const RateCardsPage = lazy(() => import('../pages/RateCardsPage').then(m => ({ default: m.RateCardsPage })));
const UsersPage = lazy(() => import('../pages/UsersPage').then(m => ({ default: m.UsersPage })));
const PaymentsPage = lazy(() => import('../pages/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-surface-background p-8">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  </div>
);

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RouteErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-primary text-text-inverse rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main router component
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            
            <Route
              path="/quotes"
              element={
                <RequireAuth>
                  <AppLayout>
                    <QuotesPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            
            <Route
              path="/quotes/:id"
              element={
                <RequireAuth>
                  <AppLayout>
                    <QuoteDetailPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            
            <Route
              path="/rate-cards"
              element={
                <RequireAuth>
                  <AppLayout>
                    <RateCardsPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            
            <Route
              path="/users"
              element={
                <RequireAuth>
                  <AppLayout>
                    <UsersPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            
            <Route
              path="/payments"
              element={
                <RequireAuth>
                  <AppLayout>
                    <PaymentsPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </RequireAuth>
              }
            />
            
            {/* Catch-all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
};
