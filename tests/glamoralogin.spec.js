
import 'dotenv/config';
import { test, expect } from '@playwright/test';

// Glamora login credentials
const username = process.env.GLAMORA_USERNAME;
const password = process.env.GLAMORA_PASSWORD;

// Login page URL
const loginURL = 'https://glamora-staff.infineitsolutions.com/barbershop/login';

// Expected login error message
const loginError = /invalid|incorrect|wrong|failed|error|not match/i;

test.describe('Glamora Admin Login Test Suite', () => {

    // Open login page before every test
    test.beforeEach(async ({ page }) => {
        await page.goto(loginURL);
    });

    // Wait 10 seconds after every test
    test.afterEach(async ({ page }) => {
        await page.waitForTimeout(10000);
    });

    // POSITIVE TEST CASE 1: Valid username and password
    test('Verify login with valid credentials', async ({ page }) => {

        expect(username, 'Username missing in .env').toBeTruthy();
        expect(password, 'Password missing in .env').toBeTruthy();

        await page.getByPlaceholder('Enter username').fill(username);
        await page.getByPlaceholder('Enter password').fill(password);

        await page.getByRole('button', {
            name: 'Sign in as admin'
        }).click();

        await expect(page).not.toHaveURL(/\/barbershop\/login\/?$/);

    });

    // NEGATIVE TEST CASE 1: Incorrect username
    test('Verify login with incorrect username', async ({ page }) => {

        expect(password).toBeTruthy();

        await page.getByPlaceholder('Enter username')
            .fill('wrong_username_123');

        await page.getByPlaceholder('Enter password')
            .fill(password);

        await page.getByRole('button', {
            name: 'Sign in as admin'
        }).click();

        await expect(page.getByText(loginError).first())
            .toBeVisible();

        await expect(page).toHaveURL(/\/barbershop\/login\/?$/);

    });

    // NEGATIVE TEST CASE 2: Incorrect password
    test('Verify login with incorrect password', async ({ page }) => {

        expect(username).toBeTruthy();

        await page.getByPlaceholder('Enter username')
            .fill(username);

        await page.getByPlaceholder('Enter password')
            .fill('WrongPassword@123');

        await page.getByRole('button', {
            name: 'Sign in as admin'
        }).click();

        await expect(page.getByText(loginError).first())
            .toBeVisible();

        await expect(page).toHaveURL(/\/barbershop\/login\/?$/);

    });

    // NEGATIVE TEST CASE 3: Both incorrect credentials
    test('Verify login with both incorrect credentials', async ({ page }) => {

        await page.getByPlaceholder('Enter username')
            .fill('wrong_user_123');

        await page.getByPlaceholder('Enter password')
            .fill('WrongPassword@123');

        await page.getByRole('button', {
            name: 'Sign in as admin'
        }).click();

        await expect(page.getByText(loginError).first())
            .toBeVisible();

        await expect(page).toHaveURL(/\/barbershop\/login\/?$/);

    });

    // NEGATIVE TEST CASE 4: Both fields empty
    test('Verify validation when both fields are empty', async ({ page }) => {

        const usernameField = page.getByPlaceholder('Enter username');
        const passwordField = page.getByPlaceholder('Enter password');

        await page.getByRole('button', {
            name: 'Sign in as admin'
        }).click();

        expect(await usernameField.evaluate(el => el.checkValidity()))
            .toBe(false);

        expect(await passwordField.evaluate(el => el.checkValidity()))
            .toBe(false);

    });

    // NEGATIVE TEST CASE 5: Username empty
    test('Verify validation when username is empty', async ({ page }) => {

        const usernameField = page.getByPlaceholder('Enter username');

        await page.getByPlaceholder('Enter password')
            .fill(password || 'TestPassword123');

        await page.getByRole('button', {
            name: 'Sign in as admin'
        }).click();

        expect(await usernameField.evaluate(el => el.checkValidity()))
            .toBe(false);

    });

    // NEGATIVE TEST CASE 6: Password empty
    test('Verify validation when password is empty', async ({ page }) => {

        const passwordField = page.getByPlaceholder('Enter password');

        await page.getByPlaceholder('Enter username')
            .fill(username || 'testuser');

        await page.getByRole('button', {
            name: 'Sign in as admin'
        }).click();

        expect(await passwordField.evaluate(el => el.checkValidity()))
            .toBe(false);

    });

    // UI TEST CASE 1: Password masking
    test('Verify password field is masked', async ({ page }) => {

        await page.getByPlaceholder('Enter password')
            .fill('TestPassword123');

        await expect(page.getByPlaceholder('Enter password'))
            .toHaveAttribute('type', 'password');

    });

});
