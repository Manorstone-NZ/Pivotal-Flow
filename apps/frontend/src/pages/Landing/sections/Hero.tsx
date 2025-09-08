import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { Button } from '../../../components/ui';

/**
 * Hero Section Component - Modern, Professional Design
 * 
 * Features:
 * - Clean typography hierarchy inspired by Google/Jira
 * - Proper spacing and visual balance
 * - Subtle gradient background
 * - Professional button styling
 * - Responsive design with proper breakpoints
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
      className="relative bg-gradient-to-br from-neutral-50 via-white to-primary-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
      aria-labelledby="hero-heading"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-100/20 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        {/* Main Headline */}
        <h1 
          id="hero-heading"
          className="text-4xl font-bold text-blue-600 tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl mb-6"
        >
          <span className="block">Pivotal Flow</span>
        </h1>
        
        {/* Subheadline */}
        <p 
          className="text-lg text-neutral-600 mb-8 max-w-3xl mx-auto sm:text-xl lg:text-2xl leading-relaxed"
          aria-describedby="hero-description"
        >
          Streamline your business workflow from quotes to payments with our comprehensive suite of professional tools.
        </p>
        
        {/* Dynamic CTAs based on auth state */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          {isAuthenticated ? (
            <>
              <Button
                onClick={handleContinueToDashboard}
                className="bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-8 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px]"
                aria-describedby="continue-description"
              >
                Continue to Dashboard
              </Button>
              <Button
                onClick={handleExploreQuotes}
                className="border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500 px-8 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px]"
                aria-describedby="explore-description"
              >
                Explore Quotes
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSignIn}
              className="bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-8 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px]"
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
          <div className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-neutral-200/50 shadow-sm max-w-md mx-auto">
            <p className="text-sm text-neutral-600">
              Welcome back, <span className="font-medium text-neutral-900">{user.email}</span>
            </p>
          </div>
        )}

        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500 mb-6">Trusted by businesses worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-neutral-400 font-semibold">Security First</div>
            <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
            <div className="text-neutral-400 font-semibold">99.9% Uptime</div>
            <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
            <div className="text-neutral-400 font-semibold">24/7 Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};
