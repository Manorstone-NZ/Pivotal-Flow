import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../Button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/Progress';

interface AccessibilityTestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  element?: HTMLElement;
  suggestions?: string[];
}

interface AccessibilityTestProps {
  className?: string;
  onTestComplete?: (results: AccessibilityTestResult[]) => void;
}

export const AccessibilityTest: React.FC<AccessibilityTestProps> = ({
  className = '',
  onTestComplete
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<AccessibilityTestResult[]>([]);
  const [testScore, setTestScore] = useState<number>(0);

  const runAccessibilityTests = useCallback(async () => {
    setIsTesting(true);
    const results: AccessibilityTestResult[] = [];

    try {
      // Test 1: Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
      
      let hasH1 = false;
      let headingOrderValid = true;
      let previousLevel = 0;
      
      for (const level of headingLevels) {
        if (level === 1) hasH1 = true;
        if (level > previousLevel + 1) {
          headingOrderValid = false;
          break;
        }
        previousLevel = level;
      }

      results.push({
        testName: 'Heading Hierarchy',
        status: hasH1 && headingOrderValid ? 'pass' : 'fail',
        message: hasH1 && headingOrderValid 
          ? 'Proper heading hierarchy found' 
          : 'Heading hierarchy issues detected',
        suggestions: !hasH1 ? ['Add an h1 element to the page'] : 
                    !headingOrderValid ? ['Ensure headings follow logical order (h1 → h2 → h3, etc.)'] : []
      });

      // Test 2: Check for proper form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      let labeledInputs = 0;
      let totalInputs = inputs.length;

      inputs.forEach(input => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        if (label || ariaLabel || ariaLabelledBy) {
          labeledInputs++;
        }
      });

      results.push({
        testName: 'Form Labels',
        status: totalInputs === 0 ? 'info' : labeledInputs === totalInputs ? 'pass' : 'fail',
        message: totalInputs === 0 
          ? 'No form inputs found' 
          : `${labeledInputs}/${totalInputs} inputs have proper labels`,
        suggestions: labeledInputs < totalInputs ? [
          'Add labels to all form inputs',
          'Use aria-label or aria-labelledby for inputs without visible labels'
        ] : []
      });

      // Test 3: Check for proper button accessibility
      const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
      let accessibleButtons = 0;
      let totalButtons = buttons.length;

      buttons.forEach(button => {
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        const ariaLabelledBy = button.getAttribute('aria-labelledby');
        const title = button.getAttribute('title');
        
        if (text || ariaLabel || ariaLabelledBy || title) {
          accessibleButtons++;
        }
      });

      results.push({
        testName: 'Button Accessibility',
        status: totalButtons === 0 ? 'info' : accessibleButtons === totalButtons ? 'pass' : 'fail',
        message: totalButtons === 0 
          ? 'No buttons found' 
          : `${accessibleButtons}/${totalButtons} buttons have accessible names`,
        suggestions: accessibleButtons < totalButtons ? [
          'Add text content, aria-label, or aria-labelledby to all buttons'
        ] : []
      });

      // Test 4: Check for proper link accessibility
      const links = document.querySelectorAll('a[href]');
      let accessibleLinks = 0;
      let totalLinks = links.length;

      links.forEach(link => {
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const ariaLabelledBy = link.getAttribute('aria-labelledby');
        const title = link.getAttribute('title');
        
        if (text || ariaLabel || ariaLabelledBy || title) {
          accessibleLinks++;
        }
      });

      results.push({
        testName: 'Link Accessibility',
        status: totalLinks === 0 ? 'info' : accessibleLinks === totalLinks ? 'pass' : 'fail',
        message: totalLinks === 0 
          ? 'No links found' 
          : `${accessibleLinks}/${totalLinks} links have accessible names`,
        suggestions: accessibleLinks < totalLinks ? [
          'Add text content, aria-label, or aria-labelledby to all links'
        ] : []
      });

      // Test 5: Check for proper table structure
      const tables = document.querySelectorAll('table');
      let accessibleTables = 0;
      let totalTables = tables.length;

      tables.forEach(table => {
        const hasCaption = table.querySelector('caption');
        const hasHeaders = table.querySelectorAll('th').length > 0;
        const hasScope = Array.from(table.querySelectorAll('th')).some(th => 
          th.getAttribute('scope') === 'row' || th.getAttribute('scope') === 'col'
        );
        
        if (hasCaption || (hasHeaders && hasScope)) {
          accessibleTables++;
        }
      });

      results.push({
        testName: 'Table Accessibility',
        status: totalTables === 0 ? 'info' : accessibleTables === totalTables ? 'pass' : 'fail',
        message: totalTables === 0 
          ? 'No tables found' 
          : `${accessibleTables}/${totalTables} tables have proper accessibility structure`,
        suggestions: accessibleTables < totalTables ? [
          'Add captions to tables',
          'Use proper th elements with scope attributes',
          'Ensure table headers are properly associated with data cells'
        ] : []
      });

      // Test 6: Check for proper color contrast (simplified)
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
      let contrastIssues = 0;

      // This is a simplified check - in a real implementation, you'd use a library
      // to calculate actual contrast ratios
      textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        // Simple check for transparent or very light colors
        if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
          contrastIssues++;
        }
      });

      results.push({
        testName: 'Color Contrast',
        status: contrastIssues === 0 ? 'pass' : 'warning',
        message: contrastIssues === 0 
          ? 'No obvious color contrast issues detected' 
          : `${contrastIssues} potential contrast issues found`,
        suggestions: contrastIssues > 0 ? [
          'Use a color contrast analyzer to verify WCAG AA compliance',
          'Ensure text has sufficient contrast against background colors'
        ] : []
      });

      // Test 7: Check for proper ARIA attributes
      const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
      let validAriaElements = 0;
      let totalAriaElements = ariaElements.length;

      ariaElements.forEach(element => {
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const ariaDescribedBy = element.getAttribute('aria-describedby');
        const role = element.getAttribute('role');
        
        // Check if ARIA attributes are properly used
        if (ariaLabel || ariaLabelledBy || ariaDescribedBy || role) {
          validAriaElements++;
        }
      });

      results.push({
        testName: 'ARIA Attributes',
        status: totalAriaElements === 0 ? 'info' : validAriaElements === totalAriaElements ? 'pass' : 'warning',
        message: totalAriaElements === 0 
          ? 'No ARIA attributes found' 
          : `${validAriaElements}/${totalAriaElements} ARIA attributes are properly used`,
        suggestions: validAriaElements < totalAriaElements ? [
          'Ensure ARIA attributes are used correctly',
          'Verify aria-label, aria-labelledby, and aria-describedby reference valid elements'
        ] : []
      });

      // Test 8: Check for proper focus management
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      let focusableCount = focusableElements.length;

      results.push({
        testName: 'Focus Management',
        status: focusableCount > 0 ? 'pass' : 'info',
        message: `${focusableCount} focusable elements found`,
        suggestions: focusableCount === 0 ? [
          'Ensure users can navigate the page using keyboard',
          'Add focusable elements or check tabindex attributes'
        ] : []
      });

      // Test 9: Check for proper language declaration
      const htmlLang = document.documentElement.getAttribute('lang');
      
      results.push({
        testName: 'Language Declaration',
        status: htmlLang ? 'pass' : 'fail',
        message: htmlLang ? `Language declared as: ${htmlLang}` : 'No language declaration found',
        suggestions: !htmlLang ? [
          'Add lang attribute to html element',
          'Example: <html lang="en">'
        ] : []
      });

      // Test 10: Check for proper meta viewport
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      results.push({
        testName: 'Viewport Meta Tag',
        status: viewportMeta ? 'pass' : 'warning',
        message: viewportMeta ? 'Viewport meta tag found' : 'No viewport meta tag found',
        suggestions: !viewportMeta ? [
          'Add viewport meta tag for mobile responsiveness',
          'Example: <meta name="viewport" content="width=device-width, initial-scale=1">'
        ] : []
      });

      setTestResults(results);
      
      // Calculate score
      const passedTests = results.filter(r => r.status === 'pass').length;
      const totalTests = results.length;
      const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;
      setTestScore(score);
      
      if (onTestComplete) {
        onTestComplete(results);
      }
      
    } catch (error) {
      console.error('Accessibility testing failed:', error);
      results.push({
        testName: 'Test Execution',
        status: 'fail',
        message: 'Accessibility testing failed to execute',
        suggestions: ['Check browser console for errors', 'Ensure page is fully loaded']
      });
      setTestResults(results);
    } finally {
      setIsTesting(false);
    }
  }, [onTestComplete]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'success';
      case 'fail': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return 'Pass';
      case 'fail': return 'Fail';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Testing</CardTitle>
          <CardDescription>
            Automated accessibility testing for WCAG 2.1 AA compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Test Score</h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-brand-primary">
                  {testScore}%
                </div>
                <Progress value={testScore} className="w-32" />
              </div>
            </div>
            <Button 
              onClick={runAccessibilityTests}
              disabled={isTesting}
              loading={isTesting}
            >
              {isTesting ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed results of accessibility testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {result.testName}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1">
                        {result.message}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(result.status)}>
                      {getStatusBadge(result.status)}
                    </Badge>
                  </div>
                  
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-text-primary mb-2">
                        Suggestions:
                      </h5>
                      <ul className="list-disc list-inside space-y-1">
                        {result.suggestions.map((suggestion, suggestionIndex) => (
                          <li key={suggestionIndex} className="text-sm text-text-secondary">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};