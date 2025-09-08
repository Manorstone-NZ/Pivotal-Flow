import React, { useState } from 'react';
import { axe } from 'jest-axe';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

interface AccessibilityAuditResult {
  violations: AccessibilityViolation[];
  passes: Array<{
    id: string;
    description: string;
    nodes: Array<{
      target: string[];
      html: string;
    }>;
  }>;
  incomplete: Array<{
    id: string;
    description: string;
    nodes: Array<{
      target: string[];
      html: string;
    }>;
  }>;
  inapplicable: Array<{
    id: string;
    description: string;
  }>;
}

interface AccessibilityAuditProps {
  className?: string;
  onAuditComplete?: (result: AccessibilityAuditResult) => void;
}

export const AccessibilityAudit: React.FC<AccessibilityAuditProps> = ({
  className = '',
  onAuditComplete
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AccessibilityAuditResult | null>(null);
  const [auditScore, setAuditScore] = useState<number>(0);
  const [lastAuditTime, setLastAuditTime] = useState<Date | null>(null);

  const runAccessibilityAudit = async () => {
    setIsAuditing(true);
    
    try {
      // Get the current page content
      const pageContent = document.body;
      
      // Run axe-core audit
      const results = await axe(pageContent, {
        rules: {
          // WCAG 2.1 AA rules
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: false }, // AAA level
          'keyboard-navigation': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'focus-visible': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-required-parent': { enabled: true },
          'aria-required-children': { enabled: true },
          'aria-roles': { enabled: true },
          'aria-label': { enabled: true },
          'aria-labelledby': { enabled: true },
          'aria-describedby': { enabled: true },
          'aria-hidden': { enabled: true },
          'aria-live': { enabled: true },
          'aria-atomic': { enabled: true },
          'aria-expanded': { enabled: true },
          'aria-selected': { enabled: true },
          'aria-checked': { enabled: true },
          'aria-pressed': { enabled: true },
          'aria-current': { enabled: true },
          'aria-level': { enabled: true },
          'aria-posinset': { enabled: true },
          'aria-setsize': { enabled: true },
          'aria-sort': { enabled: true },
          'aria-valuemin': { enabled: true },
          'aria-valuemax': { enabled: true },
          'aria-valuenow': { enabled: true },
          'aria-valuetext': { enabled: true },
          'aria-modal': { enabled: true },
          'aria-dialog-name': { enabled: true },
          'aria-tooltip-name': { enabled: true },
          'aria-treeitem-name': { enabled: true },
          'aria-menuitem': { enabled: true },
          'aria-menubar': { enabled: true },
          'aria-menu': { enabled: true },
          'aria-menuitemcheckbox': { enabled: true },
          'aria-menuitemradio': { enabled: true },
          'aria-option': { enabled: true },
          'aria-combobox': { enabled: true },
          'aria-listbox': { enabled: true },
          'aria-grid': { enabled: true },
          'aria-gridcell': { enabled: true },
          'aria-columnheader': { enabled: true },
          'aria-rowheader': { enabled: true },
          'aria-rowgroup': { enabled: true },
          'aria-row': { enabled: true },
          'aria-table': { enabled: true },
          'aria-tab': { enabled: true },
          'aria-tablist': { enabled: true },
          'aria-tabpanel': { enabled: true },
          'aria-progressbar': { enabled: true },
          'aria-slider': { enabled: true },
          'aria-spinbutton': { enabled: true },
          'aria-switch': { enabled: true },
          'aria-textbox': { enabled: true },
          'aria-searchbox': { enabled: true },
          'aria-button': { enabled: true },
          'aria-link': { enabled: true },
          'aria-checkbox': { enabled: true },
          'aria-radio': { enabled: true },
          'aria-select': { enabled: true },
          'heading-order': { enabled: true },
          'html-has-lang': { enabled: true },
          'html-lang-valid': { enabled: true },
          'html-xml-lang-mismatch': { enabled: true },
          'image-alt': { enabled: true },
          'image-redundant-alt': { enabled: true },
          'input-image-alt': { enabled: true },
          'label': { enabled: true },
          'label-title-only': { enabled: true },
          'landmark-one-main': { enabled: true },
          'landmark-unique': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'marquee': { enabled: true },
          'meta-refresh': { enabled: true },
          'meta-viewport': { enabled: true },
          'object-alt': { enabled: true },
          'p-as-heading': { enabled: true },
          'page-has-heading-one': { enabled: true },
          'page-has-main': { enabled: true },
          'presentation-role-conflict': { enabled: true },
          'region': { enabled: true },
          'role-img-alt': { enabled: true },
          'scope-attr-valid': { enabled: true },
          'scrollable-region-focusable': { enabled: true },
          'server-side-image-map': { enabled: true },
          'svg-img-alt': { enabled: true },
          'tabindex': { enabled: true },
          'table-duplicate-name': { enabled: true },
          'table-fake-caption': { enabled: true },
          'td-headers-attr': { enabled: true },
          'td-has-header': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'valid-lang': { enabled: true },
          'video-caption': { enabled: true },
          'video-description': { enabled: true }
        }
      });

      // Type the results properly
      const typedResults: AccessibilityAuditResult = {
        violations: (results as any).violations || [],
        passes: (results as any).passes || [],
        incomplete: (results as any).incomplete || [],
        inapplicable: (results as any).inapplicable || []
      };
      
      setAuditResult(typedResults);
      
      // Calculate accessibility score
      const totalChecks = typedResults.passes.length + typedResults.violations.length + typedResults.incomplete.length;
      const passedChecks = typedResults.passes.length;
      const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
      setAuditScore(score);
      
      setLastAuditTime(new Date());
      
      if (onAuditComplete) {
        onAuditComplete(typedResults);
      }
      
    } catch (error) {
      console.error('Accessibility audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'error';
      case 'serious': return 'error';
      case 'moderate': return 'warning';
      case 'minor': return 'info';
      default: return 'default';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical': return 'Critical';
      case 'serious': return 'Serious';
      case 'moderate': return 'Moderate';
      case 'minor': return 'Minor';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Audit</CardTitle>
          <CardDescription>
            Comprehensive WCAG 2.1 AA compliance testing and validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Current Score</h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-brand-primary">
                  {auditScore}%
                </div>
                <Progress value={auditScore} className="w-32" />
              </div>
            </div>
            <Button 
              onClick={runAccessibilityAudit}
              disabled={isAuditing}
              loading={isAuditing}
            >
              {isAuditing ? 'Running Audit...' : 'Run Audit'}
            </Button>
          </div>
          
          {lastAuditTime && (
            <p className="text-sm text-text-secondary">
              Last audit: {lastAuditTime.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {auditResult && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                  <div className="text-2xl font-bold text-green-800">
                    {auditResult.passes.length}
                  </div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded">
                  <div className="text-2xl font-bold text-red-800">
                    {auditResult.violations.length}
                  </div>
                  <div className="text-sm text-red-700">Violations</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-2xl font-bold text-yellow-800">
                    {auditResult.incomplete.length}
                  </div>
                  <div className="text-sm text-yellow-700">Incomplete</div>
                </div>
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-2xl font-bold text-blue-800">
                    {auditResult.inapplicable.length}
                  </div>
                  <div className="text-sm text-blue-700">N/A</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Violations */}
          {auditResult.violations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Violations</CardTitle>
                <CardDescription>
                  Issues that need to be fixed for WCAG 2.1 AA compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditResult.violations.map((violation, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            {violation.description}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">
                            {violation.help}
                          </p>
                        </div>
                        <Badge variant={getImpactColor(violation.impact)}>
                          {getImpactBadge(violation.impact)}
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-text-primary mb-2">
                          Affected Elements ({violation.nodes.length}):
                        </h5>
                        <div className="space-y-2">
                          {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                            <div key={nodeIndex} className="p-2 bg-surface-card rounded border">
                              <code className="text-xs text-text-secondary">
                                {node.target.join(', ')}
                              </code>
                              <p className="text-xs text-text-secondary mt-1">
                                {node.failureSummary}
                              </p>
                            </div>
                          ))}
                          {violation.nodes.length > 3 && (
                            <p className="text-xs text-text-secondary">
                              ... and {violation.nodes.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <a 
                          href={violation.helpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-primary hover:underline"
                        >
                          Learn more about this rule →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Passed Checks */}
          {auditResult.passes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Passed Checks</CardTitle>
                <CardDescription>
                  Accessibility features that are working correctly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {auditResult.passes.map((pass, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded">
                      <div className="text-sm font-medium text-green-800">
                        {pass.description}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {pass.nodes.length} element{pass.nodes.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};