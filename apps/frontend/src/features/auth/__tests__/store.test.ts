import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth, useAuthStore } from '../../features/auth/store';

// Mock the SDK with proper PivotalFlowClient export
vi.mock('@pivotal-flow/sdk', () => ({
  PivotalFlowClient: vi.fn().mockImplementation(() => ({
    auth: {
      login: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
    },
    users: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    quotes: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      transitionStatus: vi.fn(),
    },
  })),
}));

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.removeItem.mockClear();
    localStorageMock.setItem.mockClear();
    // Reset fetch mock
    global.fetch = vi.fn();
    
    // Clear persisted auth state
    localStorageMock.removeItem('pivotal-flow-auth');
    
    // Reset store state directly
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('initializes with no user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles login successfully', async () => {
    const mockLoginResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    };

    // Mock fetch for login request
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockLoginResponse.user);
    expect(result.current.accessToken).toBe(mockLoginResponse.accessToken);
  });

  it('handles login failure', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    });

    const { result } = renderHook(() => useAuth());

    // Ensure initial state is clean
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    await act(async () => {
      try {
        await result.current.login('invalid@example.com', 'wrongpassword');
      } catch (error) {
        // Expected to throw
      }
    });

    // State should remain clean after failed login
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('handles logout', async () => {
    const mockLoginResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    };

    // Mock fetch for login request
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
    });

    const { result } = renderHook(() => useAuth());

    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
  });

  it('handles token refresh', async () => {
    const mockRefreshResponse = {
      accessToken: 'new-access-token',
      expiresIn: 3600,
    };

    // Mock fetch for refresh request
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRefreshResponse),
    });

    // Set up initial state with refresh token
    const { result } = renderHook(() => useAuth());
    
    // Set refresh token in state
    await act(async () => {
      result.current.setTokens('old-access-token', 'refresh-token');
    });

    await act(async () => {
      await result.current.refreshAccessToken();
    });

    expect(result.current.accessToken).toBe(mockRefreshResponse.accessToken);
  });

  it('handles token refresh failure', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAuth());

    // Set refresh token in state
    await act(async () => {
      result.current.setTokens('old-access-token', 'invalid-refresh-token');
    });

    await act(async () => {
      try {
        await result.current.refreshAccessToken();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('loads user from stored token', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };

    // Mock fetch for auth check request
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useAuth());

    // Set access token in state
    await act(async () => {
      result.current.setTokens('valid-access-token', 'refresh-token');
    });

    await act(async () => {
      await result.current.checkAuthStatus();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles loadUser failure', async () => {
    // Mock fetch to return 401 (unauthorized)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAuth());

    // Set invalid access token in state
    await act(async () => {
      result.current.setTokens('invalid-access-token', 'refresh-token');
    });

    await act(async () => {
      await result.current.checkAuthStatus();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
