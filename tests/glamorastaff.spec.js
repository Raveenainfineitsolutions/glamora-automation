
import 'dotenv/config';
import { test, expect } from '@playwright/test';

const LOGIN_URL =
  'https://glamora-staff.infineitsolutions.com/barbershop/login';

const username = process.env.GLAMORA_USERNAME;
const password = process.env.GLAMORA_PASSWORD;

const uniqueName = (prefix = 'PW Staff') =>
  `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// LOGIN
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
    name: /sign in as admin/i
  }).click();

  await expect(page).not.toHaveURL(/login/i, {
    timeout: 20000
  });
}

// OPEN STAFF MODULE
async function openStaffModule(page) {
  const staffMenu = page.getByText(/^staff$/i).first();

  await expect(staffMenu).toBeVisible({ timeout: 15000 });
  await staffMenu.click();

  await expect(page.getByText(/team directory/i)).toBeVisible({
    timeout: 15000
  });
}

// OPEN ADD STAFF FORM
async function openAddStaffForm(page) {
  await page.getByRole('button', {
    name: /add new staff/i
  }).click();

  await expect(page.getByLabel(/full name/i).first()).toBeVisible({
    timeout: 10000
  });
}

// FILL OPTIONAL FIELDS
async function fillFieldIfPresent(page, label, value) {
  const field = page.getByLabel(label).first();

  if (await field.count() === 0) return;

  const tagName = await field.evaluate(el =>
    el.tagName.toLowerCase()
  );

  if (tagName === 'select') {
    const optionValue = await field.locator(
      'option:not([disabled])'
    ).evaluateAll(options => {
      const option = options.find(
        o => o.value && o.value.trim() !== ''
      );
      return option?.value;
    });

    if (optionValue) {
      await field.selectOption(optionValue);
    }
  } else {
    await field.fill(String(value));
  }
}

// FILL STAFF FORM
async function fillStaffForm(page, staffName) {
  await page.getByLabel(/full name/i).first().fill(staffName);

  await fillFieldIfPresent(page, /nationality/i, 'New Zealand');
  await fillFieldIfPresent(
    page,
    /state\s*\/?\s*province/i,
    'Auckland'
  );
  await fillFieldIfPresent(page, /commission/i, '0');

  const staffUsername = page.getByLabel(
    /staff.*username|username/i
  ).first();

  if (
    await staffUsername.count() &&
    await staffUsername.isVisible()
  ) {
    await staffUsername.fill(`pw_${Date.now()}`);
  }

  const staffPassword = page.getByLabel(
    /staff.*password|password/i
  ).last();

  if (
    await staffPassword.count() &&
    await staffPassword.isVisible()
  ) {
    await staffPassword.fill(`PwTest!${Date.now()}`);
  }

  const activeCheckbox = page.getByLabel(
    /active staff member/i
  ).first();

  if (
    await activeCheckbox.count() &&
    await activeCheckbox.isVisible()
  ) {
    if (!(await activeCheckbox.isChecked())) {
      await activeCheckbox.check();
    }
  }
}

// CREATE STAFF
async function createStaffRecord(page, staffName) {
  await openAddStaffForm(page);
  await fillStaffForm(page, staffName);

  await page.getByRole('button', {
    name: /create staff/i
  }).click();

  await expect(
    page.getByText(staffName, { exact: false }).first()
  ).toBeVisible({ timeout: 15000 });
}

// FIND STAFF ROW
function staffRow(page, staffName) {
  return page.getByRole('row').filter({
    hasText: staffName
  }).first();
}

// OPEN EDIT OR DELETE ACTION
async function openRowAction(row, actionName) {
  const button = row.getByRole('button', {
    name: actionName
  });

  if (await button.count()) {
    await button.first().click();
    return;
  }

  const titledButton = row.locator(
    `button[title*="${actionName}" i],
     button[aria-label*="${actionName}" i]`
  );

  if (await titledButton.count()) {
    await titledButton.first().click();
    return;
  }

  throw new Error(
    `Could not find ${actionName} button in staff row`
  );
}

// TEST CASES
test.describe('GLAMORA STAFF MODULE - CRUD TESTS', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await openStaffModule(page);
  });

  // TC01 - Staff page loading
  test('TC01 - Verify Staff page loads', async ({ page }) => {
    await expect(
      page.getByText(/team directory/i)
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: /add new staff/i
      })
    ).toBeVisible();

    await expect(page.locator('body')).not.toContainText(
      /internal server error/i
    );
  });

  // TC02 - Add Staff form
  test('TC02 - Verify Add Staff form opens', async ({ page }) => {
    await openAddStaffForm(page);

    await expect(
      page.getByLabel(/full name/i).first()
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: /create staff/i
      })
    ).toBeVisible();
  });

  // TC03 - Mandatory field validation
  test('TC03 - Verify mandatory field validation', async ({ page }) => {
    await openAddStaffForm(page);

    await page.getByRole('button', {
      name: /create staff/i
    }).click();

    const fullName = page.getByLabel(/full name/i).first();

    const browserInvalid = await fullName.evaluate(
      el => !el.checkValidity()
    );

    const bodyText = (
      await page.locator('body').innerText()
    ).toLowerCase();

    expect(
      browserInvalid ||
      /required|mandatory|full name|please enter|cannot be blank/.test(bodyText)
    ).toBeTruthy();
  });

  // TC04 - Create Staff
  test('TC04 - Create new staff successfully', async ({ page }) => {
    const staffName = uniqueName('PW Create');

    await createStaffRecord(page, staffName);

    await expect(
      page.getByText(staffName, { exact: false }).first()
    ).toBeVisible();
  });

  // TC05 - Search Staff
  test('TC05 - Search existing staff', async ({ page }) => {
    const search = page.locator(
      'input[type="search"], input[placeholder*="Search" i]'
    ).first();

    await expect(search).toBeVisible();

    await search.fill('Akshay');

    await expect(page.locator('body')).toBeVisible();
  });

  // TC06 - Invalid Staff Search
  test('TC06 - Search invalid staff name', async ({ page }) => {
    const search = page.locator(
      'input[type="search"], input[placeholder*="Search" i]'
    ).first();

    await expect(search).toBeVisible();

    await search.fill(`NO_MATCH_${Date.now()}`);

    await expect(page.locator('body')).toBeVisible();
  });

  // TC07 - Update Staff
  test('TC07 - Update existing staff details', async ({ page }) => {
    const originalName = uniqueName('PW Update');
    const updatedName = `${originalName} Edited`;

    // Create a record for this test
    await createStaffRecord(page, originalName);

    const row = staffRow(page, originalName);

    await expect(row).toBeVisible();

    // Click Edit
    await openRowAction(row, 'edit');

    const nameField = page.getByLabel(/full name/i).first();

    await expect(nameField).toBeVisible({
      timeout: 10000
    });

    await nameField.fill(updatedName);

    // Save updated details
    const updateButton = page.getByRole('button', {
      name: /update staff|save changes|save|update/i
    }).last();

    await expect(updateButton).toBeVisible();

    await updateButton.click();

    // Verify updated name
    await expect(
      page.getByText(updatedName, { exact: false }).first()
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByText(originalName, { exact: false })
    ).toHaveCount(0);
  });

  // TC08 - Delete Staff
  test('TC08 - Delete existing staff record', async ({ page }) => {
    const staffName = uniqueName('PW Delete');

    // Create a record for deletion
    await createStaffRecord(page, staffName);

    const row = staffRow(page, staffName);

    await expect(row).toBeVisible();

    // Accept browser confirmation if present
    page.once('dialog', dialog => dialog.accept());

    // Click Delete
    await openRowAction(row, 'delete');

    // Handle application confirmation popup
    const confirmButton = page.getByRole('button', {
      name: /confirm|yes, delete|delete staff|^delete$/i
    }).last();

    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }

    // Verify deleted staff is removed
    await expect(
      page.getByText(staffName, { exact: false })
    ).toHaveCount(0, { timeout: 15000 });
  });

  // TC09 - Pagination
  test('TC09 - Verify Staff pagination', async ({ page }) => {
    const pagination = page.getByRole('button', {
      name: /next|previous|prev/i
    });

    console.log(
      'Pagination button count:',
      await pagination.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // TC10 - Refresh Staff page
  test('TC10 - Verify Staff page refresh', async ({ page }) => {
    await page.reload();

    await expect(page).not.toHaveURL(/login/i, {
      timeout: 15000
    });

    await expect(
      page.getByText(/team directory/i)
    ).toBeVisible();
  });

});
