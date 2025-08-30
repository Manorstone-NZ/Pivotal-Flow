module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/health'],
      startServerCommand: 'cd apps/frontend && npm run dev',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 10000,
    },
    assert: {
      assertions: {
        // Performance budgets
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'interactive': ['error', { maxNumericValue: 2000 }], // TTI < 2s
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Bundle size budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 200000 }], // JS < 200KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 500000 }], // Total < 500KB
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

