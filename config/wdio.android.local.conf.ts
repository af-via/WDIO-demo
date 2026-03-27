import { baseConfig } from './wdio.base.conf';
import type { Options } from '@wdio/types';
import * as path from 'path';
import { ENV } from '../src/utils/envConfig';
import type { AndroidLocalCapabilities } from '../src/types';

const appPath = path.resolve(process.cwd(), ENV.APP_PATH_ANDROID);

const androidCapabilities: AndroidLocalCapabilities = {
  platformName: 'Android',
  'appium:deviceName': ENV.ANDROID_DEVICE_NAME,
  'appium:platformVersion': ENV.ANDROID_PLATFORM_VERSION,
  'appium:automationName': 'UIAutomator2',
  'appium:app': appPath,
  ...(ENV.ANDROID_APP_PACKAGE && { 'appium:appPackage': ENV.ANDROID_APP_PACKAGE }),
  ...(ENV.ANDROID_APP_ACTIVITY && { 'appium:appActivity': ENV.ANDROID_APP_ACTIVITY }),
  'appium:newCommandTimeout': 90,
  'appium:autoGrantPermissions': true,
  'appium:noReset': false,
};

export const config = {
  ...baseConfig,

  // ── Specs (Android-specific tests + shared cross-platform tests) ───────────
  specs: [
    './tests/specs/android/**/*.spec.ts',
    './tests/specs/shared/**/*.spec.ts',
  ],

  // ── Capabilities ──────────────────────────────────────────────────────────
  capabilities: [androidCapabilities as object],

  // ── Appium Local Service ───────────────────────────────────────────────────
  services: [
    [
      'appium',
      {
        args: {
          relaxedSecurity: true,
          log: path.resolve(process.cwd(), 'logs/appium.log'),
        },
        logLevel: 'info',
      },
    ],
  ],

  // ── Parallel Instances ─────────────────────────────────────────────────────
  maxInstances: 1,

  // ── Env Tag ───────────────────────────────────────────────────────────────
  onPrepare(): void {
    process.env.PLATFORM = 'android';
    process.env.TEST_TARGET = 'local';
    console.log(`📱 Android Local — Device: ${ENV.ANDROID_DEVICE_NAME} (API ${ENV.ANDROID_PLATFORM_VERSION})`);
    console.log(`📦 App: ${appPath}`);
  },
} as Options.Testrunner;
