import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from './store';
import { Button } from '../../components/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  console.log('🏠 LoginPage component loaded');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, clearError, isAuthenticated } = useAuth();
  console.log('🔍 Auth state:', { isAuthenticated, isLoading });
  const { success, error: showError } = useToast();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Get redirect path from location state or search params
  const redirectTo = (location.state as { redirectTo?: string })?.redirectTo || 
                    new URLSearchParams(location.search).get('redirectTo') || 
                    '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    console.log('🚀 LOGIN FORM SUBMITTED:', data.email);
    try {
      console.log('🚀 CALLING AUTH STORE LOGIN...');
      await login(data.email, data.password);
      success('Login successful!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Set form error for display
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
      
      // Show toast notification
      showError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-surface-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">Pivotal Flow</h1>
          <p className="mt-2 text-text-secondary">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle as="h2">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      label="Email Address"
                      error={errors.email?.message || undefined}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>

              {/* Password Field */}
              <div>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      label="Password"
                      error={errors.password?.message || undefined}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>

              {/* Form Error */}
              {errors.root && (
                <div className="text-red-600 text-sm">
                  {errors.root.message}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Demo Credentials
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Email:</strong> admin@pivotalflow.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Need help? Contact support at{' '}
            <a href="mailto:support@pivotalflow.com" className="text-brand-primary hover:underline">
              support@pivotalflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
