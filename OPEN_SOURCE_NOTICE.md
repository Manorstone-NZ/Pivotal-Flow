OPEN SOURCE DEPENDENCIES NOTICE

This document lists all open source components and dependencies used in the Pivotal Flow application.

MANORSTONE LIMITED SOFTWARE LICENSE AGREEMENT
Copyright (c) 2024 Manorstone Limited. All rights reserved.

The proprietary portions of this Software are protected by the Manorstone Limited Software License Agreement.
The following open source components are used in accordance with their respective licenses:

CORE FRAMEWORKS AND RUNTIME
===========================

Node.js
- License: MIT License
- Version: 20.x
- URL: https://nodejs.org/
- Usage: JavaScript runtime environment

TypeScript
- License: Apache License 2.0
- Version: 5.x
- URL: https://www.typescriptlang.org/
- Usage: TypeScript compiler and language

WEB FRAMEWORK
=============

Fastify
- License: MIT License
- Version: 4.x
- URL: https://fastify.dev/
- Usage: Web framework for Node.js

@fastify/cors
- License: MIT License
- Version: 8.x
- URL: https://github.com/fastify/fastify-cors
- Usage: CORS support for Fastify

@fastify/helmet
- License: MIT License
- Version: 11.x
- URL: https://github.com/fastify/fastify-helmet
- Usage: Security headers for Fastify

@fastify/rate-limit
- License: MIT License
- Version: 9.x
- URL: https://github.com/fastify/fastify-rate-limit
- Usage: Rate limiting for Fastify

@fastify/jwt
- License: MIT License
- Version: 8.x
- URL: https://github.com/fastify/fastify-jwt
- Usage: JWT authentication for Fastify

@fastify/cookie
- License: MIT License
- Version: 9.x
- URL: https://github.com/fastify/fastify-cookie
- Usage: Cookie support for Fastify

DATABASE AND ORM
================

Drizzle ORM
- License: MIT License
- Version: 0.29.x
- URL: https://orm.drizzle.team/
- Usage: TypeScript ORM for database operations

postgres
- License: MIT License
- Version: 3.x
- URL: https://github.com/porsager/postgres
- Usage: PostgreSQL client for Node.js

CACHE AND STORAGE
=================

Redis
- License: BSD License
- Version: 5.x
- URL: https://redis.io/
- Usage: In-memory data structure store

redis (Node.js client)
- License: MIT License
- Version: 4.x
- URL: https://github.com/redis/node-redis
- Usage: Redis client for Node.js

AUTHENTICATION AND SECURITY
==========================

bcryptjs
- License: MIT License
- Version: 2.x
- URL: https://github.com/dcodeIO/bcrypt.js/
- Usage: Password hashing

jsonwebtoken
- License: MIT License
- Version: 9.x
- URL: https://github.com/auth0/node-jsonwebtoken
- Usage: JWT token generation and verification

UTILITIES AND TOOLS
==================

dotenv
- License: MIT License
- Version: 16.x
- URL: https://github.com/motdotla/dotenv
- Usage: Environment variable management

zod
- License: MIT License
- Version: 3.x
- URL: https://zod.dev/
- Usage: TypeScript-first schema validation

decimal.js
- License: MIT License
- Version: 10.x
- URL: https://mikemcl.github.io/decimal.js/
- Usage: Decimal arithmetic for financial calculations

MONITORING AND METRICS
======================

prom-client
- License: Apache License 2.0
- Version: 15.x
- URL: https://github.com/siimon/prom-client
- Usage: Prometheus metrics collection

DEVELOPMENT TOOLS
=================

ESLint
- License: MIT License
- Version: 8.x
- URL: https://eslint.org/
- Usage: JavaScript/TypeScript linting

@typescript-eslint/eslint-plugin
- License: MIT License
- Version: 6.x
- URL: https://github.com/typescript-eslint/typescript-eslint
- Usage: TypeScript-specific ESLint rules

@typescript-eslint/parser
- License: MIT License
- Version: 6.x
- URL: https://github.com/typescript-eslint/typescript-eslint
- Usage: TypeScript parser for ESLint

Vitest
- License: MIT License
- Version: 1.x
- URL: https://vitest.dev/
- Usage: Unit testing framework

@vitest/coverage-v8
- License: MIT License
- Version: 1.x
- URL: https://vitest.dev/
- Usage: Code coverage for Vitest

BUILD TOOLS
===========

Vite
- License: MIT License
- Version: 5.x
- URL: https://vitejs.dev/
- Usage: Build tool and development server

pnpm
- License: MIT License
- Version: 8.x
- URL: https://pnpm.io/
- Usage: Package manager

DOCKER AND INFRASTRUCTURE
=========================

PostgreSQL (Docker Image)
- License: PostgreSQL License
- Version: 16
- URL: https://www.postgresql.org/
- Usage: Database server

Redis (Docker Image)
- License: BSD License
- Version: 7
- URL: https://redis.io/
- Usage: Cache server

Prometheus (Docker Image)
- License: Apache License 2.0
- Version: Latest
- URL: https://prometheus.io/
- Usage: Metrics collection and monitoring

Grafana (Docker Image)
- License: Apache License 2.0
- Version: Latest
- URL: https://grafana.com/
- Usage: Metrics visualization and dashboards

TESTING TOOLS
=============

Playwright
- License: Apache License 2.0
- Version: 1.x
- URL: https://playwright.dev/
- Usage: End-to-end testing

DOCUMENTATION
=============

OpenAPI/Swagger
- License: Apache License 2.0
- URL: https://swagger.io/
- Usage: API documentation generation

---

IMPORTANT NOTICES:

1. OPEN SOURCE COMPLIANCE
   - All open source components are used in accordance with their respective licenses
   - The restrictions in the Pivotal Flow Software License Agreement apply only to the proprietary portions
   - You retain all rights granted by the open source licenses for the respective components

2. LICENSE COMPATIBILITY
   - All included open source components have permissive licenses (MIT, Apache 2.0, BSD)
   - These licenses are compatible with the proprietary license of the main application
   - No copyleft licenses are used that would require source code disclosure

3. ATTRIBUTION REQUIREMENTS
   - You must maintain all copyright notices and license texts for open source components
   - You may not remove or alter attribution notices for open source components
   - The original license texts for each component should be preserved

4. UPDATES AND MODIFICATIONS
   - This list may be updated as dependencies are added or removed
   - Check package.json files for the most current list of dependencies
   - Version numbers may change with updates

For questions about open source compliance or licensing, please contact:
Manorstone Limited
Email: legal@manorstone.co.nz
