import { defineConfig, devices } from '@playwright/test';

// Tests de bout en bout contre la stack `docker compose up` (ADR 0007).
// APP_PORT est la même variable que dans compose.yaml.
export default defineConfig({
  testDir: './e2e',
  // Un test arrête l'API data : rien ne doit tourner en parallèle
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${process.env.APP_PORT ?? '3000'}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
});
