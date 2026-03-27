import { baseConfig } from './wdio.base.conf';
import type { Options } from '@wdio/types';
import { ENV, validateEnv } from '../src/utils/envConfig';
import type { TestMuCapabilities } from '../src/types';

validateEnv(['TESTMU_USERNAME', 'TESTMU_ACCESS_KEY', 'TESTMU_APP_URL_ANDROID']);

const buildName = `${ENV.BUILD_NAME} — Android #${ENV.BUILD_NUMBER}`;

const androidCapabilities: TestMuCapabilities = {
  platformName: 'Android',
  'lt:options': {
    username: ENV.TESTMU_USERNAME,
    accessKey: ENV.TESTMU_ACCESS_KEY,
    deviceName: ENV.TESTMU_ANDROID_DEVICE,
    platformVersion: ENV.TESTMU_ANDROID_VERSION,
    automationName: 'UIAutomator2',
    app: ENV.TESTMU_APP_URL_ANDROID,
    build: buildName,
    name: ENV.SUITE_NAME,
    isRealMobile: true,
    network: true,
    video: true,
    visual: true,
    console: true,
    devicelog: true,
    autoGrantPermissions: true,
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
    './tests/specs/android/**/*.spec.ts',
    './tests/specs/shared/**/*.spec.ts',
  ],

  // ── Capabilities ──────────────────────────────────────────────────────────
  capabilities: [androidCapabilities as object],

  // ── No local Appium service needed ─────────────────────────────────────────
  services: [],

  // ── Allow parallel devices on TestMu ──────────────────────────────────────
  maxInstances: 2,

  // ── Env Tag ───────────────────────────────────────────────────────────────
  onPrepare(): void {
    process.env.PLATFORM = 'android';
    process.env.TEST_TARGET = 'testmu';
    console.log(`☁  TestMu Android — Device: ${ENV.TESTMU_ANDROID_DEVICE} (${ENV.TESTMU_ANDROID_VERSION})`);
    console.log(`📦 App URL: ${ENV.TESTMU_APP_URL_ANDROID}`);
    console.log(`🔨 Build: ${buildName}`);
  },
} as Options.Testrunner;
