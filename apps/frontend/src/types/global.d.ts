// Global type declarations for browser APIs and third-party libraries

declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
      captureMessage: (message: string, level?: string) => void;
      withScope: (callback: (scope: { setTag: (key: string, value: string) => void; setContext: (key: string, context: Record<string, unknown>) => void; setLevel: (level: string) => void }) => void) => void;
    };
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

export {};

