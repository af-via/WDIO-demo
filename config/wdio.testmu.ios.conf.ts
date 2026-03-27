import { baseConfig } from './wdio.base.conf';
import type { Options } from '@wdio/types';
import { ENV, validateEnv } from '../src/utils/envConfig';
import type { TestMuCapabilities } from '../src/types';

validateEnv(['TESTMU_USERNAME', 'TESTMU_ACCESS_KEY', 'TESTMU_APP_URL_IOS']);

const buildName = `${ENV.BUILD_NAME} — iOS #${ENV.BUILD_NUMBER}`;

const iosCapabilities: TestMuCapabilities = {
  platformName: 'iOS',
  'lt:options': {
    username: ENV.TESTMU_USERNAME,
    accessKey: ENV.TESTMU_ACCESS_KEY,
    deviceName: ENV.TESTMU_IOS_DEVICE,
    platformVersion: ENV.TESTMU_IOS_VERSION,
    automationName: 'XCUITest',
    app: ENV.TESTMU_APP_URL_IOS,
    build: buildName,
    name: ENV.SUITE_NAME,
    isRealMobile: true,
    network: true,
    video: true,
    visual: true,
    console: true,
    devicelog: true,
    autoAcceptAlerts: true,
    newCommandTimeout: 90,
    idleTimeout: 150,
  },
};

export const config = {
  ...baseConfig,

  // ── Hub Connection ─────────────────────────────────────────────────────────
  hostname: ENV.TESTMU_HUB,
  port: 443,
  path: '/wd/hub',
  protocol: 'https',

  // ── Specs ──────────────────────────────────────────────────────────────────
  specs: [
    './tests/specs/ios/**/*.spec.ts',
    './tests/specs/shared/**/*.spec.ts',
  ],

  // ── Capabilities ──────────────────────────────────────────────────────────
  capabilities: [iosCapabilities as object],

  // ── No local Appium service needed ─────────────────────────────────────────
  services: [],

  // ── Allow parallel devices on TestMu ──────────────────────────────────────
  maxInstances: 2,

  // ── Env Tag ───────────────────────────────────────────────────────────────
  onPrepare(): void {
    process.env.PLATFORM = 'ios';
    process.env.TEST_TARGET = 'testmu';
    console.log(`☁  TestMu iOS — Device: ${ENV.TESTMU_IOS_DEVICE} (${ENV.TESTMU_IOS_VERSION})`);
    console.log(`📦 App URL: ${ENV.TESTMU_APP_URL_IOS}`);
    console.log(`🔨 Build: ${buildName}`);
  },
} as Options.Testrunner;
