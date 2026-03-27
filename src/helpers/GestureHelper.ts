import type { ChainablePromiseElement } from 'webdriverio';
import logger from '../utils/logger';

/**
 * GestureHelper — Swipe, scroll, drag, long-press, and pinch actions.
 * Works on both Android (UIAutomator2) and iOS (XCUITest).
 */
export class GestureHelper {
  private readonly platform: 'android' | 'ios';

  constructor() {
    this.platform = (process.env.PLATFORM || 'android') as 'android' | 'ios';
  }

  get isAndroid(): boolean {
    return this.platform === 'android';
  }

  // ── Scroll ─────────────────────────────────────────────────────────────────

  /**
   * Scroll the screen in the given direction.
   */
  async scroll(
    direction: 'up' | 'down' | 'left' | 'right',
    distance = 0.5,
  ): Promise<void> {
    logger.debug(`Scrolling ${direction} (distance: ${distance})`);
    const { width, height } = await driver.getWindowSize();

    const centerX = Math.round(width / 2);
    const centerY = Math.round(height / 2);
    const scrollDistance = Math.round(height * distance);

    const vectors: Record<string, { startX: number; startY: number; endX: number; endY: number }> = {
      up:    { startX: centerX, startY: centerY + scrollDistance / 2, endX: centerX, endY: centerY - scrollDistance / 2 },
      down:  { startX: centerX, startY: centerY - scrollDistance / 2, endX: centerX, endY: centerY + scrollDistance / 2 },
      left:  { startX: centerX + scrollDistance / 2, startY: centerY, endX: centerX - scrollDistance / 2, endY: centerY },
      right: { startX: centerX - scrollDistance / 2, startY: centerY, endX: centerX + scrollDistance / 2, endY: centerY },
    };

    const { startX, startY, endX, endY } = vectors[direction];

    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: startX, y: startY })
      .down()
      .pause(200)
      .move({ x: endX, y: endY, duration: 600 })
      .up()
      .perform();
  }

  /**
   * Scroll until an element is visible, up to maxScrolls times.
   */
  async scrollToElement(
    element: ChainablePromiseElement,
    direction: 'up' | 'down' = 'down',
    maxScrolls = 5,
  ): Promise<boolean> {
    for (let i = 0; i < maxScrolls; i++) {
      if (await element.isDisplayed()) {
        logger.debug(`Element found after ${i} scroll(s)`);
        return true;
      }
      await this.scroll(direction);
      await browser.pause(300);
    }
    logger.warn(`Element not found after ${maxScrolls} scrolls`);
    return false;
  }

  /**
   * Platform-native scroll within a scrollable container.
   * Uses UiScrollable for Android, mobile:scroll for iOS.
   */
  async scrollToText(text: string, direction: 'up' | 'down' = 'down'): Promise<void> {
    logger.debug(`Scrolling to element with text: "${text}"`);
    if (this.isAndroid) {
      const selector = `new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${text}"))`;
      await $(`android=${selector}`).waitForExist({ timeout: 15000 });
    } else {
      await driver.execute('mobile: scroll', {
        direction,
        predicateString: `label == "${text}"`,
      });
    }
  }

  // ── Swipe ──────────────────────────────────────────────────────────────────

  /**
   * Swipe on a specific element (e.g. swipe-to-delete).
   */
  async swipeOnElement(
    element: ChainablePromiseElement,
    direction: 'left' | 'right' | 'up' | 'down',
    distanceRatio = 0.75,
  ): Promise<void> {
    logger.debug(`Swiping ${direction} on element`);
    const location = await element.getLocation();
    const size = await element.getSize();
    const { x, y } = location;
    const { width, height } = size;

    const startX = Math.round(x + width / 2);
    const startY = Math.round(y + height / 2);
    const dx = Math.round(width * distanceRatio);
    const dy = Math.round(height * distanceRatio);

    const endpoints: Record<string, { endX: number; endY: number }> = {
      left:  { endX: startX - dx, endY: startY },
      right: { endX: startX + dx, endY: startY },
      up:    { endX: startX,      endY: startY - dy },
      down:  { endX: startX,      endY: startY + dy },
    };

    const { endX, endY } = endpoints[direction];

    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: startX, y: startY })
      .down()
      .pause(100)
      .move({ x: endX, y: endY, duration: 400 })
      .up()
      .perform();
  }

  // ── Long Press ─────────────────────────────────────────────────────────────

  async longPress(element: ChainablePromiseElement, durationMs = 1500): Promise<void> {
    logger.debug(`Long-pressing element for ${durationMs}ms`);
    const location = await element.getLocation();
    const size = await element.getSize();
    const x = Math.round(location.x + size.width / 2);
    const y = Math.round(location.y + size.height / 2);

    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y })
      .down()
      .pause(durationMs)
      .up()
      .perform();
  }

  // ── Pinch / Zoom ───────────────────────────────────────────────────────────

  async pinchIn(scale = 0.5, durationMs = 500): Promise<void> {
    logger.debug(`Pinch in (scale: ${scale})`);
    if (this.isAndroid) {
      await driver.execute('mobile: pinchCloseGesture', {
        elementId: null,
        percent: scale,
        speed: 2500,
      });
    } else {
      await driver.execute('mobile: pinch', { scale, velocity: -1, duration: durationMs / 1000 });
    }
  }

  async pinchOut(scale = 2.0, durationMs = 500): Promise<void> {
    logger.debug(`Pinch out (scale: ${scale})`);
    if (this.isAndroid) {
      await driver.execute('mobile: pinchOpenGesture', {
        elementId: null,
        percent: 0.5,
        speed: 2500,
      });
    } else {
      await driver.execute('mobile: pinch', { scale, velocity: 1, duration: durationMs / 1000 });
    }
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  async dragAndDrop(
    sourceElement: ChainablePromiseElement,
    targetElement: ChainablePromiseElement,
    durationMs = 1000,
  ): Promise<void> {
    logger.debug('Drag and drop');
    const srcLoc = await sourceElement.getLocation();
    const srcSize = await sourceElement.getSize();
    const tgtLoc = await targetElement.getLocation();
    const tgtSize = await targetElement.getSize();

    const startX = Math.round(srcLoc.x + srcSize.width / 2);
    const startY = Math.round(srcLoc.y + srcSize.height / 2);
    const endX = Math.round(tgtLoc.x + tgtSize.width / 2);
    const endY = Math.round(tgtLoc.y + tgtSize.height / 2);

    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: startX, y: startY })
      .down()
      .pause(500)
      .move({ x: endX, y: endY, duration: durationMs })
      .pause(200)
      .up()
      .perform();
  }

  // ── Double Tap ─────────────────────────────────────────────────────────────

  async doubleTap(element: ChainablePromiseElement): Promise<void> {
    logger.debug('Double tapping element');
    const location = await element.getLocation();
    const size = await element.getSize();
    const x = Math.round(location.x + size.width / 2);
    const y = Math.round(location.y + size.height / 2);

    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y })
      .down()
      .up()
      .pause(100)
      .down()
      .up()
      .perform();
  }
}

export const gestureHelper = new GestureHelper();
