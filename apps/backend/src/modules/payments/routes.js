import { PaymentRepository, MetricsCollector, generateId } from '@pivotal-flow/shared';
import { z } from 'zod';
import { sendErrorResponse } from '../../lib/error-handler.js';
// Zod schemas for validation
const CreatePaymentSchema = z.object({
    invoiceId: z.string().min(1, 'Invoice ID is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    method: z.string().min(1, 'Payment method is required'),
    reference: z.string().optional(),
    paidAt: z.string().datetime().optional(),
    idempotencyKey: z.string().optional(),
    gatewayPayload: z.record(z.unknown()).optional(),
});
const VoidPaymentSchema = z.object({
    reason: z.string().min(1, 'Void reason is required'),
});
export const paymentRoutes = async (fastify) => {
    const paymentRepo = new PaymentRepository(fastify.db, { organizationId: 'org-1', userId: 'user-1' });
    const metrics = new MetricsCollector();
    // POST /v1/payments - Create payment
    fastify.post('/v1/payments', async (request, reply) => {
        const startTime = Date.now();
        try {
            // Validate request body
            const data = CreatePaymentSchema.parse(request.body);
            const userId = request.user?.userId;
            const organizationId = request.user?.organizationId;
            if (!userId || !organizationId) {
                sendErrorResponse(reply, 'AUTHENTICATION_ERROR', 'Authentication required', 401, request.id);
                return;
            }
            // Create payment data with proper defaults
            const paymentData = {
                id: generateId(),
                organizationId: organizationId,
                invoiceId: data.invoiceId,
                amount: data.amount.toString(),
                currency: data.currency,
                method: data.method,
                reference: data.reference || '',
                paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
                createdBy: userId,
                idempotencyKey: data.idempotencyKey || '',
                gatewayPayload: data.gatewayPayload || {},
            };
            // Validate payment data
            const validation = paymentRepo.validatePaymentData(paymentData);
            if (!validation.isValid) {
                return reply.status(400).send({
                    error: 'Validation failed',
                    details: validation.errors,
                });
            }
            // Create payment
            const payment = await paymentRepo.createPayment(paymentData);
            // Record metrics
            metrics.recordPaymentCreated();
            metrics.recordPaymentApply(Date.now() - startTime);
            return reply.status(200).send(payment);
        }
        catch (error) {
            metrics.recordPaymentError();
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    error: 'Validation failed',
                    details: error.errors,
                });
            }
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.status(404).send({ error: error.message });
                }
                if (error.message.includes('currency') || error.message.includes('amount')) {
                    return reply.status(400).send({ error: error.message });
                }
            }
            fastify.log.error({ error }, 'Payment creation failed');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    // GET /v1/invoices/:id/payments - List payments for invoice
    fastify.get('/v1/invoices/:id/payments', async (request, reply) => {
        try {
            const { id } = request.params;
            const organizationId = request.user?.organizationId;
            const result = await paymentRepo.getInvoiceWithPayments(id);
            if (!result) {
                return reply.status(404).send({ error: 'Invoice not found' });
            }
            // Check if user has access to this invoice
            if (result.invoice.organizationId !== organizationId) {
                return reply.status(403).send({ error: 'Forbidden' });
            }
            return reply.status(200).send(result.payments);
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to get invoice payments');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    // POST /v1/payments/:id/void - Void payment
    fastify.post('/v1/payments/:id/void', async (request, reply) => {
        try {
            const { id } = request.params;
            const { reason } = VoidPaymentSchema.parse(request.body);
            const userId = request.user?.userId;
            const organizationId = request.user?.organizationId;
            if (!userId || !organizationId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const payment = await paymentRepo.voidPayment(id, reason, userId);
            return reply.status(200).send(payment);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    error: 'Validation failed',
                    details: error.errors,
                });
            }
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.status(404).send({ error: error.message });
                }
            }
            fastify.log.error({ error }, 'Payment void failed');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    // Test payment endpoint without authentication
    fastify.get('/v1/test/payments/:invoiceId', async (request, reply) => {
        try {
            const { invoiceId } = request.params;
            const result = await paymentRepo.getInvoiceWithPayments(invoiceId);
            if (!result) {
                return reply.status(404).send({ error: 'Invoice not found' });
            }
            return reply.status(200).send({
                invoice: result.invoice,
                payments: result.payments
            });
        }
        catch (error) {
            fastify.log.error({ error }, 'Failed to get invoice payments');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
    // Test payment creation endpoint without authentication
    fastify.post('/v1/test/payments', async (request, reply) => {
        const startTime = Date.now();
        try {
            // Validate request body
            const data = CreatePaymentSchema.parse(request.body);
            // Use the real user and organization IDs
            const userId = '2a870792-298d-41aa-b4ba-3349aebc749c';
            const organizationId = '6975c31b-a98d-491f-aed6-8792735aef02';
            // Create payment data with proper defaults
            const paymentData = {
                id: generateId(),
                organizationId: organizationId,
                invoiceId: data.invoiceId,
                amount: data.amount.toString(),
                currency: data.currency,
                method: data.method,
                reference: data.reference || '',
                paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
                createdBy: userId,
                idempotencyKey: data.idempotencyKey || '',
                gatewayPayload: data.gatewayPayload || {},
            };
            // Validate payment data
            const validation = paymentRepo.validatePaymentData(paymentData);
            if (!validation.isValid) {
                return reply.status(400).send({
                    error: 'Validation failed',
                    details: validation.errors,
                });
            }
            // Create payment
            const payment = await paymentRepo.createPayment(paymentData);
            // Record metrics
            metrics.recordPaymentCreated();
            metrics.recordPaymentApply(Date.now() - startTime);
            return reply.status(200).send(payment);
        }
        catch (error) {
            metrics.recordPaymentError();
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    error: 'Validation failed',
                    details: error.errors,
                });
            }
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.status(404).send({ error: error.message });
                }
                if (error.message.includes('currency') || error.message.includes('amount')) {
                    return reply.status(400).send({ error: error.message });
                }
            }
            fastify.log.error({ error }, 'Payment creation failed');
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
};
//# sourceMappingURL=routes.js.map