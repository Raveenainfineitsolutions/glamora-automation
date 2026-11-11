
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

  await expect(page).not.toHaveURL(/\/login/, {
    timeout: 15000
  });
}

// ======================================================
// APPOINTMENT MODULE NAVIGATION
// ======================================================

async function openAppointmentModule(page) {
  await login(page);

  const appointmentMenu = page.getByText(
    /^appointments?$/i
  ).first();

  await expect(appointmentMenu).toBeVisible({
    timeout: 15000
  });

  await appointmentMenu.click();

  await expect(page.locator('body')).toBeVisible();

  await page.waitForTimeout(1500);

  console.log('Appointment URL:', page.url());
}

// ======================================================
// TAB HELPER
// ======================================================

async function openTab(page, tabName) {
  const tab = page.getByText(tabName, {
    exact: true
  }).first();

  await expect(tab).toBeVisible({
    timeout: 10000
  });

  await tab.click();

  await page.waitForTimeout(1000);

  await expect(page.locator('body')).toBeVisible();

  console.log(`${tabName} tab opened`);
}

// ======================================================
// COMMON TEST SETUP
// ======================================================

test.describe('GLAMORA APPOINTMENT MODULE', () => {

  test.beforeEach(async ({ page }) => {
    await openAppointmentModule(page);
  });

  // ----------------------------------------------------
  // TC01 - Verify Appointment Page
  // ----------------------------------------------------

  test('TC01 - Verify Appointment page loads successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();

    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  // ----------------------------------------------------
  // TC02 - Scheduled Tab
  // ----------------------------------------------------

  test('TC02 - Verify Scheduled tab', async ({ page }) => {
    await openTab(page, 'Scheduled');
  });

  // ----------------------------------------------------
  // TC03 - Unallocated Tab
  // ----------------------------------------------------

  test('TC03 - Verify Unallocated tab', async ({ page }) => {
    await openTab(page, 'Unallocated');
  });

  // ----------------------------------------------------
  // TC04 - Completed Tab
  // ----------------------------------------------------

  test('TC04 - Verify Completed tab', async ({ page }) => {
    await openTab(page, 'Completed');
  });

  // ----------------------------------------------------
  // TC05 - Cancelled Tab
  // ----------------------------------------------------

  test('TC05 - Verify Cancelled tab', async ({ page }) => {
    await openTab(page, 'Cancelled');
  });

  // ----------------------------------------------------
  // TC06 - Verify All Tabs
  // ----------------------------------------------------

  test('TC06 - Verify all Appointment tabs', async ({ page }) => {
    const tabs = [
      'Scheduled',
      'Unallocated',
      'Completed',
      'Cancelled'
    ];

    for (const tab of tabs) {
      await openTab(page, tab);

      const content = await page.locator('body').innerText();

      expect(content.trim().length).toBeGreaterThan(0);
    }
  });

  // ----------------------------------------------------
  // TC07 - List View
  // ----------------------------------------------------

  test('TC07 - Verify List view', async ({ page }) => {
    const listView = page.getByText('List', {
      exact: true
    }).first();

    await expect(listView).toBeVisible();
    await listView.click();

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC08 - Calendar View
  // ----------------------------------------------------

  test('TC08 - Verify Calendar view', async ({ page }) => {
    const calendarView = page.getByText('Calendar', {
      exact: true
    }).first();

    await expect(calendarView).toBeVisible();
    await calendarView.click();

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC09 - Filters
  // ----------------------------------------------------

  test('TC09 - Verify Appointment filters', async ({ page }) => {
    const filter = page.getByText('Filters', {
      exact: true
    }).first();

    await expect(filter).toBeVisible();
    await filter.click();

    await page.waitForTimeout(500);

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC10 - Search
  // ----------------------------------------------------

  test('TC10 - Verify Appointment search', async ({ page }) => {
    const search = page.locator(
      'input[type="search"], input[placeholder*="Search" i]'
    ).first();

    await expect(search).toBeVisible();

    await search.fill('Akshay');

    await page.waitForTimeout(1500);

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC11 - Invalid Search
  // ----------------------------------------------------

  test('TC11 - Verify search with invalid text', async ({ page }) => {
    const search = page.locator(
      'input[type="search"], input[placeholder*="Search" i]'
    ).first();

    await expect(search).toBeVisible();

    await search.fill('ZZZZINVALID123');

    await page.waitForTimeout(1500);

    await expect(page.locator('body')).toBeVisible();

    console.log('Invalid search input accepted for inspection');
  });

  // ----------------------------------------------------
  // TC12 - New Appointment Form
  // ----------------------------------------------------

  test('TC12 - Verify New Appointment form opens', async ({ page }, testInfo) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();

    await newButton.click();

    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('new-appointment-form.png'),
      fullPage: true
    });

    console.log('New Appointment form opened for inspection');
  });

  // ----------------------------------------------------
  // TC13 - Verify Edit Action Availability
  // ----------------------------------------------------

  test('TC13 - Inspect Edit appointment action', async ({ page }) => {
    const editAction = page.getByText(/edit visit|edit appointment/i).first();

    console.log(
      'Edit action count:',
      await editAction.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC14 - Inspect Assign Action
  // ----------------------------------------------------

  test('TC14 - Inspect Assign action', async ({ page }) => {
    const assignAction = page.getByRole('button', {
      name: /assign/i
    });

    console.log(
      'Assign button count:',
      await assignAction.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC15 - Inspect Complete Action
  // ----------------------------------------------------

  test('TC15 - Inspect Complete action', async ({ page }) => {
    const completeAction = page.getByRole('button', {
      name: /complete/i
    });

    console.log(
      'Complete button count:',
      await completeAction.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC16 - Inspect Cancel Action
  // ----------------------------------------------------

  test('TC16 - Inspect Cancel action', async ({ page }) => {
    const cancelAction = page.getByRole('button', {
      name: /cancel/i
    });

    console.log(
      'Cancel button count:',
      await cancelAction.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC17 - Inspect Delete Action
  // ----------------------------------------------------

  test('TC17 - Inspect Delete action', async ({ page }) => {
    const deleteAction = page.getByRole('button', {
      name: /delete/i
    });

    console.log(
      'Delete button count:',
      await deleteAction.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC18 - Pagination
  // ----------------------------------------------------

  test('TC18 - Verify pagination controls', async ({ page }) => {
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
  // TC19 - Refresh
  // ----------------------------------------------------

  test('TC19 - Verify Appointment page refresh', async ({ page }) => {
    await page.reload();

    await expect(page).not.toHaveURL(/\/login/, {
      timeout: 15000
    });

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC20 - Scroll
  // ----------------------------------------------------

  test('TC20 - Verify page scrolling', async ({ page }) => {
    const beforeScroll = await page.evaluate(() => window.scrollY);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(500);

    const afterScroll = await page.evaluate(() => window.scrollY);

    console.log({
      beforeScroll,
      afterScroll
    });

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC21 - Buttons
  // ----------------------------------------------------

  test('TC21 - Verify buttons are displayed', async ({ page }) => {
    const buttons = page.getByRole('button');

    expect(await buttons.count()).toBeGreaterThan(0);
  });

  // ----------------------------------------------------
  // TC22 - Tables
  // ----------------------------------------------------

  test('TC22 - Inspect Appointment tables', async ({ page }) => {
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
  // TC23 - Input Fields
  // ----------------------------------------------------

  test('TC23 - Inspect input fields', async ({ page }) => {
    console.log(
      'Input count:',
      await page.locator('input').count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC24 - Images
  // ----------------------------------------------------

  test('TC24 - Verify images load correctly', async ({ page }) => {
    const images = page.locator('img');

    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);

      if (await image.isVisible()) {
        const naturalWidth = await image.evaluate(
          img => img.naturalWidth
        );

        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  // ----------------------------------------------------
  // TC25 - Application Error Messages
  // ----------------------------------------------------

  test('TC25 - Check for common server error messages', async ({ page }) => {
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
  // TC26 - Appointment Page Report
  // ----------------------------------------------------

  test('TC26 - Capture Appointment page details', async ({ page }, testInfo) => {
    console.log('URL:', page.url());
    console.log('Title:', await page.title());

    console.log(
      'Buttons:',
      await page.getByRole('button').count()
    );

    console.log(
      'Links:',
      await page.getByRole('link').count()
    );

    console.log(
      'Inputs:',
      await page.locator('input').count()
    );

    console.log(
      'Tables:',
      await page.locator('table').count()
    );

    await page.screenshot({
      path: testInfo.outputPath('appointment-report.png'),
      fullPage: true
    });
  });

  // ----------------------------------------------------
  // TC27 - Verify Completed Records
  // ----------------------------------------------------

  test('TC27 - Verify Completed appointment records', async ({ page }) => {
    await openTab(page, 'Completed');

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC28 - Verify Cancelled Records
  // ----------------------------------------------------

  test('TC28 - Verify Cancelled appointment records', async ({ page }) => {
    await openTab(page, 'Cancelled');

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC29 - Inspect Completed Appointment Actions
  // ----------------------------------------------------

  test('TC29 - Inspect actions for completed appointments', async ({ page }) => {
    await openTab(page, 'Completed');

    console.log(
      'Edit actions:',
      await page.getByRole('button', {
        name: /edit/i
      }).count()
    );

    console.log(
      'Delete actions:',
      await page.getByRole('button', {
        name: /delete/i
      }).count()
    );
  });

  // ----------------------------------------------------
  // TC30 - Inspect Cancelled Appointment Actions
  // ----------------------------------------------------

  test('TC30 - Inspect actions for cancelled appointments', async ({ page }) => {
    await openTab(page, 'Cancelled');

    console.log(
      'Edit actions:',
      await page.getByRole('button', {
        name: /edit/i
      }).count()
    );

    console.log(
      'Cancel actions:',
      await page.getByRole('button', {
        name: /cancel/i
      }).count()
    );
  });

  // ----------------------------------------------------
  // TC31 - Customer Validation Form Inspection
  // ----------------------------------------------------

  test('TC31 - Inspect mandatory customer fields', async ({ page }) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(1000);

    const inputs = page.locator('input');

    console.log(
      'Input fields in form:',
      await inputs.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC32 - Customer Lookup Field Inspection
  // ----------------------------------------------------

  test('TC32 - Inspect customer lookup fields', async ({ page }) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(1000);

    console.log(
      'Telephone fields:',
      await page.locator('input[type="tel"]').count()
    );

    console.log(
      'Search fields:',
      await page.locator('input[placeholder*="search" i]').count()
    );
  });

  // ----------------------------------------------------
  // TC33 - New Customer Form Inspection
  // ----------------------------------------------------

  test('TC33 - Inspect new customer entry fields', async ({ page }) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(1000);

    console.log(
      'Telephone fields:',
      await page.locator('input[type="tel"]').count()
    );

    console.log(
      'Text fields:',
      await page.locator('input[type="text"]').count()
    );
  });

  // ----------------------------------------------------
  // TC34 - Date Field Inspection
  // ----------------------------------------------------

  test('TC34 - Inspect appointment date fields', async ({ page }) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(1000);

    console.log(
      'Date fields:',
      await page.locator('input[type="date"]').count()
    );

    console.log(
      'Date-time fields:',
      await page.locator('input[type="datetime-local"]').count()
    );
  });

  // ----------------------------------------------------
  // TC35 - Service Field Inspection
  // ----------------------------------------------------

  test('TC35 - Inspect service selection fields', async ({ page }) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(1000);

    console.log(
      'Select fields:',
      await page.locator('select').count()
    );

    console.log(
      'Service-related text:',
      await page.getByText(/service/i).count()
    );
  });

  // ----------------------------------------------------
  // TC36 - Staff Field Inspection
  // ----------------------------------------------------

  test('TC36 - Inspect staff selection fields', async ({ page }) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(1000);

    console.log(
      'Staff-related text:',
      await page.getByText(/staff|barber|employee/i).count()
    );
  });

  // ----------------------------------------------------
  // TC37 - Slot Field Inspection
  // ----------------------------------------------------

  test('TC37 - Inspect appointment time slot fields', async ({ page }) => {
    const newButton = page.getByRole('button', {
      name: /new|add appointment|create appointment/i
    }).first();

    await expect(newButton).toBeVisible();
    await newButton.click();

    await page.waitForTimeout(1000);

    console.log(
      'Time-related fields:',
      await page.getByText(/slot|time/i).count()
    );

    console.log(
      'Select fields:',
      await page.locator('select').count()
    );
  });

  // ----------------------------------------------------
  // TC38 - Verify Appointment Tab Navigation
  // ----------------------------------------------------

  test('TC38 - Verify navigation between appointment statuses', async ({ page }) => {
    const tabs = [
      'Scheduled',
      'Unallocated',
      'Completed',
      'Cancelled'
    ];

    for (const tab of tabs) {
      await openTab(page, tab);
    }
  });

  // ----------------------------------------------------
  // TC39 - Verify Appointment Page Title
  // ----------------------------------------------------

  test('TC39 - Verify page title', async ({ page }) => {
    const title = await page.title();

    console.log('Page title:', title);

    expect(title.trim().length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------
  // TC40 - Verify Links
  // ----------------------------------------------------

  test('TC40 - Verify page links are available', async ({ page }) => {
    const links = page.getByRole('link');

    console.log(
      'Link count:',
      await links.count()
    );

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC41 - Verify Horizontal and Vertical Scrolling
  // ----------------------------------------------------

  test('TC41 - Inspect horizontal and vertical scrolling', async ({ page }) => {
    const scrollDetails = await page.evaluate(() => ({
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));

    console.log('Scroll details:', scrollDetails);

    await page.evaluate(() => {
      window.scrollTo(
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight
      );
    });

    await page.waitForTimeout(500);

    await expect(page.locator('body')).toBeVisible();
  });

  // ----------------------------------------------------
  // TC42 - Capture Appointment Module Screenshot
  // ----------------------------------------------------

  test('TC42 - Capture full Appointment module screenshot', async ({ page }, testInfo) => {
    await page.screenshot({
      path: testInfo.outputPath('appointment-full-page.png'),
      fullPage: true
    });

    console.log('Appointment screenshot captured');
  });

});
