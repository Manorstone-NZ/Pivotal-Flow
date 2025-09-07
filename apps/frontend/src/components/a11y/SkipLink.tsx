import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SkipLink component for keyboard navigation accessibility
 * Provides skip navigation links for keyboard users
 */
export function SkipLink({ 
  href, 
  children, 
  className = '' 
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary 
        focus:text-text-inverse focus:rounded-md focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        transition-all duration-200 ease-in-out
        ${className}
      `.trim()}
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          (target as HTMLElement).focus();
        }
      }}
    >
      {children}
    </a>
  );
}

/**
 * Common skip links for typical page structure
 */
export function CommonSkipLinks() {
  return (
    <>
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
      <SkipLink href="#navigation">
        Skip to navigation
      </SkipLink>
      <SkipLink href="#footer">
        Skip to footer
      </SkipLink>
    </>
  );
}
