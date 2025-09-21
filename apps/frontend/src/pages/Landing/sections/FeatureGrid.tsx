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
 * Feature Grid Component - Modern, Professional Design
 * 
 * Features:
 * - Properly sized icons (20px instead of 32px)
 * - Clean card design with subtle shadows
 * - Professional spacing and typography
 * - Hover effects and transitions
 * - Responsive grid layout
 */
export const FeatureGrid: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Feature definitions with properly sized icons
  const features: FeatureCard[] = [
    {
      id: 'quotes',
      title: 'Quotes',
      description: 'Create, manage, and track quotes from start to finish with professional templates.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      route: '/quotes',
      requiresAuth: true,
    },
    {
      id: 'rate-cards',
      title: 'Rate Cards',
      description: 'Define pricing structures and rate cards for consistent, professional quoting.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      route: '/rate-cards',
      requiresAuth: true,
    },
    {
      id: 'invoices',
      title: 'Invoices',
      description: 'Generate professional invoices and track payment status with automated reminders.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      route: '/invoices',
      requiresAuth: true,
    },
    {
      id: 'time-approvals',
      title: 'Time & Approvals',
      description: 'Track time, manage approvals, and streamline workflows with intelligent automation.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      route: '/time',
      requiresAuth: true,
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage team members, roles, and permissions with granular access controls.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
      className="px-4 py-20 sm:px-6 lg:px-8 bg-surface-card"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            id="features-heading"
            className="text-3xl font-bold text-text-primary tracking-tight sm:text-4xl mb-4"
          >
            Everything you need to manage your business
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Streamline your workflow from quotes to payments with our comprehensive suite of professional tools designed for modern businesses.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <article
              key={feature.id}
              role="article"
              className="group bg-surface-card rounded-xl border border-surface-border p-6 hover:border-surface-border hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleFeatureClick(feature)}
            >
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 rounded-lg text-brand-primary mb-4 group-hover:bg-brand-primary/20 transition-colors duration-200">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-brand-primary transition-colors duration-200">
                {feature.title}
              </h3>
              
              <p className="text-text-secondary mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              {/* CTA Button */}
              <div className="flex items-center text-sm font-medium text-brand-primary group-hover:text-brand-secondary transition-colors duration-200">
                {feature.requiresAuth && !isAuthenticated ? (
                  <>
                    <span>Sign In Required</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </div>
              
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

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-text-secondary mb-6">
            Ready to streamline your business workflow?
          </p>
          <Button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="bg-brand-primary text-text-inverse hover:bg-brand-secondary focus:ring-brand-primary px-8 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
          </Button>
        </div>
      </div>
    </section>
  );
};
