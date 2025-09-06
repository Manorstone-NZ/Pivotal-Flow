"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: "tests/e2e",
    reporter: [["list"]],
    use: {
        baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
        trace: "on-first-retry",
    },
    workers: 2
});
//# sourceMappingURL=playwright.config.js.map