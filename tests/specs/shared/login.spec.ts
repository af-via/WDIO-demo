import { expect } from '@wdio/globals';
import { loginPage } from '../../../src/pages/LoginPage';
import { homePage } from '../../../src/pages/HomePage';
import { users } from '../../fixtures/testData';
import logger, { logStep } from '../../../src/utils/logger';
import allureReporter from '@wdio/allure-reporter';

describe('Login — Shared (Android + iOS)', () => {
  beforeEach(async () => {
    allureReporter.addFeature('Authentication');
    allureReporter.addStory('Login Flow');
    await loginPage.waitForPageLoad();
  });

  it('should display login screen elements', async () => {
    allureReporter.addSeverity('normal');
    logStep('Verify login screen is displayed');

    const isLoginEnabled = await loginPage.isLoginButtonEnabled();
    expect(isLoginEnabled).toBe(true);
  });

  it('should log in with valid credentials', async () => {
    allureReporter.addSeverity('critical');
    logStep('Enter valid credentials and submit');

    await loginPage.login(users.validUser.username, users.validUser.password);

    logStep('Verify home screen is displayed after login');
    await homePage.waitForPageLoad();

    const isHomeDisplayed = await homePage.isWelcomeBannerDisplayed();
    expect(isHomeDisplayed).toBe(true);
    logger.info('Login with valid credentials: PASS');
  });

  it('should show an error for invalid credentials', async () => {
    allureReporter.addSeverity('critical');
    logStep('Enter invalid credentials and submit');

    await loginPage.login(users.invalidUser.username, users.invalidUser.password);

    logStep('Verify error message is displayed');
    const isError = await loginPage.isErrorDisplayed();
    expect(isError).toBe(true);

    const errorText = await loginPage.getErrorMessage();
    expect(errorText.length).toBeGreaterThan(0);
    logger.info(`Error message displayed: "${errorText}"`);
  });

  it('should not enable login with empty fields', async () => {
    allureReporter.addSeverity('normal');
    logStep('Leave credentials empty and check login button');

    await loginPage.enterUsername('');
    await loginPage.enterPassword('');

    const hasError = await loginPage.isErrorDisplayed();
    const isEnabled = await loginPage.isLoginButtonEnabled();
    // Either the button is disabled OR an error is shown
    const isBlocked = !isEnabled || hasError;
    expect(isBlocked).toBe(true);
  });

  afterEach(async () => {
    // Reset to login screen if we ended up on another page
    try {
      const isHome = await homePage.isWelcomeBannerDisplayed();
      if (isHome) {
        await homePage.logout();
        await loginPage.waitForPageLoad();
      }
    } catch {
      // Already on login screen
    }
  });
});
