/**
 * Customer Routes
 * API endpoints for customer and contact management (following quotes pattern)
 */
import { CustomerService } from './service.js';
import { CustomerListResponseSchema, CustomerDetailResponseSchema, ContactListResponseSchema, CustomerResponseSchema, ContactResponseSchema, ErrorResponseSchema, StandardSuccessResponseSchema, CustomerIdParamSchema, ContactIdParamSchema, CustomerQuerystringSchema, CreateCustomerBodySchema, UpdateCustomerBodySchema, CreateContactBodySchema, UpdateContactBodySchema, } from './schemas.js';
// List customers with filtering and pagination
export function registerCustomerListRoute(fastify) {
    fastify.get('/v1/customers', {
        schema: {
            tags: ['Customers'],
            summary: 'List customers',
            description: 'Get paginated list of customers with filtering options',
            security: [{ bearerAuth: [] }],
            querystring: CustomerQuerystringSchema,
            response: {
                200: CustomerListResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { page = 1, limit = 20, search, status, customerType, industry, source, tags, sortBy, sortOrder = 'desc', } = request.query;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const filters = {
                search,
                status,
                customerType,
                industry,
                source,
                tags,
                sortBy,
                sortOrder,
            };
            const { customers, total } = await customerService.listCustomers(filters, { page, limit });
            const pages = Math.ceil(total / limit);
            return reply.send({
                success: true,
                data: customers,
                pagination: {
                    page,
                    limit,
                    total,
                    pages,
                },
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to list customers',
            });
        }
    });
}
// Get customer by ID
export function registerCustomerGetRoute(fastify) {
    fastify.get('/v1/customers/:id', {
        schema: {
            tags: ['Customers'],
            summary: 'Get customer by ID',
            description: 'Get customer details by ID with optional contacts',
            security: [{ bearerAuth: [] }],
            params: CustomerIdParamSchema,
            querystring: {
                type: 'object',
                properties: {
                    includeContacts: { type: 'boolean', default: false },
                },
            },
            response: {
                200: CustomerDetailResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId } = request.params;
            const includeContacts = request.query?.includeContacts || false;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const customer = await customerService.getCustomerById(customerId, includeContacts);
            if (!customer) {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Customer not found',
                });
            }
            return reply.send({
                success: true,
                data: customer,
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to get customer',
            });
        }
    });
}
// Create new customer
export function registerCustomerCreateRoute(fastify) {
    fastify.post('/v1/customers', {
        schema: {
            tags: ['Customers'],
            summary: 'Create customer',
            description: 'Create a new customer',
            security: [{ bearerAuth: [] }],
            body: CreateCustomerBodySchema,
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: CustomerResponseSchema,
                        message: { type: 'string' },
                    },
                },
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const customer = await customerService.createCustomer(request.body);
            return reply.status(201).send({
                success: true,
                data: customer,
                message: 'Customer created successfully',
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to create customer',
            });
        }
    });
}
// Update customer
export function registerCustomerUpdateRoute(fastify) {
    fastify.patch('/v1/customers/:id', {
        schema: {
            tags: ['Customers'],
            summary: 'Update customer',
            description: 'Update customer details',
            security: [{ bearerAuth: [] }],
            params: CustomerIdParamSchema,
            body: UpdateCustomerBodySchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: CustomerResponseSchema,
                        message: { type: 'string' },
                    },
                },
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId } = request.params;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const customer = await customerService.updateCustomer(customerId, request.body);
            if (!customer) {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Customer not found',
                });
            }
            return reply.send({
                success: true,
                data: customer,
                message: 'Customer updated successfully',
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to update customer',
            });
        }
    });
}
// Delete customer
export function registerCustomerDeleteRoute(fastify) {
    fastify.delete('/v1/customers/:id', {
        schema: {
            tags: ['Customers'],
            summary: 'Delete customer',
            description: 'Soft delete customer',
            security: [{ bearerAuth: [] }],
            params: CustomerIdParamSchema,
            response: {
                200: StandardSuccessResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId } = request.params;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const deleted = await customerService.deleteCustomer(customerId);
            if (!deleted) {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Customer not found',
                });
            }
            return reply.send({
                success: true,
                message: 'Customer deleted successfully',
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to delete customer',
            });
        }
    });
}
// List customer contacts
export function registerContactListRoute(fastify) {
    fastify.get('/v1/customers/:id/contacts', {
        schema: {
            tags: ['Contacts'],
            summary: 'List customer contacts',
            description: 'Get all contacts for a customer',
            security: [{ bearerAuth: [] }],
            params: CustomerIdParamSchema,
            response: {
                200: ContactListResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId } = request.params;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            // Verify customer exists
            const hasAccess = await customerService.hasCustomerAccess(customerId);
            if (!hasAccess) {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Customer not found',
                });
            }
            const contacts = await customerService.getCustomerContacts(customerId);
            return reply.send({
                success: true,
                data: contacts,
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to list contacts',
            });
        }
    });
}
// Get contact by ID
export function registerContactGetRoute(fastify) {
    fastify.get('/v1/customers/:id/contacts/:contactId', {
        schema: {
            tags: ['Contacts'],
            summary: 'Get contact by ID',
            description: 'Get contact details by ID',
            security: [{ bearerAuth: [] }],
            params: ContactIdParamSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: ContactResponseSchema,
                    },
                },
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId, contactId } = request.params;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const contact = await customerService.getContactById(customerId, contactId);
            if (!contact) {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Contact not found',
                });
            }
            return reply.send({
                success: true,
                data: contact,
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to get contact',
            });
        }
    });
}
// Create new contact
export function registerContactCreateRoute(fastify) {
    fastify.post('/v1/customers/:id/contacts', {
        schema: {
            tags: ['Contacts'],
            summary: 'Create contact',
            description: 'Create a new contact for a customer',
            security: [{ bearerAuth: [] }],
            params: CustomerIdParamSchema,
            body: CreateContactBodySchema,
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: ContactResponseSchema,
                        message: { type: 'string' },
                    },
                },
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId } = request.params;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const contact = await customerService.createContact(customerId, request.body);
            return reply.status(201).send({
                success: true,
                data: contact,
                message: 'Contact created successfully',
            });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Customer not found') {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Customer not found',
                });
            }
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to create contact',
            });
        }
    });
}
// Update contact
export function registerContactUpdateRoute(fastify) {
    fastify.patch('/v1/customers/:id/contacts/:contactId', {
        schema: {
            tags: ['Contacts'],
            summary: 'Update contact',
            description: 'Update contact details',
            security: [{ bearerAuth: [] }],
            params: ContactIdParamSchema,
            body: UpdateContactBodySchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: ContactResponseSchema,
                        message: { type: 'string' },
                    },
                },
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId, contactId } = request.params;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const contact = await customerService.updateContact(customerId, contactId, request.body);
            if (!contact) {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Contact not found',
                });
            }
            return reply.send({
                success: true,
                data: contact,
                message: 'Contact updated successfully',
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to update contact',
            });
        }
    });
}
// Delete contact
export function registerContactDeleteRoute(fastify) {
    fastify.delete('/v1/customers/:id/contacts/:contactId', {
        schema: {
            tags: ['Contacts'],
            summary: 'Delete contact',
            description: 'Soft delete contact',
            security: [{ bearerAuth: [] }],
            params: ContactIdParamSchema,
            response: {
                200: StandardSuccessResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
                403: ErrorResponseSchema,
                404: ErrorResponseSchema,
                500: ErrorResponseSchema,
            },
        },
    }, async (request, reply) => {
        try {
            const { user } = request;
            const { id: customerId, contactId } = request.params;
            const customerService = new CustomerService(fastify, user.organizationId, user.userId);
            const deleted = await customerService.deleteContact(customerId, contactId);
            if (!deleted) {
                return reply.status(404).send({
                    success: false,
                    error: 'Not Found',
                    message: 'Contact not found',
                });
            }
            return reply.send({
                success: true,
                message: 'Contact deleted successfully',
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to delete contact',
            });
        }
    });
}
//# sourceMappingURL=routes.js.map