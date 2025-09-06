import type { FastifyInstance } from 'fastify';

/**
 * OpenAPI Documentation Plugin
 * 
 * Provides Swagger UI and JSON schema generation for API documentation
 * Only enables UI when OPENAPI_ENABLE environment variable is set to 'true'
 */
export default async function openapiPlugin(fastify: FastifyInstance) {
  console.log('OpenAPI plugin starting...');
  fastify.log.info('OpenAPI plugin starting...');
  
  // Test route to verify plugin is working
  fastify.get('/test-openapi', async (_request, reply) => {
    console.log('Test route hit');
    return reply.send({ message: 'OpenAPI plugin is working!' });
  });
  
// Get server URL from environment or default to localhost
// const _serverUrl = process.env['PUBLIC_API_URL'] || 'http://localhost:3000';
  
  // Note: Using existing /api/openapi.json endpoint instead of @fastify/swagger
  // to avoid route conflicts with existing routes

  // Only register Swagger UI if explicitly enabled
  if (process.env['OPENAPI_ENABLE'] === 'true') {
    // Serve the documentation HTML page
    fastify.get('/docs', async (_request, reply) => {
      console.log('Serving /docs route');
      fastify.log.info('Serving /docs route');
      return reply.type('text/html').send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pivotal Flow API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                onComplete: function() {
                    console.log('Swagger UI loaded successfully');
                },
                onFailure: function(data) {
                    console.error('Failed to load Swagger UI:', data);
                }
            });
        };
    </script>
</body>
</html>
      `);
    });

    fastify.log.info('Swagger UI enabled at /docs');
  } else {
    fastify.log.info('Swagger UI disabled (set OPENAPI_ENABLE=true to enable)');
  }
  
  fastify.log.info('OpenAPI plugin completed');
}