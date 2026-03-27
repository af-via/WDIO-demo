import type { ChainablePromiseElement } from 'webdriverio';
import logger from '../utils/logger';
import { ENV } from '../utils/envConfig';

/**
 * BasePage — All Page Objects extend this class.
 * Provides platform-aware element lookup, waits, and common interactions.
 */
export abstract class BasePage {
  protected readonly platform: 'android' | 'ios';
  protected readonly defaultTimeout: number;

  constructor() {
    this.platform = (process.env.PLATFORM || 'android') as 'android' | 'ios';
    this.defaultTimeout = ENV.EXPLICIT_TIMEOUT;
  }

  get isAndroid(): boolean {
    return this.platform === 'android';
  }

  get isIOS(): boolean {
    return this.platform === 'ios';
  }

  // ── Element Resolution ─────────────────────────────────────────────────────

  /**
   * Returns the element for the given locator strategy and selector.
   * Supports platform-conditional selectors via object form.
   */
  protected el(
    androidSelector: string,
    iosSelector: string,
    _strategy: 'accessibility id' | 'id' | '-android uiautomator' | '-ios predicate string' | '-ios class chain' | 'xpath' = 'accessibility id',
  ): ChainablePromiseElement {
    const selector = this.isAndroid ? androidSelector : iosSelector;
    return $(selector);
  }

  /**
   * Shorthand: find by accessibility id (works on both platforms when IDs match).
   */
  protected byAccessibilityId(id: string): ChainablePromiseElement {
    return $(`~${id}`);
  }

  /**
   * Android-only: UIAutomator2 selector.
   */
  protected byAndroidUISelector(selector: string): ChainablePromiseElement {
    return $(`android=${selector}`);
  }

  /**
   * iOS-only: NSPredicate string selector.
   */
  protected byIOSPredicate(predicate: string): ChainablePromiseElement {
    return $(`-ios predicate string:${predicate}`);
  }

  /**
   * iOS-only: iOSClassChain selector.
   */
  protected byIOSClassChain(chain: string): ChainablePromiseElement {
    return $(`-ios class chain:${chain}`);
  }

  // ── Waits ──────────────────────────────────────────────────────────────────

  async waitForDisplayed(
    element: ChainablePromiseElement,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    logger.debug(`Waiting for element to be displayed — timeout: ${timeout}ms`);
    await element.waitForDisplayed({
      timeout,
      timeoutMsg: message || `Element not displayed within ${timeout}ms`,
    });
  }

  async waitForEnabled(
    element: ChainablePromiseElement,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await element.waitForEnabled({
      timeout,
      timeoutMsg: message || `Element not enabled within ${timeout}ms`,
    });
  }

  async waitForExist(
    element: ChainablePromiseElement,
    timeout = this.defaultTimeout,
    message?: string,
  ): Promise<void> {
    await element.waitForExist({
      timeout,
      timeoutMsg: message || `Element not found within ${timeout}ms`,
    });
  }

  async waitForNotExist(
    element: ChainablePromiseElement,
    timeout = this.defaultTimeout,
  ): Promise<void> {
    await element.waitForExist({
      timeout,
      reverse: true,
      timeoutMsg: `Element still present after ${timeout}ms`,
    });
  }

  // ── Interactions ───────────────────────────────────────────────────────────

  async tap(element: ChainablePromiseElement, timeout = this.defaultTimeout): Promise<void> {
    await this.waitForDisplayed(element, timeout);
    logger.debug(`Tapping element`);
    await element.click();
  }

  async typeText(
    element: ChainablePromiseElement,
    text: string,
    clearFirst = true,
    timeout = this.defaultTimeout,
  ): Promise<void> {
    await this.waitForDisplayed(element, timeout);
    if (clearFirst) await element.clearValue();
    logger.debug(`Typing text: "${text}"`);
    await element.setValue(text);
  }

  async getText(element: ChainablePromiseElement, timeout = this.defaultTimeout): Promise<string> {
    await this.waitForDisplayed(element, timeout);
    return element.getText();
  }

  async getAttribute(
    element: ChainablePromiseElement,
    attribute: string,
    timeout = this.defaultTimeout,
  ): Promise<string> {
    await this.waitForExist(element, timeout);
    return (await element.getAttribute(attribute)) ?? '';
  }

  async isDisplayed(element: ChainablePromiseElement): Promise<boolean> {
    try {
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async isEnabled(element: ChainablePromiseElement): Promise<boolean> {
    try {
      return await element.isEnabled();
    } catch {
      return false;
    }
  }

  // ── Navigation / App Control ───────────────────────────────────────────────

  async hideKeyboard(): Promise<void> {
    try {
      if (this.isAndroid) {
        await driver.hideKeyboard();
      } else {
        // For iOS, tap outside or use done button
        await driver.hideKeyboard('pressKey', 'Done');
      }
    } catch {
      logger.debug('hideKeyboard failed — keyboard may not be visible');
    }
  }

  async pressBack(): Promise<void> {
    if (this.isAndroid) {
      await driver.pressKeyCode(4); // Android back key
    } else {
      logger.warn('pressBack() has no effect on iOS — use navigation element instead');
    }
  }

  async launchApp(): Promise<void> {
    await driver.activateApp(
      this.isAndroid
        ? (ENV.ANDROID_APP_PACKAGE as string)
        : (ENV.IOS_BUNDLE_ID as string),
    );
  }

  async closeApp(): Promise<void> {
    await driver.terminateApp(
      this.isAndroid
        ? (ENV.ANDROID_APP_PACKAGE as string)
        : (ENV.IOS_BUNDLE_ID as string),
    );
  }

  async resetApp(): Promise<void> {
    await driver.reloadSession();
  }

  async pause(ms: number): Promise<void> {
    await browser.pause(ms);
  }

  // ── Abstract ───────────────────────────────────────────────────────────────

  /**
   * Each page defines how to verify it is fully loaded.
   */
  abstract waitForPageLoad(): Promise<void>;
}
