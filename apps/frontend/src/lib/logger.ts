/**
 * Frontend Logger Utility
 * Simple logging interface for development and debugging
 */

interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const createLogger = (): Logger => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    info: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.info(`[INFO] ${message}`, ...args);
      }
    },
    
    warn: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    },
    
    error: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.error(`[ERROR] ${message}`, ...args);
      }
    },
    
    debug: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    }
  };
};

export const logger = createLogger();
