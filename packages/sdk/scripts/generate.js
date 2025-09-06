#!/usr/bin/env tsx
/**
 * SDK Generation Script for D4 Contract Stability
 * Generates TypeScript types from OpenAPI specification
 */
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Configuration
const API_URL = process.env['API_URL'] || 'http://localhost:3000/api/openapi.json';
const OUTPUT_DIR = join(__dirname, '..', 'src', 'gen');
const TYPES_FILE = join(OUTPUT_DIR, 'types.ts');
async function generateSDK() {
    try {
        console.log('🔄 Fetching OpenAPI spec from', API_URL);
        // Ensure output directory exists
        mkdirSync(OUTPUT_DIR, { recursive: true });
        // Use openapi-typescript CLI to generate types
        const command = `npx openapi-typescript "${API_URL}" --output "${TYPES_FILE}"`;
        console.log('Running:', command);
        execSync(command, {
            stdio: 'inherit',
            cwd: join(__dirname, '..')
        });
        console.log('✅ Generated types to', TYPES_FILE);
        console.log('📊 Generated types include:');
        console.log('   - API endpoint types');
        console.log('   - Request/response schemas');
        console.log('   - Component schemas');
        console.log('   - Error response types');
    }
    catch (error) {
        console.error('❌ Failed to generate SDK types:', error);
        if (error instanceof Error) {
            if (error.message.includes('fetch')) {
                console.error('💡 Make sure the backend server is running on', API_URL);
                console.error('💡 You can also set API_URL environment variable to point to a different URL');
            }
        }
        process.exit(1);
    }
}
// Run generation
generateSDK();
//# sourceMappingURL=generate.js.map