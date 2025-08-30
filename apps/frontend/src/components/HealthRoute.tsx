import React from 'react';

/**
 * Placeholder health route component for performance measurement
 * This demonstrates code splitting and lazy loading capabilities
 */
export const HealthRoute: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🏥 Health Check Route</h1>
      <p>This is a placeholder route for performance measurement only.</p>
      <div style={{ margin: '2rem 0' }}>
        <h2>Performance Metrics</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ Code splitting enabled</li>
          <li>✅ React.lazy implemented</li>
          <li>✅ Suspense boundary active</li>
          <li>✅ Bundle analyzer configured</li>
        </ul>
      </div>
      <div style={{ margin: '2rem 0' }}>
        <h2>Bundle Information</h2>
        <p>Check <code>dist/stats.html</code> for detailed bundle analysis</p>
        <p>Target: Total bundle size under 200KB</p>
        <p>Target: Time to Interactive under 2s</p>
      </div>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '1rem', 
        borderRadius: '8px',
        margin: '2rem 0'
      }}>
        <h3>Measurement Instructions</h3>
        <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>Run <code>npm run analyze</code> to generate bundle stats</li>
          <li>Use Lighthouse CI to measure performance</li>
          <li>Verify chunk splitting in browser dev tools</li>
          <li>Check network tab for lazy-loaded chunks</li>
        </ol>
      </div>
    </div>
  );
};

