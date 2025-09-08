import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LandingPage } from './Landing';
import { Hero } from './sections/Hero';
import { FeatureGrid } from './sections/FeatureGrid';
import { LiveStatus } from './sections/LiveStatus';
import { Footer } from './sections/Footer';

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock('../../../features/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock fetch for health endpoint
global.fetch = vi.fn();

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  });

  it('renders the landing page with all sections', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    expect(screen.getByText('Pivotal Flow')).toBeInTheDocument();
    expect(screen.getByText('Quotes → Invoices → Payments, flawlessly connected.')).toBeInTheDocument();
    expect(screen.getByText('Everything you need to manage your business')).toBeInTheDocument();
    expect(screen.getByText('System Status')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    const mainElement = container.querySelector('.min-h-screen');
    expect(mainElement).toHaveClass('bg-gradient-to-br', 'from-surface-background');
  });
});

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders headline and subheadline', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <Hero />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Pivotal Flow' })).toBeInTheDocument();
    expect(screen.getByText('Quotes → Invoices → Payments, flawlessly connected.')).toBeInTheDocument();
  });

  it('shows Sign In button when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <Hero />
      </TestWrapper>
    );

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).not.toBeDisabled();
  });

  it('shows Continue to Dashboard and Explore Quotes buttons when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'test@example.com' },
    });

    render(
      <TestWrapper>
        <Hero />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Continue to Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explore Quotes' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back, test@example.com')).toBeInTheDocument();
  });

  it('navigates to login when Sign In is clicked', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <Hero />
      </TestWrapper>
    );

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to dashboard when Continue to Dashboard is clicked', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'test@example.com' },
    });

    render(
      <TestWrapper>
        <Hero />
      </TestWrapper>
    );

    const continueButton = screen.getByRole('button', { name: 'Continue to Dashboard' });
    fireEvent.click(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('has proper accessibility attributes', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <Hero />
      </TestWrapper>
    );

    const heading = screen.getByRole('heading', { name: 'Pivotal Flow' });
    expect(heading).toHaveAttribute('id', 'hero-heading');

    const section = heading.closest('section');
    expect(section).toHaveAttribute('aria-labelledby', 'hero-heading');
  });
});

describe('FeatureGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  });

  it('renders all 5 feature cards', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <FeatureGrid />
      </TestWrapper>
    );

    expect(screen.getByText('Quotes')).toBeInTheDocument();
    expect(screen.getByText('Rate Cards')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Time & Approvals')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('shows Sign In Required for auth-required features when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <FeatureGrid />
      </TestWrapper>
    );

    const buttons = screen.getAllByText('Sign In Required');
    expect(buttons).toHaveLength(5); // All features require auth
  });

  it('shows Get Started for features when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'test@example.com' },
    });

    render(
      <TestWrapper>
        <FeatureGrid />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole('button', { name: 'Get Started' });
    expect(buttons).toHaveLength(5);
  });

  it('navigates to login when clicking disabled feature button', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <FeatureGrid />
      </TestWrapper>
    );

    const quotesButton = screen.getByRole('button', { name: 'Sign In Required' });
    fireEvent.click(quotesButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to feature route when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'test@example.com' },
    });

    render(
      <TestWrapper>
        <FeatureGrid />
      </TestWrapper>
    );

    const quotesButton = screen.getAllByRole('button', { name: 'Get Started' })[0];
    fireEvent.click(quotesButton);

    expect(mockNavigate).toHaveBeenCalledWith('/quotes');
  });

  it('has proper semantic HTML structure', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <TestWrapper>
        <FeatureGrid />
      </TestWrapper>
    );

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(5);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(5);
  });
});

describe('LiveStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('renders system status section', () => {
    render(
      <TestWrapper>
        <LiveStatus />
      </TestWrapper>
    );

    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Details' })).toBeInTheDocument();
  });

  it('fetches health status on mount', async () => {
    const mockHealthResponse = {
      status: 'ok',
      timestamp: '2024-01-01T00:00:00Z',
      uptime: 3600,
      version: '1.0.0',
      checks: {
        database: { status: 'ok', message: 'Database connection successful', timestamp: '2024-01-01T00:00:00Z' },
        redis: { status: 'ok', message: 'Redis connection successful', timestamp: '2024-01-01T00:00:00Z' },
        metrics: { status: 'ok', message: 'Metrics service operational', timestamp: '2024-01-01T00:00:00Z' },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthResponse,
    });

    render(
      <TestWrapper>
        <LiveStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/health', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
    });
  });

  it('handles health check failure gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <TestWrapper>
        <LiveStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Service Unavailable')).toBeInTheDocument();
    });
  });

  it('shows detailed status when Show Details is clicked', async () => {
    const mockHealthResponse = {
      status: 'ok',
      timestamp: '2024-01-01T00:00:00Z',
      uptime: 3600,
      version: '1.0.0',
      checks: {
        database: { status: 'ok', message: 'Database connection successful', timestamp: '2024-01-01T00:00:00Z' },
        redis: { status: 'ok', message: 'Redis connection successful', timestamp: '2024-01-01T00:00:00Z' },
        metrics: { status: 'ok', message: 'Metrics service operational', timestamp: '2024-01-01T00:00:00Z' },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthResponse,
    });

    render(
      <TestWrapper>
        <LiveStatus />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
    });

    const showDetailsButton = screen.getByRole('button', { name: 'Show Details' });
    fireEvent.click(showDetailsButton);

    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();
    expect(screen.getByText('Metrics')).toBeInTheDocument();
    expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument();
  });

  it('has aria-live region for screen reader announcements', () => {
    render(
      <TestWrapper>
        <LiveStatus />
      </TestWrapper>
    );

    const liveRegion = screen.getByRole('status', { hidden: true });
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });
});

describe('Footer', () => {
  it('renders footer with version information', () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    expect(screen.getByText('Pivotal Flow')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Changelog')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText(/Version:/)).toBeInTheDocument();
    expect(screen.getByText(/Build:/)).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: 'Footer navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('shows current year in copyright', () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Pivotal Flow. All rights reserved.`)).toBeInTheDocument();
  });
});
