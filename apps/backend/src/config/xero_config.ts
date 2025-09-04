/**
 * Xero Configuration
 * Configuration shapes for Xero integration
 */

export interface XeroConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string;
  scopes: string[];
  webhookKey?: string;
}

export interface XeroEnvironmentConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string;
  webhookKey?: string;
}

/**
 * Get Xero configuration from environment variables
 */
export function getXeroConfig(): XeroConfig {
  const config: XeroConfig = {
    clientId: process.env.XERO_CLIENT_ID || '',
    clientSecret: process.env.XERO_CLIENT_SECRET || '',
    redirectUri: process.env.XERO_REDIRECT_URI || '',
    tenantId: process.env.XERO_TENANT_ID,
    scopes: [
      'offline_access',
      'accounting.transactions',
      'accounting.contacts',
      'accounting.settings',
    ],
    webhookKey: process.env.XERO_WEBHOOK_KEY,
  };

  return config;
}

/**
 * Check if Xero integration is properly configured
 */
export function isXeroConfigured(): boolean {
  const config = getXeroConfig();
  return !!(config.clientId && config.clientSecret && config.redirectUri);
}

/**
 * Get Xero OAuth scopes
 */
export function getXeroScopes(): string[] {
  return [
    'offline_access',
    'accounting.transactions',
    'accounting.contacts',
    'accounting.settings',
  ];
}

/**
 * Get Xero OAuth authorization URL
 */
export function getXeroAuthUrl(state: string): string {
  const config = getXeroConfig();
  const scopes = getXeroScopes().join(' ');
  
  return `https://login.xero.com/identity/connect/authorize?` +
    `response_type=code` +
    `&client_id=${encodeURIComponent(config.clientId)}` +
    `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${encodeURIComponent(state)}`;
}

/**
 * Validate Xero configuration
 */
export function validateXeroConfig(): { valid: boolean; errors: string[] } {
  const config = getXeroConfig();
  const errors: string[] = [];

  if (!config.clientId) {
    errors.push('XERO_CLIENT_ID is required');
  }

  if (!config.clientSecret) {
    errors.push('XERO_CLIENT_SECRET is required');
  }

  if (!config.redirectUri) {
    errors.push('XERO_REDIRECT_URI is required');
  }

  if (!config.tenantId) {
    errors.push('XERO_TENANT_ID is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get Xero webhook configuration
 */
export function getXeroWebhookConfig(): { enabled: boolean; key?: string } {
  const config = getXeroConfig();
  
  return {
    enabled: !!config.webhookKey,
    key: config.webhookKey,
  };
}
