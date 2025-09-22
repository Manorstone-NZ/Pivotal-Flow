/**
 * F2B Session Verification for Opaque Token Authentication
 * Implements secure session-based authentication replacing JWT
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createHash } from 'crypto';
import { SessionService } from './session-service.js';
import { logger } from '../logger.js';

// Types for authenticated requests
export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  memberships: Array<{
    tenantId: string;
    role: string;
  }>;
}

// Note: We use 'any' casting instead of extending FastifyRequest to avoid type conflicts
// The session verification adds user, sessionId, and tenantId to the request object

// Session verification preHandler
export async function verifySession(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract session ID from cookie
    const sessionId = request.cookies?.['sid'];
    
    if (!sessionId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Session cookie required',
        code: 'NO_SESSION'
      });
    }

    // Validate session format (should be a valid UUID)
    if (!isValidSessionId(sessionId)) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid session format',
        code: 'INVALID_SESSION_FORMAT'
      });
    }

    // Use SessionService to validate session
    const sessionService = new SessionService();
    const sessionData = await sessionService.validateSession(sessionId);

    if (!sessionData) {
      logger.warn({
        sessionId: hashSessionId(sessionId),
        ip: request.ip,
        userAgent: request.headers['user-agent']
      }, 'Session validation failed - session not found or expired');
      
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Session not found or expired',
        code: 'INVALID_SESSION'
      });
    }

    // Create authenticated user object
    const authenticatedUser: AuthenticatedUser = {
      userId: sessionData.userId,
      organizationId: sessionData.organizationId,
      tenantId: sessionData.tenantId,
      roles: sessionData.roles,
      permissions: sessionData.permissions,
      memberships: sessionData.memberships
    };

    // Attach to request (using any to bypass TypeScript restrictions)
    (request as any).user = authenticatedUser;
    (request as any).sessionId = sessionId;
    (request as any).tenantId = sessionData.tenantId;

    // Set tenant context for RLS if enabled
    await setTenantContext(request, sessionData.tenantId);

    logger.debug({
      userId: sessionData.userId,
      tenantId: sessionData.tenantId,
      sessionId: hashSessionId(sessionId)
    }, 'Session verification successful');

  } catch (error) {
    logger.error({
      err: error,
      sessionId: request.cookies?.['sid'] ? hashSessionId(request.cookies['sid']) : 'none',
      ip: request.ip
    }, 'Session verification failed');

    return reply.status(500).send({
      error: {
        code: 'SESSION_VERIFICATION_ERROR',
        message: 'Internal session verification error',
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    });
  }
}

// PASETO verification for service-to-service
export async function verifyPaseto(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Paseto ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'PASETO token required in Authorization header',
        code: 'INVALID_AUTH_HEADER'
      });
    }

    // const token = authHeader.substring(7); // Remove 'Paseto ' prefix

    // TODO: Implement PASETO v4.public verification
    // For now, this is a placeholder
    logger.warn('PASETO verification not yet implemented');

    return reply.status(501).send({
      error: {
        code: 'PASETO_NOT_IMPLEMENTED',
        message: 'PASETO verification not yet implemented',
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    });

  } catch (error) {
    logger.error({ err: error }, 'PASETO verification failed');

    return reply.status(500).send({
      error: {
        code: 'PASETO_VERIFICATION_ERROR',
        message: 'Internal PASETO verification error',
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    });
  }
}

// PASETO verification for public links
export async function verifyPublicPaseto(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract token from URL parameter
    const token = (request.params as any)?.token;
    
    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Public token required',
        code: 'NO_PUBLIC_TOKEN'
      });
    }

    // TODO: Implement PASETO v4.local or v4.public verification for public tokens
    // For now, this is a placeholder
    logger.warn('Public PASETO verification not yet implemented');

    return reply.status(501).send({
      error: {
        code: 'PUBLIC_PASETO_NOT_IMPLEMENTED',
        message: 'Public PASETO verification not yet implemented',
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    });

  } catch (error) {
    logger.error({ err: error }, 'Public PASETO verification failed');

    return reply.status(500).send({
      error: {
        code: 'PUBLIC_PASETO_VERIFICATION_ERROR',
        message: 'Internal public PASETO verification error',
        timestamp: new Date().toISOString(),
        request_id: request.id
      }
    });
  }
}

// Helper functions

function isValidSessionId(sessionId: string): boolean {
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

function hashSessionId(sessionId: string): string {
  return createHash('sha256').update(sessionId).digest('hex').substring(0, 8);
}

async function setTenantContext(_request: FastifyRequest, tenantId: string): Promise<void> {
  try {
    // TODO: Implement RLS context setting with Drizzle
    // For now, this is a placeholder
    logger.debug({ tenantId }, 'Setting tenant context for RLS');
  } catch (error) {
    logger.warn({ err: error, tenantId }, 'Failed to set tenant context for RLS');
    // Don't fail the request if RLS context setting fails
  }
}

// Plugin registration function
export async function registerSessionVerification(fastify: FastifyInstance): Promise<void> {
  // Decorate fastify with verification functions
  fastify.decorate('verifySession', verifySession);
  fastify.decorate('verifyPaseto', verifyPaseto);
  fastify.decorate('verifyPublicPaseto', verifyPublicPaseto);

  logger.info('Session verification handlers registered');
}
