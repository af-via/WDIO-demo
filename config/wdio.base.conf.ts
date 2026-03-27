import type { Options } from '@wdio/types';
import { ENV } from '../src/utils/envConfig';

export const baseConfig: Partial<Options.Testrunner> = {
  runner: 'local',

  // ── Test Files ─────────────────────────────────────────────────────────────
  specs: ['./tests/specs/**/*.spec.ts'],
  exclude: [],

  // ── Concurrency ────────────────────────────────────────────────────────────
  maxInstances: 1,

  // ── Framework ─────────────────────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: 1,
  },

  // ── Reporters ─────────────────────────────────────────────────────────────
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: false,
        addConsoleLogs: true,
      },
    ],
  ],

  // ── Hooks ──────────────────────────────────────────────────────────────────
  onPrepare(_config, _capabilities): void {
    console.log(`\n🚀 Test Run Starting — Target: ${ENV.TARGET} | Platform: ${ENV.PLATFORM}\n`);
  },

  beforeSession(_config, _capabilities, _specs): void {
    // Per-session setup (runs before each worker process)
  },

  before(_capabilities, _specs): void {
    // Runs once per driver session before tests start
  },

  beforeTest(test): void {
    const allure = (global as unknown as { allure?: { startStep: (n: string) => void } }).allure;
    if (allure) {
      console.log(`\n▶ Starting: ${test.fullTitle}`);
    }
  },

  afterTest(test, _context, { error, duration, passed }): void {
    if (!passed) {
      console.error(`✖ FAILED: ${test.fullTitle} (${duration}ms)`);
      if (error?.message) console.error(`  Error: ${error.message}`);
      // Capture screenshot on failure
      try {
        const screenshotPath = `./allure-results/screenshots/${Date.now()}_${test.title.replace(/\s+/g, '_')}.png`;
        void browser.saveScreenshot(screenshotPath);
      } catch {
        // Screenshot capture failed (e.g. session already closed)
      }
    } else {
      console.log(`✔ PASSED: ${test.fullTitle} (${duration}ms)`);
    }
  },

  onComplete(_exitCode, _config, _capabilities, results): void {
    console.log(`\n📊 Tests complete — Passed: ${results.passed} | Failed: ${results.failed}\n`);
  },

  // ── Timeouts ───────────────────────────────────────────────────────────────
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
};
