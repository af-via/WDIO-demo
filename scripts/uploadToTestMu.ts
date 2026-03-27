#!/usr/bin/env ts-node
/**
 * uploadToTestMu.ts
 *
 * Uploads the app binary to TestMu (LambdaTest) App Center.
 * Reads the app path from the .app-path-<platform> file created by downloadFromFirebase.ts,
 * or from APP_PATH_ANDROID / APP_PATH_IOS environment variables.
 *
 * After upload, writes the app URL to:
 *   .testmu-app-url-android   (containing the lt:// URL for Android)
 *   .testmu-app-url-ios       (containing the lt:// URL for iOS)
 *
 * These are read by the CI pipeline to set TESTMU_APP_URL_ANDROID / TESTMU_APP_URL_IOS
 * for the WDIO test run.
 *
 * Usage:
 *   ts-node scripts/uploadToTestMu.ts --platform android
 *   ts-node scripts/uploadToTestMu.ts --platform ios
 *   ts-node scripts/uploadToTestMu.ts --platform android --app-path ./apps/android/app.apk
 */

import * as path from 'path';
import * as fs from 'fs';
import { TestMuClient } from '../src/utils/TestMuClient';
import { validateEnv, ENV } from '../src/utils/envConfig';
import logger from '../src/utils/logger';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const platform = (args[args.indexOf('--platform') + 1] || 'android') as 'android' | 'ios';
  const appPathOverride = args.includes('--app-path') ? args[args.indexOf('--app-path') + 1] : null;

  if (!['android', 'ios'].includes(platform)) {
    console.error(`Invalid platform "${platform}". Use --platform android|ios`);
    process.exit(1);
  }

  validateEnv(['TESTMU_USERNAME', 'TESTMU_ACCESS_KEY']);

  // Resolve app path: CLI arg > env var > .app-path file
  let appPath: string;
  if (appPathOverride) {
    appPath = appPathOverride;
  } else {
    const envPath = platform === 'android' ? ENV.APP_PATH_ANDROID : ENV.APP_PATH_IOS;
    const pathFile = path.resolve(process.cwd(), `.app-path-${platform}`);

    if (envPath && envPath !== `./apps/${platform}/app.${platform === 'android' ? 'apk' : 'ipa'}`) {
      appPath = envPath;
    } else if (fs.existsSync(pathFile)) {
      appPath = fs.readFileSync(pathFile, 'utf-8').trim();
    } else {
      appPath = envPath;
    }
  }

  logger.info(`Uploading ${platform} app from: ${appPath}`);

  const client = new TestMuClient();

  try {
    const result = await client.uploadApp(appPath, platform);

    logger.info(`✔ TestMu App URL: ${result.appUrl}`);

    // Write app URL to file for CI consumption
    const urlFile = path.resolve(process.cwd(), `.testmu-app-url-${platform}`);
    fs.writeFileSync(urlFile, result.appUrl, 'utf-8');
    logger.info(`  App URL written to: ${urlFile}`);

    // Print in Azure DevOps variable format for the pipeline to capture
    console.log(`##vso[task.setvariable variable=TESTMU_APP_URL_${platform.toUpperCase()}]${result.appUrl}`);
    console.log(`TESTMU_APP_URL_${platform.toUpperCase()}=${result.appUrl}`);
  } catch (err) {
    logger.error(`TestMu upload failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
