/**
 * Performance timer utility for measuring function execution time
 */
export class PerformanceTimer {
    startTime;
    name;
    constructor(name) {
        this.name = name;
        this.startTime = Date.now();
    }
    end() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        return {
            duration,
            startTime: this.startTime,
            endTime
        };
    }
    log() {
        const result = this.end();
        console.log(`⏱️  ${this.name}: ${result.duration}ms`);
    }
    warn(threshold = 1000) {
        const result = this.end();
        if (result.duration > threshold) {
            console.warn(`🐌 Slow operation: ${this.name} took ${result.duration}ms (threshold: ${threshold}ms)`);
        }
    }
}
/**
 * Timer decorator for functions
 */
export function timer(name) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const timerName = name || `${target.constructor.name}.${propertyKey}`;
        descriptor.value = function (...args) {
            const timer = new PerformanceTimer(timerName);
            try {
                const result = originalMethod.apply(this, args);
                timer.log();
                return result;
            }
            catch (error) {
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
export function createTimer(name) {
    const timer = new PerformanceTimer(name);
    return () => timer.log();
}
/**
 * Async timer for async functions
 */
export function asyncTimer(name) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const timerName = name || `${target.constructor.name}.${propertyKey}`;
        descriptor.value = async function (...args) {
            const timer = new PerformanceTimer(timerName);
            try {
                const result = await originalMethod.apply(this, args);
                timer.log();
                return result;
            }
            catch (error) {
                timer.log();
                throw error;
            }
        };
        return descriptor;
    };
}
// Export a simple timer function for backward compatibility
export const timerFunction = createTimer;
//# sourceMappingURL=timer.js.map