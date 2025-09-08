import '@testing-library/jest-dom';

// Mock global objects for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URLSearchParams for auth tests
global.URLSearchParams = vi.fn().mockImplementation(() => ({
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(),
  delete: vi.fn(),
}));

// Mock process.env for API client tests
Object.defineProperty(process, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000/api/v1',
  },
  writable: true,
});

// Extend the expect interface for jest-axe
declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void;
  }
}

// Mock jest for compatibility
declare global {
  var jest: {
    fn: (implementation?: (...args: unknown[]) => unknown) => unknown;
  };
}

global.jest = {
  fn: (implementation?: (...args: unknown[]) => unknown) => {
    const mockFn = (...args: unknown[]) => {
      mockFn.mock.calls.push(args);
      if (implementation) {
        return implementation(...args);
      }
      return mockFn.mock.results[mockFn.mock.results.length - 1]?.value;
    };
    
    mockFn.mock = {
      calls: [] as unknown[][],
      results: [] as { type: string; value: unknown }[],
    };
    
    mockFn.mockReturnValue = (value: unknown) => {
      mockFn.mock.results.push({ type: 'return', value });
      return mockFn;
    };
    
    mockFn.mockImplementation = (imp: (...args: unknown[]) => unknown) => {
      implementation = imp;
      return mockFn;
    };
    
    return mockFn;
  },
};