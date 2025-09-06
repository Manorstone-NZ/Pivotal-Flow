import React, { Suspense, lazy, useState } from 'react';
import { useAppStore } from './lib/state/store.js';
import { Button } from './components/Button.jsx';
// Lazy load the health route component
const HealthRoute = lazy(() => import('./components/HealthRoute.jsx').then(module => ({ default: module.HealthRoute })));
export const App = () => {
    const count = useAppStore(s => s.count);
    const inc = useAppStore(s => s.inc);
    const [currentRoute, setCurrentRoute] = useState('main');
    const renderRoute = () => {
        switch (currentRoute) {
            case 'health':
                return (
                    <Suspense fallback={<div>Loading health route...</div>}>
                        <HealthRoute />
                    </Suspense>
                );
            default:
                return (<div>
            <h1>Pivotal Flow</h1>
            <p>Design tokens in use. Try the button.</p>
            <Button onClick={inc}>Clicked {count} times</Button>
          </div>);
        }
    };
    return (<div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <Button onClick={() => setCurrentRoute('main')} style={{ marginRight: '1rem' }}>
          Main Route
        </Button>
        <Button onClick={() => setCurrentRoute('health')}>
          Health Route (Lazy)
        </Button>
      </div>
      {renderRoute()}
    </div>);
};
//# sourceMappingURL=App.js.map