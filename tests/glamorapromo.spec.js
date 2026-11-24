
import 'dotenv/config';
import { test, expect } from '@playwright/test';

// Glamora URLs
const LOGIN_URL =
  'https://glamora-staff.infineitsolutions.com/barbershop/login';

const TV_PROMO_URL =
  'https://glamora-staff.infineitsolutions.com/tv-promo';

// Login credentials from .env
const username = process.env.GLAMORA_USERNAME;
const password = process.env.GLAMORA_PASSWORD;

// Generate unique names for test images
const uniqueId = () =>
  `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// Small PNG image for upload testing
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jGq0AAAAASUVORK5CYII=',
  'base64'
);

// LOGIN HELPER
async function login(page) {
  if (!username || !password) {
    throw new Error(
      'Please add GLAMORA_USERNAME and GLAMORA_PASSWORD in your .env file'
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

// OPEN TV PROMO MODULE
async function openTVPromo(page) {
  await page.goto(TV_PROMO_URL);

  await expect(
    page.getByRole('heading', { name: /tv promo/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(
    page.getByText(/slideshow order/i)
  ).toBeVisible();
}

// IMAGE UPLOAD INPUT
function imageUploadInput(page) {
  return page.locator('input[type="file"]').first();
}

// CREATE TEST IMAGE
function createImage(name) {
  return {
    name: `${name}.png`,
    mimeType: 'image/png',
    buffer: pngBuffer
  };
}

// SELECT IMAGES
async function selectImages(page, imageNames) {
  const files = imageNames.map(name => createImage(name));
  const uploadInput = imageUploadInput(page);

  await expect(uploadInput).toHaveCount(1);
  await uploadInput.setInputFiles(files);
}

// ADD IMAGES TO TV BOARD
async function addToTVBoard(page) {
  const addButton = page.getByRole('button', {
    name: /add to tv board/i
  });

  await expect(addButton).toBeVisible();
  await expect(addButton).toBeEnabled();

  await addButton.click();
}

// COUNT SLIDES
async function getSlideCount(page) {
  return page.getByRole('button', {
    name: /^remove$/i
  }).count();
}

// TEST SUITE
test.describe('GLAMORA TV PROMO MODULE AUTOMATION', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await openTVPromo(page);
  });

  // TC01 - Verify TV Promo page
  test('TC01 - Verify TV Promo page loads successfully', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /tv promo/i })
    ).toBeVisible();

    await expect(
      page.getByText(/slideshow order/i)
    ).toBeVisible();
  });

  // TC02 - Verify Choose Image button
  test('TC02 - Verify Choose Image button', async ({ page }) => {
    const chooseButton = page.getByRole('button', {
      name: /choose image/i
    });

    await expect(chooseButton).toBeVisible();
    await expect(chooseButton).toBeEnabled();
  });

  // TC03 - Verify Add to TV Board button
  test('TC03 - Verify Add to TV Board button', async ({ page }) => {
    const addButton = page.getByRole('button', {
      name: /add to tv board/i
    });

    await expect(addButton).toBeVisible();
  });

  // TC04 - Upload one image
  test('TC04 - Upload one picture to TV Promo', async ({ page }) => {
    const imageName = `PW_Single_${uniqueId()}`;

    await selectImages(page, [imageName]);

    await expect(
      page.getByText(`${imageName}.png`)
    ).toBeVisible();

    await addToTVBoard(page);

    await expect(
      page.getByText(/slideshow order/i)
    ).toBeVisible();
  });

  // TC05 - Upload multiple images together
  test('TC05 - Upload multiple pictures together', async ({ page }) => {
    const id = uniqueId();

    const imageNames = [
      `PW_Multiple_1_${id}`,
      `PW_Multiple_2_${id}`,
      `PW_Multiple_3_${id}`
    ];

    const previousCount = await getSlideCount(page);

    await selectImages(page, imageNames);

    for (const name of imageNames) {
      await expect(
        page.getByText(`${name}.png`)
      ).toBeVisible();
    }

    await addToTVBoard(page);

    await expect.poll(
      async () => getSlideCount(page)
    ).toBe(previousCount + 3);
  });

  // TC06 - Verify slideshow order section
  test('TC06 - Verify slideshow order section', async ({ page }) => {
    await expect(
      page.getByText(/slideshow order/i)
    ).toBeVisible();

    const slideCount = await getSlideCount(page);

    console.log('Current slideshow image count:', slideCount);
    expect(slideCount).toBeGreaterThanOrEqual(0);
  });

  // TC07 - Move image Up
  test('TC07 - Move slideshow image Up', async ({ page }) => {
    const id = uniqueId();

    await selectImages(page, [
      `PW_Up_1_${id}`,
      `PW_Up_2_${id}`
    ]);

    await addToTVBoard(page);

    const count = await getSlideCount(page);
    expect(count).toBeGreaterThanOrEqual(2);

    const upButtons = page.getByRole('button', {
      name: /^up$/i
    });

    await expect(upButtons.nth(1)).toBeVisible();
    await expect(upButtons.nth(1)).toBeEnabled();

    await upButtons.nth(1).click();

    await expect.poll(
      async () => getSlideCount(page)
    ).toBe(count);
  });

  // TC08 - Move image Down
  test('TC08 - Move slideshow image Down', async ({ page }) => {
    const id = uniqueId();

    await selectImages(page, [
      `PW_Down_1_${id}`,
      `PW_Down_2_${id}`
    ]);

    await addToTVBoard(page);

    const count = await getSlideCount(page);
    expect(count).toBeGreaterThanOrEqual(2);

    const downButtons = page.getByRole('button', {
      name: /^down$/i
    });

    await expect(downButtons.first()).toBeVisible();
    await expect(downButtons.first()).toBeEnabled();

    await downButtons.first().click();

    await expect.poll(
      async () => getSlideCount(page)
    ).toBe(count);
  });

  // TC09 - Verify Up and Down controls
  test('TC09 - Verify Up and Down controls', async ({ page }) => {
    const upButtons = page.getByRole('button', {
      name: /^up$/i
    });

    const downButtons = page.getByRole('button', {
      name: /^down$/i
    });

    console.log('Up buttons:', await upButtons.count());
    console.log('Down buttons:', await downButtons.count());

    await expect(page.locator('body')).toBeVisible();
  });

  // TC10 - Cancel image deletion
  test('TC10 - Cancel image deletion', async ({ page }) => {
    const id = uniqueId();

    await selectImages(page, [`PW_Cancel_Delete_${id}`]);
    await addToTVBoard(page);

    const previousCount = await getSlideCount(page);

    const removeButton = page.getByRole('button', {
      name: /^remove$/i
    }).last();

    await removeButton.click();

    await expect(
      page.getByText(/remove promo image/i)
    ).toBeVisible();

    await expect(
      page.getByText(/this image will stop showing/i)
    ).toBeVisible();

    await page.getByRole('button', {
      name: /^cancel$/i
    }).click();

    await expect.poll(
      async () => getSlideCount(page)
    ).toBe(previousCount);
  });

  // TC11 - Delete image
  test('TC11 - Delete image from TV Board', async ({ page }) => {
    const id = uniqueId();

    await selectImages(page, [`PW_Delete_${id}`]);
    await addToTVBoard(page);

    const previousCount = await getSlideCount(page);

    const removeButton = page.getByRole('button', {
      name: /^remove$/i
    }).last();

    await removeButton.click();

    await expect(
      page.getByText(/remove promo image/i)
    ).toBeVisible();

    await page.getByRole('button', {
      name: /^remove$/i
    }).last().click();

    await expect.poll(
      async () => getSlideCount(page)
    ).toBe(previousCount - 1);
  });

  // TC12 - Verify image counter
  test('TC12 - Verify TV Promo image counter', async ({ page }) => {
    const counter = page.getByText(/\d+\s*\/\s*12/);

    await expect(counter).toBeVisible();

    console.log(
      'TV Promo image counter:',
      await counter.innerText()
    );
  });

  // TC13 - Verify maximum image limit information
  test('TC13 - Verify maximum image limit information', async ({ page }) => {
    await expect(
      page.getByText(/you can add/i)
    ).toBeVisible();

    await expect(
      page.getByText(/12/)
    ).toBeVisible();
  });

  // TC14 - Verify slideshow controls
  test('TC14 - Verify slideshow controls', async ({ page }) => {
    const slideCount = await getSlideCount(page);

    const upCount = await page.getByRole('button', {
      name: /^up$/i
    }).count();

    const downCount = await page.getByRole('button', {
      name: /^down$/i
    }).count();

    expect(upCount).toBe(slideCount);
    expect(downCount).toBe(slideCount);
  });

  // TC15 - Refresh TV Promo page
  test('TC15 - Verify TV Promo page after refresh', async ({ page }) => {
    await page.reload();

    await expect(
      page.getByRole('heading', { name: /tv promo/i })
    ).toBeVisible();

    await expect(
      page.getByText(/slideshow order/i)
    ).toBeVisible();
  });

});
