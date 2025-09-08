declare module 'jest-axe' {
  export function axe(element: HTMLElement | HTMLElement[], options?: Record<string, unknown>): Promise<{ violations: unknown[] }>;
  export function toHaveNoViolations(): {
    message(): string;
    pass: boolean;
  };
}
