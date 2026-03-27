import logger from '../utils/logger';

/**
 * WaitHelper — Explicit waits and polling utilities beyond WDIO's built-ins.
 */
export class WaitHelper {
  /**
   * Wait for a condition to be truthy, polling at the given interval.
   */
  async waitForCondition(
    condition: () => Promise<boolean> | boolean,
    timeout = 30000,
    interval = 500,
    message = 'Condition not met',
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) return;
      await browser.pause(interval);
    }
    throw new Error(`${message} (timeout: ${timeout}ms)`);
  }

  /**
   * Wait for an element's text to match a string or regex.
   */
  async waitForText(
    element: WebdriverIO.Element,
    expected: string | RegExp,
    timeout = 15000,
  ): Promise<void> {
    logger.debug(`Waiting for element text to match: ${expected}`);
    await this.waitForCondition(
      async () => {
        try {
          const text = await element.getText();
          return typeof expected === 'string' ? text === expected : expected.test(text);
        } catch {
          return false;
        }
      },
      timeout,
      300,
      `Element text did not match "${expected}" within ${timeout}ms`,
    );
  }

  /**
   * Wait for an element's attribute value to match.
   */
  async waitForAttribute(
    element: WebdriverIO.Element,
    attribute: string,
    expected: string,
    timeout = 15000,
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        try {
          const value = await element.getAttribute(attribute);
          return value === expected;
        } catch {
          return false;
        }
      },
      timeout,
      300,
      `Attribute "${attribute}" did not equal "${expected}" within ${timeout}ms`,
    );
  }

  /**
   * Wait for the app to become foreground (Android only).
   */
  async waitForAppInForeground(appPackage: string, timeout = 10000): Promise<void> {
    await this.waitForCondition(
      async () => {
        const current = await driver.getCurrentActivity();
        return current.includes(appPackage);
      },
      timeout,
      500,
      `App "${appPackage}" not in foreground within ${timeout}ms`,
    );
  }

  /**
   * Hard sleep — prefer sparingly. Use waitForCondition instead.
   */
  async sleep(ms: number): Promise<void> {
    logger.debug(`Sleeping ${ms}ms`);
    await browser.pause(ms);
  }
}

export const waitHelper = new WaitHelper();
