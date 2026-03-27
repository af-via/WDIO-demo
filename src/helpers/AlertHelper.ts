import type { ChainablePromiseElement } from 'webdriverio';
import logger from '../utils/logger';

/**
 * AlertHelper — Handle native system dialogs, permissions, and in-app alerts.
 */
export class AlertHelper {
  private readonly platform: 'android' | 'ios';

  constructor() {
    this.platform = (process.env.PLATFORM || 'android') as 'android' | 'ios';
  }

  get isAndroid(): boolean {
    return this.platform === 'android';
  }

  // ── Native Alerts ──────────────────────────────────────────────────────────

  async isAlertPresent(): Promise<boolean> {
    try {
      const text = await driver.getAlertText();
      return !!text;
    } catch {
      return false;
    }
  }

  async acceptAlert(): Promise<void> {
    logger.debug('Accepting native alert');
    try {
      await driver.acceptAlert();
    } catch {
      logger.debug('No native alert to accept');
    }
  }

  async dismissAlert(): Promise<void> {
    logger.debug('Dismissing native alert');
    try {
      await driver.dismissAlert();
    } catch {
      logger.debug('No native alert to dismiss');
    }
  }

  async getAlertText(): Promise<string | null> {
    try {
      return await driver.getAlertText();
    } catch {
      return null;
    }
  }

  // ── Permission Dialogs ─────────────────────────────────────────────────────

  /**
   * Allow a permission dialog (e.g. camera, location).
   * Handles both Android and iOS system dialogs.
   */
  async allowPermission(): Promise<void> {
    logger.debug('Allowing permission dialog');
    if (this.isAndroid) {
      const allowButton = await this.findAndroidPermissionButton(['Allow', 'ALLOW', 'Allow only while using the app', 'OK']);
      if (allowButton) await allowButton.click();
    } else {
      const allowButton = await this.findIOSPermissionButton(['Allow', 'Allow While Using App', 'OK', 'Allow Access to All Photos']);
      if (allowButton) await allowButton.click();
    }
  }

  /**
   * Deny a permission dialog.
   */
  async denyPermission(): Promise<void> {
    logger.debug('Denying permission dialog');
    if (this.isAndroid) {
      const denyButton = await this.findAndroidPermissionButton(["Don't allow", 'Deny', 'DENY']);
      if (denyButton) await denyButton.click();
    } else {
      const denyButton = await this.findIOSPermissionButton(["Don't Allow", 'Deny']);
      if (denyButton) await denyButton.click();
    }
  }

  // ── In-App Alert (iOS UIAlertController / Android Dialog) ─────────────────

  /**
   * Tap a button in an in-app alert/dialog by button text.
   */
  async tapAlertButton(buttonText: string): Promise<void> {
    logger.debug(`Tapping alert button: "${buttonText}"`);
    if (this.isAndroid) {
      await $(`//*[@text="${buttonText}"]`).click();
    } else {
      await $(`~${buttonText}`).click();
    }
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private async findAndroidPermissionButton(
    labels: string[],
  ): Promise<ChainablePromiseElement | null> {
    for (const label of labels) {
      try {
        const el = $(`//*[@text="${label}" and @clickable="true"]`);
        if (await el.isDisplayed()) return el;
      } catch { /* not found */ }
    }
    return null;
  }

  private async findIOSPermissionButton(
    labels: string[],
  ): Promise<ChainablePromiseElement | null> {
    for (const label of labels) {
      try {
        const el = $(`~${label}`);
        if (await el.isDisplayed()) return el;
      } catch { /* not found */ }
    }
    return null;
  }
}

export const alertHelper = new AlertHelper();
