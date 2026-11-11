import 'dotenv/config';
import { test, expect } from '@playwright/test';

const LOGIN_URL =
    'https://glamora-staff.infineitsolutions.com/barbershop/login';

const username = process.env.GLAMORA_USERNAME;
const password = process.env.GLAMORA_PASSWORD;


// ======================================================
// LOGIN HELPER
// ======================================================

async function login(page) {

    expect(
        username,
        'GLAMORA_USERNAME is missing in .env'
    ).toBeTruthy();

    expect(
        password,
        'GLAMORA_PASSWORD is missing in .env'
    ).toBeTruthy();

    await page.goto(LOGIN_URL);

    await expect(
        page.getByPlaceholder('Enter username')
    ).toBeVisible();

    await expect(
        page.getByPlaceholder('Enter password')
    ).toBeVisible();

    await page.getByPlaceholder('Enter username')
        .fill(username);

    await page.getByPlaceholder('Enter password')
        .fill(password);

    await page.getByRole('button', {
        name: 'Sign in as admin'
    }).click();

    await page.waitForLoadState('domcontentloaded');

    // Allow dashboard to load
    await page.waitForTimeout(3000);

    console.log('Current URL:', page.url());

    if (page.url().includes('/barbershop/login')) {

        console.log('LOGIN FAILED');

        console.log(
            await page.locator('body').innerText()
        );

        throw new Error(
            'Login failed. Check credentials or login response.'
        );
    }

    console.log('LOGIN SUCCESSFUL');
}


// ======================================================
// HOME MODULE
// ======================================================

test.describe('GLAMORA ADMIN - HOME MODULE', () => {


    // ==================================================
    // TC01 - Home page loads
    // ==================================================

    test('TC01 - Verify Home page opens successfully', async ({ page }) => {

        await login(page);

        await expect(
            page.locator('body')
        ).toBeVisible();

        console.log('Home page loaded successfully');

    });


    // ==================================================
    // TC02 - Verify Home URL
    // ==================================================

    test('TC02 - Verify Home page URL', async ({ page }) => {

        await login(page);

        expect(page.url())
            .not.toContain('/barbershop/login');

        console.log('Home URL:', page.url());

    });


    // ==================================================
    // TC03 - Verify page title
    // ==================================================

    test('TC03 - Verify Home page title', async ({ page }) => {

        await login(page);

        const title = await page.title();

        console.log('Page title:', title);

        expect(title.trim().length)
            .toBeGreaterThan(0);

    });


    // ==================================================
    // TC04 - Verify Home page contains data
    // ==================================================

    test('TC04 - Verify Home page contains data', async ({ page }) => {

        await login(page);

        const bodyText =
            await page.locator('body').innerText();

        expect(bodyText.trim().length)
            .toBeGreaterThan(0);

        console.log('Home page contains data');

    });


    // ==================================================
    // TC05 - Verify all visible buttons
    // ==================================================

    test('TC05 - Verify Home page buttons', async ({ page }) => {

        await login(page);

        const buttons =
            page.getByRole('button');

        const count =
            await buttons.count();

        console.log(
            `Total buttons found: ${count}`
        );

        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {

            const button =
                buttons.nth(i);

            if (await button.isVisible()) {

                const text =
                    (await button.innerText()).trim();

                const ariaLabel =
                    await button.getAttribute('aria-label');

                console.log(
                    `Button ${i + 1}:`,
                    text || ariaLabel || '[No name]'
                );

                expect(
                    await button.isEnabled()
                ).toBeTruthy();
            }
        }

    });


    // ==================================================
    // TC06 - Verify links
    // ==================================================

    test('TC06 - Verify Home page links', async ({ page }) => {

        await login(page);

        const links =
            page.getByRole('link');

        const count =
            await links.count();

        console.log(
            `Total links found: ${count}`
        );

        for (let i = 0; i < count; i++) {

            const link =
                links.nth(i);

            if (await link.isVisible()) {

                const text =
                    (await link.innerText()).trim();

                const href =
                    await link.getAttribute('href');

                console.log(
                    `Link ${i + 1}: ${text || '[No text]'} -> ${href}`
                );
            }
        }

    });


    // ==================================================
    // TC07 - Verify headings
    // ==================================================

    test('TC07 - Verify Home page headings', async ({ page }) => {

        await login(page);

        const headings =
            page.getByRole('heading');

        const count =
            await headings.count();

        console.log(
            `Total headings: ${count}`
        );

        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {

            const text =
                (await headings.nth(i).innerText()).trim();

            if (text) {

                console.log(
                    `Heading ${i + 1}: ${text}`
                );
            }
        }

    });


    // ==================================================
    // TC08 - Verify images
    // ==================================================

    test('TC08 - Verify Home page images are loaded', async ({ page }) => {

        await login(page);

        const images =
            page.locator('img');

        const count =
            await images.count();

        console.log(
            `Total images: ${count}`
        );

        for (let i = 0; i < count; i++) {

            const image =
                images.nth(i);

            if (await image.isVisible()) {

                const naturalWidth =
                    await image.evaluate(
                        img => img.naturalWidth
                    );

                expect(
                    naturalWidth,
                    `Image ${i + 1} appears broken`
                ).toBeGreaterThan(0);
            }
        }

    });


    // ==================================================
    // TC09 - Verify dashboard cards
    // ==================================================

    test('TC09 - Verify Home page cards/statistics', async ({ page }) => {

        await login(page);

        const cards =
            page.locator(
                '[class*="card"], [class*="Card"]'
            );

        const count =
            await cards.count();

        console.log(
            `Possible cards found: ${count}`
        );

        for (let i = 0; i < count; i++) {

            const card =
                cards.nth(i);

            if (await card.isVisible()) {

                const text =
                    (await card.innerText()).trim();

                if (text) {

                    console.log(
                        `Card ${i + 1}: ${text}`
                    );
                }
            }
        }

    });


    // ==================================================
    // TC10 - Verify tables
    // ==================================================

    test('TC10 - Verify Home page tables', async ({ page }) => {

        await login(page);

        const tables =
            page.locator('table');

        const count =
            await tables.count();

        console.log(
            `Tables found: ${count}`
        );

        for (let i = 0; i < count; i++) {

            const table =
                tables.nth(i);

            if (await table.isVisible()) {

                const text =
                    (await table.innerText()).trim();

                console.log(
                    `Table ${i + 1}:`
                );

                console.log(text);
            }
        }

    });


    // ==================================================
    // TC11 - Verify table headers
    // ==================================================

    test('TC11 - Verify table headers', async ({ page }) => {

        await login(page);

        const headers =
            page.locator('table th');

        const count =
            await headers.count();

        console.log(
            `Table headers found: ${count}`
        );

        for (let i = 0; i < count; i++) {

            const text =
                (await headers.nth(i).innerText()).trim();

            if (text) {

                console.log(
                    `Header ${i + 1}: ${text}`
                );
            }
        }

    });


    // ==================================================
    // TC12 - Verify input fields
    // ==================================================

    test('TC12 - Verify Home page input fields', async ({ page }) => {

        await login(page);

        const inputs =
            page.locator('input');

        const count =
            await inputs.count();

        console.log(
            `Input fields found: ${count}`
        );

        for (let i = 0; i < count; i++) {

            const input =
                inputs.nth(i);

            if (await input.isVisible()) {

                console.log({
                    field: i + 1,
                    placeholder:
                        await input.getAttribute('placeholder'),
                    type:
                        await input.getAttribute('type')
                });
            }
        }

    });


    // ==================================================
    // TC13 - Verify dropdowns
    // ==================================================

    test('TC13 - Verify Home page dropdowns', async ({ page }) => {

        await login(page);

        const selects =
            page.locator('select');

        const count =
            await selects.count();

        console.log(
            `Dropdowns found: ${count}`
        );

        for (let i = 0; i < count; i++) {

            const select =
                selects.nth(i);

            if (await select.isVisible()) {

                expect(
                    await select.isEnabled()
                ).toBeTruthy();

                console.log(
                    `Dropdown ${i + 1} is enabled`
                );
            }
        }

    });


    // ==================================================
    // TC14 - Verify Home after refresh
    // ==================================================

    test('TC14 - Verify Home page after refresh', async ({ page }) => {

        await login(page);

        await page.reload();

        await page.waitForLoadState(
            'domcontentloaded'
        );

        await page.waitForTimeout(2000);

        expect(page.url())
            .not.toContain('/barbershop/login');

        await expect(
            page.locator('body')
        ).toBeVisible();

        console.log(
            'Home page loaded successfully after refresh'
        );

    });


    // ==================================================
    // TC15 - Verify browser Back and Forward
    // ==================================================

    test('TC15 - Verify browser Back and Forward', async ({ page }) => {

        await login(page);

        const homeURL =
            page.url();

        console.log(
            'Home URL:',
            homeURL
        );

        await page.goBack();

        await page.waitForTimeout(1000);

        console.log(
            'After Back:',
            page.url()
        );

        await page.goForward();

        await page.waitForTimeout(1000);

        console.log(
            'After Forward:',
            page.url()
        );

        expect(page.url())
            .not.toContain('/barbershop/login');

    });


    // ==================================================
    // TC16 - Verify navigation elements
    // ==================================================

    test('TC16 - Verify Home navigation elements', async ({ page }) => {

        await login(page);

        const links =
            page.getByRole('link');

        const count =
            await links.count();

        const dangerousWords = [
            'logout',
            'delete',
            'remove',
            'cancel',
            'save',
            'submit',
            'confirm',
            'approve',
            'reject',
            'disable',
            'enable',
            'clear',
            'reset'
        ];

        for (let i = 0; i < count; i++) {

            const link =
                links.nth(i);

            if (!await link.isVisible()) {
                continue;
            }

            const name =
                (
                    await link.innerText()
                ).trim();

            const href =
                await link.getAttribute('href');

            if (!href) {
                continue;
            }

            const dangerous =
                dangerousWords.some(word =>
                    name.toLowerCase().includes(word)
                );

            if (dangerous) {

                console.log(
                    `Skipped potentially destructive link: ${name}`
                );

                continue;
            }

            console.log(
                `Navigation: ${name} -> ${href}`
            );
        }

    });


    // ==================================================
    // TC17 - Verify no obvious application error
    // ==================================================

    test('TC17 - Verify Home page has no obvious error', async ({ page }) => {

        await login(page);

        const bodyText =
            (
                await page.locator('body').innerText()
            ).toLowerCase();

        const errorMessages = [
            'internal server error',
            'something went wrong',
            'server error',
            '500 error',
            'page not found',
            '404 error',
            'failed to load'
        ];

        for (const error of errorMessages) {

            expect(
                bodyText,
                `Unexpected error found: ${error}`
            ).not.toContain(error);
        }

        console.log(
            'No obvious application error found'
        );

    });


    // ==================================================
    // TC18 - Verify buttons have valid dimensions
    // ==================================================

    test('TC18 - Verify visible buttons have valid dimensions', async ({ page }) => {

        await login(page);

        const buttons =
            page.getByRole('button');

        const count =
            await buttons.count();

        for (let i = 0; i < count; i++) {

            const button =
                buttons.nth(i);

            if (!await button.isVisible()) {
                continue;
            }

            const box =
                await button.boundingBox();

            if (box) {

                expect(box.width)
                    .toBeGreaterThan(0);

                expect(box.height)
                    .toBeGreaterThan(0);
            }
        }

        console.log(
            'Visible buttons have valid dimensions'
        );

    });


    // ==================================================
    // TC19 - Negative
    // Verify Home cannot be accessed without login
    // ==================================================

    test('TC19 - Verify Home cannot be accessed without authentication', async ({ browser }) => {

        const page =
            await browser.newPage();

        await page.goto(
            'https://glamora-staff.infineitsolutions.com/barbershop/'
        );

        await page.waitForLoadState(
            'domcontentloaded'
        );

        await page.waitForTimeout(2000);

        console.log(
            'Unauthenticated URL:',
            page.url()
        );

        expect(
            page.url()
        ).toContain('/login');

        await page.close();

    });


    // ==================================================
    // TC20 - Negative
    // Invalid search
    // ==================================================

    test('TC20 - Verify invalid search input', async ({ page }) => {

        await login(page);

        const inputs =
            page.locator('input');

        const count =
            await inputs.count();

        let searchFound = false;

        for (let i = 0; i < count; i++) {

            const input =
                inputs.nth(i);

            if (!await input.isVisible()) {
                continue;
            }

            const placeholder =
                (
                    await input.getAttribute('placeholder')
                ) || '';

            const type =
                (
                    await input.getAttribute('type')
                ) || '';

            if (
                placeholder.toLowerCase().includes('search') ||
                type === 'search'
            ) {

                searchFound = true;

                await input.fill(
                    'ZZZZZZ999999INVALID'
                );

                await page.waitForTimeout(1000);

                expect(page.url())
                    .not.toContain('/error');

                console.log(
                    'Invalid search handled without page crash'
                );

                break;
            }
        }

        if (!searchFound) {

            console.log(
                'No search field found on Home page'
            );
        }

    });


    // ==================================================
    // TC21 - Negative
    // Blank search
    // ==================================================

    test('TC21 - Verify blank search', async ({ page }) => {

        await login(page);

        const inputs =
            page.locator('input');

        const count =
            await inputs.count();

        for (let i = 0; i < count; i++) {

            const input =
                inputs.nth(i);

            if (!await input.isVisible()) {
                continue;
            }

            const placeholder =
                (
                    await input.getAttribute('placeholder')
                ) || '';

            const type =
                (
                    await input.getAttribute('type')
                ) || '';

            if (
                placeholder.toLowerCase().includes('search') ||
                type === 'search'
            ) {

                await input.fill('');

                await page.waitForTimeout(500);

                expect(page.url())
                    .not.toContain('/error');

                console.log(
                    'Blank search handled successfully'
                );

                break;
            }
        }

    });


    // ==================================================
    // TC22 - Negative
    // Special characters in search
    // ==================================================

    test('TC22 - Verify special characters in search', async ({ page }) => {

        await login(page);

        const inputs =
            page.locator('input');

        const count =
            await inputs.count();

        for (let i = 0; i < count; i++) {

            const input =
                inputs.nth(i);

            if (!await input.isVisible()) {
                continue;
            }

            const placeholder =
                (
                    await input.getAttribute('placeholder')
                ) || '';

            const type =
                (
                    await input.getAttribute('type')
                ) || '';

            if (
                placeholder.toLowerCase().includes('search') ||
                type === 'search'
            ) {

                await input.fill(
                    '!@#$%^&*()_+'
                );

                await page.waitForTimeout(500);

                expect(page.url())
                    .not.toContain('/error');

                console.log(
                    'Special characters handled without page crash'
                );

                break;
            }
        }

    });


    // ==================================================
    // TC23 - Negative
    // Very long search
    // ==================================================

    test('TC23 - Verify very long search input', async ({ page }) => {

        await login(page);

        const inputs =
            page.locator('input');

        const count =
            await inputs.count();

        const longText =
            'A'.repeat(300);

        for (let i = 0; i < count; i++) {

            const input =
                inputs.nth(i);

            if (!await input.isVisible()) {
                continue;
            }

            const placeholder =
                (
                    await input.getAttribute('placeholder')
                ) || '';

            const type =
                (
                    await input.getAttribute('type')
                ) || '';

            if (
                placeholder.toLowerCase().includes('search') ||
                type === 'search'
            ) {

                await input.fill(longText);

                await page.waitForTimeout(500);

                expect(page.url())
                    .not.toContain('/error');

                console.log(
                    'Long search input handled'
                );

                break;
            }
        }

    });


    // ==================================================
    // TC24 - Negative
    // Multiple refreshes
    // ==================================================

    test('TC24 - Verify Home page after multiple refreshes', async ({ page }) => {

        await login(page);

        for (let i = 1; i <= 3; i++) {

            await page.reload();

            await page.waitForLoadState(
                'domcontentloaded'
            );

            await page.waitForTimeout(1000);

            expect(page.url())
                .not.toContain('/barbershop/login');

            await expect(
                page.locator('body')
            ).toBeVisible();

            console.log(
                `Refresh ${i} successful`
            );
        }

    });


    // ==================================================
    // TC25 - Verify links have destination
    // ==================================================

    test('TC25 - Verify Home links have destinations', async ({ page }) => {

        await login(page);

        const links =
            page.getByRole('link');

        const count =
            await links.count();

        for (let i = 0; i < count; i++) {

            const link =
                links.nth(i);

            if (!await link.isVisible()) {
                continue;
            }

            const href =
                await link.getAttribute('href');

            const name =
                (await link.innerText()).trim();

            if (
                href === null ||
                href === ''
            ) {

                console.log(
                    `Possible link without destination: ${name}`
                );
            }
        }

    });


    // ==================================================
    // TC26 - Verify broken images
    // ==================================================

    test('TC26 - Verify Home page has no broken images', async ({ page }) => {

        await login(page);

        const images =
            page.locator('img');

        const count =
            await images.count();

        let brokenImages = 0;

        for (let i = 0; i < count; i++) {

            const image =
                images.nth(i);

            const naturalWidth =
                await image.evaluate(
                    img => img.naturalWidth
                );

            if (naturalWidth === 0) {

                brokenImages++;

                console.log(
                    `Broken image found: ${i + 1}`
                );
            }
        }

        expect(
            brokenImages
        ).toBe(0);

        console.log(
            'No broken images found'
        );

    });


    // ==================================================
    // TC27 - Complete Home page inspection
    // ==================================================

    test('TC27 - Generate Home page inspection report', async ({ page }) => {

        await login(page);

        console.log('\n====================================');
        console.log('GLAMORA HOME PAGE REPORT');
        console.log('====================================');

        console.log(
            'URL:',
            page.url()
        );

        console.log(
            'Title:',
            await page.title()
        );

        console.log(
            'Buttons:',
            await page.getByRole('button').count()
        );

        console.log(
            'Links:',
            await page.getByRole('link').count()
        );

        console.log(
            'Input fields:',
            await page.locator('input').count()
        );

        console.log(
            'Tables:',
            await page.locator('table').count()
        );

        console.log(
            'Images:',
            await page.locator('img').count()
        );

        console.log('\n========== HOME PAGE DATA ==========');

        console.log(
            await page.locator('body').innerText()
        );

        await page.screenshot({
            path: 'glamora-home-page.png',
            fullPage: true
        });

        console.log(
            'Screenshot saved: glamora-home-page.png'
        );

    });


    // ==================================================
    // TC28 - Verify vertical and horizontal scrolling
    // ==================================================

    test('TC28 - Verify Home page scroll bars are working correctly', async ({ page }) => {

        await login(page);

        console.log('\n====================================');
        console.log('SCROLL BAR TEST');
        console.log('====================================');

        const dimensions =
            await page.evaluate(() => ({
                viewportHeight: window.innerHeight,
                viewportWidth: window.innerWidth,
                documentHeight:
                    document.documentElement.scrollHeight,
                documentWidth:
                    document.documentElement.scrollWidth
            }));

        console.log(
            'Page dimensions:',
            dimensions
        );


        // ------------------------------------------
        // VERTICAL SCROLL
        // ------------------------------------------

        const verticalScrollAvailable =
            dimensions.documentHeight >
            dimensions.viewportHeight;

        if (verticalScrollAvailable) {

            console.log(
                'Vertical scrollbar is available'
            );

            const initialScroll =
                await page.evaluate(
                    () => window.scrollY
                );

            expect(initialScroll)
                .toBe(0);

            // Scroll to bottom
            await page.evaluate(() => {

                window.scrollTo({
                    top:
                        document.documentElement.scrollHeight,
                    behavior: 'instant'
                });

            });

            await page.waitForTimeout(500);

            const bottom =
                await page.evaluate(() => ({
                    scrollY: window.scrollY,
                    documentHeight:
                        document.documentElement.scrollHeight,
                    viewportHeight:
                        window.innerHeight
                }));

            console.log(
                'Bottom position:',
                bottom
            );

            // Verify scrolling actually happened
            expect(
                bottom.scrollY
            ).toBeGreaterThan(0);

            // Verify bottom is reachable
            expect(
                bottom.scrollY +
                bottom.viewportHeight
            ).toBeGreaterThanOrEqual(
                bottom.documentHeight - 5
            );

            console.log(
                'Vertical scrolling to bottom is working'
            );


            // Scroll back to top
            await page.evaluate(() => {

                window.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });

            });

            await page.waitForTimeout(500);

            const top =
                await page.evaluate(
                    () => window.scrollY
                );

            expect(top)
                .toBe(0);

            console.log(
                'Vertical scrolling back to top is working'
            );

        } else {

            console.log(
                'Vertical scrollbar is not required because the page fits in the viewport'
            );
        }


        // ------------------------------------------
        // HORIZONTAL SCROLL
        // ------------------------------------------

        const horizontalScrollAvailable =
            dimensions.documentWidth >
            dimensions.viewportWidth;

        if (horizontalScrollAvailable) {

            console.log(
                'Horizontal scrollbar is available'
            );

            await page.evaluate(() => {

                window.scrollTo({
                    left:
                        document.documentElement.scrollWidth,
                    behavior: 'instant'
                });

            });

            await page.waitForTimeout(500);

            const right =
                await page.evaluate(() => ({
                    scrollX: window.scrollX,
                    documentWidth:
                        document.documentElement.scrollWidth,
                    viewportWidth:
                        window.innerWidth
                }));

            console.log(
                'Right position:',
                right
            );

            expect(
                right.scrollX
            ).toBeGreaterThan(0);

            expect(
                right.scrollX +
                right.viewportWidth
            ).toBeGreaterThanOrEqual(
                right.documentWidth - 5
            );

            console.log(
                'Horizontal scrolling is working'
            );


            // Scroll back left
            await page.evaluate(() => {

                window.scrollTo({
                    left: 0,
                    behavior: 'instant'
                });

            });

            await page.waitForTimeout(500);

            const left =
                await page.evaluate(
                    () => window.scrollX
                );

            expect(left)
                .toBe(0);

            console.log(
                'Horizontal scrolling back to left is working'
            );

        } else {

            console.log(
                'Horizontal scrollbar is not required'
            );
        }


        // ------------------------------------------
        // INTERNAL SCROLLABLE CONTAINERS
        // ------------------------------------------

        const scrollableContainers =
            await page.locator('*').evaluateAll(elements => {

                return elements.filter(element => {

                    const style =
                        window.getComputedStyle(element);

                    const vertical =
                        (
                            style.overflowY === 'auto' ||
                            style.overflowY === 'scroll'
                        ) &&
                        element.scrollHeight >
                            element.clientHeight;

                    const horizontal =
                        (
                            style.overflowX === 'auto' ||
                            style.overflowX === 'scroll'
                        ) &&
                        element.scrollWidth >
                            element.clientWidth;

                    return vertical || horizontal;

                }).length;

            });

        console.log(
            'Scrollable internal containers:',
            scrollableContainers
        );

        console.log(
            'Scroll bar verification completed successfully'
        );

    });


    // ==================================================
    // TC29 - Verify Home page after scrolling
    // ==================================================

    test('TC29 - Verify Home page content remains accessible after scrolling', async ({ page }) => {

        await login(page);

        const bodyBefore =
            await page.locator('body').innerText();

        // Scroll to bottom
        await page.evaluate(() => {

            window.scrollTo({
                top:
                    document.documentElement.scrollHeight,
                behavior: 'instant'
            });

        });

        await page.waitForTimeout(500);

        // Scroll to top
        await page.evaluate(() => {

            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });

        });

        await page.waitForTimeout(500);

        const bodyAfter =
            await page.locator('body').innerText();

        expect(bodyAfter.trim().length)
            .toBeGreaterThan(0);

        expect(bodyAfter)
            .toContain(
                bodyBefore.substring(0, 20)
            );

        console.log(
            'Home page content remains accessible after scrolling'
        );

    });


    // ==================================================
    // TC30 - Verify page does not horizontally overflow
    // ==================================================

    test('TC30 - Check Home page horizontal overflow', async ({ page }) => {

        await login(page);

        const overflow =
            await page.evaluate(() => {

                return {
                    viewportWidth:
                        window.innerWidth,

                    documentWidth:
                        document.documentElement.scrollWidth
                };

            });

        console.log(
            'Horizontal dimensions:',
            overflow
        );

        if (
            overflow.documentWidth >
            overflow.viewportWidth
        ) {

            console.log(
                'Horizontal scrolling is required on this page'
            );

        } else {

            console.log(
                'No unnecessary horizontal overflow detected'
            );
        }

    });


    // ==================================================
    // KEEP BROWSER OPEN
    // ==================================================

    test.afterEach(async ({ page }) => {

        // Keep browser open for inspection
        await page.waitForTimeout(5000);

    });

});