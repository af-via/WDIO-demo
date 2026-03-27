import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import logger from './logger';
import { ENV } from './envConfig';
import type { TestMuUploadResponse, TestMuUploadResult, Platform } from '../types';

const TESTMU_UPLOAD_URL = 'https://manual-api.lambdatest.com/app/upload/realDevice';

/**
 * TestMuClient — Uploads app binaries to TestMu (LambdaTest) App Center.
 *
 * Required env vars:
 *   LT_USERNAME
 *   LT_ACCESS_KEY
 */
export class TestMuClient {
  private readonly username: string;
  private readonly accessKey: string;

  constructor(username = ENV.TESTMU_USERNAME, accessKey = ENV.TESTMU_ACCESS_KEY) {
    if (!username || !accessKey) {
      throw new Error('LT_USERNAME and LT_ACCESS_KEY must be set to use TestMu');
    }
    this.username = username;
    this.accessKey = accessKey;
  }

  /**
   * Upload an app binary to TestMu App Center.
   * Returns the app URL (lt://APP_URL) to use in capabilities.
   */
  async uploadApp(appFilePath: string, platform: Platform): Promise<TestMuUploadResult> {
    const resolvedPath = path.resolve(process.cwd(), appFilePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`App file not found: ${resolvedPath}`);
    }

    const fileName = path.basename(resolvedPath);
    const fileSize = (fs.statSync(resolvedPath).size / 1024 / 1024).toFixed(2);
    logger.info(`Uploading ${platform} app to TestMu: ${fileName} (${fileSize} MB)`);

    const form = new FormData();
    form.append('appFile', fs.createReadStream(resolvedPath), {
      filename: fileName,
      contentType: platform === 'android' ? 'application/vnd.android.package-archive' : 'application/octet-stream',
    });
    form.append('name', fileName);

    const response = await axios.post<TestMuUploadResponse>(TESTMU_UPLOAD_URL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Basic ${Buffer.from(`${this.username}:${this.accessKey}`).toString('base64')}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { app_url, app_id, name } = response.data;
    logger.info(`✔ Upload complete — App URL: ${app_url} | ID: ${app_id} | Name: ${name}`);

    return { platform, appUrl: app_url, appId: app_id };
  }

  /**
   * List already-uploaded apps on TestMu.
   */
  async listApps(): Promise<TestMuUploadResponse[]> {
    const response = await axios.get<{ data: TestMuUploadResponse[] }>(
      'https://manual-api.lambdatest.com/app/data?storage=all',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.username}:${this.accessKey}`).toString('base64')}`,
        },
      },
    );
    return response.data.data || [];
  }
}
