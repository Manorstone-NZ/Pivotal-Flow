/**
 * Performance timer utility for measuring function execution time
 */
export interface TimerResult {
    duration: number;
    startTime: number;
    endTime: number;
}
export declare class PerformanceTimer {
    private startTime;
    private name;
    constructor(name: string);
    end(): TimerResult;
    log(): void;
    warn(threshold?: number): void;
}
/**
 * Timer decorator for functions
 */
export declare function timer(name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Simple timer function for inline usage
 */
export declare function createTimer(name: string): () => void;
/**
 * Async timer for async functions
 */
export declare function asyncTimer(name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const timerFunction: typeof createTimer;
//# sourceMappingURL=timer.d.ts.map