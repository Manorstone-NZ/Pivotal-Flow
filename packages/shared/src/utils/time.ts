/**
 * Timing utilities for performance measurement
 */

export interface TimerResult {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

export class PerformanceTimer {
  private name: string;
  private startTime: number;

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
  }

  /**
   * End the timer and return the result
   */
  end(): TimerResult {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    return {
      name: this.name,
      duration,
      startTime: this.startTime,
      endTime
    };
  }

  /**
   * End the timer and log the result
   */
  log(): TimerResult {
    const result = this.end();
    console.log(`⏱️  ${result.name}: ${result.duration}ms`);
    return result;
  }

  /**
   * Get current duration without ending the timer
   */
  getCurrentDuration(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Start a timer
 */
export function startTimer(name: string): PerformanceTimer {
  return new PerformanceTimer(name);
}

/**
 * End a timer and return duration in milliseconds
 */
export function endTimer(timer: PerformanceTimer): number {
  return timer.end().duration;
}

/**
 * Time a function execution
 */
export function timeFunction<T>(name: string, fn: () => T): T {
  const timer = startTimer(name);
  try {
    const result = fn();
    timer.log();
    return result;
  } catch (error) {
    timer.log();
    throw error;
  }
}

/**
 * Time an async function execution
 */
export async function timeAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const timer = startTimer(name);
  try {
    const result = await fn();
    timer.log();
    return result;
  } catch (error) {
    timer.log();
    throw error;
  }
}

/**
 * Create a simple timer that returns a function to end it
 */
export function createTimer(name: string): () => number {
  const timer = startTimer(name);
  return () => endTimer(timer);
}

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(2);
  return `${minutes}m ${seconds}s`;
}

/**
 * Get current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestampISO(): string {
  return new Date().toISOString();
}
