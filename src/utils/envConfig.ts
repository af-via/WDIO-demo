import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  // ── Execution Target ──────────────────────────────────────────────────────
  TARGET: (process.env.TEST_TARGET || 'local') as 'local' | 'testmu',
  PLATFORM: (process.env.PLATFORM || 'android') as 'android' | 'ios',

  // ── TestMu / LambdaTest ───────────────────────────────────────────────────
  TESTMU_USERNAME: process.env.LT_USERNAME || '',
  TESTMU_ACCESS_KEY: process.env.LT_ACCESS_KEY || '',
  TESTMU_HUB: 'mobile-hub.lambdatest.com',
  TESTMU_APP_URL_ANDROID: process.env.TESTMU_APP_URL_ANDROID || '',
  TESTMU_APP_URL_IOS: process.env.TESTMU_APP_URL_IOS || '',

  // ── Firebase App Distribution ─────────────────────────────────────────────
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_APP_ID_ANDROID: process.env.FIREBASE_APP_ID_ANDROID || '',
  FIREBASE_APP_ID_IOS: process.env.FIREBASE_APP_ID_IOS || '',
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'service-account.json',

  // ── Local App Paths ────────────────────────────────────────────────────────
  APP_PATH_ANDROID: process.env.APP_PATH_ANDROID || './apps/android/app.apk',
  APP_PATH_IOS: process.env.APP_PATH_IOS || './apps/ios/app.ipa',

  // ── Local Device / Emulator ────────────────────────────────────────────────
  ANDROID_DEVICE_NAME: process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
  ANDROID_PLATFORM_VERSION: process.env.ANDROID_PLATFORM_VERSION || '14.0',
  IOS_DEVICE_NAME: process.env.IOS_DEVICE_NAME || 'iPhone 15',
  IOS_PLATFORM_VERSION: process.env.IOS_PLATFORM_VERSION || '17.4',
  IOS_UDID: process.env.IOS_UDID || '',
  IOS_BUNDLE_ID: process.env.IOS_BUNDLE_ID || '',
  ANDROID_APP_PACKAGE: process.env.ANDROID_APP_PACKAGE || '',
  ANDROID_APP_ACTIVITY: process.env.ANDROID_APP_ACTIVITY || '',

  // ── TestMu Device Config ───────────────────────────────────────────────────
  TESTMU_ANDROID_DEVICE: process.env.TESTMU_ANDROID_DEVICE || 'Pixel 8',
  TESTMU_ANDROID_VERSION: process.env.TESTMU_ANDROID_VERSION || '14',
  TESTMU_IOS_DEVICE: process.env.TESTMU_IOS_DEVICE || 'iPhone 15',
  TESTMU_IOS_VERSION: process.env.TESTMU_IOS_VERSION || '17',

  // ── Build / Test Metadata ──────────────────────────────────────────────────
  BUILD_NAME: process.env.BUILD_NAME || `Local Build ${new Date().toISOString()}`,
  BUILD_NUMBER: process.env.BUILD_BUILDNUMBER || process.env.BUILD_NUMBER || '0',
  SUITE_NAME: process.env.SUITE_NAME || 'Mobile Regression',

  // ── Timeouts (ms) ─────────────────────────────────────────────────────────
  IMPLICIT_TIMEOUT: Number(process.env.IMPLICIT_TIMEOUT) || 10000,
  EXPLICIT_TIMEOUT: Number(process.env.EXPLICIT_TIMEOUT) || 30000,
  PAGE_LOAD_TIMEOUT: Number(process.env.PAGE_LOAD_TIMEOUT) || 60000,
};

export function validateEnv(required: (keyof typeof ENV)[]): void {
  const missing = required.filter((key) => !ENV[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
