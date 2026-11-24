
import 'dotenv/config';
import { test, expect } from '@playwright/test';

const LOGIN_URL =
  'https://glamora-staff.infineitsolutions.com/barbershop/login';

const SHIFT_URL =
  'https://glamora-staff.infineitsolutions.com/shifts';

const username = process.env.GLAMORA_USERNAME;
const password = process.env.GLAMORA_PASSWORD;

const uniqueName = (prefix = 'PW_Shift') =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// ---------------- LOGIN ----------------

async function login(page) {
  if (!username || !password) {
    throw new Error(
      'Add GLAMORA_USERNAME and GLAMORA_PASSWORD to your .env file.'
    );
  }

  await page.goto(LOGIN_URL);

  await page.getByPlaceholder(/username/i).fill(username);
  await page.getByPlaceholder(/password/i).fill(password);

  await page.getByRole('button', {
    name: /sign in as admin/i
  }).click();

  await expect(page).not.toHaveURL(/login/i, {
    timeout: 20000
  });
}

// ---------------- OPEN SHIFT TIMINGS ----------------

async function openShiftTimings(page) {
  await page.goto(SHIFT_URL);

  await expect(
    page.getByRole('heading', { name: /shift timings/i })
  ).toBeVisible({ timeout: 20000 });

  await expect(
    page.getByText(/saved templates/i)
  ).toBeVisible();
}

// ---------------- FORM LOCATORS ----------------

function shiftNameInput(page) {
  return page.getByPlaceholder(/e\.g\./i);
}

function timeInputs(page) {
  return page.locator('input[type="time"]');
}

function saveButton(page) {
  return page.getByRole('button', { name: /save shift/i });
}

async function selectContinuous(page) {
  await page.getByRole('button', {
    name: /^continuous$/i
  }).click();
}

async function selectSplit(page) {
  await page.getByRole('button', {
    name: /^split shift$/i
  }).click();
}

async function fillContinuous(page, name, start, end) {
  await selectContinuous(page);

  await shiftNameInput(page).fill(name);

  await timeInputs(page).nth(0).fill(start);
  await timeInputs(page).nth(1).fill(end);
}

async function fillSplit(page, name, start1, end1, start2, end2) {
  await selectSplit(page);

  await shiftNameInput(page).fill(name);

  await timeInputs(page).nth(0).fill(start1);
  await timeInputs(page).nth(1).fill(end1);
  await timeInputs(page).nth(2).fill(start2);
  await timeInputs(page).nth(3).fill(end2);
}

async function saveShift(page) {
  await saveButton(page).click();
}

async function expectValidationMessage(page) {
  await expect(
    page.getByText(/required|invalid|overlap|must be|enter|select/i).first()
  ).toBeVisible({ timeout: 5000 });
}

async function expectShiftSaved(page, name) {
  await expect(
    page.getByText(name, { exact: true }).last()
  ).toBeVisible({ timeout: 10000 });
}

// ---------------- TEST SUITE ----------------

test.describe('GLAMORA - SHIFT TIMINGS MODULE', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await openShiftTimings(page);
  });

  // =================================================
  // POSITIVE TEST CASES
  // =================================================

  test('TC01 - Verify Shift Timings page loads', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /shift timings/i })
    ).toBeVisible();

    await expect(
      page.getByText(/add shift timing/i)
    ).toBeVisible();

    await expect(
      page.getByText(/saved templates/i)
    ).toBeVisible();
  });

  test('TC02 - Verify all quick presets', async ({ page }) => {
    for (const preset of [
      'Morning',
      'Afternoon',
      'Evening',
      'Full day',
      'Split day'
    ]) {
      await expect(
        page.getByRole('button', { name: preset, exact: true })
      ).toBeVisible();
    }
  });

  test('TC03 - Verify Continuous mode', async ({ page }) => {
    await selectContinuous();

    await expect(timeInputs(page)).toHaveCount(2);
  });

  test('TC04 - Verify Split shift mode', async ({ page }) => {
    await selectSplit(page);

    await expect(timeInputs(page)).toHaveCount(4);

    await expect(
      page.getByText(/part 1/i)
    ).toBeVisible();

    await expect(
      page.getByText(/part 2/i)
    ).toBeVisible();
  });

  test('TC05 - Create a valid continuous shift', async ({ page }) => {
    const name = uniqueName('Morning');

    await fillContinuous(page, name, '09:00', '13:00');
    await saveShift(page);

    await expectShiftSaved(page, name);
  });

  test('TC06 - Create an afternoon shift', async ({ page }) => {
    const name = uniqueName('Afternoon');

    await fillContinuous(page, name, '13:00', '18:00');
    await saveShift(page);

    await expectShiftSaved(page, name);
  });

  test('TC07 - Create an evening shift', async ({ page }) => {
    const name = uniqueName('Evening');

    await fillContinuous(page, name, '18:00', '22:00');
    await saveShift(page);

    await expectShiftSaved(page, name);
  });

  test('TC08 - Create a full-day shift', async ({ page }) => {
    const name = uniqueName('FullDay');

    await fillContinuous(page, name, '09:00', '18:00');
    await saveShift(page);

    await expectShiftSaved(page, name);
  });

  test('TC09 - Create a valid split shift', async ({ page }) => {
    const name = uniqueName('Split');

    await fillSplit(
      page,
      name,
      '09:00',
      '13:00',
      '16:00',
      '21:00'
    );

    await saveShift(page);

    await expectShiftSaved(page, `${name} - Part 1`);
    await expectShiftSaved(page, `${name} - Part 2`);
  });

  test('TC10 - Verify Morning preset fills the form', async ({ page }) => {
    await page.getByRole('button', {
      name: 'Morning',
      exact: true
    }).click();

    await expect(shiftNameInput(page)).not.toHaveValue('');
    await expect(timeInputs(page).nth(0)).not.toHaveValue('');
    await expect(timeInputs(page).nth(1)).not.toHaveValue('');
  });

  test('TC11 - Verify Afternoon preset fills the form', async ({ page }) => {
    await page.getByRole('button', {
      name: 'Afternoon',
      exact: true
    }).click();

    await expect(shiftNameInput(page)).not.toHaveValue('');
    await expect(timeInputs(page).nth(0)).not.toHaveValue('');
    await expect(timeInputs(page).nth(1)).not.toHaveValue('');
  });

  test('TC12 - Verify Evening preset fills the form', async ({ page }) => {
    await page.getByRole('button', {
      name: 'Evening',
      exact: true
    }).click();

    await expect(shiftNameInput(page)).not.toHaveValue('');
  });

  test('TC13 - Verify Full day preset fills the form', async ({ page }) => {
    await page.getByRole('button', {
      name: 'Full day',
      exact: true
    }).click();

    await expect(shiftNameInput(page)).not.toHaveValue('');
  });

  test('TC14 - Verify Split day preset selects split mode', async ({ page }) => {
    await page.getByRole('button', {
      name: 'Split day',
      exact: true
    }).click();

    await expect(timeInputs(page)).toHaveCount(4);
  });

  test('TC15 - Save an inactive shift', async ({ page }) => {
    const name = uniqueName('Inactive');

    await fillContinuous(page, name, '10:00', '15:00');

    const activeCheckbox = page.getByRole('checkbox', {
      name: /active/i
    });

    await activeCheckbox.uncheck();

    await saveShift(page);

    await expectShiftSaved(page, name);
  });

  test('TC16 - Verify saved templates remain after refresh', async ({ page }) => {
    const name = uniqueName('Refresh');

    await fillContinuous(page, name, '08:00', '12:00');
    await saveShift(page);

    await expectShiftSaved(page, name);

    await page.reload();

    await expectShiftSaved(page, name);
  });

  test('TC17 - Verify Edit control is available', async ({ page }) => {
    const name = uniqueName('Edit');

    await fillContinuous(page, name, '09:00', '14:00');
    await saveShift(page);

    await expectShiftSaved(page, name);

    await expect(
      page.getByRole('button', { name: /^edit$/i }).last()
    ).toBeVisible();
  });

  test('TC18 - Open edit form for a saved shift', async ({ page }) => {
    const name = uniqueName('EditOpen');

    await fillContinuous(page, name, '09:00', '14:00');
    await saveShift(page);

    await expectShiftSaved(page, name);

    await page.getByRole('button', {
      name: /^edit$/i
    }).last().click();

    await expect(shiftNameInput(page)).toHaveValue(name);
    await expect(timeInputs(page).nth(0)).toHaveValue('09:00');
    await expect(timeInputs(page).nth(1)).toHaveValue('14:00');
  });

  test('TC19 - Verify Deactivate control is available', async ({ page }) => {
    const name = uniqueName('Deactivate');

    await fillContinuous(page, name, '10:00', '16:00');
    await saveShift(page);

    await expectShiftSaved(page, name);

    await expect(
      page.getByRole('button', {
        name: /^deactivate$/i
      }).last()
    ).toBeVisible();
  });

  test('TC20 - Verify Allocate navigation is available', async ({ page }) => {
    await expect(
      page.getByText('Allocate', { exact: true })
    ).toBeVisible();
  });

  // =================================================
  // NEGATIVE TEST CASES
  // =================================================

  test('TC21 - Do not save shift with blank name', async ({ page }) => {
    await fillContinuous(page, '', '09:00', '13:00');
    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC22 - Do not save shift with blank start time', async ({ page }) => {
    const name = uniqueName('BlankStart');

    await fillContinuous(page, name, '', '13:00');
    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC23 - Do not save shift with blank end time', async ({ page }) => {
    const name = uniqueName('BlankEnd');

    await fillContinuous(page, name, '09:00', '');
    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC24 - Do not save shift when all fields are blank', async ({ page }) => {
    await shiftNameInput(page).fill('');
    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC25 - Reject end time earlier than start time', async ({ page }) => {
    const name = uniqueName('InvalidTime');

    await fillContinuous(page, name, '18:00', '09:00');
    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC26 - Reject same start and end time', async ({ page }) => {
    const name = uniqueName('SameTime');

    await fillContinuous(page, name, '09:00', '09:00');
    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC27 - Reject split shift with blank Part 1 start', async ({ page }) => {
    const name = uniqueName('SplitBlank1');

    await fillSplit(
      page,
      name,
      '',
      '13:00',
      '16:00',
      '21:00'
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC28 - Reject split shift with blank Part 1 end', async ({ page }) => {
    const name = uniqueName('SplitBlank2');

    await fillSplit(
      page,
      name,
      '09:00',
      '',
      '16:00',
      '21:00'
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC29 - Reject split shift with blank Part 2 start', async ({ page }) => {
    const name = uniqueName('SplitBlank3');

    await fillSplit(
      page,
      name,
      '09:00',
      '13:00',
      '',
      '21:00'
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC30 - Reject split shift with blank Part 2 end', async ({ page }) => {
    const name = uniqueName('SplitBlank4');

    await fillSplit(
      page,
      name,
      '09:00',
      '13:00',
      '16:00',
      ''
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC31 - Reject overlapping split shift periods', async ({ page }) => {
    const name = uniqueName('Overlap');

    await fillSplit(
      page,
      name,
      '09:00',
      '15:00',
      '13:00',
      '18:00'
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC32 - Reject split Part 2 before Part 1 ends', async ({ page }) => {
    const name = uniqueName('SplitOrder');

    await fillSplit(
      page,
      name,
      '09:00',
      '13:00',
      '10:00',
      '18:00'
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC33 - Reject split Part 1 with invalid time order', async ({ page }) => {
    const name = uniqueName('SplitInvalid1');

    await fillSplit(
      page,
      name,
      '13:00',
      '09:00',
      '16:00',
      '21:00'
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC34 - Reject split Part 2 with invalid time order', async ({ page }) => {
    const name = uniqueName('SplitInvalid2');

    await fillSplit(
      page,
      name,
      '09:00',
      '13:00',
      '21:00',
      '16:00'
    );

    await saveShift(page);

    await expectValidationMessage(page);
  });

  test('TC35 - Verify switching from Split to Continuous mode', async ({ page }) => {
    await selectSplit(page);
    await expect(timeInputs(page)).toHaveCount(4);

    await selectContinuous(page);
    await expect(timeInputs(page)).toHaveCount(2);
  });

  test('TC36 - Verify switching from Continuous to Split mode', async ({ page }) => {
    await selectContinuous(page);
    await expect(timeInputs(page)).toHaveCount(2);

    await selectSplit(page);
    await expect(timeInputs(page)).toHaveCount(4);
  });

  test('TC37 - Verify page does not crash after repeated refresh', async ({ page }) => {
    await page.reload();

    await expect(
      page.getByRole('heading', { name: /shift timings/i })
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByText(/saved templates/i)
    ).toBeVisible();
  });

  test('TC38 - Verify shift form remains usable after invalid submission', async ({ page }) => {
    await fillContinuous(page, '', '09:00', '13:00');
    await saveShift(page);

    await expectValidationMessage(page);

    const name = uniqueName('AfterError');

    await fillContinuous(page, name, '09:00', '13:00');
    await saveShift(page);

    await expectShiftSaved(page, name);
  });

});
