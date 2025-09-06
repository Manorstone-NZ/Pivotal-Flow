import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "tests/e2e",
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
  },
  workers: 2
})
