/**
 * Xero Integration Package
 * Main exports for the Xero integration package
 */

export * from './src/types.js';
export * from './src/mapping.js';
export * from './src/no-op-connector.js';

// Re-export main connector interface
export { XeroConnector } from './src/types.js';
export { NoOpXeroConnector } from './src/no-op-connector.js';
