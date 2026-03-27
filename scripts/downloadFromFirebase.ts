#!/usr/bin/env ts-node
/**
 * downloadFromFirebase.ts
 *
 * Downloads the latest app release from Firebase App Distribution.
 * Writes the local path to a `.app-path` file so subsequent scripts can read it.
 *
 * Usage:
 *   ts-node scripts/downloadFromFirebase.ts --platform android
 *   ts-node scripts/downloadFromFirebase.ts --platform ios
 */

import * as path from 'path';
import * as fs from 'fs';
import { FirebaseAppDistributionClient } from '../src/utils/FirebaseClient';
import { validateEnv } from '../src/utils/envConfig';
import logger from '../src/utils/logger';

async function main(): Promise<void> {
  const platform = (process.argv[process.argv.indexOf('--platform') + 1] || 'android') as 'android' | 'ios';

  if (!['android', 'ios'].includes(platform)) {
    console.error(`Invalid platform "${platform}". Use --platform android|ios`);
    process.exit(1);
  }

  validateEnv(['FIREBASE_PROJECT_ID']);
  if (platform === 'android') validateEnv(['FIREBASE_APP_ID_ANDROID']);
  if (platform === 'ios') validateEnv(['FIREBASE_APP_ID_IOS']);

  const client = new FirebaseAppDistributionClient();

  logger.info(`Starting Firebase App Distribution download — platform: ${platform}`);
  const result = await client.downloadApp(platform);

  logger.info(`✔ Downloaded: ${result.localPath}`);
  logger.info(`  Version: ${result.version} (${result.buildNumber})`);

  // Write the resolved path to a file so the upload script can read it
  const pathFile = path.resolve(process.cwd(), `.app-path-${platform}`);
  fs.writeFileSync(pathFile, result.localPath, 'utf-8');
  logger.info(`  Path written to: ${pathFile}`);

  // Also set environment variable for current process (useful when chained)
  if (platform === 'android') {
    process.env.APP_PATH_ANDROID = result.localPath;
  } else {
    process.env.APP_PATH_IOS = result.localPath;
  }
}

main().catch((err) => {
  logger.error(`Firebase download failed: ${(err as Error).message}`);
  process.exit(1);
});
