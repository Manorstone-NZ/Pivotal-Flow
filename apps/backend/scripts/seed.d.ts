#!/usr/bin/env tsx
/**
 * Basic Database Seeding Script
 *
 * This script seeds the database with minimal essential data for development and testing.
 *
 * Usage:
 *   pnpm run db:seed
 *   pnpm run db:seed -- --reset  # Reset and reseed
 */
declare function seedDatabase(): Promise<void>;
declare function resetDatabase(): Promise<void>;
export { seedDatabase, resetDatabase };
//# sourceMappingURL=seed.d.ts.map