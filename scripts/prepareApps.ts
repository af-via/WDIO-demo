#!/usr/bin/env ts-node
/**
 * prepareApps.ts
 *
 * Orchestrates the full app preparation pipeline:
 *   1. Download latest release from Firebase App Distribution
 *   2. Upload to TestMu App Center
 *   3. Output app URLs for test execution
 *
 * Usage:
 *   ts-node scripts/prepareApps.ts --platform android
 *   ts-node scripts/prepareApps.ts --platform ios
 *   ts-node scripts/prepareApps.ts --platform both
 */

import { FirebaseAppDistributionClient } from '../src/utils/FirebaseClient';
import { TestMuClient } from '../src/utils/TestMuClient';
import { validateEnv } from '../src/utils/envConfig';
import logger from '../src/utils/logger';
import type { Platform } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

async function preparePlatform(
  platform: Platform,
  firebase: FirebaseAppDistributionClient,
  testmu: TestMuClient,
): Promise<{ platform: Platform; appUrl: string }> {
  logger.info(`\n${'─'.repeat(50)}`);
  logger.info(`Preparing ${platform.toUpperCase()} app`);
  logger.info('─'.repeat(50));

  // 1. Download from Firebase
  const downloadResult = await firebase.downloadApp(platform);
  logger.info(`Downloaded: ${downloadResult.localPath} (v${downloadResult.version})`);

  // 2. Upload to TestMu
  const uploadResult = await testmu.uploadApp(downloadResult.localPath, platform);
  logger.info(`Uploaded to TestMu: ${uploadResult.appUrl}`);

  // 3. Write the app URL for CI to pick up
  const urlFile = path.resolve(process.cwd(), `.testmu-app-url-${platform}`);
  fs.writeFileSync(urlFile, uploadResult.appUrl, 'utf-8');

  // Export as Azure DevOps pipeline variable
  console.log(`##vso[task.setvariable variable=TESTMU_APP_URL_${platform.toUpperCase()}]${uploadResult.appUrl}`);

  return { platform, appUrl: uploadResult.appUrl };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const platformArg = args.includes('--platform') ? args[args.indexOf('--platform') + 1] : 'both';

  const platforms: Platform[] = platformArg === 'both'
    ? ['android', 'ios']
    : [platformArg as Platform];

  // Validate required env vars
  validateEnv(['FIREBASE_PROJECT_ID', 'TESTMU_USERNAME', 'TESTMU_ACCESS_KEY']);
  for (const p of platforms) {
    validateEnv([p === 'android' ? 'FIREBASE_APP_ID_ANDROID' : 'FIREBASE_APP_ID_IOS']);
  }

  const firebase = new FirebaseAppDistributionClient();
  const testmu = new TestMuClient();

  const results: { platform: Platform; appUrl: string }[] = [];

  for (const platform of platforms) {
    const result = await preparePlatform(platform, firebase, testmu);
    results.push(result);
  }

  logger.info('\n✅ App preparation complete:');
  for (const { platform, appUrl } of results) {
    logger.info(`  ${platform.toUpperCase()}: ${appUrl}`);
  }
}

main().catch((err) => {
  logger.error(`App preparation failed: ${(err as Error).message}`);
  process.exit(1);
});
