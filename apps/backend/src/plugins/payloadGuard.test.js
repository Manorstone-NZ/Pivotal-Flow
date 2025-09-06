import { describe, it, expect, beforeEach, vi } from 'vitest';
import { payloadGuardPlugin } from './payloadGuard.js';
describe('Payload Guard Plugin', () => {
    let app;
    beforeEach(async () => {
        app = {
            addHook: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
            put: vi.fn()
        };
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
//# sourceMappingURL=payloadGuard.test.js.map