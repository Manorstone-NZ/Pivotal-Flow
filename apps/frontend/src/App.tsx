import React from 'react';
import { useAppStore } from './lib/state/store';
import { Button } from './components/Button';

export const App: React.FC = () => {
  const count = useAppStore(s => s.count);
  const inc = useAppStore(s => s.inc);
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pivotal Flow</h1>
      <p>Design tokens in use. Try the button.</p>
      <Button onClick={inc}>Clicked {count} times</Button>
    </div>
  );
};
