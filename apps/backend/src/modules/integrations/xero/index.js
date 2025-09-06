/**
 * Xero Integration Module
 * Backend module for Xero integration with feature flagging
 */
import { getXeroConfig, isXeroConfigured } from '../../../config/xero_config.js';
// import { NoOpXeroConnector } from '../../../../../../packages/integrations/xero/src/no-op-connector.js';
// Local NoOpXeroConnector implementation
class NoOpXeroConnector {
    constructor() {
        // No-op constructor
    }
    async pushInvoice(_invoice) {
        return { success: true, message: 'No-op mode: Invoice not pushed to Xero' };
    }
}
/**
 * Xero integration module plugin
 */
const xeroIntegrationModule = async (fastify) => {
    // Register Xero routes
    await registerXeroRoutes(fastify);
    fastify.log.info('Xero integration module registered');
};
/**
 * Register Xero integration routes
 */
async function registerXeroRoutes(fastify) {
    // Health check endpoint
    fastify.get('/v1/integrations/xero/health', {
        schema: {
            description: 'Returns the health status of the Xero integration',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        enabled: { type: 'boolean' },
                        status: { type: 'string', enum: ['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'DISABLED'] },
                        lastSync: { type: 'string' },
                        errors: { type: 'array', items: { type: 'string' } },
                        configStatus: {
                            type: 'object',
                            properties: {
                                clientId: { type: 'boolean' },
                                clientSecret: { type: 'boolean' },
                                redirectUri: { type: 'boolean' },
                                tenantId: { type: 'boolean' },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, _reply) => {
        const { organizationId } = request.user;
        // Check if organization has Xero integration enabled
        const organization = await fastify.db.query.organizations.findFirst({
            where: (organizations, { eq }) => eq(organizations.id, organizationId),
        });
        const xeroEnabled = organization?.settings?.xero_integration_enabled === true;
        const config = getXeroConfig();
        const isConfigured = isXeroConfigured();
        let status;
        const errors = [];
        if (!xeroEnabled) {
            status = 'DISABLED';
            errors.push('Xero integration is disabled for this organization');
        }
        else if (!isConfigured) {
            status = 'UNHEALTHY';
            errors.push('Xero integration is not properly configured');
        }
        else {
            status = 'HEALTHY';
        }
        return {
            enabled: xeroEnabled && isConfigured,
            status,
            lastSync: status === 'HEALTHY' ? new Date().toISOString() : undefined,
            errors,
            configStatus: {
                clientId: Boolean(config.clientId),
                clientSecret: Boolean(config.clientSecret),
                redirectUri: Boolean(config.redirectUri),
                tenantId: Boolean(config.tenantId),
            },
        };
    });
    // Push invoice endpoint
    fastify.post('/v1/integrations/xero/push/invoice', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    invoiceId: { type: 'string' },
                    operation: { type: 'string', enum: ['create', 'update'] },
                },
                required: ['invoiceId', 'operation'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        operationId: { type: 'string' },
                        externalId: { type: 'string' },
                        warnings: { type: 'array', items: { type: 'string' } },
                        timestamp: { type: 'string' },
                    },
                },
            },
        },
        preHandler: fastify.authenticate,
    }, async (request, reply) => {
        const { organizationId } = request.user;
        const { invoiceId } = request.body;
        // Check if Xero integration is enabled for organization
        const organization = await fastify.db.query.organizations.findFirst({
            where: (organizations, { eq }) => eq(organizations.id, organizationId),
        });
        if (!organization?.settings?.xero_integration_enabled) {
            return reply.status(503).send({
                error: 'Service Unavailable',
                message: 'Xero integration is disabled for this organization',
                code: 'XERO_DISABLED',
            });
        }
        // Create no-op connector
        const connector = new NoOpXeroConnector();
        // Create mock invoice for testing
        const mockInvoice = {
            invoiceId,
            invoiceNumber: `INV-${invoiceId}`,
            contact: {
                contactId: 'contact_001',
                name: 'Test Customer',
            },
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'DRAFT',
            lineAmountTypes: 'Exclusive',
            lineItems: [
                {
                    lineItemId: 'line_001',
                    description: 'Test Service',
                    quantity: 1,
                    unitAmount: 100.0,
                    lineAmount: 100.0,
                    accountCode: '200',
                    taxType: 'OUTPUT',
                    taxAmount: 15.0,
                },
            ],
            subtotal: 100.0,
            totalTax: 15.0,
            total: 115.0,
            currencyCode: 'NZD',
            hasAttachments: false,
            hasErrors: false,
        };
        const result = await connector.pushInvoice(mockInvoice);
        return result;
    });
    // OAuth callback endpoint (disabled when feature off)
    fastify.get('/v1/integrations/xero/callback', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    code: { type: 'string' },
                    state: { type: 'string' },
                },
                required: ['code', 'state'],
            },
        },
    }, async (request, reply) => {
        const { code, state } = request.query;
        // Log structured message when disabled
        fastify.log.info({
            msg: 'Xero OAuth callback received but integration is disabled',
            code,
            state,
            status: 'DISABLED',
        });
        return reply.status(503).send({
            error: 'Service Unavailable',
            message: 'Xero integration is currently disabled',
            code: 'XERO_DISABLED',
        });
    });
    // Webhook endpoint (disabled when feature off)
    fastify.post('/v1/integrations/xero/webhook', {
        schema: {},
    }, async (request, reply) => {
        const payload = request.body;
        const signature = request.headers['x-xero-signature'];
        // Log structured message when disabled
        fastify.log.info({
            msg: 'Xero webhook received but integration is disabled',
            payload: JSON.stringify(payload),
            signature,
            status: 'DISABLED',
        });
        return reply.status(503).send({
            error: 'Service Unavailable',
            message: 'Xero integration is currently disabled',
            code: 'XERO_DISABLED',
        });
    });
}
export { xeroIntegrationModule };
//# sourceMappingURL=index.js.map