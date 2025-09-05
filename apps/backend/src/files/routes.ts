/**
 * File routes
 * API endpoints for file generation and access
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { FileService } from './service.js';
import { PermissionService } from '../modules/permissions/service.js';
import { AuditLogger } from '../modules/audit/logger.js';
import { FILE_ERRORS } from './constants.js';

// Request schemas
const GenerateFileRequestSchema = z.object({
  fileType: z.enum(['exports', 'pdfs', 'templates', 'assets']),
  mimeType: z.string(),
  content: z.string(),
  description: z.string().min(1).max(255),
});

const GetSignedUrlRequestSchema = z.object({
  fileId: z.string().uuid(),
  fileType: z.enum(['exports', 'pdfs', 'templates', 'assets']).optional(),
});

// Response schemas
const FileInfoResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  fileType: z.string(),
  mimeType: z.string(),
  size: z.number(),
  description: z.string(),
  createdAt: z.string(),
});

const SignedUrlResponseSchema = z.object({
  fileId: z.string(),
  signedUrl: z.string(),
  expiresIn: z.string(),
});

/**
 * Register file routes
 */
export async function registerFileRoutes(fastify: FastifyInstance): Promise<void> {
  // Generate file
  fastify.post<{ Body: any }>('/v1/files/generate', {
    schema: {
      tags: ['Files'],
      summary: 'Generate a file',
      description: 'Generate a file and store it in the file storage system',
      body: GenerateFileRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            fileId: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, permissionService, auditLogger);

    const fileId = await fileService.generateFile({
      organizationId,
      ...request.body,
    });

    return {
      fileId,
      message: 'File generated successfully',
    };
  });

  // Get signed URL
  fastify.post<{ Body: any }>('/v1/files/signed-url', {
    schema: {
      tags: ['Files'],
      summary: 'Get signed URL for file access',
      description: 'Generate a signed URL for secure file access',
      body: GetSignedUrlRequestSchema,
      response: {
        200: SignedUrlResponseSchema,
      },
    },
    preHandler: fastify.authenticate,
  }, async (request, _reply) => {
    const { organizationId, userId } = request.user as any;
    const { fileId, fileType } = request.body;
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, permissionService, auditLogger);

    const signedUrl = await fileService.getSignedUrl(fileId, fileType);

    return {
      fileId,
      signedUrl,
      expiresIn: fileType === 'pdfs' ? '1h' : '15m',
    };
  });

  // Download file
  fastify.get<{ Params: { fileId: string }; Querystring: { token: string } }>('/v1/files/:fileId/download', {
    schema: {
      tags: ['Files'],
      summary: 'Download a file',
      description: 'Download a file using a signed token',
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
      tags: ['Files'],
      summary: 'Get file information',
      description: 'Get information about a file',
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
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, permissionService, auditLogger);

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
      tags: ['Files'],
      summary: 'Delete a file',
      description: 'Delete a file from storage',
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
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, permissionService, auditLogger);

    await fileService.deleteFile(fileId);

    return {
      message: 'File deleted successfully',
    };
  });

  // Cleanup expired files
  fastify.post('/v1/files/cleanup', {
    schema: {
      tags: ['Files'],
      summary: 'Clean up expired files',
      description: 'Remove expired files from storage',
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
    const permissionService = new PermissionService(organizationId);
    const auditLogger = new AuditLogger(fastify, organizationId, userId);

    const fileService = new FileService(organizationId, userId, permissionService, auditLogger);

    const deletedCount = await fileService.cleanupExpiredFiles();

    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} expired files`,
    };
  });
}
