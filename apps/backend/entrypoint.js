#!/usr/bin/env node

/**
 * Production entrypoint for Pivotal Flow Backend
 * Waits for dependencies and starts the application
 */

import { execSync } from 'child_process';
import { setTimeout } from 'timers/promises';

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'postgres';
const POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
const POSTGRES_USER = process.env.POSTGRES_USER || 'pivotal';
const POSTGRES_DB = process.env.POSTGRES_DB || 'pivotal';
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

async function waitForPostgreSQL() {
  console.log('Waiting for PostgreSQL...');
  
  while (true) {
    try {
      execSync(`pg_isready -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -d ${POSTGRES_DB}`, { 
        stdio: 'pipe' 
      });
      console.log('PostgreSQL is ready!');
      break;
    } catch (error) {
      console.log('PostgreSQL is unavailable - sleeping');
      await setTimeout(2000);
    }
  }
}

async function waitForRedis() {
  console.log('Waiting for Redis...');
  
  while (true) {
    try {
      execSync(`redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} ping`, { 
        stdio: 'pipe' 
      });
      console.log('Redis is ready!');
      break;
    } catch (error) {
      console.log('Redis is unavailable - sleeping');
      await setTimeout(2000);
    }
  }
}

async function runMigrations() {
  if (process.env.MIGRATE_ON_START === 'true') {
    console.log('Running database migrations...');
    try {
      execSync('pnpm db:migrate:ci', { stdio: 'inherit' });
      console.log('Database migrations completed!');
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}

async function startApplication() {
  console.log('Starting Pivotal Flow Backend...');
  
  // Import and start the application
  const { default: app } = await import('./dist/index.js');
}

async function main() {
  try {
    await waitForPostgreSQL();
    await waitForRedis();
    await runMigrations();
    await startApplication();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

main();
