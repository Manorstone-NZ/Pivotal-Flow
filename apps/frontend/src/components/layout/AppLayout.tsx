import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SystemStatusWidget } from './SystemStatusWidget';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      
      // Close sidebar on mobile by default
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={cn('min-h-screen bg-surface-background', className)}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content Area */}
      <div className={cn(
        'flex flex-col transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
      )}>
        {/* Header */}
        <Header 
          onMenuToggle={toggleSidebar}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* System Status Banner (Mobile) */}
            <div className="lg:hidden mb-6">
              <SystemStatusWidget compact />
            </div>
            
            {/* Page Content */}
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-surface-border bg-surface-card px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span>© 2024 Pivotal Flow. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Version 1.0.0</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* System Status (Desktop) */}
              <div className="hidden lg:block">
                <SystemStatusWidget compact />
              </div>
              
              {/* Footer Links */}
              <div className="flex items-center space-x-4 text-sm">
                <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-text-secondary hover:text-text-primary transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Layout wrapper for protected routes
export const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
};