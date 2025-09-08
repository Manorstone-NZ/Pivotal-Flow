import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../Button';
import { Badge } from '../ui/Badge';

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'loading' | 'rendering' | 'network' | 'bundle' | 'caching' | 'images' | 'fonts' | 'javascript';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: string;
  implementation: string[];
  codeExamples?: {
    before: string;
    after: string;
    language: string;
  };
  tools?: string[];
  resources?: string[];
}

interface PerformanceOptimizerProps {
  className?: string;
  onOptimizationSelect?: (optimization: OptimizationRecommendation) => void;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  className = '',
  onOptimizationSelect
}) => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateRecommendations = useCallback((): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = [
      // Loading optimizations
      {
        id: 'lazy-loading',
        title: 'Implement Lazy Loading',
        description: 'Load images and components only when they are needed, reducing initial bundle size and improving page load times.',
        category: 'loading',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '30-50% faster initial load',
        implementation: [
          'Use React.lazy() for component lazy loading',
          'Implement intersection observer for image lazy loading',
          'Add loading states and fallbacks',
          'Consider route-based code splitting'
        ],
        codeExamples: {
          before: `// Before: All components loaded immediately
import HeavyComponent from './HeavyComponent';

function App() {
  return <HeavyComponent />;
}`,
          after: `// After: Lazy loading with Suspense
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}`,
          language: 'tsx'
        },
        tools: ['React.lazy', 'Intersection Observer API', 'React Suspense'],
        resources: ['React Code Splitting Guide', 'Web.dev Lazy Loading']
      },
      
      {
        id: 'image-optimization',
        title: 'Optimize Images',
        description: 'Use modern image formats, proper sizing, and compression to reduce image load times and bandwidth usage.',
        category: 'images',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '40-70% smaller file sizes',
        implementation: [
          'Convert images to WebP format',
          'Implement responsive images with srcset',
          'Add proper alt attributes for accessibility',
          'Use image compression tools',
          'Consider using a CDN for image delivery'
        ],
        codeExamples: {
          before: `// Before: Unoptimized image
<img src="/large-image.jpg" alt="Product" />`,
          after: `// After: Optimized responsive image
<img 
  src="/image.webp" 
  srcSet="/image-320.webp 320w, /image-640.webp 640w, /image-1280.webp 1280w"
  sizes="(max-width: 768px) 320px, (max-width: 1024px) 640px, 1280px"
  alt="Product description"
  loading="lazy"
/>`,
          language: 'tsx'
        },
        tools: ['WebP', 'ImageOptim', 'Cloudinary', 'Next.js Image'],
        resources: ['Web.dev Image Optimization', 'MDN Responsive Images']
      },
      
      {
        id: 'bundle-splitting',
        title: 'Implement Code Splitting',
        description: 'Split your JavaScript bundle into smaller chunks to reduce initial load time and improve caching.',
        category: 'bundle',
        impact: 'high',
        effort: 'high',
        estimatedImprovement: '50-80% smaller initial bundle',
        implementation: [
          'Use dynamic imports for route-based splitting',
          'Implement vendor chunk splitting',
          'Add common chunk extraction',
          'Use webpack-bundle-analyzer to identify opportunities',
          'Consider micro-frontends for large applications'
        ],
        codeExamples: {
          before: `// Before: Large bundle with all routes
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';`,
          after: `// After: Route-based code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));`,
          language: 'tsx'
        },
        tools: ['Webpack', 'Vite', 'React.lazy', 'webpack-bundle-analyzer'],
        resources: ['React Code Splitting', 'Webpack Code Splitting']
      },
      
      {
        id: 'caching-strategy',
        title: 'Implement Caching Strategy',
        description: 'Use proper HTTP caching headers and service workers to cache resources and improve repeat visits.',
        category: 'caching',
        impact: 'medium',
        effort: 'medium',
        estimatedImprovement: '60-90% faster repeat visits',
        implementation: [
          'Set appropriate Cache-Control headers',
          'Implement service worker for offline caching',
          'Use ETags for conditional requests',
          'Cache API responses with React Query',
          'Implement stale-while-revalidate pattern'
        ],
        codeExamples: {
          before: `// Before: No caching
const fetchData = async () => {
  const response = await fetch('/api/data');
  return response.json();
};`,
          after: `// After: With React Query caching
const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: () => fetch('/api/data').then(res => res.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});`,
          language: 'tsx'
        },
        tools: ['React Query', 'Service Workers', 'Workbox', 'HTTP Cache Headers'],
        resources: ['MDN HTTP Caching', 'React Query Documentation']
      },
      
      {
        id: 'font-optimization',
        title: 'Optimize Font Loading',
        description: 'Use font-display and preloading to prevent layout shifts and improve text rendering performance.',
        category: 'fonts',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: 'Prevent layout shifts, faster text rendering',
        implementation: [
          'Use font-display: swap for custom fonts',
          'Preload critical fonts',
          'Use system fonts as fallbacks',
          'Consider variable fonts for multiple weights',
          'Implement font subsetting for smaller file sizes'
        ],
        codeExamples: {
          before: `/* Before: Blocking font load */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2');
}`,
          after: `/* After: Optimized font loading */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2');
  font-display: swap;
}

/* Preload critical fonts */
<link rel="preload" href="/fonts/custom-font.woff2" as="font" type="font/woff2" crossorigin>`,
          language: 'css'
        },
        tools: ['Google Fonts', 'Font Squirrel', 'Variable Fonts'],
        resources: ['Web.dev Font Optimization', 'MDN Font Display']
      },
      
      {
        id: 'javascript-optimization',
        title: 'Optimize JavaScript Execution',
        description: 'Reduce JavaScript execution time and improve interactivity by optimizing code and using modern patterns.',
        category: 'javascript',
        impact: 'high',
        effort: 'high',
        estimatedImprovement: '20-40% faster execution',
        implementation: [
          'Use requestIdleCallback for non-critical work',
          'Implement virtual scrolling for large lists',
          'Use Web Workers for heavy computations',
          'Optimize React rendering with useMemo and useCallback',
          'Implement debouncing and throttling for events'
        ],
        codeExamples: {
          before: `// Before: Heavy computation on main thread
const processLargeDataset = (data) => {
  return data.map(item => heavyComputation(item));
};`,
          after: `// After: Using Web Worker
const worker = new Worker('/workers/data-processor.js');
worker.postMessage(largeDataset);
worker.onmessage = (e) => {
  setProcessedData(e.data);
};`,
          language: 'tsx'
        },
        tools: ['Web Workers', 'React DevTools', 'requestIdleCallback'],
        resources: ['MDN Web Workers', 'React Performance']
      },
      
      {
        id: 'network-optimization',
        title: 'Optimize Network Requests',
        description: 'Reduce the number and size of network requests to improve loading performance.',
        category: 'network',
        impact: 'medium',
        effort: 'medium',
        estimatedImprovement: '30-50% fewer requests',
        implementation: [
          'Combine multiple API calls into single requests',
          'Use GraphQL for efficient data fetching',
          'Implement request deduplication',
          'Use HTTP/2 server push for critical resources',
          'Optimize API response sizes'
        ],
        codeExamples: {
          before: `// Before: Multiple API calls
const fetchUserData = async () => {
  const user = await fetch('/api/user');
  const posts = await fetch('/api/posts');
  const comments = await fetch('/api/comments');
  return { user, posts, comments };
};`,
          after: `// After: Single GraphQL query
const GET_USER_DATA = gql\`
  query GetUserData {
    user { id name email }
    posts { id title content }
    comments { id content }
  }
\`;`,
          language: 'tsx'
        },
        tools: ['GraphQL', 'Apollo Client', 'React Query', 'SWR'],
        resources: ['GraphQL Documentation', 'Apollo Client Guide']
      },
      
      {
        id: 'rendering-optimization',
        title: 'Optimize Rendering Performance',
        description: 'Improve React rendering performance by reducing unnecessary re-renders and optimizing component updates.',
        category: 'rendering',
        impact: 'medium',
        effort: 'medium',
        estimatedImprovement: '20-30% faster rendering',
        implementation: [
          'Use React.memo for component memoization',
          'Implement useMemo and useCallback for expensive calculations',
          'Optimize state updates to prevent cascading re-renders',
          'Use React DevTools Profiler to identify bottlenecks',
          'Consider virtualization for large lists'
        ],
        codeExamples: {
          before: `// Before: Unnecessary re-renders
const ExpensiveComponent = ({ data }) => {
  const processedData = data.map(item => expensiveOperation(item));
  return <div>{processedData}</div>;
};`,
          after: `// After: Optimized with memoization
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(
    () => data.map(item => expensiveOperation(item)),
    [data]
  );
  return <div>{processedData}</div>;
});`,
          language: 'tsx'
        },
        tools: ['React DevTools', 'React.memo', 'useMemo', 'useCallback'],
        resources: ['React Performance', 'React DevTools Profiler']
      }
    ];
    
    return recommendations;
  }, []);

  const analyzePerformance = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const allRecommendations = generateRecommendations();
    setRecommendations(allRecommendations);
    setIsAnalyzing(false);
  }, [generateRecommendations]);

  useEffect(() => {
    analyzePerformance();
  }, [analyzePerformance]);

  const filteredRecommendations = recommendations.filter(rec => {
    const categoryMatch = selectedCategory === 'all' || rec.category === selectedCategory;
    const impactMatch = selectedImpact === 'all' || rec.impact === selectedImpact;
    return categoryMatch && impactMatch;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loading': return '⚡';
      case 'images': return '🖼️';
      case 'bundle': return '📦';
      case 'caching': return '💾';
      case 'fonts': return '🔤';
      case 'javascript': return '⚙️';
      case 'network': return '🌐';
      case 'rendering': return '🎨';
      default: return '📈';
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'loading', label: 'Loading' },
    { value: 'images', label: 'Images' },
    { value: 'bundle', label: 'Bundle' },
    { value: 'caching', label: 'Caching' },
    { value: 'fonts', label: 'Fonts' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'network', label: 'Network' },
    { value: 'rendering', label: 'Rendering' }
  ];

  const impacts = [
    { value: 'all', label: 'All Impact Levels' },
    { value: 'high', label: 'High Impact' },
    { value: 'medium', label: 'Medium Impact' },
    { value: 'low', label: 'Low Impact' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions to improve your application's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium text-text-primary">Category:</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="ml-2 p-1 border rounded text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Impact:</label>
                <select 
                  value={selectedImpact} 
                  onChange={(e) => setSelectedImpact(e.target.value)}
                  className="ml-2 p-1 border rounded text-sm"
                >
                  {impacts.map(impact => (
                    <option key={impact.value} value={impact.value}>{impact.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button 
              onClick={analyzePerformance}
              disabled={isAnalyzing}
              loading={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{getCategoryIcon(recommendation.category)}</span>
                    <span>{recommendation.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {recommendation.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getImpactColor(recommendation.impact)}>
                    {recommendation.impact} impact
                  </Badge>
                  <Badge variant={getEffortColor(recommendation.effort)}>
                    {recommendation.effort} effort
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Implementation Steps */}
              <div>
                <h4 className="font-semibold mb-2">Implementation Steps:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {recommendation.implementation.map((step, index) => (
                    <li key={index} className="text-sm text-text-secondary">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Code Examples */}
              {recommendation.codeExamples && (
                <div>
                  <h4 className="font-semibold mb-2">Code Example:</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-1">Before:</p>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <code>{recommendation.codeExamples.before}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-1">After:</p>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <code>{recommendation.codeExamples.after}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Tools and Resources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.tools && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Tools:</h4>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.tools.map((tool, index) => (
                        <Badge key={index} variant="default" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {recommendation.resources && (
                  <div>
                    <h4 className="font-semibold mb-2">Resources:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recommendation.resources.map((resource, index) => (
                        <li key={index} className="text-sm text-text-secondary">
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Estimated Improvement */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-800">
                  Estimated Improvement: {recommendation.estimatedImprovement}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => onOptimizationSelect?.(recommendation)}
                  variant="outline"
                >
                  Implement This Optimization
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Summary</CardTitle>
          <CardDescription>
            Overview of performance optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded">
              <div className="text-2xl font-bold text-red-800">
                {recommendations.filter(r => r.impact === 'high').length}
              </div>
              <div className="text-sm text-red-700">High Impact</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-2xl font-bold text-yellow-800">
                {recommendations.filter(r => r.impact === 'medium').length}
              </div>
              <div className="text-sm text-yellow-700">Medium Impact</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-2xl font-bold text-green-800">
                {recommendations.filter(r => r.impact === 'low').length}
              </div>
              <div className="text-sm text-green-700">Low Impact</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};