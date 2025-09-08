import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { Button } from '../../../components/ui';

/**
 * Hero Section Component
 * 
 * Features:
 * - Big headline: "Pivotal Flow"
 * - Subheadline: "Quotes → Invoices → Payments, flawlessly connected."
 * - Dynamic CTAs based on authentication state
 * - Keyboard focus order and accessibility
 * - Responsive design with motion preferences
 */
export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  const handleExploreQuotes = () => {
    navigate('/quotes');
  };

  return (
    <section 
      className="relative px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Headline */}
        <h1 
          id="hero-heading"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6"
        >
          <span className="block">Pivotal Flow</span>
        </h1>
        
        {/* Subheadline */}
        <p 
          className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto"
          aria-describedby="hero-description"
        >
          Quotes → Invoices → Payments, flawlessly connected.
        </p>
        
        {/* Dynamic CTAs based on auth state */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isAuthenticated ? (
            <>
              <Button
                onClick={handleContinueToDashboard}
                variant="primary"
                size="lg"
                className="min-w-[200px]"
                aria-describedby="continue-description"
              >
                Continue to Dashboard
              </Button>
              <Button
                onClick={handleExploreQuotes}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
                aria-describedby="explore-description"
              >
                Explore Quotes
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSignIn}
              variant="primary"
              size="lg"
              className="min-w-[200px]"
              aria-describedby="signin-description"
            >
              Sign In
            </Button>
          )}
        </div>
        
        {/* Hidden descriptions for screen readers */}
        <div className="sr-only">
          <p id="hero-description">
            Pivotal Flow streamlines your business workflow from quotes to payments
          </p>
          {isAuthenticated ? (
            <>
              <p id="continue-description">
                Continue to your dashboard to access all features
              </p>
              <p id="explore-description">
                Explore quotes and manage your business operations
              </p>
            </>
          ) : (
            <p id="signin-description">
              Sign in to access your Pivotal Flow account
            </p>
          )}
        </div>
        
        {/* Welcome message for authenticated users */}
        {isAuthenticated && user && (
          <p className="mt-6 text-sm text-text-secondary">
            Welcome back, {user.email}
          </p>
        )}
      </div>
    </section>
  );
};
