import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface RoutePrefetchProps {
  children: React.ReactNode;
}

interface PrefetchConfig {
  route: string;
  priority: 'high' | 'medium' | 'low';
  prefetchOnHover?: boolean;
  prefetchOnIdle?: boolean;
  prefetchDelay?: number;
}

// Route prefetching configuration
const ROUTE_PREFETCH_CONFIG: PrefetchConfig[] = [
  { route: '/quotes', priority: 'high', prefetchOnHover: true, prefetchOnIdle: true, prefetchDelay: 2000 },
  { route: '/users', priority: 'high', prefetchOnHover: true, prefetchOnIdle: true, prefetchDelay: 3000 },
  { route: '/rate-cards', priority: 'medium', prefetchOnHover: true, prefetchOnIdle: true, prefetchDelay: 5000 },
  { route: '/payments', priority: 'medium', prefetchOnHover: true, prefetchOnIdle: true, prefetchDelay: 5000 },
  { route: '/settings', priority: 'low', prefetchOnHover: true, prefetchOnIdle: true, prefetchDelay: 10000 },
];

// Prefetched routes cache
const prefetchedRoutes = new Set<string>();

export const RoutePrefetch: React.FC<RoutePrefetchProps> = ({ children }) => {
  const location = useLocation();
  // const navigate = useNavigate();
  const idleTimeoutRef = useRef<NodeJS.Timeout>();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Prefetch a route component
  const prefetchRoute = useCallback(async (route: string) => {
    if (prefetchedRoutes.has(route)) {
      return; // Already prefetched
    }

    try {
      // Mark prefetch start
      performance.mark(`prefetch-${route}-start`);
      
      // Import the route component (this will be cached by webpack)
      let componentPromise: Promise<unknown>;
      
      switch (route) {
        case '/quotes':
          componentPromise = import('../../pages/QuotesPage');
          break;
        case '/users':
          componentPromise = import('../../pages/UsersPage');
          break;
        case '/rate-cards':
          componentPromise = import('../../pages/RateCardsPage');
          break;
        case '/payments':
          componentPromise = import('../../pages/PaymentsPage');
          break;
        case '/settings':
          componentPromise = import('../../pages/SettingsPage');
          break;
        default:
          return;
      }

      await componentPromise;
      
      // Mark prefetch end
      performance.mark(`prefetch-${route}-end`);
      performance.measure(`prefetch-${route}-duration`, `prefetch-${route}-start`, `prefetch-${route}-end`);
      
      prefetchedRoutes.add(route);
      
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`🚀 Prefetched route: ${route}`);
      }
      
      // Report prefetch performance
      if (window.gtag) {
        window.gtag('event', 'route_prefetch', {
          route_name: route,
          prefetch_success: true,
        });
      }
      
    } catch (error) {
      console.warn(`Failed to prefetch route ${route}:`, error);
      
      if (window.gtag) {
        window.gtag('event', 'route_prefetch', {
          route_name: route,
          prefetch_success: false,
        });
      }
    }
  }, []);

  // Prefetch routes on idle
  const prefetchOnIdle = useCallback(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        ROUTE_PREFETCH_CONFIG.forEach(config => {
          if (config.prefetchOnIdle && config.route !== location.pathname) {
            prefetchRoute(config.route);
          }
        });
      }, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        ROUTE_PREFETCH_CONFIG.forEach(config => {
          if (config.prefetchOnIdle && config.route !== location.pathname) {
            prefetchRoute(config.route);
          }
        });
      }, 1000);
    }
  }, [location.pathname, prefetchRoute]);

  // Prefetch routes on hover
  const handleLinkHover = useCallback((route: string, config: PrefetchConfig) => {
    if (!config.prefetchOnHover || prefetchedRoutes.has(route)) {
      return;
    }

    // Clear existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set new timeout for prefetch
    hoverTimeoutRef.current = setTimeout(() => {
      prefetchRoute(route);
    }, config.prefetchDelay || 200);
  }, [prefetchRoute]);

  // Set up idle prefetching
  useEffect(() => {
    // Initial idle prefetch after page load
    const initialTimeout = setTimeout(prefetchOnIdle, 2000);
    
    // Set up periodic idle prefetching
    const interval = setInterval(prefetchOnIdle, 30000); // Every 30 seconds
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [prefetchOnIdle]);

  // Enhanced navigation with prefetching (commented out as unused)
  // const enhancedNavigate = useCallback((to: string) => {
  //   // Prefetch the target route if not already prefetched
  //   if (!prefetchedRoutes.has(to)) {
  //     prefetchRoute(to);
  //   }
  //   
  //   // Navigate
  //   navigate(to);
  // }, [navigate, prefetchRoute]);

  // Expose enhanced navigation to child components
  useEffect(() => {
    // Add prefetch data attributes to navigation links
    const addPrefetchAttributes = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const config = ROUTE_PREFETCH_CONFIG.find(c => c.route === href);
          if (config) {
            link.setAttribute('data-prefetch', 'true');
            link.setAttribute('data-prefetch-priority', config.priority);
            
            // Add hover event listener
            link.addEventListener('mouseenter', () => {
              handleLinkHover(href, config);
            });
          }
        }
      });
    };

    // Run after DOM updates
    const timeout = setTimeout(addPrefetchAttributes, 100);
    
    return () => clearTimeout(timeout);
  }, [location.pathname, handleLinkHover]);

  return <>{children}</>;
};

// Hook for programmatic route prefetching
export const useRoutePrefetch = () => {
  const prefetchRoute = useCallback(async (route: string) => {
    if (prefetchedRoutes.has(route)) {
      return true; // Already prefetched
    }

    try {
      let componentPromise: Promise<unknown>;
      
      switch (route) {
        case '/quotes':
          componentPromise = import('../../pages/QuotesPage');
          break;
        case '/users':
          componentPromise = import('../../pages/UsersPage');
          break;
        case '/rate-cards':
          componentPromise = import('../../pages/RateCardsPage');
          break;
        case '/payments':
          componentPromise = import('../../pages/PaymentsPage');
          break;
        case '/settings':
          componentPromise = import('../../pages/SettingsPage');
          break;
        default:
          return false;
      }

      await componentPromise;
      prefetchedRoutes.add(route);
      return true;
    } catch (error) {
      console.warn(`Failed to prefetch route ${route}:`, error);
      return false;
    }
  }, []);

  const isPrefetched = useCallback((route: string) => {
    return prefetchedRoutes.has(route);
  }, []);

  return { prefetchRoute, isPrefetched };
};

// Performance monitoring for prefetching
export const PrefetchMonitor = {
  getPrefetchedRoutes: () => Array.from(prefetchedRoutes),
  
  getPrefetchStats: () => {
    const entries = performance.getEntriesByType('measure');
    const prefetchEntries = entries.filter(entry => entry.name.includes('prefetch'));
    
    return prefetchEntries.map(entry => ({
      route: entry.name.replace('prefetch-', '').replace('-duration', ''),
      duration: Math.round(entry.duration),
      startTime: Math.round(entry.startTime),
    }));
  },
  
  clearPrefetchStats: () => {
    const entries = performance.getEntriesByType('measure');
    entries.forEach(entry => {
      if (entry.name.includes('prefetch')) {
        performance.clearMeasures(entry.name);
      }
    });
  },
};
