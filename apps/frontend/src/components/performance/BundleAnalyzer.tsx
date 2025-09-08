import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

interface BundleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  percentage: number;
  modules: ModuleInfo[];
}

interface ModuleInfo {
  name: string;
  size: number;
  percentage: number;
  type: 'javascript' | 'css' | 'image' | 'font' | 'other';
}

interface BundleAnalysis {
  totalSize: number;
  totalGzippedSize: number;
  bundles: BundleInfo[];
  largestModules: ModuleInfo[];
  recommendations: BundleRecommendation[];
  timestamp: Date;
}

interface BundleRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'splitting' | 'tree-shaking' | 'compression' | 'duplicates' | 'unused';
  suggestions: string[];
  estimatedSavings: string;
}

interface BundleAnalyzerProps {
  className?: string;
  onAnalysisComplete?: (analysis: BundleAnalysis) => void;
}

export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  className = '',
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateMockAnalysis = useCallback((): BundleAnalysis => {
    const bundles: BundleInfo[] = [
      {
        name: 'vendor.js',
        size: 1024000, // 1MB
        gzippedSize: 256000, // 256KB
        percentage: 45,
        modules: [
          { name: 'react', size: 512000, percentage: 50, type: 'javascript' },
          { name: 'react-dom', size: 256000, percentage: 25, type: 'javascript' },
          { name: 'lodash', size: 128000, percentage: 12.5, type: 'javascript' },
          { name: 'moment', size: 128000, percentage: 12.5, type: 'javascript' }
        ]
      },
      {
        name: 'app.js',
        size: 512000, // 512KB
        gzippedSize: 128000, // 128KB
        percentage: 25,
        modules: [
          { name: 'components', size: 256000, percentage: 50, type: 'javascript' },
          { name: 'pages', size: 128000, percentage: 25, type: 'javascript' },
          { name: 'utils', size: 64000, percentage: 12.5, type: 'javascript' },
          { name: 'styles', size: 64000, percentage: 12.5, type: 'css' }
        ]
      },
      {
        name: 'chunk-1.js',
        size: 256000, // 256KB
        gzippedSize: 64000, // 64KB
        percentage: 15,
        modules: [
          { name: 'chart.js', size: 128000, percentage: 50, type: 'javascript' },
          { name: 'd3', size: 128000, percentage: 50, type: 'javascript' }
        ]
      },
      {
        name: 'chunk-2.js',
        size: 128000, // 128KB
        gzippedSize: 32000, // 32KB
        percentage: 10,
        modules: [
          { name: 'pdf-lib', size: 128000, percentage: 100, type: 'javascript' }
        ]
      },
      {
        name: 'assets',
        size: 128000, // 128KB
        gzippedSize: 128000, // 128KB (images don't compress much)
        percentage: 5,
        modules: [
          { name: 'images', size: 96000, percentage: 75, type: 'image' },
          { name: 'fonts', size: 32000, percentage: 25, type: 'font' }
        ]
      }
    ];

    const largestModules: ModuleInfo[] = [
      { name: 'react', size: 512000, percentage: 22.7, type: 'javascript' },
      { name: 'react-dom', size: 256000, percentage: 11.4, type: 'javascript' },
      { name: 'components', size: 256000, percentage: 11.4, type: 'javascript' },
      { name: 'lodash', size: 128000, percentage: 5.7, type: 'javascript' },
      { name: 'chart.js', size: 128000, percentage: 5.7, type: 'javascript' },
      { name: 'd3', size: 128000, percentage: 5.7, type: 'javascript' },
      { name: 'moment', size: 128000, percentage: 5.7, type: 'javascript' },
      { name: 'pdf-lib', size: 128000, percentage: 5.7, type: 'javascript' }
    ];

    const recommendations: BundleRecommendation[] = [
      {
        id: 'code-splitting',
        title: 'Implement Code Splitting',
        description: 'Split large bundles into smaller chunks to improve loading performance.',
        impact: 'high',
        category: 'splitting',
        suggestions: [
          'Use React.lazy() for route-based splitting',
          'Implement dynamic imports for heavy components',
          'Split vendor and app bundles',
          'Consider micro-frontends for large applications'
        ],
        estimatedSavings: '40-60% smaller initial bundle'
      },
      {
        id: 'tree-shaking',
        title: 'Enable Tree Shaking',
        description: 'Remove unused code from bundles to reduce file sizes.',
        impact: 'high',
        category: 'tree-shaking',
        suggestions: [
          'Use ES6 modules instead of CommonJS',
          'Enable sideEffects: false in package.json',
          'Use specific imports instead of wildcard imports',
          'Remove unused dependencies'
        ],
        estimatedSavings: '20-40% smaller bundles'
      },
      {
        id: 'duplicate-removal',
        title: 'Remove Duplicate Dependencies',
        description: 'Eliminate duplicate packages that increase bundle size unnecessarily.',
        impact: 'medium',
        category: 'duplicates',
        suggestions: [
          'Use npm ls to identify duplicates',
          'Consolidate similar packages',
          'Use package resolution in webpack',
          'Consider using yarn resolutions'
        ],
        estimatedSavings: '10-30% smaller bundles'
      },
      {
        id: 'compression',
        title: 'Improve Compression',
        description: 'Use better compression algorithms and techniques.',
        impact: 'medium',
        category: 'compression',
        suggestions: [
          'Enable Brotli compression',
          'Use webpack compression plugin',
          'Optimize images before bundling',
          'Minify CSS and JavaScript'
        ],
        estimatedSavings: '15-25% smaller gzipped size'
      },
      {
        id: 'unused-code',
        title: 'Remove Unused Code',
        description: 'Identify and remove dead code from your application.',
        impact: 'medium',
        category: 'unused',
        suggestions: [
          'Use webpack-bundle-analyzer to identify unused code',
          'Remove unused CSS',
          'Eliminate unused JavaScript functions',
          'Use tools like unimported to find unused files'
        ],
        estimatedSavings: '5-15% smaller bundles'
      }
    ];

    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    const totalGzippedSize = bundles.reduce((sum, bundle) => sum + bundle.gzippedSize, 0);

    return {
      totalSize,
      totalGzippedSize,
      bundles,
      largestModules,
      recommendations,
      timestamp: new Date()
    };
  }, []);

  const analyzeBundle = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const analysis = generateMockAnalysis();
    setAnalysis(analysis);
    
    if (onAnalysisComplete) {
      onAnalysisComplete(analysis);
    }
    
    setIsAnalyzing(false);
  }, [generateMockAnalysis, onAnalysisComplete]);

  useEffect(() => {
    analyzeBundle();
  }, [analyzeBundle]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'javascript': return 'primary';
      case 'css': return 'success';
      case 'image': return 'warning';
      case 'font': return 'error';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (!analysis) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Analyzing bundle...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Bundle Analysis Summary</CardTitle>
          <CardDescription>
            Overview of your application's bundle composition and size
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="text-2xl font-bold text-blue-800">
                  {formatBytes(analysis.totalSize)}
                </div>
                <div className="text-sm text-blue-700">Total Size</div>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                <div className="text-2xl font-bold text-green-800">
                  {formatBytes(analysis.totalGzippedSize)}
                </div>
                <div className="text-sm text-green-700">Gzipped Size</div>
              </div>
              <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded">
                <div className="text-2xl font-bold text-purple-800">
                  {analysis.bundles.length}
                </div>
                <div className="text-sm text-purple-700">Bundles</div>
              </div>
            </div>
            <Button 
              onClick={analyzeBundle}
              disabled={isAnalyzing}
              loading={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Bundle Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of each bundle and its contents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.bundles.map((bundle) => (
              <div key={bundle.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-primary">{bundle.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{formatBytes(bundle.size)}</Badge>
                    <Badge variant="default">{formatBytes(bundle.gzippedSize)} gzipped</Badge>
                    <Badge variant="info">{bundle.percentage}%</Badge>
                  </div>
                </div>
                
                <Progress value={bundle.percentage} className="mb-3" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {bundle.modules.map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getTypeColor(module.type)} className="text-xs">
                          {module.type}
                        </Badge>
                        <span className="text-sm text-text-primary">{module.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-text-secondary">
                          {formatBytes(module.size)}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {module.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Largest Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Largest Modules</CardTitle>
          <CardDescription>
            The biggest contributors to your bundle size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.largestModules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{module.name}</div>
                    <Badge variant={getTypeColor(module.type)} className="text-xs">
                      {module.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-text-primary">
                    {formatBytes(module.size)}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {module.percentage}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            Suggestions to reduce bundle size and improve performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      {recommendation.title}
                    </h4>
                    <p className="text-sm text-text-secondary mt-1">
                      {recommendation.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getImpactColor(recommendation.impact)}>
                      {recommendation.impact} impact
                    </Badge>
                    <Badge variant="default">
                      {recommendation.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-text-primary mb-2">
                    Suggestions:
                  </h5>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendation.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-text-secondary">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-800">
                    Estimated Savings: {recommendation.estimatedSavings}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Timestamp */}
      <Card>
        <CardContent className="text-center py-4">
          <p className="text-sm text-text-secondary">
            Analysis completed at {analysis.timestamp.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};