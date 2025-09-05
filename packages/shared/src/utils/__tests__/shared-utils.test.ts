/**
 * Unit tests for shared utilities
 */

import { describe, it, expect } from 'vitest';
import { 
  generateId, 
  generateIdWithPrefix, 
  generateShortId,
  generateRequestId,
  generateSessionId,
  generateJobId,
  generateFileId,
  isValidUuid,
  generateHash,
  startTimer,
  endTimer,
  timeFunction,
  timeAsyncFunction,
  createTimer,
  formatDuration,
  getCurrentTimestamp,
  getCurrentTimestampISO
} from '@pivotal-flow/shared';

describe('Shared ID Utilities', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(isValidUuid(id1)).toBe(true);
    expect(isValidUuid(id2)).toBe(true);
  });

  it('should generate IDs with prefixes', () => {
    const id = generateIdWithPrefix('test');
    expect(id).toMatch(/^test_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should generate short IDs', () => {
    const id = generateShortId();
    expect(id).toMatch(/^[0-9a-f]{8}$/i);
  });

  it('should generate specific ID types', () => {
    expect(generateRequestId()).toMatch(/^req_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(generateSessionId()).toMatch(/^sess_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(generateJobId()).toMatch(/^job_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(generateFileId()).toMatch(/^file_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should validate UUIDs correctly', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('invalid-uuid')).toBe(false);
    expect(isValidUuid('')).toBe(false);
  });

  it('should generate hashes', () => {
    const hash1 = generateHash('test');
    const hash2 = generateHash('test');
    const hash3 = generateHash('different');
    
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/i);
  });
});

describe('Shared Time Utilities', () => {
  it('should create and use timers', () => {
    const timer = startTimer('test');
    const duration = endTimer(timer);
    
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100); // Should be very fast
  });

  it('should time synchronous functions', () => {
    const result = timeFunction('test', () => {
      return 'test result';
    });
    
    expect(result).toBe('test result');
  });

  it('should time asynchronous functions', async () => {
    const result = await timeAsyncFunction('test', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'async result';
    });
    
    expect(result).toBe('async result');
  });

  it('should create simple timers', () => {
    const endTimer = createTimer('test');
    const duration = endTimer();
    
    expect(duration).toBeGreaterThan(0);
  });

  it('should format durations correctly', () => {
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(1500)).toBe('1.50s');
    expect(formatDuration(65000)).toBe('1m 5.00s');
  });

  it('should get current timestamps', () => {
    const timestamp = getCurrentTimestamp();
    const iso = getCurrentTimestampISO();
    
    expect(timestamp).toBeGreaterThan(0);
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
