#!/usr/bin/env node
"use strict";
/**
 * QA Script: Forbid Prisma
 *
 * This script checks for any Prisma imports or references in the codebase
 * and fails CI if any are found. This ensures we stay aligned with Drizzle only.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
class PrismaForbiddenChecker {
    violations = [];
    rootDir = process.cwd();
    /**
     * Check for Prisma violations in the codebase
     */
    async checkForViolations() {
        console.log('🔍 Checking for Prisma violations...');
        // Check TypeScript/JavaScript files
        await this.checkSourceFiles();
        // Check package.json files
        await this.checkPackageFiles();
        // Check documentation files
        await this.checkDocumentationFiles();
        if (this.violations.length > 0) {
            this.reportViolations();
            process.exit(1);
        }
        else {
            console.log('✅ No Prisma violations found!');
        }
    }
    /**
     * Check source files for Prisma imports and usage
     */
    async checkSourceFiles() {
        const patterns = [
            'apps/**/*.{ts,tsx,js,jsx}',
            'packages/**/*.{ts,tsx,js,jsx}',
            'scripts/**/*.{ts,tsx,js,jsx}',
        ];
        for (const pattern of patterns) {
            try {
                const files = execSync(`find . -path "./node_modules" -prune -o -path "./.git" -prune -o -name "${pattern}" -print`, { encoding: 'utf8' })
                    .split('\n')
                    .filter(Boolean);
                for (const file of files) {
                    await this.checkFile(file);
                }
            }
            catch (error) {
                // Ignore find errors
            }
        }
    }
    /**
     * Check package.json files for Prisma dependencies
     */
    async checkPackageFiles() {
        const packageFiles = [
            'package.json',
            'apps/backend/package.json',
            'apps/frontend/package.json',
            'packages/shared/package.json',
            'packages/sdk/package.json',
        ];
        for (const packageFile of packageFiles) {
            const filePath = join(this.rootDir, packageFile);
            if (existsSync(filePath)) {
                await this.checkPackageFile(filePath);
            }
        }
    }
    /**
     * Check documentation files for Prisma references
     */
    async checkDocumentationFiles() {
        const docPatterns = [
            'docs/**/*.md',
            '*.md',
            'plans/**/*.md',
            'sources/**/*.md',
        ];
        for (const pattern of docPatterns) {
            try {
                const files = execSync(`find . -path "./node_modules" -prune -o -path "./.git" -prune -o -name "${pattern}" -print`, { encoding: 'utf8' })
                    .split('\n')
                    .filter(Boolean);
                for (const file of files) {
                    await this.checkDocumentationFile(file);
                }
            }
            catch (error) {
                // Ignore find errors
            }
        }
    }
    /**
     * Check a single file for Prisma violations
     */
    async checkFile(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                // Check for Prisma imports
                if (line.includes('@prisma/client') || line.includes('prisma')) {
                    if (line.includes('import') || line.includes('require')) {
                        this.violations.push({
                            file: filePath,
                            line: lineNumber,
                            content: line.trim(),
                            type: 'import'
                        });
                    }
                    else if (line.includes('PrismaClient') || line.includes('prisma.')) {
                        this.violations.push({
                            file: filePath,
                            line: lineNumber,
                            content: line.trim(),
                            type: 'usage'
                        });
                    }
                }
            }
        }
        catch (error) {
            // Ignore file read errors
        }
    }
    /**
     * Check package.json file for Prisma dependencies
     */
    async checkPackageFile(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                if (line.includes('"@prisma/client"') || line.includes('"prisma"')) {
                    this.violations.push({
                        file: filePath,
                        line: lineNumber,
                        content: line.trim(),
                        type: 'reference'
                    });
                }
            }
        }
        catch (error) {
            // Ignore file read errors
        }
    }
    /**
     * Check documentation file for Prisma references
     */
    async checkDocumentationFile(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                // Check for Prisma references in documentation
                if (line.toLowerCase().includes('prisma') &&
                    !line.includes('drizzle') &&
                    !line.includes('migration') &&
                    !line.includes('CF0') &&
                    !line.includes('ORM alignment')) {
                    this.violations.push({
                        file: filePath,
                        line: lineNumber,
                        content: line.trim(),
                        type: 'reference'
                    });
                }
            }
        }
        catch (error) {
            // Ignore file read errors
        }
    }
    /**
     * Report violations and exit with error
     */
    reportViolations() {
        console.error('\n❌ Prisma violations found!');
        console.error('This project uses Drizzle ORM only. Please remove all Prisma references.\n');
        const violationsByType = {
            import: this.violations.filter(v => v.type === 'import'),
            usage: this.violations.filter(v => v.type === 'usage'),
            reference: this.violations.filter(v => v.type === 'reference'),
        };
        if (violationsByType.import.length > 0) {
            console.error('📦 Prisma Imports:');
            violationsByType.import.forEach(v => {
                console.error(`  ${v.file}:${v.line} - ${v.content}`);
            });
            console.error('');
        }
        if (violationsByType.usage.length > 0) {
            console.error('🔧 Prisma Usage:');
            violationsByType.usage.forEach(v => {
                console.error(`  ${v.file}:${v.line} - ${v.content}`);
            });
            console.error('');
        }
        if (violationsByType.reference.length > 0) {
            console.error('📚 Documentation References:');
            violationsByType.reference.forEach(v => {
                console.error(`  ${v.file}:${v.line} - ${v.content}`);
            });
            console.error('');
        }
        console.error('💡 To fix these violations:');
        console.error('  1. Replace Prisma imports with Drizzle imports');
        console.error('  2. Update database queries to use Drizzle syntax');
        console.error('  3. Remove Prisma dependencies from package.json');
        console.error('  4. Update documentation to reference Drizzle only');
        console.error('  5. Use the repository layer pattern for data access\n');
        console.error(`Total violations: ${this.violations.length}`);
    }
}
// Run the check
async function main() {
    const checker = new PrismaForbiddenChecker();
    await checker.checkForViolations();
}
main().catch((error) => {
    console.error('Error running Prisma forbidden check:', error);
    process.exit(1);
});
//# sourceMappingURL=forbid_prisma.js.map