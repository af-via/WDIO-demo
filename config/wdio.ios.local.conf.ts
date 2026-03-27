import { baseConfig } from './wdio.base.conf';
import type { Options } from '@wdio/types';
import * as path from 'path';
import { ENV } from '../src/utils/envConfig';
import type { IOSLocalCapabilities } from '../src/types';

const appPath = path.resolve(process.cwd(), ENV.APP_PATH_IOS);

const iosCapabilities: IOSLocalCapabilities = {
  platformName: 'iOS',
  'appium:deviceName': ENV.IOS_DEVICE_NAME,
  'appium:platformVersion': ENV.IOS_PLATFORM_VERSION,
  'appium:automationName': 'XCUITest',
  'appium:app': appPath,
  ...(ENV.IOS_BUNDLE_ID && { 'appium:bundleId': ENV.IOS_BUNDLE_ID }),
  ...(ENV.IOS_UDID && { 'appium:udid': ENV.IOS_UDID }),
  'appium:newCommandTimeout': 90,
  'appium:autoAcceptAlerts': true,
  'appium:noReset': false,
  'appium:wdaStartupRetries': 3,
};

export const config = {
  ...baseConfig,

  // ── Specs (iOS-specific tests + shared cross-platform tests) ───────────────
  specs: [
    './tests/specs/ios/**/*.spec.ts',
    './tests/specs/shared/**/*.spec.ts',
  ],

  // ── Capabilities ──────────────────────────────────────────────────────────
  capabilities: [iosCapabilities as object],

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
    process.env.PLATFORM = 'ios';
    process.env.TEST_TARGET = 'local';
    console.log(`📱 iOS Local — Device: ${ENV.IOS_DEVICE_NAME} (${ENV.IOS_PLATFORM_VERSION})`);
    console.log(`📦 App: ${appPath}`);
  },
} as Options.Testrunner;
