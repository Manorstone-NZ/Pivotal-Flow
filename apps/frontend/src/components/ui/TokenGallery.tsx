interface TokenGalleryProps {
  className?: string;
}

export function TokenGallery({ className = '' }: TokenGalleryProps) {
  const colorTokens = [
    { name: 'Brand Primary', value: 'var(--pf-color-brand-primary)', css: '--pf-color-brand-primary' },
    { name: 'Brand Secondary', value: 'var(--pf-color-brand-secondary)', css: '--pf-color-brand-secondary' },
    { name: 'Brand Accent', value: 'var(--pf-color-brand-accent)', css: '--pf-color-brand-accent' },
    { name: 'Success', value: 'var(--pf-color-semantic-success)', css: '--pf-color-semantic-success' },
    { name: 'Warning', value: 'var(--pf-color-semantic-warning)', css: '--pf-color-semantic-warning' },
    { name: 'Error', value: 'var(--pf-color-semantic-error)', css: '--pf-color-semantic-error' },
    { name: 'Info', value: 'var(--pf-color-semantic-info)', css: '--pf-color-semantic-info' },
  ];

  const neutralTokens = [
    { name: 'Neutral 50', value: 'var(--pf-color-neutral-50)', css: '--pf-color-neutral-50' },
    { name: 'Neutral 100', value: 'var(--pf-color-neutral-100)', css: '--pf-color-neutral-100' },
    { name: 'Neutral 200', value: 'var(--pf-color-neutral-200)', css: '--pf-color-neutral-200' },
    { name: 'Neutral 300', value: 'var(--pf-color-neutral-300)', css: '--pf-color-neutral-300' },
    { name: 'Neutral 400', value: 'var(--pf-color-neutral-400)', css: '--pf-color-neutral-400' },
    { name: 'Neutral 500', value: 'var(--pf-color-neutral-500)', css: '--pf-color-neutral-500' },
    { name: 'Neutral 600', value: 'var(--pf-color-neutral-600)', css: '--pf-color-neutral-600' },
    { name: 'Neutral 700', value: 'var(--pf-color-neutral-700)', css: '--pf-color-neutral-700' },
    { name: 'Neutral 800', value: 'var(--pf-color-neutral-800)', css: '--pf-color-neutral-800' },
    { name: 'Neutral 900', value: 'var(--pf-color-neutral-900)', css: '--pf-color-neutral-900' },
    { name: 'Neutral 950', value: 'var(--pf-color-neutral-950)', css: '--pf-color-neutral-950' },
  ];

  const surfaceTokens = [
    { name: 'Background', value: 'var(--pf-color-surface-background)', css: '--pf-color-surface-background' },
    { name: 'Card', value: 'var(--pf-color-surface-card)', css: '--pf-color-surface-card' },
    { name: 'Border', value: 'var(--pf-color-surface-border)', css: '--pf-color-surface-border' },
  ];

  const textTokens = [
    { name: 'Primary', value: 'var(--pf-color-text-primary)', css: '--pf-color-text-primary' },
    { name: 'Secondary', value: 'var(--pf-color-text-secondary)', css: '--pf-color-text-secondary' },
    { name: 'Disabled', value: 'var(--pf-color-text-disabled)', css: '--pf-color-text-disabled' },
    { name: 'Inverse', value: 'var(--pf-color-text-inverse)', css: '--pf-color-text-inverse' },
  ];

  const spacingTokens = [
    { name: '1', value: 'var(--pf-spacing-1)', css: '--pf-spacing-1' },
    { name: '2', value: 'var(--pf-spacing-2)', css: '--pf-spacing-2' },
    { name: '4', value: 'var(--pf-spacing-4)', css: '--pf-spacing-4' },
    { name: '6', value: 'var(--pf-spacing-6)', css: '--pf-spacing-6' },
    { name: '8', value: 'var(--pf-spacing-8)', css: '--pf-spacing-8' },
    { name: '12', value: 'var(--pf-spacing-12)', css: '--pf-spacing-12' },
    { name: '16', value: 'var(--pf-spacing-16)', css: '--pf-spacing-16' },
    { name: '24', value: 'var(--pf-spacing-24)', css: '--pf-spacing-24' },
    { name: '32', value: 'var(--pf-spacing-32)', css: '--pf-spacing-32' },
  ];

  const typographyTokens = [
    { name: 'XS', value: 'var(--pf-font-size-xs)', css: '--pf-font-size-xs' },
    { name: 'SM', value: 'var(--pf-font-size-sm)', css: '--pf-font-size-sm' },
    { name: 'Base', value: 'var(--pf-font-size-base)', css: '--pf-font-size-base' },
    { name: 'LG', value: 'var(--pf-font-size-lg)', css: '--pf-font-size-lg' },
    { name: 'XL', value: 'var(--pf-font-size-xl)', css: '--pf-font-size-xl' },
    { name: '2XL', value: 'var(--pf-font-size-2xl)', css: '--pf-font-size-2xl' },
    { name: '3XL', value: 'var(--pf-font-size-3xl)', css: '--pf-font-size-3xl' },
    { name: '4XL', value: 'var(--pf-font-size-4xl)', css: '--pf-font-size-4xl' },
  ];

  const shadowTokens = [
    { name: 'SM', value: 'var(--pf-shadow-sm)', css: '--pf-shadow-sm' },
    { name: 'Base', value: 'var(--pf-shadow-base)', css: '--pf-shadow-base' },
    { name: 'MD', value: 'var(--pf-shadow-md)', css: '--pf-shadow-md' },
    { name: 'LG', value: 'var(--pf-shadow-lg)', css: '--pf-shadow-lg' },
    { name: 'XL', value: 'var(--pf-shadow-xl)', css: '--pf-shadow-xl' },
    { name: '2XL', value: 'var(--pf-shadow-2xl)', css: '--pf-shadow-2xl' },
  ];

  const TokenSection = ({ title, tokens, type }: { title: string; tokens: Array<{ name: string; value: string; css: string }>; type: 'color' | 'spacing' | 'typography' | 'shadow' }) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-text-primary mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <div key={token.name} className="bg-surface-card border border-surface-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-text-primary">{token.name}</span>
              <code className="text-sm text-text-secondary bg-neutral-100 px-2 py-1 rounded">
                {token.css}
              </code>
            </div>
            
            {type === 'color' && (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded border border-surface-border"
                  style={{ backgroundColor: token.value }}
                  aria-label={`Color preview for ${token.name}`}
                />
                <div className="flex-1">
                  <div className="text-sm text-text-secondary font-mono">{token.value}</div>
                </div>
              </div>
            )}
            
            {type === 'spacing' && (
              <div className="flex items-center gap-3">
                <div
                  className="bg-brand-primary rounded"
                  style={{ width: token.value, height: '20px' }}
                  aria-label={`Spacing preview for ${token.name}`}
                />
                <div className="text-sm text-text-secondary font-mono">{token.value}</div>
              </div>
            )}
            
            {type === 'typography' && (
              <div className="space-y-2">
                <div
                  className="text-text-primary"
                  style={{ fontSize: token.value }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
                <div className="text-sm text-text-secondary font-mono">{token.value}</div>
              </div>
            )}
            
            {type === 'shadow' && (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 bg-surface-card rounded border border-surface-border"
                  style={{ boxShadow: token.value }}
                  aria-label={`Shadow preview for ${token.name}`}
                />
                <div className="text-sm text-text-secondary font-mono truncate">{token.value}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Design Token Gallery</h1>
        <p className="text-text-secondary">
          Comprehensive showcase of all design tokens used in the Pivotal Flow design system.
        </p>
      </div>

      <TokenSection title="Brand Colors" tokens={colorTokens} type="color" />
      <TokenSection title="Neutral Colors" tokens={neutralTokens} type="color" />
      <TokenSection title="Surface Colors" tokens={surfaceTokens} type="color" />
      <TokenSection title="Text Colors" tokens={textTokens} type="color" />
      <TokenSection title="Spacing Scale" tokens={spacingTokens} type="spacing" />
      <TokenSection title="Typography Scale" tokens={typographyTokens} type="typography" />
      <TokenSection title="Shadow Scale" tokens={shadowTokens} type="shadow" />
    </div>
  );
}
