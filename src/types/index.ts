// ── Platform / Driver Types ───────────────────────────────────────────────────

export type Platform = 'android' | 'ios';
export type ExecutionTarget = 'local' | 'testmu';
export type DriverType = 'UIAutomator2' | 'XCUITest';

// ── Firebase Types ────────────────────────────────────────────────────────────

export interface FirebaseRelease {
  name: string;
  releaseNotes?: { text: string };
  displayVersion: string;
  buildVersion: string;
  createTime: string;
  firebaseConsoleUri?: string;
  testingUri?: string;
  binaryDownloadUri?: string;
}

export interface FirebaseDownloadResult {
  platform: Platform;
  version: string;
  buildNumber: string;
  localPath: string;
}

// ── TestMu / LambdaTest Types ─────────────────────────────────────────────────

export interface TestMuUploadResponse {
  app_url: string;
  app_id: string;
  name: string;
  type: string;
}

export interface TestMuUploadResult {
  platform: Platform;
  appUrl: string;
  appId: string;
}

// ── WDIO Capabilities ─────────────────────────────────────────────────────────

export interface AndroidLocalCapabilities {
  platformName: 'Android';
  'appium:deviceName': string;
  'appium:platformVersion': string;
  'appium:automationName': 'UIAutomator2';
  'appium:app': string;
  'appium:appPackage'?: string;
  'appium:appActivity'?: string;
  'appium:newCommandTimeout': number;
  'appium:autoGrantPermissions': boolean;
  'appium:noReset'?: boolean;
  'appium:fullReset'?: boolean;
}

export interface IOSLocalCapabilities {
  platformName: 'iOS';
  'appium:deviceName': string;
  'appium:platformVersion': string;
  'appium:automationName': 'XCUITest';
  'appium:app': string;
  'appium:bundleId'?: string;
  'appium:udid'?: string;
  'appium:newCommandTimeout': number;
  'appium:autoAcceptAlerts': boolean;
  'appium:noReset'?: boolean;
  'appium:wdaStartupRetries'?: number;
}

export interface TestMuCapabilities {
  platformName: 'Android' | 'iOS';
  'lt:options': {
    username: string;
    accessKey: string;
    deviceName: string;
    platformVersion: string;
    automationName: 'UIAutomator2' | 'XCUITest';
    app: string;
    build: string;
    name?: string;
    isRealMobile: boolean;
    network?: boolean;
    video?: boolean;
    visual?: boolean;
    console?: boolean;
    devicelog?: boolean;
    autoGrantPermissions?: boolean;
    autoAcceptAlerts?: boolean;
    newCommandTimeout?: number;
    idleTimeout?: number;
  };
}

// ── Test Data ─────────────────────────────────────────────────────────────────

export interface UserCredentials {
  username: string;
  password: string;
}

export interface TestUser {
  valid: UserCredentials;
  invalid: UserCredentials;
}
