/**
 * Performance timer utility for measuring function execution time
 */

export interface TimerResult {
  duration: number;
  startTime: number;
  endTime: number;
}

export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
  }

  end(): TimerResult {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    return {
      duration,
      startTime: this.startTime,
      endTime
    };
  }

  log(): void {
    const result = this.end();
    console.log(`⏱️  ${this.name}: ${result.duration}ms`);
  }

  warn(threshold: number = 1000): void {
    const result = this.end();
    if (result.duration > threshold) {
      console.warn(`🐌 Slow operation: ${this.name} took ${result.duration}ms (threshold: ${threshold}ms)`);
    }
  }
}

/**
 * Timer decorator for functions
 */
export function timer(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timerName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      const timer = new PerformanceTimer(timerName);
      try {
        const result = originalMethod.apply(this, args);
        timer.log();
        return result;
      } catch (error) {
        timer.log();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Simple timer function for inline usage
 */
export function createTimer(name: string): () => void {
  const timer = new PerformanceTimer(name);
  return () => timer.log();
}

/**
 * Async timer for async functions
 */
export function asyncTimer(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timerName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const timer = new PerformanceTimer(timerName);
      try {
        const result = await originalMethod.apply(this, args);
        timer.log();
        return result;
      } catch (error) {
        timer.log();
        throw error;
      }
    };

    return descriptor;
  };
}

// Export a simple timer function for backward compatibility
export const timerFunction = createTimer;
