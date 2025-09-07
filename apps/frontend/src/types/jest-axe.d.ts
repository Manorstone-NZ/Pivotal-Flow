declare module 'jest-axe' {
  export function axe(element: HTMLElement | HTMLElement[], options?: any): Promise<any>;
  export function toHaveNoViolations(): {
    message(): string;
    pass: boolean;
  };
}
