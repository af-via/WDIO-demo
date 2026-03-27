import { BasePage } from './BasePage';
import logger from '../utils/logger';

/**
 * HomePage — Main screen after login.
 * Demonstrates navigation tab bar interactions and list scrolling.
 */
export class HomePage extends BasePage {
  // ── Selectors ──────────────────────────────────────────────────────────────

  private get welcomeBanner() {
    return this.el('~welcome_banner', '~welcome_banner');
  }

  private get profileTab() {
    return this.el('~tab_profile', '~tab_profile');
  }

  private get searchTab() {
    return this.el('~tab_search', '~tab_search');
  }

  private get notificationsTab() {
    return this.el('~tab_notifications', '~tab_notifications');
  }

  private get userGreeting() {
    return this.el('~user_greeting', '~user_greeting');
  }

  private get logoutButton() {
    return this.el('~logout_button', '~logout_button');
  }

  private get searchBar() {
    return this.el('~search_bar', '~search_bar');
  }

  // ── Page Load ──────────────────────────────────────────────────────────────

  async waitForPageLoad(): Promise<void> {
    logger.info('HomePage: waiting for page to load');
    await this.waitForDisplayed(this.welcomeBanner, 15000);
    logger.info('HomePage: loaded');
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async tapProfileTab(): Promise<void> {
    logger.info('HomePage: navigating to Profile tab');
    await this.tap(this.profileTab);
  }

  async tapSearchTab(): Promise<void> {
    logger.info('HomePage: navigating to Search tab');
    await this.tap(this.searchTab);
  }

  async tapNotificationsTab(): Promise<void> {
    logger.info('HomePage: navigating to Notifications tab');
    await this.tap(this.notificationsTab);
  }

  async searchFor(query: string): Promise<void> {
    logger.info(`HomePage: searching for "${query}"`);
    await this.tap(this.searchTab);
    await this.typeText(this.searchBar, query);
    if (this.isAndroid) {
      await driver.pressKeyCode(66); // Enter/Search key
    } else {
      await driver.execute('mobile: pressButton', [{ name: 'return' }]);
    }
  }

  async logout(): Promise<void> {
    logger.info('HomePage: logging out');
    await this.tap(this.profileTab);
    await this.tap(this.logoutButton);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async getGreetingText(): Promise<string> {
    return this.getText(this.userGreeting);
  }

  async getItemCount(): Promise<number> {
    const items = await $$('~list_item');
    return items.length;
  }

  async isWelcomeBannerDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.welcomeBanner);
  }
}

export const homePage = new HomePage();
