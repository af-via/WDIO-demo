import { expect } from '@wdio/globals';
import { loginPage } from '../../../src/pages/LoginPage';
import { homePage } from '../../../src/pages/HomePage';
import { gestureHelper } from '../../../src/helpers/GestureHelper';
import { users } from '../../fixtures/testData';
import logger, { logStep } from '../../../src/utils/logger';
import allureReporter from '@wdio/allure-reporter';

describe('Home — Android specific', () => {
  before(async () => {
    allureReporter.addFeature('Home Screen');
    allureReporter.addTag('android');

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

    const greeting = await homePage.getGreetingText();
    expect(greeting.length).toBeGreaterThan(0);
    logger.info(`Greeting: ${greeting}`);
  });

  it('should navigate to search tab', async () => {
    allureReporter.addSeverity('normal');
    logStep('Tap search tab');

    await homePage.tapSearchTab();
    // Verify search results page or search input is visible
    // (add your app-specific assertion here)
  });

  it('should scroll down and back up', async () => {
    allureReporter.addSeverity('minor');
    logStep('Scroll down on home screen');

    await gestureHelper.scroll('down', 0.5);
    await browser.pause(300);
    await gestureHelper.scroll('up', 0.5);
  });

  it('should handle back button press', async () => {
    allureReporter.addSeverity('minor');
    logStep('Press Android back button');

    await homePage.tapSearchTab();
    await driver.pressKeyCode(4); // Back key
    // Should return to previous state
  });

  after(async () => {
    logStep('Logout after android home tests');
    try {
      await homePage.logout();
    } catch {
      logger.warn('Logout step skipped — may already be logged out');
    }
  });
});
