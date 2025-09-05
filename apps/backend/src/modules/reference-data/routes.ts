/**
 * Reference data routes
 * API endpoints for reference data with caching
 */

import { FastifyInstance } from 'fastify';
import { ReferenceDataService } from './service.js';
import { PermissionService } from '../permissions/service.js';
import { AuditLogger } from '../audit/logger.js';
import {
  CurrenciesResponseSchema,
  TaxClassesResponseSchema,
  RolesResponseSchema,
  PermissionsResponseSchema,
  ServiceCategoriesResponseSchema,
  RateCardsResponseSchema,
} from './schemas.js';

/**
 * Register reference data routes
 */
export async function registerReferenceDataRoutes(fastify: FastifyInstance): Promise<void> {
  // Get currencies
  fastify.get('/v1/reference/currencies', {
    schema: {
      tags: ['Reference'],
      summary: 'Get currencies reference data',
      description: 'Returns a list of active currencies for frontend pickers',
      response: {
        200: CurrenciesResponseSchema,
      },
    },
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const referenceService = new ReferenceDataService(organizationId, userId, permissionService, auditLogger);
    const result = await referenceService.getCurrencies();

    return result;
  });

  // Get tax classes
  fastify.get('/v1/reference/tax-classes', {
    schema: {
      tags: ['Reference'],
      summary: 'Get tax classes reference data',
      description: 'Returns a list of active tax classes for frontend pickers',
      response: {
        200: TaxClassesResponseSchema,
      },
    },
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const referenceService = new ReferenceDataService(organizationId, userId, permissionService, auditLogger);
    const result = await referenceService.getTaxClasses();

    return result;
  });

  // Get roles
  fastify.get('/v1/reference/roles', {
    schema: {
      tags: ['Reference'],
      summary: 'Get roles reference data',
      description: 'Returns a list of active roles for frontend pickers',
      response: {
        200: RolesResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const referenceService = new ReferenceDataService(organizationId, userId, permissionService, auditLogger);
    const result = await referenceService.getRoles();

    return result;
  });

  // Get permissions
  fastify.get('/v1/reference/permissions', {
    schema: {
      tags: ['Reference'],
      summary: 'Get permissions reference data',
      description: 'Returns a list of permissions for frontend pickers',
      response: {
        200: PermissionsResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const referenceService = new ReferenceDataService(organizationId, userId, permissionService, auditLogger);
    const result = await referenceService.getPermissions();

    return result;
  });

  // Get service categories
  fastify.get('/v1/reference/service-categories', {
    schema: {
      tags: ['Reference'],
      summary: 'Get service categories reference data',
      description: 'Returns a list of active service categories for frontend pickers',
      response: {
        200: ServiceCategoriesResponseSchema,
      },
    },
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const referenceService = new ReferenceDataService(organizationId, userId, permissionService, auditLogger);
    const result = await referenceService.getServiceCategories();

    return result;
  });

  // Get rate cards
  fastify.get('/v1/reference/rate-cards', {
    schema: {
      tags: ['Reference'],
      summary: 'Get rate cards reference data',
      description: 'Returns a list of active rate cards for frontend pickers',
      response: {
        200: RateCardsResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const referenceService = new ReferenceDataService(organizationId, userId, permissionService, auditLogger);
    const result = await referenceService.getRateCards();

    return result;
  });

  // Bust cache for a specific reference type
  fastify.post<{ Body: { referenceType: string } }>('/v1/reference/cache/bust', {
    schema: {
      tags: ['Reference'],
      summary: 'Bust cache for reference data',
      description: 'Invalidates cache for a specific reference data type',
      body: {
        type: 'object',
        properties: {
          referenceType: {
            type: 'string',
            enum: ['currencies', 'taxClasses', 'roles', 'permissions', 'serviceCategories', 'rateCards'],
          },
        },
        required: ['referenceType'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            referenceType: { type: 'string' },
          },
        },
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const { referenceType } = request.body;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const referenceService = new ReferenceDataService(organizationId, userId, permissionService, auditLogger);
    await referenceService.bustCache(referenceType);

    return {
      message: 'Cache busted successfully',
      referenceType,
    };
  });
}
