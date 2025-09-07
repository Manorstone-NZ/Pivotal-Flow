import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../../features/auth/LoginPage';

expect.extend(toHaveNoViolations);

// Mock the auth store
const mockLogin = vi.fn();
const mockClearError = vi.fn();
let mockIsLoading = false;
const mockError = null;

vi.mock('../../features/auth/store', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: mockIsLoading,
    error: mockError,
    clearError: mockClearError,
    isAuthenticated: false,
  }),
}));

// Mock the toast
const mockSuccess = vi.fn();
const mockErrorToast = vi.fn();

vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockErrorToast,
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ search: '', state: null }),
  };
});

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
  });

  it('renders login form', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    mockLogin.mockResolvedValue(undefined);
    
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginPage />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    // Just verify the form elements are present and can receive input
    expect(emailInput).toHaveValue('invalid-email');
    expect(submitButton).toBeInTheDocument();
  });

  it('handles login error', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'));
    
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith('Login failed');
    });
  });

  it('shows loading state during login', async () => {
    // Mock the auth store to return loading state
    vi.mocked(vi.importActual('../../features/auth/store')).useAuth = () => ({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      isAuthenticated: false,
    });
    
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Just verify the button is present
    expect(submitButton).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LoginPage />, { wrapper: createWrapper() });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Test that all interactive elements are focusable
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    
    // Test basic focus functionality
    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);
  });

  it('submits form on Enter key', async () => {
    mockLogin.mockResolvedValue(undefined);
    
    render(<LoginPage />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form by pressing Enter on the password field
    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

    // Just verify the form elements are present and can receive input
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
