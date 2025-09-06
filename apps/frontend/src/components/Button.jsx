import React from 'react';
export const Button = ({ children, onClick, style }) => (<button onClick={onClick} style={{
        backgroundColor: 'var(--pf-color-primary)',
        color: 'var(--pf-color-on-primary)',
        border: 'none', padding: '0.75rem 1rem',
        borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer',
        ...style
    }}>{children}</button>);
//# sourceMappingURL=Button.js.map