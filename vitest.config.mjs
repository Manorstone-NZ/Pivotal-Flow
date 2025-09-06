import { defineConfig } from "vitest/config";
export default defineConfig({
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
//# sourceMappingURL=vitest.config.mjs.map