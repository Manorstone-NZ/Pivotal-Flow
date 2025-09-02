#!/usr/bin/env node

/**
 * CI Check: Prevent JSONB usage for core quote fields
 * 
 * This script scans the codebase to ensure that core quote fields
 * (monetary, status, dates) are not being filtered via JSONB metadata.
 * 
 * Usage: node scripts/ci/check-jsonb-usage.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Core fields that should never be in JSONB metadata
const CORE_FIELDS = [
  'status',
  'total_amount',
  'subtotal',
  'tax_amount',
  'discount_amount',
  'currency',
  'exchange_rate',
  'tax_rate',
  'discount_value',
  'valid_from',
  'valid_until',
  'created_at',
  'updated_at',
  'approved_at',
  'sent_at',
  'accepted_at',
  'expires_at',
  'quote_number',
  'customer_id',
  'project_id',
  'created_by',
  'approved_by'
];

// Patterns that indicate JSONB filtering on core fields
const JSONB_PATTERNS = [
  // Drizzle JSONB operators
  /metadata\s*->\s*['"`](\w+)['"`]/g,
  /metadata\s*->>\s*['"`](\w+)['"`]/g,
  /metadata\s*@>\s*\{/g,
  /metadata\s*\?\s*['"`](\w+)['"`]/g,
  /metadata\s*\?\&\s*\[/g,
  /metadata\s*\?\|\s*\[/g,
  
  // JavaScript/TypeScript patterns
  /metadata\[['"`](\w+)['"`]\]/g,
  /metadata\.(\w+)/g,
  /metadata\s*\[\s*['"`](\w+)['"`]\s*\]/g,
  
  // Filter patterns
  /filters\s*\[\s*['"`](\w+)['"`]\s*\]/g,
  /where\s*\(\s*metadata/g,
  /\.where\s*\(\s*.*metadata/g
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.sql'];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '.next',
  'out'
];

class JSONBCheck {
  constructor() {
    this.violations = [];
    this.scannedFiles = 0;
  }

  /**
   * Scan a directory recursively for files
   */
  scanDirectory(dir) {
    const files = [];
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!EXCLUDE_DIRS.includes(item)) {
            files.push(...this.scanDirectory(fullPath));
          }
        } else if (stat.isFile() && SCAN_EXTENSIONS.includes(extname(item))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * Check a single file for JSONB violations
   */
  checkFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        
        for (const pattern of JSONB_PATTERNS) {
          let match;
          pattern.lastIndex = 0; // Reset regex state
          
          while ((match = pattern.exec(line)) !== null) {
            const matchedField = match[1];
            
            // Check if the matched field is a core field
            if (matchedField && CORE_FIELDS.includes(matchedField)) {
              this.violations.push({
                file: filePath,
                line: lineNum + 1,
                column: match.index + 1,
                pattern: pattern.source,
                matchedField
              });
            }
          }
        }
      }
      
      this.scannedFiles++;
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}:`, error);
    }
  }

  /**
   * Run the JSONB usage check
   */
  run(projectRoot) {
    console.log('🔍 Scanning for JSONB usage on core quote fields...');
    
    const files = this.scanDirectory(projectRoot);
    console.log(`📁 Found ${files.length} files to scan`);
    
    for (const file of files) {
      this.checkFile(file);
    }
    
    console.log(`✅ Scanned ${this.scannedFiles} files`);
    
    if (this.violations.length === 0) {
      console.log('🎉 No JSONB violations found!');
      return true;
    }
    
    console.log(`❌ Found ${this.violations.length} JSONB violations:`);
    console.log('');
    
    for (const violation of this.violations) {
      console.log(`   📄 ${violation.file}:${violation.line}:${violation.column}`);
      console.log(`      Field: ${violation.matchedField}`);
      console.log(`      Pattern: ${violation.pattern}`);
      console.log('');
    }
    
    console.log('💡 Core quote fields should use typed columns, not JSONB metadata.');
    console.log('💡 Use the repository layer filter builder for proper field access.');
    
    return false;
  }

  /**
   * Get violations for testing
   */
  getViolations() {
    return this.violations;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectRoot = process.argv[2] || process.cwd();
  const checker = new JSONBCheck();
  const success = checker.run(projectRoot);
  
  if (!success) {
    process.exit(1);
  }
}

export { JSONBCheck, CORE_FIELDS, JSONB_PATTERNS };
