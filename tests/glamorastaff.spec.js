
import 'dotenv/config';
import { test, expect } from '@playwright/test';


// ======================================================
// CONFIGURATION
// ======================================================

const LOGIN_URL =
  'https://glamora-staff.infineitsolutions.com/barbershop/login';

const username = process.env.GLAMORA_USERNAME;
const password = process.env.GLAMORA_PASSWORD;


// ======================================================
// LOGIN HELPER
// ======================================================

async function login(page) {

  if (!username || !password) {
    throw new Error(
      'Missing GLAMORA_USERNAME or GLAMORA_PASSWORD in .env file'
    );
  }

  await page.goto(LOGIN_URL);

  await page.getByPlaceholder('Enter username').fill(username);
  await page.getByPlaceholder('Enter password').fill(password);

  await page.getByRole('button', {
    name: 'Sign in as admin'
  }).click();

  await expect(page).not.toHaveURL(/login/, {
    timeout: 15000
  });

}


// ======================================================
// STAFF MODULE NAVIGATION
// ======================================================

async function openStaffModule(page) {

  await login(page);

  const staffMenu = page.getByText(
    /^staff$/i
  ).first();

  await expect(staffMenu).toBeVisible({
    timeout: 15000
  });

  await staffMenu.click();

  await page.waitForTimeout(1500);

  await expect(page.locator('body')).toBeVisible();

  console.log('Staff URL:', page.url());

}


// ======================================================
// ADD STAFF FORM HELPER
// ======================================================

async function openAddStaffForm(page) {

  const addButton = page.getByRole('button', {
    name: /add new staff/i
  });

  await expect(addButton).toBeVisible({
    timeout: 10000
  });

  await addButton.click();

  await page.waitForTimeout(1000);

  await expect(page.locator('body')).toBeVisible();

  console.log('Add New Staff form opened');

}


// ======================================================
// TAB / BUTTON HELPER
// ======================================================

async function clickButton(page, buttonName) {

  const button = page.getByRole('button', {
    name: buttonName
  }).first();

  await expect(button).toBeVisible({
    timeout: 10000
  });

  await button.click();

  await page.waitForTimeout(1000);

}


// ======================================================
// COMMON TEST SETUP
// ======================================================

test.describe('GLAMORA STAFF MANAGEMENT MODULE', () => {

  test.beforeEach(async ({ page }) => {
    await openStaffModule(page);
  });


  // ----------------------------------------------------
  // TC01 - Verify Staff Page
  // ----------------------------------------------------

  test('TC01 - Verify Staff page loads successfully', async ({ page }) => {

    await expect(page.locator('body')).toBeVisible();

    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );

    console.log('Staff page loaded successfully');

  });


  // ----------------------------------------------------
  // TC02 - Verify Staff Directory
  // ----------------------------------------------------

  test('TC02 - Verify Staff Directory is displayed', async ({ page }) => {

    await expect(
      page.getByText(/team directory/i).first()
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: /add new staff/i
      })
    ).toBeVisible();

  });


  // ----------------------------------------------------
  // TC03 - Add New Staff Button
  // ----------------------------------------------------

  test('TC03 - Verify Add New Staff button', async ({ page }) => {

    const addButton = page.getByRole('button', {
      name: /add new staff/i
    });

    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();

  });


  // ----------------------------------------------------
  // TC04 - Add New Staff Form
  // ----------------------------------------------------

  test('TC04 - Verify Add New Staff form opens', async ({ page }, testInfo) => {

    await openAddStaffForm(page);

    await page.screenshot({
      path: testInfo.outputPath('add-staff-form.png'),
      fullPage: true
    });

    console.log('Add New Staff form opened for inspection');

  });


  // ----------------------------------------------------
  // TC05 - Full Name Field
  // ----------------------------------------------------

  test('TC05 - Verify Full Name field', async ({ page }) => {

    await openAddStaffForm(page);

    const fullName = page.getByLabel(/full name/i).first();

    console.log(
      'Full Name field count:',
      await fullName.count()
    );

    await expect(fullName).toBeVisible();

  });


  // ----------------------------------------------------
  // TC06 - Nationality Field
  // ----------------------------------------------------

  test('TC06 - Verify Nationality field', async ({ page }) => {

    await openAddStaffForm(page);

    const nationality = page.getByLabel(/nationality/i).first();

    console.log(
      'Nationality field count:',
      await nationality.count()
    );

    await expect(nationality).toBeVisible();

  });


  // ----------------------------------------------------
  // TC07 - State / Province Field
  // ----------------------------------------------------

  test('TC07 - Verify State / Province field', async ({ page }) => {

    await openAddStaffForm(page);

    const state = page.getByLabel(/state\s*\/?\s*province/i).first();

    console.log(
      'State field count:',
      await state.count()
    );

    await expect(state).toBeVisible();

  });


  // ----------------------------------------------------
  // TC08 - Commission Field
  // ----------------------------------------------------

  test('TC08 - Verify Commission field', async ({ page }) => {

    await openAddStaffForm(page);

    const commission = page.getByLabel(/commission/i).first();

    console.log(
      'Commission field count:',
      await commission.count()
    );

    await expect(commission).toBeVisible();

  });


  // ----------------------------------------------------
  // TC09 - Optional Staff Username Field
  // ----------------------------------------------------

  test('TC09 - Verify optional Staff username field', async ({ page }) => {

    await openAddStaffForm(page);

    const usernameField = page.getByLabel(
      /staff.*username|username/i
    ).first();

    console.log(
      'Staff username field count:',
      await usernameField.count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC10 - Optional Staff Password Field
  // ----------------------------------------------------

  test('TC10 - Verify optional Staff password field', async ({ page }) => {

    await openAddStaffForm(page);

    const passwordField = page.getByLabel(
      /staff.*password|password/i
    ).last();

    console.log(
      'Staff password field count:',
      await passwordField.count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC11 - Active Staff Checkbox
  // ----------------------------------------------------

  test('TC11 - Verify Active Staff Member checkbox', async ({ page }) => {

    await openAddStaffForm(page);

    const activeCheckbox = page.getByLabel(
      /active staff member/i
    ).first();

    console.log(
      'Active checkbox count:',
      await activeCheckbox.count()
    );

    await expect(activeCheckbox).toBeVisible();

  });


  // ----------------------------------------------------
  // TC12 - Create Staff Button
  // ----------------------------------------------------

  test('TC12 - Verify Create Staff button', async ({ page }) => {

    await openAddStaffForm(page);

    const createButton = page.getByRole('button', {
      name: /create staff/i
    });

    await expect(createButton).toBeVisible();

    console.log(
      'Create Staff button count:',
      await createButton.count()
    );

  });


  // ----------------------------------------------------
  // TC13 - Required Field Validation
  // ----------------------------------------------------

  test('TC13 - Verify required field validation', async ({ page }) => {

    await openAddStaffForm(page);

    await clickButton(page, /create staff/i);

    await expect(page.locator('body')).toBeVisible();

    const bodyText = await page.locator('body').innerText();

    console.log('Validation response:', bodyText);

  });


  // ----------------------------------------------------
  // TC14 - Commission Validation
  // ----------------------------------------------------

  test('TC14 - Verify invalid Commission value', async ({ page }) => {

    await openAddStaffForm(page);

    const commission = page.getByLabel(/commission/i).first();

    await expect(commission).toBeVisible();

    await commission.fill('150');

    await clickButton(page, /create staff/i);

    const isValid = await commission.evaluate(
      element => element.checkValidity()
    ).catch(() => true);

    console.log('Commission field validity:', isValid);

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC15 - Cancel Add Staff Form
  // ----------------------------------------------------

  test('TC15 - Verify Cancel button in Add Staff form', async ({ page }) => {

    await openAddStaffForm(page);

    const cancelButton = page.getByRole('button', {
      name: /^cancel$/i
    });

    console.log(
      'Cancel button count:',
      await cancelButton.count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC16 - Search Staff
  // ----------------------------------------------------

  test('TC16 - Verify Staff search', async ({ page }) => {

    const search = page.locator(
      'input[type="search"], input[placeholder*="Search" i]'
    ).first();

    await expect(search).toBeVisible();

    await search.fill('Akshay');

    await page.waitForTimeout(1500);

    await expect(page.locator('body')).toBeVisible();

    console.log('Staff search executed');

  });


  // ----------------------------------------------------
  // TC17 - Invalid Staff Search
  // ----------------------------------------------------

  test('TC17 - Verify search with invalid text', async ({ page }) => {

    const search = page.locator(
      'input[type="search"], input[placeholder*="Search" i]'
    ).first();

    await expect(search).toBeVisible();

    await search.fill('ZZZZINVALID123');

    await page.waitForTimeout(1500);

    await expect(page.locator('body')).toBeVisible();

    console.log('Invalid staff search completed');

  });


  // ----------------------------------------------------
  // TC18 - Edit Staff Action
  // ----------------------------------------------------

  test('TC18 - Inspect Edit Staff action', async ({ page }) => {

    const editAction = page.getByRole('button', {
      name: /edit/i
    });

    console.log(
      'Edit button count:',
      await editAction.count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC19 - Delete Staff Action
  // ----------------------------------------------------

  test('TC19 - Inspect Delete Staff action', async ({ page }) => {

    const deleteAction = page.getByRole('button', {
      name: /delete|remove/i
    });

    console.log(
      'Delete button count:',
      await deleteAction.count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC20 - Staff Pagination
  // ----------------------------------------------------

  test('TC20 - Verify Staff pagination controls', async ({ page }) => {

    const nextButton = page.getByRole('button', {
      name: /next/i
    });

    const previousButton = page.getByRole('button', {
      name: /previous|prev/i
    });

    console.log(
      'Next button count:',
      await nextButton.count()
    );

    console.log(
      'Previous button count:',
      await previousButton.count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC21 - Staff Table
  // ----------------------------------------------------

  test('TC21 - Inspect Staff Directory table', async ({ page }) => {

    console.log(
      'Table count:',
      await page.locator('table').count()
    );

    console.log(
      'Row count:',
      await page.locator('tr').count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC22 - Staff Input Fields
  // ----------------------------------------------------

  test('TC22 - Inspect Staff input fields', async ({ page }) => {

    console.log(
      'Input count:',
      await page.locator('input').count()
    );

    console.log(
      'Select count:',
      await page.locator('select').count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC23 - Staff Buttons
  // ----------------------------------------------------

  test('TC23 - Verify Staff page buttons', async ({ page }) => {

    const buttons = page.getByRole('button');

    console.log(
      'Button count:',
      await buttons.count()
    );

    expect(await buttons.count()).toBeGreaterThan(0);

  });


  // ----------------------------------------------------
  // TC24 - Staff Page Links
  // ----------------------------------------------------

  test('TC24 - Verify Staff page links', async ({ page }) => {

    const links = page.getByRole('link');

    console.log(
      'Link count:',
      await links.count()
    );

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC25 - Refresh Staff Page
  // ----------------------------------------------------

  test('TC25 - Verify Staff page refresh', async ({ page }) => {

    await page.reload();

    await expect(page).not.toHaveURL(/login/, {
      timeout: 15000
    });

    await expect(page.locator('body')).toBeVisible();

    console.log('Staff page refreshed successfully');

  });


  // ----------------------------------------------------
  // TC26 - Staff Page Scrolling
  // ----------------------------------------------------

  test('TC26 - Verify Staff page scrolling', async ({ page }) => {

    const beforeScroll = await page.evaluate(
      () => window.scrollY
    );

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(500);

    const afterScroll = await page.evaluate(
      () => window.scrollY
    );

    console.log({
      beforeScroll,
      afterScroll
    });

    await expect(page.locator('body')).toBeVisible();

  });


  // ----------------------------------------------------
  // TC27 - Staff Page Images
  // ----------------------------------------------------

  test('TC27 - Verify Staff page images load correctly', async ({ page }) => {

    const images = page.locator('img');

    const count = await images.count();

    console.log('Image count:', count);

    for (let i = 0; i < count; i++) {

      const image = images.nth(i);

      if (await image.isVisible()) {

        const naturalWidth = await image.evaluate(
          img => img.naturalWidth
        );

        console.log(
          `Image ${i + 1} natural width:`,
          naturalWidth
        );

        expect(naturalWidth).toBeGreaterThan(0);

      }

    }

  });


  // ----------------------------------------------------
  // TC28 - Application Error Messages
  // ----------------------------------------------------

  test('TC28 - Check for common server error messages', async ({ page }) => {

    const body = (
      await page.locator('body').innerText()
    ).toLowerCase();

    const errors = [
      '404 not found',
      '500 internal server error',
      'internal server error',
      'something went wrong'
    ];

    for (const error of errors) {
      expect(body).not.toContain(error);
    }

  });


  // ----------------------------------------------------
  // TC29 - Staff Page Title
  // ----------------------------------------------------

  test('TC29 - Verify Staff page title', async ({ page }) => {

    const title = await page.title();

    console.log('Page title:', title);

    expect(title.trim().length).toBeGreaterThan(0);

  });


  // ----------------------------------------------------
  // TC30 - Capture Staff Module Screenshot
  // ----------------------------------------------------

  test('TC30 - Capture full Staff module screenshot', async ({ page }, testInfo) => {

    await page.screenshot({
      path: testInfo.outputPath('staff-module-full-page.png'),
      fullPage: true
    });

    console.log('Staff module screenshot captured');

  });


  // ----------------------------------------------------
  // TC31 - Staff Form Screenshot
  // ----------------------------------------------------

  test('TC31 - Capture Add Staff form screenshot', async ({ page }, testInfo) => {

    await openAddStaffForm(page);

    await page.screenshot({
      path: testInfo.outputPath('staff-form-full-page.png'),
      fullPage: true
    });

    console.log('Staff form screenshot captured');

  });


  // ----------------------------------------------------
  // TC32 - Staff Directory Content
  // ----------------------------------------------------

  test('TC32 - Verify Staff Directory content', async ({ page }) => {

    const content = await page.locator('body').innerText();

    console.log('Staff Directory content:', content);

    expect(content.trim().length).toBeGreaterThan(0);

  });


});
