import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface SecurityAuditProps {
  className?: string;
  enableRealTime?: boolean;
  showSecurityChecks?: boolean;
  enableContentSecurityPolicy?: boolean;
  enableXSSProtection?: boolean;
}

interface SecurityIssue {
  id: string;
  category: 'xss' | 'csrf' | 'injection' | 'headers' | 'authentication' | 'data';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  code?: string;
  fixed: boolean;
}

interface SecurityMetrics {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  securityScore: number;
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({
  className = '',
  // enableRealTime = true,
  // showSecurityChecks = true,
  enableContentSecurityPolicy = true,
  enableXSSProtection = true
}) => {
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalIssues: 0,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 0,
    securityScore: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const performSecurityAudit = async (): Promise<SecurityIssue[]> => {
    const issues: SecurityIssue[] = [];

    // Check for XSS vulnerabilities
    if (enableXSSProtection) {
      // Check for innerHTML usage
      const scripts = document.querySelectorAll('script');
      scripts.forEach((script, index) => {
        if (script.innerHTML.includes('innerHTML') || script.innerHTML.includes('outerHTML')) {
          issues.push({
            id: `xss-innerhtml-${index}`,
            category: 'xss',
            severity: 'high',
            title: 'Potential XSS via innerHTML',
            description: 'Script contains innerHTML/outerHTML usage which can lead to XSS attacks.',
            impact: 'High - Can lead to code injection and data theft',
            recommendation: 'Use textContent instead of innerHTML, or sanitize input',
            code: `// Instead of: element.innerHTML = userInput;\n// Use: element.textContent = userInput;`,
            fixed: false
          });
        }
      });

      // Check for eval usage
      const scriptsWithEval = Array.from(scripts).filter(script => 
        script.innerHTML.includes('eval(') || script.innerHTML.includes('Function(')
      );
      if (scriptsWithEval.length > 0) {
        issues.push({
          id: 'xss-eval',
          category: 'xss',
          severity: 'critical',
          title: 'Dangerous eval() usage detected',
          description: 'Code contains eval() or Function() calls which are security risks.',
          impact: 'Critical - Can execute arbitrary code',
          recommendation: 'Remove eval() usage and use safer alternatives',
          code: `// Instead of: eval(userInput);\n// Use: JSON.parse(userInput) or other safe methods`,
          fixed: false
        });
      }
    }

    // Check for CSRF protection
    const forms = document.querySelectorAll('form');
    const formsWithoutCSRF = Array.from(forms).filter(form => 
      !form.querySelector('input[name="_token"]') && 
      !form.querySelector('input[name="csrf_token"]') &&
      !form.querySelector('meta[name="csrf-token"]')
    );
    if (formsWithoutCSRF.length > 0) {
      issues.push({
        id: 'csrf-protection',
        category: 'csrf',
        severity: 'high',
        title: 'Missing CSRF protection',
        description: 'Forms are missing CSRF tokens for protection against cross-site request forgery.',
        impact: 'High - Can lead to unauthorized actions',
        recommendation: 'Add CSRF tokens to all forms',
        code: `<input type="hidden" name="_token" value="${'{csrf_token}'}" />`,
        fixed: false
      });
    }

    // Check for secure headers
    if (enableContentSecurityPolicy) {
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!metaCSP) {
        issues.push({
          id: 'csp-missing',
          category: 'headers',
          severity: 'medium',
          title: 'Missing Content Security Policy',
          description: 'No Content Security Policy header found.',
          impact: 'Medium - Reduces protection against XSS',
          recommendation: 'Add CSP header to prevent XSS attacks',
          code: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline';" />`,
          fixed: false
        });
      }
    }

    // Check for HTTPS usage
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push({
        id: 'https-missing',
        category: 'headers',
        severity: 'high',
        title: 'Not using HTTPS',
        description: 'Application is not served over HTTPS.',
        impact: 'High - Data transmission is not encrypted',
        recommendation: 'Enable HTTPS for all communications',
        code: '// Configure SSL/TLS certificates',
        fixed: false
      });
    }

    // Check for authentication issues
    const authTokens = document.querySelectorAll('input[type="password"], input[name*="password"]');
    const authWithoutSecure = Array.from(authTokens).filter(input => 
      !input.hasAttribute('autocomplete') || input.getAttribute('autocomplete') !== 'off'
    );
    if (authWithoutSecure.length > 0) {
      issues.push({
        id: 'auth-autocomplete',
        category: 'authentication',
        severity: 'medium',
        title: 'Password fields without autocomplete="off"',
        description: 'Password fields should disable autocomplete for security.',
        impact: 'Medium - Passwords may be stored in browser',
        recommendation: 'Add autocomplete="off" to password fields',
        code: `<input type="password" autocomplete="off" />`,
        fixed: false
      });
    }

    // Check for data exposure
    const sensitiveData = document.querySelectorAll('[data-*]');
    const exposedData = Array.from(sensitiveData).filter(element => {
      const dataAttrs = Array.from(element.attributes)
        .filter(attr => attr.name.startsWith('data-'))
        .map(attr => attr.name);
      return dataAttrs.some(attr => 
        attr.includes('password') || 
        attr.includes('token') || 
        attr.includes('secret') ||
        attr.includes('key')
      );
    });
    if (exposedData.length > 0) {
      issues.push({
        id: 'data-exposure',
        category: 'data',
        severity: 'high',
        title: 'Sensitive data in DOM attributes',
        description: 'Sensitive information is exposed in data attributes.',
        impact: 'High - Sensitive data visible in DOM',
        recommendation: 'Remove sensitive data from DOM attributes',
        code: `// Instead of: <div data-password="\${password}">\n// Use: Store in secure state management`,
        fixed: false
      });
    }

    return issues;
  };

  const calculateSecurityScore = (issues: SecurityIssue[]): number => {
    if (issues.length === 0) return 100;
    
    const weights = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5
    };
    
    const totalWeight = issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
    const maxWeight = issues.length * 25; // All critical
    
    return Math.max(0, 100 - (totalWeight / maxWeight) * 100);
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    try {
      const issues = await performSecurityAudit();
      setSecurityIssues(issues);
      
      const metrics: SecurityMetrics = {
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
        highIssues: issues.filter(i => i.severity === 'high').length,
        mediumIssues: issues.filter(i => i.severity === 'medium').length,
        lowIssues: issues.filter(i => i.severity === 'low').length,
        securityScore: calculateSecurityScore(issues)
      };
      
      setMetrics(metrics);
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runSecurityScan();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📝';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'xss': return '🛡️';
      case 'csrf': return '🔒';
      case 'injection': return '💉';
      case 'headers': return '📋';
      case 'authentication': return '🔑';
      case 'data': return '📊';
      default: return '🔍';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const fixIssue = (issueId: string) => {
    setSecurityIssues(prev => 
      prev.map(issue => 
        issue.id === issueId ? { ...issue, fixed: true } : issue
      )
    );
    
    // Recalculate metrics
    const updatedIssues = securityIssues.map(issue => 
      issue.id === issueId ? { ...issue, fixed: true } : issue
    );
    const unfixedIssues = updatedIssues.filter(issue => !issue.fixed);
    const newScore = calculateSecurityScore(unfixedIssues);
    
    setMetrics(prev => ({
      ...prev,
      securityScore: newScore,
      totalIssues: unfixedIssues.length,
      criticalIssues: unfixedIssues.filter(i => i.severity === 'critical').length,
      highIssues: unfixedIssues.filter(i => i.severity === 'high').length,
      mediumIssues: unfixedIssues.filter(i => i.severity === 'medium').length,
      lowIssues: unfixedIssues.filter(i => i.severity === 'low').length,
    }));
  };

  return (
    <div className={cn('fixed top-4 right-4 z-50', className)}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Toggle security audit"
      >
        🔒 Security ({metrics.totalIssues})
      </button>

      {isVisible && (
        <div className="absolute top-16 right-0 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Security Audit
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={runSecurityScan}
                  disabled={isScanning}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isScanning ? 'Scanning...' : 'Scan'}
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Security Score */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Security Score</h4>
              <div className="flex items-center justify-between">
                <span className={cn('text-2xl font-bold', getScoreColor(metrics.securityScore))}>
                  {Math.round(metrics.securityScore)}
                </span>
                <div className="text-sm text-gray-600">
                  {metrics.securityScore >= 90 ? 'Excellent' : 
                   metrics.securityScore >= 70 ? 'Good' : 
                   metrics.securityScore >= 50 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>

            {/* Issue Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Issues Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-bold text-red-600">{metrics.criticalIssues}</div>
                  <div className="text-red-600">Critical</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-bold text-orange-600">{metrics.highIssues}</div>
                  <div className="text-orange-600">High</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-bold text-yellow-600">{metrics.mediumIssues}</div>
                  <div className="text-yellow-600">Medium</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{metrics.lowIssues}</div>
                  <div className="text-blue-600">Low</div>
                </div>
              </div>
            </div>

            {/* Security Issues */}
            {securityIssues.length === 0 ? (
              <div className="text-center text-green-600 text-sm py-4">
                🎉 No security issues found! Your app is secure.
              </div>
            ) : (
              <div className="space-y-3">
                {securityIssues.filter(issue => !issue.fixed).map((issue) => (
                  <div
                    key={issue.id}
                    className={cn(
                      'p-3 rounded border',
                      getSeverityColor(issue.severity)
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                        <span className="font-medium text-sm">{issue.title}</span>
                      </div>
                      <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                    </div>
                    
                    <p className="text-xs mb-2">{issue.description}</p>
                    
                    <div className="text-xs mb-2">
                      <strong>Impact:</strong> {issue.impact}
                    </div>
                    
                    <div className="text-xs mb-2">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </div>
                    
                    {issue.code && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium">Show Code</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {issue.code}
                        </pre>
                      </details>
                    )}
                    
                    <button
                      onClick={() => fixIssue(issue.id)}
                      className="mt-2 w-full px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark as Fixed
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Security Best Practices */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Security Best Practices</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div>• Use HTTPS for all communications</div>
                <div>• Implement Content Security Policy</div>
                <div>• Sanitize all user inputs</div>
                <div>• Use CSRF tokens in forms</div>
                <div>• Enable XSS protection headers</div>
                <div>• Keep dependencies updated</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
