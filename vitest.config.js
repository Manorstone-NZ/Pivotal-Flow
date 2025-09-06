"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        include: ["**/*.test.ts", "**/tests/unit/**/*.test.ts", "**/tests/integration/**/*.test.ts"],
        exclude: ["**/e2e/**", "node_modules", "dist"],
        globals: true,
        environment: "node",
        reporters: ["default"],
        pool: "threads",
        coverage: {
            reporter: ["text", "lcov"],
            reportsDirectory: "coverage/unit"
        }
    }
});
//# sourceMappingURL=vitest.config.js.map