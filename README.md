# Mobile Test Automation Framework

WebdriverIO + Appium + XCUITest + UIAutomator2 + Allure — TypeScript

---

## Table of Contents
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [App Preparation (Firebase → TestMu)](#app-preparation)
- [Project Structure](#project-structure)
- [Page Object Model](#page-object-model)
- [Azure DevOps CI](#azure-devops-ci)
- [Adding New Tests](#adding-new-tests)

---

## Architecture

```
Firebase App Distribution
        │  (service account download)
        ▼
   apps/android/   apps/ios/
        │  (upload via REST API)
        ▼
  TestMu (LambdaTest) App Center
        │  (lt:// app URL in capabilities)
        ▼
   WDIO + Appium Hub ──► Real Device / Emulator / Simulator
        │
        ▼
  Allure Report  ◄──  Azure DevOps Artifact
```

**Execution modes:**

| Mode | Config | Where tests run |
|------|--------|-----------------|
| `test:android:local` | `wdio.android.local.conf.ts` | Local emulator or real Android device |
| `test:ios:local` | `wdio.ios.local.conf.ts` | Local iOS simulator or real iPhone |
| `test:android:testmu` | `wdio.testmu.android.conf.ts` | TestMu (LambdaTest) real Android device |
| `test:ios:testmu` | `wdio.testmu.ios.conf.ts` | TestMu (LambdaTest) real iOS device |

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | `nvm use 20` recommended |
| Appium | 2.x | `npm install -g appium` |
| appium-uiautomator2-driver | latest | `appium driver install uiautomator2` |
| appium-xcuitest-driver | latest | `appium driver install xcuitest` |
| Xcode | ≥ 15 | macOS only, required for iOS local |
| Android SDK / `adb` | latest | Required for Android local |
| Java (JDK 11+) | 11+ | Required for UIAutomator2 |
| allure-commandline | 2.x | `npm install -g allure-commandline` |

---

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd WDIO-demo
npm ci
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials and device settings
```

### 3. Install Appium Drivers

```bash
npm run appium:install:drivers
# or manually:
appium driver install xcuitest
appium driver install uiautomator2
```

### 4. Firebase Service Account

Place your GCP service account JSON at `service-account.json` (path is configurable via `FIREBASE_SERVICE_ACCOUNT_PATH`).

The account needs the **Firebase App Distribution Viewer** or higher role.

### 5. Azure DevOps Variable Group

Create a variable group named **`mobile-test-secrets`** in your Azure DevOps project with these secrets:

| Variable | Description |
|----------|-------------|
| `LT_USERNAME` | TestMu username |
| `LT_ACCESS_KEY` | TestMu access key |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_APP_ID_ANDROID` | Firebase Android app ID |
| `FIREBASE_APP_ID_IOS` | Firebase iOS app ID |
| `TESTMU_ANDROID_DEVICE` | e.g. `Pixel 8` |
| `TESTMU_ANDROID_VERSION` | e.g. `14` |
| `TESTMU_IOS_DEVICE` | e.g. `iPhone 15` |
| `TESTMU_IOS_VERSION` | e.g. `17` |
| `TEST_USERNAME` | App login username |
| `TEST_PASSWORD` | App login password |

Upload `firebase-service-account.json` as a **Secure File** in Azure DevOps Pipelines → Library → Secure Files.

---

## Running Tests

### Local (Emulator / Simulator / Real Device)

```bash
# Start emulator manually, then:
npm run test:android:local

# Or for iOS simulator:
npm run test:ios:local
```

### TestMu Cloud (from local machine)

```bash
# Ensure LT_USERNAME, LT_ACCESS_KEY, and TESTMU_APP_URL_* are set in .env
npm run test:android:testmu
npm run test:ios:testmu
```

### Full CI Flow (download + upload + test)

```bash
# Android
npm run ci:android

# iOS
npm run ci:ios
```

### Allure Report

```bash
# After tests complete:
npm run allure:report
```

---

## App Preparation

### Step-by-step

```bash
# 1. Download latest release from Firebase
npm run download:firebase:android
npm run download:firebase:ios

# 2. Upload to TestMu App Center
npm run upload:testmu:android
npm run upload:testmu:ios

# Or run both together:
npm run prepare:apps -- --platform both
```

The upload scripts output the `lt://` app URLs and write them to `.testmu-app-url-android` / `.testmu-app-url-ios`. Add these to your `.env` as `TESTMU_APP_URL_ANDROID` / `TESTMU_APP_URL_IOS`.

---

## Project Structure

```
WDIO-demo/
├── .azure/
│   └── azure-pipelines.yml       # Azure DevOps multi-stage pipeline
├── config/
│   ├── wdio.base.conf.ts         # Shared reporters, hooks, timeouts
│   ├── wdio.android.local.conf.ts
│   ├── wdio.ios.local.conf.ts
│   ├── wdio.testmu.android.conf.ts
│   └── wdio.testmu.ios.conf.ts
├── scripts/
│   ├── downloadFromFirebase.ts   # Download APK/IPA from Firebase
│   ├── uploadToTestMu.ts         # Upload to TestMu App Center
│   └── prepareApps.ts            # Orchestrates both steps
├── src/
│   ├── helpers/
│   │   ├── AlertHelper.ts        # Native alert & permission dialogs
│   │   ├── GestureHelper.ts      # Swipe, scroll, long-press, pinch
│   │   └── WaitHelper.ts         # Polling waits and condition helpers
│   ├── pages/
│   │   ├── BasePage.ts           # Abstract POM base class
│   │   ├── LoginPage.ts          # Login screen POM
│   │   └── HomePage.ts           # Home screen POM
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── utils/
│       ├── envConfig.ts          # Typed environment variables
│       ├── FirebaseClient.ts     # Firebase App Distribution API client
│       ├── logger.ts             # Winston logger
│       └── TestMuClient.ts       # TestMu upload REST client
├── tests/
│   ├── fixtures/
│   │   └── testData.ts           # Shared test data
│   └── specs/
│       ├── android/              # Android-only tests
│       ├── ios/                  # iOS-only tests
│       └── shared/               # Cross-platform tests (run on both)
├── apps/                         # Downloaded binaries (gitignored)
├── allure-results/               # Raw Allure data (gitignored)
├── allure-report/                # Generated HTML report (gitignored)
├── logs/                         # Winston log files (gitignored)
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Page Object Model

All page objects extend `BasePage`:

```typescript
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  // Platform-aware selectors
  private get myButton(): WebdriverIO.Element {
    return this.el('~android_id', '~ios_id');
  }

  // Must implement
  async waitForPageLoad(): Promise<void> {
    await this.waitForDisplayed(this.myButton);
  }

  // Actions
  async tapButton(): Promise<void> {
    await this.tap(this.myButton);
  }
}

export const myPage = new MyPage();
```

**BasePage utilities:**

| Method | Description |
|--------|-------------|
| `el(androidSel, iosSel)` | Returns the platform-appropriate element |
| `byAccessibilityId(id)` | Shorthand for `~id` |
| `byAndroidUISelector(sel)` | UIAutomator2 selector |
| `byIOSPredicate(pred)` | NSPredicate string |
| `byIOSClassChain(chain)` | XCUITest class chain |
| `tap(el)` | Wait for display, then click |
| `typeText(el, text)` | Clear + type |
| `waitForDisplayed(el)` | Wait with configurable timeout |
| `hideKeyboard()` | Platform-aware keyboard dismissal |
| `pressBack()` | Android back key |
| `isDisplayed(el)` | Safe check (never throws) |

---

## Azure DevOps CI

The pipeline (`.azure/azure-pipelines.yml`) runs these stages:

```
Setup ──► PrepareApps ──► TestAndroid ──┐
                     └──► TestiOS      ├──► Report
```

- **Triggers**: PRs and pushes to `main`/`develop`, plus manual runs
- **Parameters**: `platform` (android/ios/both), `suite`, `skipAppPrep`
- **Artifacts**: Allure HTML report published as pipeline artifact
- **Secrets**: Stored in the `mobile-test-secrets` variable group

---

## Adding New Tests

1. **New Page Object** — Create `src/pages/YourPage.ts` extending `BasePage`
2. **Shared test** — Add spec to `tests/specs/shared/` (runs on both platforms)
3. **Platform-specific** — Add to `tests/specs/android/` or `tests/specs/ios/`
4. **Allure labels** — Use `allureReporter.addFeature()`, `addSeverity()`, `addTag()` in `beforeEach`

```bash
# Run only your new test locally
WDIO_SPEC=tests/specs/shared/yourtest.spec.ts npm run test:android:local
```
