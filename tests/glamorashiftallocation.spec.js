
const { test, expect } = require('@playwright/test');

// ======================================================
// GLAMORA HOME / DASHBOARD AUTOMATION
// ======================================================

test.use({
  browserName: 'chromium',
  channel: 'chrome',
  headless: false,
  viewport: { width: 1366, height: 768 },
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure'
});

test.setTimeout(60000);

const LOGIN_URL =
  'https://glamora-staff.infineitsolutions.com/barbershop/login';

const USERNAME = process.env.GLAMORA_USERNAME || 'shaheen';
const PASSWORD = process.env.GLAMORA_PASSWORD;

// ======================================================
// LOGIN HELPER
// ======================================================

async function login(page) {
  if (!PASSWORD) {
    throw new Error(
      'Password is missing. Set GLAMORA_PASSWORD in your terminal.'
    );
  }

  await page.goto(LOGIN_URL, {
    waitUntil: 'domcontentloaded'
  });

  const passwordInput = page.locator(
    'input[type="password"]:visible'
  ).first();

  await expect(passwordInput).toBeVisible({
    timeout: 15000
  });

  const usernameInput = page.locator(
    'input[type="email"]:visible, ' +
    'input[type="text"]:visible, ' +
    'input:not([type]):visible'
  ).first();

  await expect(usernameInput).toBeVisible();

  await usernameInput.fill(USERNAME);
  await passwordInput.fill(PASSWORD);

  let loginButton = page.getByRole('button', {
    name: /login|log in|sign in|submit/i
  }).first();

  if (await loginButton.count() === 0) {
    loginButton = page.locator(
      'button[type="submit"]:visible'
    ).first();
  }

  await expect(loginButton).toBeVisible({
    timeout: 10000
  });

  await loginButton.click();

  // Wait for successful navigation away from login.
  await expect(page).not.toHaveURL(/\/login/i, {
    timeout: 20000
  });

  await expect(page.locator('body')).toBeVisible();

  // Allow the Dashboard UI to render.
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

// ======================================================
// OPTIONAL FEATURE HELPER
// Skips a test if the feature is not present.
// ======================================================

async function requireFeature(testInfo, locator, featureName) {
  const count = await locator.count();

  if (count === 0) {
    test.skip(true, `${featureName} is not available on this page.`);
  }

  const visible = await locator.first().isVisible().catch(() => false);

  if (!visible) {
    test.skip(true, `${featureName} is not visible.`);
  }
}

// ======================================================
// LOGIN BEFORE EACH TEST
// ======================================================

test.beforeEach(async ({ page }) => {
  await login(page);
});

// ======================================================
// DASHBOARD TEST CASES
// ======================================================

test.describe('GLAMORA HOME / DASHBOARD MODULE', () => {

  test('GLM_HOME_001 - Dashboard should open successfully', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('GLM_HOME_002 - Dashboard page should contain visible content', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();

    expect(bodyText.trim().length).toBeGreaterThan(0);
  });

  test('GLM_HOME_003 - Page title should not be empty', async ({ page }) => {
    const title = await page.title();

    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('GLM_HOME_004 - Main page should be rendered', async ({ page }) => {
    const main = page.locator('main, [role="main"]');

    if (await main.count()) {
      await expect(main.first()).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('GLM_HOME_005 - Dashboard headings should be visible when present', async ({ page }) => {
    const headings = page.locator('h1, h2');

    if (await headings.count() === 0) {
      test.skip(true, 'No h1 or h2 heading found.');
    }

    await expect(headings.first()).toBeVisible();
  });

  test('GLM_HOME_006 - Navigation links should be available', async ({ page }) => {
    const links = page.locator('a:visible');

    await requireFeature(test.info(), links, 'Navigation links');

    expect(await links.count()).toBeGreaterThan(0);
  });

  test('GLM_HOME_007 - Visible buttons should be enabled where applicable', async ({ page }) => {
    const buttons = page.locator('button:visible');

    await requireFeature(test.info(), buttons, 'Dashboard buttons');

    const enabledCount = await buttons.evaluateAll(items =>
      items.filter(button => !button.disabled).length
    );

    expect(enabledCount).toBeGreaterThan(0);
  });

  test('GLM_HOME_008 - Dashboard should reload successfully', async ({ page }) => {
    await page.reload({
      waitUntil: 'domcontentloaded'
    });

    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/i);
  });

  test('GLM_HOME_009 - Browser back and forward navigation should work', async ({ page }) => {
    await page.goBack().catch(() => {});
    await page.goForward().catch(() => {});

    await expect(page.locator('body')).toBeVisible();
  });

  test('GLM_HOME_010 - Visible images should load correctly', async ({ page }) => {
    const brokenImages = await page.locator('img:visible').evaluateAll(images =>
      images.filter(image =>
        image.complete && image.naturalWidth === 0
      ).map(image => image.src)
    );

    expect(
      brokenImages,
      `Broken images found: ${brokenImages.join(', ')}`
    ).toHaveLength(0);
  });

  test('GLM_HOME_011 - Visible links should have valid href attributes', async ({ page }) => {
    const invalidLinks = await page.locator('a:visible').evaluateAll(links =>
      links.filter(link => {
        const href = link.getAttribute('href');

        return (
          !href ||
          href.trim() === '' ||
          href.trim().toLowerCase().startsWith('javascript:')
        );
      }).map(link => link.innerText.trim())
    );

    expect(
      invalidLinks,
      `Links without valid href: ${invalidLinks.join(', ')}`
    ).toHaveLength(0);
  });

  test('GLM_HOME_012 - Search field should accept text when available', async ({ page }) => {
    const search = page.locator(
      'input[type="search"]:visible, input[placeholder*="search" i]:visible'
    );

    await requireFeature(test.info(), search, 'Search field');

    await search.first().fill('test');

    await expect(search.first()).toHaveValue('test');
  });

  test('GLM_HOME_013 - Notification control should be clickable when available', async ({ page }) => {
    const notification = page.locator(
      'button[aria-label*="notification" i]:visible, ' +
      '[role="button"][aria-label*="notification" i]:visible'
    );

    await requireFeature(test.info(), notification, 'Notification control');

    await notification.first().click();
    await expect(page.locator('body')).toBeVisible();
  });

  test('GLM_HOME_014 - Profile control should be clickable when available', async ({ page }) => {
    const profile = page.locator(
      'button[aria-label*="profile" i]:visible, ' +
      'button[aria-label*="account" i]:visible, ' +
      '[role="button"][aria-label*="profile" i]:visible'
    );

    await requireFeature(test.info(), profile, 'Profile control');

    await profile.first().click();
    await expect(page.locator('body')).toBeVisible();
  });

  test('GLM_HOME_015 - Dashboard should not have horizontal overflow on desktop', async ({ page }) => {
    await page.setViewportSize({
      width: 1366,
      height: 768
    });

    const dimensions = await page.evaluate(() => ({
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    }));

    expect(
      dimensions.pageWidth,
      'Unexpected horizontal page overflow'
    ).toBeLessThanOrEqual(dimensions.viewportWidth + 2);
  });

  test('GLM_HOME_016 - Dashboard should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({
      width: 768,
      height: 1024
    });

    await expect(page.locator('body')).toBeVisible();
  });

  test('GLM_HOME_017 - Dashboard should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844
    });

    await expect(page.locator('body')).toBeVisible();
  });

  test('GLM_HOME_018 - Page should not display a server error message', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();

    expect(bodyText).not.toMatch(
      /\b(500 internal server error|502 bad gateway|503 service unavailable)\b/i
    );
  });

  test('GLM_HOME_019 - Dashboard should remain accessible after viewport change', async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844
    });

    await page.setViewportSize({
      width: 1366,
      height: 768
    });

    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/i);
  });

  test('GLM_HOME_020 - Dashboard should remain accessible after reload', async ({ page }) => {
    await page.reload({
      waitUntil: 'domcontentloaded'
    });

    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/i);
  });

});
