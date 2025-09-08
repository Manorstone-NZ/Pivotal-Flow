import React, { useEffect, useRef } from 'react';

// Browser API type definitions
interface FirstInputEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
  processingStart: number;
  processingEnd: number;
}

interface LayoutShiftEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMarksProps {
  routeName: string;
  children: React.ReactNode;
}

export const PerformanceMarks: React.FC<PerformanceMarksProps> = ({ 
  routeName, 
  children 
}) => {
  const routeStartRef = useRef<number>(0);

  useEffect(() => {
    // Mark route start
    routeStartRef.current = performance.now();
    performance.mark(`${routeName}-start`);
    
    // Measure TTFB proxy (Time to First Byte)
    const ttfbStart = performance.now();
    
    // Use requestIdleCallback for non-blocking performance measurement
    const measurePerformance = () => {
      const routeEnd = performance.now();
      const routeDuration = routeEnd - routeStartRef.current;
      
      // Mark route end
      performance.mark(`${routeName}-end`);
      performance.measure(`${routeName}-duration`, `${routeName}-start`, `${routeName}-end`);
      
      // Calculate TTFB proxy (time to component mount)
      const ttfbProxy = routeEnd - ttfbStart;
      
      // Report performance metrics (no PII)
      const metrics = {
        route: routeName,
        duration: Math.round(routeDuration),
        ttfbProxy: Math.round(ttfbProxy),
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 50), // Truncated for privacy
        connectionType: (navigator as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
      };
      
      // Send to analytics (placeholder for Sentry/OpenTelemetry)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'route_performance', {
          route_name: routeName,
          duration_ms: metrics.duration,
          ttfb_proxy_ms: metrics.ttfbProxy,
        });
      }
      
      // Log to console in development
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`🚀 Route Performance [${routeName}]:`, metrics);
      }
      
      // Store in performance observer for LCP proxy
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint');
            
            if (lcpEntry) {
              const lcpProxy = lcpEntry.startTime;
              console.log(`🎯 LCP Proxy [${routeName}]:`, Math.round(lcpProxy), 'ms');
              
              // Report LCP proxy
              if (window.gtag) {
                window.gtag('event', 'lcp_proxy', {
                  route_name: routeName,
                  lcp_proxy_ms: Math.round(lcpProxy),
                });
              }
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Cleanup observer after 5 seconds
          setTimeout(() => observer.disconnect(), 5000);
        } catch (error) {
          console.warn('Performance observer not supported:', error);
        }
      }
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(measurePerformance);
    } else {
      setTimeout(measurePerformance, 0);
    }
    
    // Cleanup function
    return () => {
      // Mark route cleanup
      performance.mark(`${routeName}-cleanup`);
    };
  }, [routeName]);

  return <>{children}</>;
};

// Hook for measuring component performance
export const usePerformanceMeasure = (componentName: string) => {
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    startTimeRef.current = performance.now();
    performance.mark(`${componentName}-mount-start`);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;
      
      performance.mark(`${componentName}-mount-end`);
      performance.measure(`${componentName}-mount-duration`, 
        `${componentName}-mount-start`, 
        `${componentName}-mount-end`
      );
      
      if (process.env['NODE_ENV'] === 'development') {
        console.log(`⚡ Component Mount [${componentName}]:`, Math.round(duration), 'ms');
      }
    };
  }, [componentName]);
};

// Performance monitoring utility
export const PerformanceMonitor = {
  // Mark custom performance points
  mark: (name: string) => {
    performance.mark(name);
  },
  
  // Measure between two marks
  measure: (name: string, startMark: string, endMark: string) => {
    performance.measure(name, startMark, endMark);
  },
  
  // Get performance metrics
  getMetrics: () => {
    const entries = performance.getEntriesByType('measure');
    return entries.map(entry => ({
      name: entry.name,
      duration: Math.round(entry.duration),
      startTime: Math.round(entry.startTime),
    }));
  },
  
  // Clear performance marks and measures
  clear: () => {
    performance.clearMarks();
    performance.clearMeasures();
  },
  
  // Report Core Web Vitals
  reportWebVitals: () => {
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎯 LCP:', Math.round(lastEntry?.startTime || 0), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('👆 FID:', Math.round((entry as unknown as FirstInputEntry).processingStart - entry.startTime), 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const layoutShiftEntry = entry as unknown as LayoutShiftEntry;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        });
        console.log('📐 CLS:', Math.round(clsValue * 1000) / 1000);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  },
};
