# Pivotal Flow - Frontend Architecture Specifications

## 🎨 **Frontend Architecture Overview**

### **Architecture Principles**
1. **Component-Based**: Reusable, composable components with clear interfaces
2. **State Management**: Centralized state with predictable data flow
3. **Performance First**: Optimized rendering, lazy loading, and code splitting
4. **Accessibility**: WCAG 2.1 AA compliance with semantic HTML
5. **Responsive Design**: Mobile-first approach with progressive enhancement
6. **Type Safety**: Full TypeScript coverage with strict type checking
7. **Testing**: Comprehensive testing with high coverage requirements

### **Technology Stack**
- **Framework**: React 18+ with Concurrent Features
- **Language**: TypeScript 5+ with strict mode
- **Build Tool**: Vite 5+ for fast development and optimized builds
- **Styling**: Tailwind CSS 3+ with custom design system
- **State Management**: Zustand for local state, React Query for server state
- **Routing**: React Router 6+ with nested routing
- **Testing**: Vitest + React Testing Library + Playwright

---

## 🏗️ **Application Architecture**

### **1. Core Application Structure**
```typescript
// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorFallback } from '@/components/ErrorFallback';
import { AppRoutes } from '@/routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AppRoutes />
                </Suspense>
              </Layout>
            </BrowserRouter>
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### **2. Routing Architecture**
```typescript
// src/routes/AppRoutes.tsx
import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';

// Lazy load route components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Projects = lazy(() => import('@/pages/Projects'));
const Quotes = lazy(() => import('@/pages/Quotes'));
const TimeTracking = lazy(() => import('@/pages/TimeTracking'));
const Users = lazy(() => import('@/pages/Users'));
const Settings = lazy(() => import('@/pages/Settings'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/projects/*" element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      } />
      <Route path="/quotes/*" element={
        <ProtectedRoute>
          <Quotes />
        </ProtectedRoute>
      } />
      <Route path="/time-tracking/*" element={
        <ProtectedRoute>
          <TimeTracking />
        </ProtectedRoute>
      } />
      <Route path="/users/*" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/settings/*" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      {/* 404 route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
```

---

## 🧩 **Component Architecture**

### **1. Component Hierarchy**

#### **Layout Components**
```typescript
// src/components/Layout/Layout.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// src/components/Layout/Sidebar.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { UserProfile } from './UserProfile';

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pivotal Flow</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <Navigation />
          <UserProfile />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pivotal Flow</h1>
          </div>
          <Navigation />
          <UserProfile />
        </div>
      </div>
    </>
  );
}
```

#### **Page Components**
```typescript
// src/pages/Dashboard/Dashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from './components/DashboardStats';
import { RecentActivity } from './components/RecentActivity';
import { ProjectProgress } from './components/ProjectProgress';
import { TimeSummary } from './components/TimeSummary';
import { dashboardApi } from '@/api/dashboard';

export function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-3">
          <DateRangePicker />
          <RefreshButton />
        </div>
      </div>

      <DashboardStats stats={dashboardData.stats} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectProgress projects={dashboardData.projects} />
        <TimeSummary timeData={dashboardData.timeData} />
      </div>

      <RecentActivity activities={dashboardData.recentActivity} />
    </div>
  );
}

// src/pages/Projects/Projects.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProjectList } from './components/ProjectList';
import { ProjectFilters } from './components/ProjectFilters';
import { CreateProjectButton } from './components/CreateProjectButton';
import { projectsApi } from '@/api/projects';
import { useProjectFilters } from './hooks/useProjectFilters';

export function Projects() {
  const { filters, updateFilters } = useProjectFilters();
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.getProjects(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <CreateProjectButton />
      </div>

      <ProjectFilters filters={filters} onFiltersChange={updateFilters} />
      
      {isLoading ? (
        <ProjectListSkeleton />
      ) : error ? (
        <ProjectListError error={error} />
      ) : (
        <ProjectList projects={projects.data} pagination={projects.pagination} />
      )}
    </div>
  );
}
```

### **2. Component Composition Patterns**

#### **Compound Components**
```typescript
// src/components/ui/DataTable/DataTable.tsx
import React from 'react';
import { DataTableProvider } from './DataTableContext';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { DataTablePagination } from './DataTablePagination';
import { DataTableFilters } from './DataTableFilters';

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowSelect?: (rows: T[]) => void;
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  children: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  onRowSelect,
  selectable = false,
  sortable = true,
  filterable = true,
  pagination = true,
  children
}: DataTableProps<T>) {
  return (
    <DataTableProvider
      data={data}
      columns={columns}
      onRowSelect={onRowSelect}
      selectable={selectable}
      sortable={sortable}
      filterable={filterable}
      pagination={pagination}
    >
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        {filterable && <DataTableFilters />}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <DataTableHeader />
            <DataTableBody />
          </table>
        </div>
        {pagination && <DataTablePagination />}
      </div>
      {children}
    </DataTableProvider>
  );
}

// Usage example
<DataTable data={projects} columns={projectColumns} selectable sortable filterable pagination>
  <DataTableToolbar>
    <DataTableSearch />
    <DataTableActions />
  </DataTableToolbar>
</DataTable>
```

#### **Render Props Pattern**
```typescript
// src/components/ui/AsyncBoundary/AsyncBoundary.tsx
import React from 'react';

interface AsyncBoundaryProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  children: (data: T) => React.ReactNode;
}

export function AsyncBoundary<T>({
  data,
  isLoading,
  error,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  children
}: AsyncBoundaryProps<T>) {
  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} retry={() => window.location.reload()} />;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return <>{children(data)}</>;
}

// Usage example
<AsyncBoundary
  data={projects}
  isLoading={isLoading}
  error={error}
  loadingComponent={ProjectListSkeleton}
  errorComponent={ProjectListError}
>
  {(projects) => <ProjectList projects={projects} />}
</AsyncBoundary>
```

---

## 🔄 **State Management Architecture**

### **1. Zustand Store Structure**
```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApi } from '@/api/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authApi.login({ email, password });
            
            set({
              user: response.user,
              token: response.access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed'
            });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          });
        },

        refreshToken: async () => {
          try {
            const response = await authApi.refreshToken();
            set({
              token: response.access_token,
              isAuthenticated: true
            });
          } catch (error) {
            get().logout();
          }
        },

        clearError: () => set({ error: null })
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          token: state.token, 
          isAuthenticated: state.isAuthenticated 
        })
      }
    )
  )
);
```

### **2. React Query Integration**
```typescript
// src/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { toast } from 'react-hot-toast';

export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.getProjects(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getProject(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: (newProject) => {
      // Update projects list
      queryClient.setQueryData(['projects'], (oldData: any) => {
        if (!oldData) return { data: [newProject], pagination: { total: 1 } };
        
        return {
          ...oldData,
          data: [newProject, ...oldData.data],
          pagination: { ...oldData.pagination, total: oldData.pagination.total + 1 }
        };
      });

      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create project');
      console.error('Create project error:', error);
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.updateProject,
    onSuccess: (updatedProject) => {
      // Update individual project
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject);
      
      // Update projects list
      queryClient.setQueryData(['projects'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((project: any) => 
            project.id === updatedProject.id ? updatedProject : project
          )
        };
      });

      toast.success('Project updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update project');
      console.error('Update project error:', error);
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: (_, projectId) => {
      // Remove from projects list
      queryClient.setQueryData(['projects'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.filter((project: any) => project.id !== projectId),
          pagination: { ...oldData.pagination, total: oldData.pagination.total - 1 }
        };
      });

      // Remove individual project
      queryClient.removeQueries({ queryKey: ['projects', projectId] });
      
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete project');
      console.error('Delete project error:', error);
    }
  });
}
```

---

## 🎨 **Styling Architecture**

### **1. Tailwind CSS Configuration**
```typescript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### **2. CSS Modules for Component-Specific Styles**
```typescript
// src/components/ui/Button/Button.module.css
.button {
  @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background;
}

.primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800;
}

.secondary {
  @apply bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-600;
}

.outline {
  @apply border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800;
}

.ghost {
  @apply hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100;
}

.small {
  @apply h-8 px-3 text-xs;
}

.medium {
  @apply h-10 px-4 py-2;
}

.large {
  @apply h-12 px-6 text-base;
}

.icon {
  @apply h-10 w-10;
}
```

---

## 🧪 **Testing Architecture**

### **1. Unit Testing with Vitest**
```typescript
// src/components/ui/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="small">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Button size="large">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state when loading prop is true', () => {
    render(<Button loading>Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### **2. Integration Testing**
```typescript
// src/pages/Projects/Projects.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Projects } from './Projects';
import { projectsApi } from '@/api/projects';

// Mock API
vi.mock('@/api/projects');
const mockProjectsApi = vi.mocked(projectsApi);

// Mock auth store
vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { id: '1', organizationId: 'org1' }
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Projects', () => {
  it('renders projects list when data is loaded', async () => {
    const mockProjects = {
      data: [
        { id: '1', name: 'Project Alpha', status: 'active' },
        { id: '2', name: 'Project Beta', status: 'completed' }
      ],
      pagination: { total: 2, page: 1, limit: 10 }
    };

    mockProjectsApi.getProjects.mockResolvedValue(mockProjects);

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', () => {
    mockProjectsApi.getProjects.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<Projects />);
    
    expect(screen.getByTestId('project-list-skeleton')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    mockProjectsApi.getProjects.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    });
  });

  it('filters projects when filters change', async () => {
    const mockProjects = {
      data: [{ id: '1', name: 'Project Alpha', status: 'active' }],
      pagination: { total: 1, page: 1, limit: 10 }
    };

    mockProjectsApi.getProjects.mockResolvedValue(mockProjects);

    renderWithProviders(<Projects />);

    // Change status filter
    const statusFilter = screen.getByLabelText('Status');
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    await waitFor(() => {
      expect(mockProjectsApi.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });
  });
});
```

---

## 📱 **Responsive Design Architecture**

### **1. Mobile-First Approach**
```typescript
// src/components/ui/ResponsiveContainer/ResponsiveContainer.tsx
import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
}

export function ResponsiveContainer({ children, mobile, tablet, desktop }: ResponsiveContainerProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;

  return <>{children}</>;
}

// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
```

### **2. Responsive Grid System**
```typescript
// src/components/ui/Grid/Grid.tsx
import React from 'react';
import clsx from 'clsx';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Grid({ children, cols = 1, gap = 'md', className }: GridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  };

  const gridGap = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div className={clsx(
      'grid',
      gridCols[cols],
      gridGap[gap],
      className
    )}>
      {children}
    </div>
  );
}
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Architecture**
- [ ] Project structure and routing setup
- [ ] Component library foundation
- [ ] State management implementation
- [ ] API integration layer

### **Phase 2: Component Development**
- [ ] Layout components (Header, Sidebar, Navigation)
- [ ] Form components with validation
- [ ] Data display components (Tables, Cards, Lists)
- [ ] Feedback components (Modals, Toasts, Alerts)

### **Phase 3: Page Development**
- [ ] Dashboard with analytics
- [ ] Project management pages
- [ ] Time tracking interface
- [ ] User management pages

### **Phase 4: Advanced Features**
- [ ] Real-time updates
- [ ] Offline support
- [ ] Progressive Web App features
- [ ] Performance optimization

### **Phase 5: Testing & Quality**
- [ ] Unit test coverage (90%+)
- [ ] Integration test coverage (80%+)
- [ ] E2E test coverage (70%+)
- [ ] Accessibility testing and compliance

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Frontend Architecture Version**: 1.0.0
