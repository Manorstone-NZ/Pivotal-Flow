import React from 'react';
import { Hero } from './sections/Hero';
import { FeatureGrid } from './sections/FeatureGrid';
import { LiveStatus } from './sections/LiveStatus';
import { Footer } from './sections/Footer';

/**
 * Landing Page Component
 * 
 * Serves both unauthenticated users (marketing-lite + sign-in) and 
 * authenticated users (dashboard shortcut tiles).
 * 
 * Features:
 * - Elegant hero section with gradient background
 * - Feature highlights: Quotes, Rate Cards, Invoices, Time & Approvals, Users
 * - Live system status from backend /health endpoint
 * - Footer with version/build info and links
 * - Responsive design with dark mode support
 * - Accessibility compliant (WCAG 2.1 AA)
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-background via-neutral-50 to-surface-background">
      {/* Main Content */}
      <main className="relative">
        <Hero />
        <FeatureGrid />
        <LiveStatus />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
