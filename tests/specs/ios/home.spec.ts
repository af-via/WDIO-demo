import { expect } from '@wdio/globals';
import { loginPage } from '../../../src/pages/LoginPage';
import { homePage } from '../../../src/pages/HomePage';
import { gestureHelper } from '../../../src/helpers/GestureHelper';
import { alertHelper } from '../../../src/helpers/AlertHelper';
import { users } from '../../fixtures/testData';
import logger, { logStep } from '../../../src/utils/logger';
import allureReporter from '@wdio/allure-reporter';

describe('Home — iOS specific', () => {
  before(async () => {
    allureReporter.addFeature('Home Screen');
    allureReporter.addTag('ios');

    logStep('Login before test suite');
    await loginPage.waitForPageLoad();
    await loginPage.login(users.validUser.username, users.validUser.password);
    await homePage.waitForPageLoad();
  });

  beforeEach(async () => {
    allureReporter.addStory('Home Navigation');
  });

  it('should display welcome banner after login', async () => {
    allureReporter.addSeverity('critical');
    logStep('Verify welcome banner');

    const isVisible = await homePage.isWelcomeBannerDisplayed();
    expect(isVisible).toBe(true);
  });

  it('should navigate to profile tab', async () => {
    allureReporter.addSeverity('normal');
    logStep('Tap profile tab');

    await homePage.tapProfileTab();
    // Add your app-specific assertion here
  });

  it('should swipe left on a list item', async () => {
    allureReporter.addSeverity('minor');
    logStep('Swipe left to reveal action (iOS swipe-to-delete pattern)');

    // This is an example; replace with your actual list element
    const firstItem = $('~list_item');
    if (await firstItem.isExisting()) {
      await gestureHelper.swipeOnElement(firstItem, 'left');
      await browser.pause(500);
    } else {
      logger.warn('No list items found for swipe test');
    }
  });

  it('should handle iOS permission dialog if triggered', async () => {
    allureReporter.addSeverity('minor');
    logStep('Allow permission dialog if shown');

    if (await alertHelper.isAlertPresent()) {
      await alertHelper.allowPermission();
    }
    // Continue with test
  });

  after(async () => {
    logStep('Logout after iOS home tests');
    try {
      await homePage.logout();
    } catch {
      logger.warn('Logout step skipped — may already be logged out');
    }
  });
});
