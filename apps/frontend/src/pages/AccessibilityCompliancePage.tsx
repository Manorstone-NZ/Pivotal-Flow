import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/Button';
import { Badge } from '../components/ui/badge';
import { 
  AccessibilityAudit, 
  AccessibilityTest, 
  KeyboardNavigation, 
  KeyboardNavigationInstructions,
  AxeAnnouncer,
  SkipLink,
  FocusTrap
} from '../components/a11y';

export const AccessibilityCompliancePage: React.FC = () => {
  const [auditResults, setAuditResults] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleAuditComplete = (results: any) => {
    setAuditResults(results);
  };

  const handleTestComplete = (results: any) => {
    setTestResults(results);
  };

  const handleNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log(`Navigation: ${direction}`);
  };

  return (
    <div className="min-h-screen bg-surface-background">
      <AxeAnnouncer message="Accessibility compliance page loaded" />
      <KeyboardNavigationInstructions />
      
      {/* Skip Links */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#audit-section">Skip to accessibility audit</SkipLink>
      <SkipLink href="#test-section">Skip to accessibility tests</SkipLink>
      
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Accessibility Compliance Center
          </h1>
          <p className="text-text-secondary">
            Comprehensive WCAG 2.1 AA compliance testing and validation tools
          </p>
        </header>

        <main id="main-content">
          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>WCAG 2.1 AA Compliance Overview</CardTitle>
              <CardDescription>
                This page provides comprehensive accessibility testing tools and compliance validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-2xl font-bold text-blue-800">WCAG 2.1</div>
                  <div className="text-sm text-blue-700">AA Level Compliance</div>
                </div>
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                  <div className="text-2xl font-bold text-green-800">Automated</div>
                  <div className="text-sm text-green-700">Testing Tools</div>
                </div>
                <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded">
                  <div className="text-2xl font-bold text-purple-800">Real-time</div>
                  <div className="text-sm text-purple-700">Validation</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common accessibility testing and validation tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setShowInstructions(!showInstructions)}>
                  {showInstructions ? 'Hide' : 'Show'} Keyboard Instructions
                </Button>
                <Button variant="outline" onClick={() => window.scrollTo(0, 0)}>
                  Scroll to Top
                </Button>
                <Button variant="outline" onClick={() => document.body.focus()}>
                  Focus Page
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Audit Section */}
          <section id="audit-section" className="mb-8">
            <KeyboardNavigation onNavigation={handleNavigation}>
              <AccessibilityAudit onAuditComplete={handleAuditComplete} />
            </KeyboardNavigation>
          </section>

          {/* Accessibility Test Section */}
          <section id="test-section" className="mb-8">
            <KeyboardNavigation onNavigation={handleNavigation}>
              <AccessibilityTest onTestComplete={handleTestComplete} />
            </KeyboardNavigation>
          </section>

          {/* Focus Trap Demo */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Focus Trap Demonstration</CardTitle>
              <CardDescription>
                Test focus management in modal-like scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FocusTrap active={true}>
                <div className="p-6 bg-surface-card border rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold">Focus Trap Demo</h3>
                  <p className="text-text-secondary">
                    This content is trapped for keyboard navigation. Tab through these elements.
                  </p>
                  <div className="space-x-2">
                    <Button>First Button</Button>
                    <Button variant="outline">Second Button</Button>
                    <Button variant="ghost">Third Button</Button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Type here..."
                    className="w-full p-2 border rounded"
                    aria-label="Test input field"
                  />
                  <Button variant="outline">Last Button</Button>
                </div>
              </FocusTrap>
            </CardContent>
          </Card>

          {/* WCAG Guidelines */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>WCAG 2.1 AA Guidelines</CardTitle>
              <CardDescription>
                Key accessibility principles and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Perceivable</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Text alternatives for images</li>
                    <li>• Captions for multimedia</li>
                    <li>• Content adaptable to different presentations</li>
                    <li>• Sufficient color contrast</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Operable</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Keyboard accessible</li>
                    <li>• No seizures from flashing content</li>
                    <li>• Users can navigate and find content</li>
                    <li>• Input methods beyond keyboard</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Understandable</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Text readable and understandable</li>
                    <li>• Content appears and operates predictably</li>
                    <li>• Users can avoid and correct mistakes</li>
                    <li>• Consistent navigation</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Robust</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Compatible with assistive technologies</li>
                    <li>• Valid markup and code</li>
                    <li>• Future-proof design</li>
                    <li>• Graceful degradation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testing Checklist */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Accessibility Testing Checklist</CardTitle>
              <CardDescription>
                Manual testing checklist for comprehensive accessibility validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">Keyboard Navigation</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">All interactive elements are keyboard accessible</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Focus indicators are visible</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Tab order is logical</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">No keyboard traps</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Screen Reader Compatibility</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Proper heading structure</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Alt text for images</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Form labels are associated</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">ARIA attributes used correctly</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button className="w-full">
                    Save Checklist Progress
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          {(auditResults || testResults) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Testing Results Summary</CardTitle>
                <CardDescription>
                  Overview of accessibility testing results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {auditResults && (
                    <div>
                      <h3 className="font-semibold mb-3">Audit Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Violations:</span>
                          <Badge variant="error">{auditResults.violations.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Passed:</span>
                          <Badge variant="success">{auditResults.passes.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Incomplete:</span>
                          <Badge variant="warning">{auditResults.incomplete.length}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {testResults && (
                    <div>
                      <h3 className="font-semibold mb-3">Test Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Tests:</span>
                          <span className="text-sm">{testResults.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Passed:</span>
                          <Badge variant="success">
                            {testResults.filter((r: any) => r.status === 'pass').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Failed:</span>
                          <Badge variant="error">
                            {testResults.filter((r: any) => r.status === 'fail').length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};
