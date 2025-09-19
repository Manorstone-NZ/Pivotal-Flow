import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../features/auth/RequireAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { AppLayout } from '../components/layout/AppLayout';
import { SkeletonCard } from '../components/ui/Skeleton';
import { PerformanceMarks, RoutePrefetch, ErrorBoundary, setupGlobalErrorHandling } from '../components/performance';

// Lazy load all page components for code splitting
const LandingPage = lazy(() => import('../pages/Landing/Landing').then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const QuotesPage = lazy(() => import('../pages/QuotesPage').then(m => ({ default: m.QuotesPage })));
const QuoteDetailPage = lazy(() => import('../pages/Quotes/Details').then(m => ({ default: m.QuoteDetailsPage })));
const InvoicesPage = lazy(() => import('../pages/Invoices/List').then(m => ({ default: m.InvoicesListPage })));
const InvoiceDetailPage = lazy(() => import('../pages/Invoices/Details').then(m => ({ default: m.InvoiceDetailsPage })));
const ProjectsPage = lazy(() => import('../pages/Projects/List').then(m => ({ default: m.ProjectsListPage })));
const ProjectDetailPage = lazy(() => import('../pages/Projects/Details').then(m => ({ default: m.ProjectDetailPage })));
const RateCardsPage = lazy(() => import('../pages/RateCards/List').then(m => ({ default: m.RateCardsListPage })));
const TimePage = lazy(() => import('../pages/Time/Time').then(m => ({ default: m.TimePage })));
const TimeApprovalsPage = lazy(() => import('../pages/Time/Approvals').then(m => ({ default: m.TimeApprovalsPage })));
const CustomersListPage = lazy(() => import('../pages/Customers/List').then(m => ({ default: m.CustomersListPage })));
const CustomerDetailsPage = lazy(() => import('../pages/Customers/Details').then(m => ({ default: m.CustomerDetailsPage })));
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

// Main router component
export const AppRouter: React.FC = () => {
  // Setup global error handling
  React.useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <RoutePrefetch>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PerformanceMarks routeName="landing">
                    <LandingPage />
                  </PerformanceMarks>
                } 
              />
              
              <Route 
                path="/login" 
                element={
                  <PerformanceMarks routeName="login">
                    <LoginPage />
                  </PerformanceMarks>
                } 
              />
              
              {/* Protected Routes with Layout */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="dashboard">
                        <DashboardPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/quotes"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="quotes">
                        <QuotesPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/quotes/:id"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="quote-detail">
                        <QuoteDetailPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/invoices"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="invoices">
                        <InvoicesPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/invoices/:id"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="invoice-detail">
                        <InvoiceDetailPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/projects"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="projects">
                        <ProjectsPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/projects/:id"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="project-detail">
                        <ProjectDetailPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/rate-cards"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="rate-cards">
                        <RateCardsPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/time"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="time">
                        <TimePage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/approvals/time"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="time-approvals">
                        <TimeApprovalsPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/customers"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="customers">
                        <CustomersListPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/customers/:id"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="customer-details">
                        <CustomerDetailsPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/users"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="users">
                        <UsersPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/payments"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="payments">
                        <PaymentsPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <AppLayout>
                      <PerformanceMarks routeName="settings">
                        <SettingsPage />
                      </PerformanceMarks>
                    </AppLayout>
                  </RequireAuth>
                }
              />
              
              {/* Catch-all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </RoutePrefetch>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
