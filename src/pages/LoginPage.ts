import { BasePage } from './BasePage';
import logger from '../utils/logger';

/**
 * LoginPage — Demonstrates platform-aware POM pattern.
 * Replace selectors with your actual app's accessibility IDs / locators.
 */
export class LoginPage extends BasePage {
  // ── Selectors ──────────────────────────────────────────────────────────────

  private get usernameField() {
    return this.el('~username_input', '~username_input');
  }

  private get passwordField() {
    return this.el('~password_input', '~password_input');
  }

  private get loginButton() {
    return this.el('~login_button', '~login_button');
  }

  private get errorMessage() {
    return this.el('~login_error_message', '~login_error_message');
  }

  private get forgotPasswordLink() {
    return this.el('~forgot_password', '~forgot_password');
  }

  private get biometricLoginButton() {
    return this.el('~biometric_login', '~biometric_login');
  }

  // ── Page Load ──────────────────────────────────────────────────────────────

  async waitForPageLoad(): Promise<void> {
    logger.info('LoginPage: waiting for page to load');
    await this.waitForDisplayed(this.usernameField);
    await this.waitForDisplayed(this.loginButton);
    logger.info('LoginPage: loaded');
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async enterUsername(username: string): Promise<void> {
    logger.debug(`LoginPage: entering username: ${username}`);
    await this.typeText(this.usernameField, username);
  }

  async enterPassword(password: string): Promise<void> {
    logger.debug('LoginPage: entering password');
    await this.typeText(this.passwordField, password);
  }

  async tapLoginButton(): Promise<void> {
    logger.info('LoginPage: tapping login button');
    await this.hideKeyboard();
    await this.tap(this.loginButton);
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLoginButton();
  }

  async tapForgotPassword(): Promise<void> {
    await this.tap(this.forgotPasswordLink);
  }

  async tapBiometricLogin(): Promise<void> {
    await this.tap(this.biometricLoginButton);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async getErrorMessage(): Promise<string> {
    await this.waitForDisplayed(this.errorMessage, 5000);
    return this.getText(this.errorMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.errorMessage);
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return this.isEnabled(this.loginButton);
  }
}

export const loginPage = new LoginPage();
