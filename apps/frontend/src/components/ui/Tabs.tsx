import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import type { BaseComponentProps } from '../../lib/utils';

interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveTab,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeTab || defaultActiveTab || items[0]?.id || ''
  );
  
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const currentActiveTab = activeTab || internalActiveTab;
  const activeTabItem = items.find(item => item.id === currentActiveTab);

  const handleTabClick = (tabId: string) => {
    const tab = items.find(item => item.id === tabId);
    if (tab && !tab.disabled) {
      if (!activeTab) {
        setInternalActiveTab(tabId);
      }
      onTabChange?.(tabId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    const currentIndex = items.findIndex(item => item.id === tabId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    const nextTab = items[nextIndex];
    if (nextTab && !nextTab.disabled) {
      handleTabClick(nextTab.id);
      activeTabRef.current?.focus();
    }
  };

  const tabListClasses = cn(
    'flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
    },
    className
  );

  const tabClasses = cn(
    'px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
    {
      // Size variants
      'px-3 py-1.5 text-xs': size === 'sm',
      'px-4 py-2 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg',
      
      // Variant styles
      'border-b-2 border-transparent': variant === 'default' || variant === 'underline',
      'rounded-md': variant === 'pills',
    }
  );

  const activeTabClasses = cn(
    tabClasses,
    {
      // Active state styles
      'text-brand-primary border-brand-primary': (variant === 'default' || variant === 'underline') && currentActiveTab,
      'bg-brand-primary text-text-inverse': variant === 'pills' && currentActiveTab,
    }
  );

  const inactiveTabClasses = cn(
    tabClasses,
    'text-text-secondary hover:text-text-primary',
    {
      'hover:border-neutral-300': variant === 'default' || variant === 'underline',
      'hover:bg-neutral-100': variant === 'pills',
    }
  );

  const disabledTabClasses = cn(
    tabClasses,
    'text-text-disabled cursor-not-allowed opacity-50'
  );

  const contentClasses = cn(
    'mt-4',
    {
      'ml-4': orientation === 'vertical',
    }
  );

  return (
    <div>
      <div
        ref={tabListRef}
        className={tabListClasses}
        role="tablist"
        aria-orientation={orientation}
      >
        {items.map((item) => {
          const isActive = item.id === currentActiveTab;
          const isDisabled = item.disabled;
          
          return (
            <button
              key={item.id}
              ref={isActive ? activeTabRef : undefined}
              className={
                isDisabled
                  ? disabledTabClasses
                  : isActive
                  ? activeTabClasses
                  : inactiveTabClasses
              }
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.id}`}
              aria-disabled={isDisabled}
              id={`tab-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      
      {activeTabItem && (
        <div
          className={contentClasses}
          role="tabpanel"
          id={`tabpanel-${activeTabItem.id}`}
          aria-labelledby={`tab-${activeTabItem.id}`}
          tabIndex={0}
        >
          {activeTabItem.content}
        </div>
      )}
    </div>
  );
};
