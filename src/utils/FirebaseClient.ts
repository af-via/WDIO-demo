import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import logger from './logger';
import { ENV } from './envConfig';
import type { FirebaseRelease, FirebaseDownloadResult, Platform } from '../types';

/**
 * FirebaseAppDistributionClient — Downloads the latest app release from
 * Firebase App Distribution using a GCP service account.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_APP_ID_ANDROID / FIREBASE_APP_ID_IOS
 *   FIREBASE_SERVICE_ACCOUNT_PATH (path to service-account.json)
 */
export class FirebaseAppDistributionClient {
  private auth: GoogleAuth | null = null;

  private getAuth(): GoogleAuth {
    if (this.auth) return this.auth;

    const serviceAccountPath = path.resolve(process.cwd(), ENV.FIREBASE_SERVICE_ACCOUNT_PATH);

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        `Firebase service account not found at: ${serviceAccountPath}\n` +
        `Set FIREBASE_SERVICE_ACCOUNT_PATH or place service-account.json in the project root.`,
      );
    }

    this.auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/firebase'],
    });

    return this.auth;
  }

  private async getAccessToken(): Promise<string> {
    const client = await this.getAuth().getClient();
    const tokenResponse = await client.getAccessToken();
    if (!tokenResponse?.token) {
      throw new Error('Failed to obtain Firebase access token');
    }
    return tokenResponse.token;
  }

  /**
   * Fetch the most recent release for the given app.
   */
  async getLatestRelease(appId: string): Promise<FirebaseRelease> {
    logger.info(`Fetching latest release for app: ${appId}`);
    const token = await this.getAccessToken();
    const url = `https://firebaseappdistribution.googleapis.com/v1/projects/${ENV.FIREBASE_PROJECT_ID}/apps/${appId}/releases?pageSize=1&orderBy=createTime+desc`;

    const response = await axios.get<{ releases: FirebaseRelease[] }>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const releases = response.data.releases;
    if (!releases || releases.length === 0) {
      throw new Error(`No releases found for app ${appId}`);
    }

    const latest = releases[0];
    logger.info(`Latest release: v${latest.displayVersion} (${latest.buildVersion}) — ${latest.createTime}`);
    return latest;
  }

  /**
   * Generate a signed download URL for the latest release binary.
   */
  async getDownloadUrl(releaseName: string): Promise<string> {
    logger.info(`Generating download URL for release: ${releaseName}`);
    const token = await this.getAccessToken();

    // Get tester download URL (binary download link)
    const binaryUrl = `https://firebaseappdistribution.googleapis.com/v1/${releaseName}/binaryDownloadUri`;
    const response = await axios.get<{ uri: string }>(binaryUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.uri;
  }

  /**
   * Download the app binary to the local filesystem.
   * Returns the local file path.
   */
  async downloadApp(platform: Platform, outputDir?: string): Promise<FirebaseDownloadResult> {
    const appId = platform === 'android' ? ENV.FIREBASE_APP_ID_ANDROID : ENV.FIREBASE_APP_ID_IOS;
    const extension = platform === 'android' ? 'apk' : 'ipa';
    const dir = outputDir || path.resolve(process.cwd(), 'apps', platform);

    if (!appId) {
      throw new Error(`FIREBASE_APP_ID_${platform.toUpperCase()} is not set`);
    }

    fs.mkdirSync(dir, { recursive: true });

    const release = await this.getLatestRelease(appId);
    const downloadUrl = await this.getDownloadUrl(release.name);

    const fileName = `app-${release.displayVersion}-${release.buildVersion}.${extension}`;
    const localPath = path.join(dir, fileName);

    logger.info(`Downloading ${platform} app to: ${localPath}`);
    await this.downloadFile(downloadUrl, localPath);
    logger.info(`Download complete: ${localPath}`);

    return {
      platform,
      version: release.displayVersion,
      buildNumber: release.buildVersion,
      localPath,
    };
  }

  private async downloadFile(url: string, outputPath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'stream' });
    const totalSize = Number(response.headers['content-length']) || 0;
    let downloaded = 0;

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);

      response.data.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        if (totalSize) {
          const pct = Math.round((downloaded / totalSize) * 100);
          process.stdout.write(`\r  Progress: ${pct}% (${(downloaded / 1024 / 1024).toFixed(1)} MB)`);
        }
      });

      response.data.pipe(writer);
      writer.on('finish', () => {
        process.stdout.write('\n');
        resolve();
      });
      writer.on('error', reject);
    });
  }

}
