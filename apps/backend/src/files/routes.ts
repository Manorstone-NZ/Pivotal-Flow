/**
 * File routes
 * API endpoints for file generation and access
 */

import type { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

import { AuditLogger } from '../modules/audit/logger.js';
// import { PermissionService } from '../modules/permissions/service.js';

import { FILE_ERRORS } from './constants.js';
import { FileService } from './service.js';

// Request schemas
const GenerateFileRequestSchema = Type.Object({
  fileType: Type.Union([
    Type.Literal('exports'),
    Type.Literal('pdfs'),
    Type.Literal('templates'),
    Type.Literal('assets')
  ]),
  mimeType: Type.String(),
  content: Type.String(),
  description: Type.String({ minLength: 1, maxLength: 255 }),
});

const GetSignedUrlRequestSchema = Type.Object({
  fileId: Type.String({ format: 'uuid' }),
  fileType: Type.Optional(Type.Union([
    Type.Literal('exports'),
    Type.Literal('pdfs'),
    Type.Literal('templates'),
    Type.Literal('assets')
  ])),
});

// Response schemas
const FileInfoResponseSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  fileType: Type.String(),
  mimeType: Type.String(),
  size: Type.Number(),
  description: Type.String(),
  createdAt: Type.String(),
});

const SignedUrlResponseSchema = Type.Object({
  fileId: Type.String(),
  signedUrl: Type.String(),
  expiresIn: Type.String(),
});

const GenerateFileResponseSchema = Type.Object({
  fileId: Type.String(),
  message: Type.String(),
});

/**
 * Register file routes
 */
export async function registerFileRoutes(fastify: FastifyInstance): Promise<void> {
  // Generate file
  fastify.post<{ Body: any }>('/v1/files/generate', {
    schema: {
      body: GenerateFileRequestSchema,
      response: {
        200: GenerateFileResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    // const permissionService = new PermissionService(fastify, userId, organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, auditLogger);

    const fileId = await fileService.generateFile({
      organizationId,
      fileType: (request.body as any).fileType,
      mimeType: (request.body as any).mimeType,
      content: (request.body as any).content,
      description: (request.body as any).description,
      userId,
    });

    return {
      fileId,
      message: 'File generated successfully',
    };
  });

  // Get signed URL
  fastify.post<{ Body: any }>('/v1/files/signed-url', {
    schema: {
      body: GetSignedUrlRequestSchema,
      response: {
        200: SignedUrlResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const { fileId, fileType } = request.body as { fileId: string; fileType: string };
    // const permissionService = new PermissionService(fastify, userId, organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, auditLogger);

    const signedUrl = await fileService.getSignedUrl(fileId, fileType as any);

    return {
      fileId,
      signedUrl,
      expiresIn: fileType === 'pdfs' ? '1h' : '15m',
    };
  });

  // Download file
  fastify.get<{ Params: { fileId: string }; Querystring: { token: string } }>('/v1/files/:fileId/download', {
    schema: {
      params: {
        type: 'object',
        properties: {
          fileId: { type: 'string' },
        },
        required: ['fileId'],
      },
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
        required: ['token'],
      },
    },
  }, async (request, reply) => {
    const { fileId } = request.params;
    const { token } = request.query;

    // Create a minimal file service for download (no user context needed for token validation)
    const fileService = new FileService('', '', {} as any, {} as any);

    try {
      const fileContent = await fileService.downloadFile(fileId, token);

      // Set response headers
      reply.header('Content-Type', fileContent.mimeType);
      reply.header('Content-Disposition', `attachment; filename="${fileContent.filename}"`);
      reply.header('Content-Length', fileContent.content.length);

      return fileContent.content;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === FILE_ERRORS.TOKEN_EXPIRED) {
          return reply.status(401).send({
            error: 'Token Expired',
            message: 'The access token has expired',
            code: 'TOKEN_EXPIRED',
          });
        }
        if (error.message === FILE_ERRORS.TOKEN_INVALID) {
          return reply.status(401).send({
            error: 'Invalid Token',
            message: 'The access token is invalid',
            code: 'INVALID_TOKEN',
          });
        }
        if (error.message === FILE_ERRORS.FILE_NOT_FOUND) {
          return reply.status(404).send({
            error: 'File Not Found',
            message: 'The requested file was not found',
            code: 'FILE_NOT_FOUND',
          });
        }
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while processing the request',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // Get file info
  fastify.get<{ Params: { fileId: string } }>('/v1/files/:fileId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          fileId: { type: 'string' },
        },
        required: ['fileId'],
      },
      response: {
        200: FileInfoResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const { fileId } = request.params;
    // const permissionService = new PermissionService(fastify, userId, organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, auditLogger);

    const fileInfo = await fileService.getFileInfo(fileId);

    return {
      id: fileInfo.id,
      organizationId: fileInfo.organizationId,
      fileType: fileInfo.fileType,
      mimeType: fileInfo.mimeType,
      size: fileInfo.size,
      description: fileInfo.description,
      createdAt: fileInfo.createdAt.toISOString(),
    };
  });

  // Delete file
  fastify.delete<{ Params: { fileId: string } }>('/v1/files/:fileId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          fileId: { type: 'string' },
        },
        required: ['fileId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const { fileId } = request.params;
    // const permissionService = new PermissionService(fastify, userId, organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, auditLogger);

    await fileService.deleteFile(fileId);

    return {
      message: 'File deleted successfully',
    };
  });

  // Cleanup expired files
  fastify.post('/v1/files/cleanup', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            deletedCount: { type: 'number' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    // const permissionService = new PermissionService(fastify, userId, organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, auditLogger);

    const deletedCount = await fileService.cleanupExpiredFiles();

    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} expired files`,
    };
  });
}
