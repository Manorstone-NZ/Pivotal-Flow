import React from 'react';
type Props = React.PropsWithChildren<{ onClick?: () => void }>;
export const Button: React.FC<Props> = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    backgroundColor: 'var(--pf-color-primary)',
    color: 'var(--pf-color-on-primary)',
    border: 'none', padding: '0.75rem 1rem',
    borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer'
  }}>{children}</button>
);
