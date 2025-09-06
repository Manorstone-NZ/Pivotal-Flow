/**
 * Xero configuration shim
 * Provides typed configuration object with optional fields
 * Validation will be added in CZ2
 */

export interface XeroConfig {
  enabled: boolean;
  clientId?: string | undefined;
  clientSecret?: string | undefined;
  redirectUri?: string | undefined;
  tenantId?: string | undefined;
  webhookKey?: string | undefined;
}

function createXeroConfig(): XeroConfig {
  const clientId = process.env['XERO_CLIENT_ID'];
  const clientSecret = process.env['XERO_CLIENT_SECRET'];
  const redirectUri = process.env['XERO_REDIRECT_URI'];
  const tenantId = process.env['XERO_TENANT_ID'];
  const webhookKey = process.env['XERO_WEBHOOK_KEY'];
  
  // enabled is true only if all required fields are present
  const enabled = !!(clientId && clientSecret && redirectUri && tenantId);
  
  return {
    enabled,
    clientId: clientId || undefined,
    clientSecret: clientSecret || undefined,
    redirectUri: redirectUri || undefined,
    tenantId: tenantId || undefined,
    webhookKey: webhookKey || undefined,
  };
}

export const xeroConfig = createXeroConfig();

// Export individual functions for compatibility
export function getXeroConfig(): XeroConfig {
  return xeroConfig;
}

export function isXeroConfigured(): boolean {
  return xeroConfig.enabled;
}