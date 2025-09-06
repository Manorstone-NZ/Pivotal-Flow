import type { FastifyInstance } from 'fastify';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { payloadGuardPlugin } from './payloadGuard.js';

describe('Payload Guard Plugin', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = {
      addHook: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn()
    } as any;
  });

  it('should register the plugin without errors', async () => {
    const done = vi.fn();
    await payloadGuardPlugin(app, {}, done);
    expect(done).toHaveBeenCalled();
  });

  it('should add preHandler hook', async () => {
    const done = vi.fn();
    await payloadGuardPlugin(app, {}, done);
    expect(app.addHook).toHaveBeenCalledWith('preHandler', expect.any(Function));
  });
});
