import React from 'react';

interface AxeAnnouncerProps {
  message?: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

/**
 * AxeAnnouncer component for accessibility announcements
 * Provides aria-live region for screen reader announcements
 */
export function AxeAnnouncer({ 
  message = '', 
  priority = 'polite',
  className = ''
}: AxeAnnouncerProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
      role="status"
      aria-label="Screen reader announcements"
    >
      {message}
    </div>
  );
}

/**
 * Hook for managing accessibility announcements
 */
export function useAxeAnnouncer() {
  const [message, setMessage] = React.useState('');
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite');

  const announce = React.useCallback((newMessage: string, newPriority: 'polite' | 'assertive' = 'polite') => {
    setMessage(newMessage);
    setPriority(newPriority);
    
    // Clear message after announcement to allow re-announcing the same message
    setTimeout(() => setMessage(''), 1000);
  }, []);

  return {
    message,
    priority,
    announce,
    AxeAnnouncer: () => <AxeAnnouncer message={message} priority={priority} />
  };
}
