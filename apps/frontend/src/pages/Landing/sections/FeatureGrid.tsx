import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { Button } from '../../../components/ui';

/**
 * Feature Card Interface
 */
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  requiresAuth: boolean;
}

/**
 * Feature Grid Component
 * 
 * Features:
 * - 5 feature cards: Quotes, Rate Cards, Invoices, Time & Approvals, Users
 * - Each card: SVG icon, short description, CTA
 * - Semantic HTML with accessible headings
 * - Responsive grid: 1/2/3 columns based on screen size
 * - Auth-aware CTAs (disabled if not authenticated)
 */
export const FeatureGrid: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Feature definitions
  const features: FeatureCard[] = [
    {
      id: 'quotes',
      title: 'Quotes',
      description: 'Create, manage, and track quotes from start to finish.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      route: '/quotes',
      requiresAuth: true,
    },
    {
      id: 'rate-cards',
      title: 'Rate Cards',
      description: 'Define pricing structures and rate cards for consistent quoting.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      route: '/rate-cards',
      requiresAuth: true,
    },
    {
      id: 'invoices',
      title: 'Invoices',
      description: 'Generate professional invoices and track payment status.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      route: '/invoices',
      requiresAuth: true,
    },
    {
      id: 'time-approvals',
      title: 'Time & Approvals',
      description: 'Track time, manage approvals, and streamline workflows.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      route: '/time',
      requiresAuth: true,
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage team members, roles, and permissions.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      route: '/users',
      requiresAuth: true,
    },
  ];

  const handleFeatureClick = (feature: FeatureCard) => {
    if (feature.requiresAuth && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(feature.route);
    }
  };

  return (
    <section 
      className="px-4 py-16 sm:px-6 lg:px-8 bg-surface-card"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold text-text-primary mb-4"
          >
            Everything you need to manage your business
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Streamline your workflow from quotes to payments with our comprehensive suite of tools.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <article
              key={feature.id}
              role="article"
              className="bg-surface-background rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-surface-border"
            >
              {/* Icon */}
              <div className="text-brand-primary mb-4">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {feature.title}
              </h3>
              
              <p className="text-text-secondary mb-6">
                {feature.description}
              </p>
              
              {/* CTA Button */}
              <Button
                onClick={() => handleFeatureClick(feature)}
                variant={isAuthenticated ? "primary" : "outline"}
                size="sm"
                disabled={feature.requiresAuth && !isAuthenticated}
                className="w-full"
                aria-describedby={`${feature.id}-description`}
              >
                {feature.requiresAuth && !isAuthenticated ? 'Sign In Required' : 'Get Started'}
              </Button>
              
              {/* Hidden description for screen readers */}
              <div className="sr-only">
                <p id={`${feature.id}-description`}>
                  {feature.requiresAuth && !isAuthenticated 
                    ? `Sign in to access ${feature.title} features`
                    : `Access ${feature.title} features and tools`
                  }
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
