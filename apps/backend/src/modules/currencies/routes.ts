import type { FastifyInstance } from 'fastify';
import { CurrencyService } from './service.js';

/**
 * Currency routes for ISO 4217 currency code management
 */
export async function currencyRoutes(fastify: FastifyInstance) {
  // Get all active currencies
  fastify.get('/currencies', {
    schema: {
      description: 'Get all active ISO 4217 currency codes',
      tags: ['currencies'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string'},
              name: { type: 'string'},
              symbol: { type: 'string'},
              isActive: { type: 'boolean'}
            }
          }
        }
      }
    }
  }, async (_request, reply) => {
    try {
      const currencyService = new CurrencyService(fastify.db, {
        organizationId: 'system', // Currencies are system-wide
        userId: 'system'
      });

      const currencies = await currencyService.getActiveCurrencies();
      return reply.send(currencies);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error fetching currencies');
      return reply.status(500).send({ error: 'Failed to fetch currencies' });
    }
  });

  // Get popular currencies
  fastify.get('/currencies/popular', {
    schema: {
      description: 'Get commonly used currencies',
      tags: ['currencies'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string'},
              name: { type: 'string'},
              symbol: { type: 'string'},
              isActive: { type: 'boolean'}
            }
          }
        }
      }
    }
  }, async (_request, reply) => {
    try {
      const currencyService = new CurrencyService(fastify.db, {
        organizationId: 'system',
        userId: 'system'
      });

      const currencies = await currencyService.getPopularCurrencies();
      return reply.send(currencies);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error fetching popular currencies');
      return reply.status(500).send({ error: 'Failed to fetch popular currencies' });
    }
  });

  // Get currencies by region
  fastify.get('/currencies/region/:region', {
    schema: {
      description: 'Get currencies by geographic region',
      tags: ['currencies'],
      params: {
        type: 'object',
        properties: {
          region: { 
            type: 'string', 
            enum: ['europe', 'asia', 'americas', 'africa', 'middle-east', 'oceania'],

          }
        },
        required: ['region']
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string'},
              name: { type: 'string'},
              symbol: { type: 'string'},
              isActive: { type: 'boolean'}
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { region } = request.params as { region: string };
      
      const currencyService = new CurrencyService(fastify.db, {
        organizationId: 'system',
        userId: 'system'
      });

      const currencies = await currencyService.getCurrenciesByRegion(region);
      return reply.send(currencies);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error fetching currencies by region');
      return reply.status(500).send({ error: 'Failed to fetch currencies by region' });
    }
  });

  // Get currency by code
  fastify.get('/currencies/:code', {
    schema: {
      description: 'Get currency details by ISO 4217 code',
      tags: ['currencies'],
      params: {
        type: 'object',
        properties: {
          code: { 
            type: 'string', 
            pattern: '^[A-Z]{3}$',

          }
        },
        required: ['code']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string'},
            name: { type: 'string'},
            symbol: { type: 'string'},
            isActive: { type: 'boolean'}
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { code } = request.params as { code: string };
      
      const currencyService = new CurrencyService(fastify.db, {
        organizationId: 'system',
        userId: 'system'
      });

      const currency = await currencyService.getCurrencyByCode(code);
      if (!currency) {
        return reply.status(404).send({ error: 'Currency not found' });
      }

      return reply.send(currency);
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error fetching currency');
      return reply.status(500).send({ error: 'Failed to fetch currency' });
    }
  });

  // Validate currency code
  fastify.get('/currencies/:code/validate', {
    schema: {
      description: 'Validate if a currency code is valid and active',
      tags: ['currencies'],
      params: {
        type: 'object',
        properties: {
          code: { 
            type: 'string', 
            pattern: '^[A-Z]{3}$',

          }
        },
        required: ['code']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean'},
            code: { type: 'string'},
            message: { type: 'string'}
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { code } = request.params as { code: string };
      
      const currencyService = new CurrencyService(fastify.db, {
        organizationId: 'system',
        userId: 'system'
      });

      const isValid = await currencyService.isValidCurrency(code);
      
      return reply.send({
        isValid,
        code,
        message: isValid ? 'Currency code is valid' : 'Currency code is invalid or inactive'
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error validating currency');
      return reply.status(500).send({ error: 'Failed to validate currency' });
    }
  });

  // Format currency amount
  fastify.post('/currencies/format', {
    schema: {
      description: 'Format a currency amount with proper symbol and formatting',
      tags: ['currencies'],
      body: {
        type: 'object',
        properties: {
          amount: { type: 'number'},
          currencyCode: { type: 'string', pattern: '^[A-Z]{3}$'},
          locale: { type: 'string'}
        },
        required: ['amount', 'currencyCode']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            formatted: { type: 'string'},
            amount: { type: 'number'},
            currencyCode: { type: 'string'},
            symbol: { type: 'string'}
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { amount, currencyCode, locale } = request.body as {
        amount: number;
        currencyCode: string;
        locale?: string;
      };
      
      const currencyService = new CurrencyService(fastify.db, {
        organizationId: 'system',
        userId: 'system'
      });

      const formatted = await currencyService.formatCurrency(amount, currencyCode, locale);
      const currency = await currencyService.getCurrencyByCode(currencyCode);
      
      return reply.send({
        formatted,
        amount,
        currencyCode,
        symbol: currency?.symbol || currencyCode
      });
    } catch (error) {
      (fastify.log as any).error(error as Error, 'Error formatting currency');
      return reply.status(500).send({ error: 'Failed to format currency' });
    }
  });
}
