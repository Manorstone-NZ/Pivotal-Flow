import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../Button';
import { Badge } from '../ui/badge';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
  onNavigation?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  trapFocus?: boolean;
  initialFocus?: boolean;
}

interface KeyboardNavigationState {
  currentIndex: number;
  totalElements: number;
  isActive: boolean;
  lastDirection: 'up' | 'down' | 'left' | 'right' | null;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  className = '',
  onNavigation,
  trapFocus = false,
  initialFocus = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<KeyboardNavigationState>({
    currentIndex: 0,
    totalElements: 0,
    isActive: false,
    lastDirection: null
  });

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      'area[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const updateFocusableElements = useCallback(() => {
    const elements = getFocusableElements();
    setState(prev => ({
      ...prev,
      totalElements: elements.length,
      currentIndex: Math.min(prev.currentIndex, elements.length - 1)
    }));
  }, [getFocusableElements]);

  const focusElement = useCallback((index: number) => {
    const elements = getFocusableElements();
    if (elements[index]) {
      elements[index].focus();
      setState(prev => ({ ...prev, currentIndex: index }));
    }
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!state.isActive) return;

    const { key, shiftKey } = event;
    
    // Handle arrow key navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      let newIndex = state.currentIndex;
      let direction: 'up' | 'down' | 'left' | 'right';

      switch (key) {
        case 'ArrowUp':
          direction = 'up';
          newIndex = Math.max(0, state.currentIndex - 1);
          break;
        case 'ArrowDown':
          direction = 'down';
          newIndex = Math.min(elements.length - 1, state.currentIndex + 1);
          break;
        case 'ArrowLeft':
          direction = 'left';
          newIndex = Math.max(0, state.currentIndex - 1);
          break;
        case 'ArrowRight':
          direction = 'right';
          newIndex = Math.min(elements.length - 1, state.currentIndex + 1);
          break;
        default:
          return;
      }

      setState(prev => ({
        ...prev,
        currentIndex: newIndex,
        lastDirection: direction
      }));

      focusElement(newIndex);
      
      if (onNavigation) {
        onNavigation(direction);
      }
    }

    // Handle Tab navigation
    if (key === 'Tab' && trapFocus) {
      event.preventDefault();
      
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      let newIndex = state.currentIndex;
      
      if (shiftKey) {
        // Shift + Tab (backward)
        newIndex = state.currentIndex === 0 ? elements.length - 1 : state.currentIndex - 1;
      } else {
        // Tab (forward)
        newIndex = state.currentIndex === elements.length - 1 ? 0 : state.currentIndex + 1;
      }

      setState(prev => ({
        ...prev,
        currentIndex: newIndex,
        lastDirection: shiftKey ? 'left' : 'right'
      }));

      focusElement(newIndex);
    }

    // Handle Enter and Space for activation
    if (['Enter', ' '].includes(key)) {
      const elements = getFocusableElements();
      const currentElement = elements[state.currentIndex];
      
      if (currentElement) {
        if (currentElement.tagName === 'BUTTON' || currentElement.getAttribute('role') === 'button') {
          currentElement.click();
        } else if (currentElement.tagName === 'A') {
          currentElement.click();
        }
      }
    }

    // Handle Escape to deactivate
    if (key === 'Escape') {
      setState(prev => ({ ...prev, isActive: false }));
      if (containerRef.current) {
        containerRef.current.blur();
      }
    }
  }, [state, getFocusableElements, focusElement, onNavigation, trapFocus]);

  const activateNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }));
    updateFocusableElements();
    
    if (initialFocus) {
      setTimeout(() => {
        focusElement(0);
      }, 0);
    }
  }, [updateFocusableElements, focusElement, initialFocus]);

  const deactivateNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  useEffect(() => {
    updateFocusableElements();
    
    const observer = new MutationObserver(() => {
      updateFocusableElements();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'tabindex']
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [updateFocusableElements]);

  useEffect(() => {
    if (state.isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    return undefined;
  }, [state.isActive, handleKeyDown]);

  return (
    <div
      ref={containerRef}
      className={`keyboard-navigation ${className}`}
      tabIndex={-1}
      onFocus={activateNavigation}
      onBlur={deactivateNavigation}
      role="application"
      aria-label="Keyboard navigable content"
    >
      {children}
      
      {/* Navigation indicator */}
      {state.isActive && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="p-2 bg-surface-card border border-surface-border shadow-lg">
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="info" className="text-xs">
                Keyboard Nav
              </Badge>
              <span className="text-text-secondary">
                {state.currentIndex + 1}/{state.totalElements}
              </span>
              {state.lastDirection && (
                <span className="text-text-secondary">
                  Last: {state.lastDirection}
                </span>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Hook for keyboard navigation state
export const useKeyboardNavigation = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const activate = useCallback(() => {
    setIsActive(true);
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
  }, []);

  const updateElements = useCallback((count: number) => {
    setTotalElements(count);
    setCurrentIndex(prev => Math.min(prev, count - 1));
  }, []);

  const setIndex = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, totalElements - 1)));
  }, [totalElements]);

  return {
    isActive,
    currentIndex,
    totalElements,
    activate,
    deactivate,
    updateElements,
    setIndex
  };
};

// Keyboard navigation instructions component
export const KeyboardNavigationInstructions: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ${className}`}>
      <Card className="max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>Keyboard Navigation Instructions</CardTitle>
          <CardDescription>
            Learn how to navigate this application using only your keyboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Basic Navigation</h3>
              <ul className="space-y-1 text-sm">
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Tab</kbd> - Move forward</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Shift + Tab</kbd> - Move backward</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> - Activate</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Space</kbd> - Activate</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Escape</kbd> - Cancel/Close</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Arrow Key Navigation</h3>
              <ul className="space-y-1 text-sm">
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">↑</kbd> - Move up</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">↓</kbd> - Move down</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←</kbd> - Move left</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">→</kbd> - Move right</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-text-secondary">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">F1</kbd> anytime to show/hide these instructions
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setIsVisible(false)}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};