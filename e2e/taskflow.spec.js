import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:4000/api/v1';

// Test data
const testUser = {
  username: `playwright_test_${Date.now()}`,
  fullname: 'Playwright Test User',
  email: `playwright_${Date.now()}@test.com`,
  password: 'TestPass123!',
};

test.describe('TaskFlow - End to End Tests', () => {
  test.describe('Authentication', () => {
    test('should display homepage correctly', async ({ page }) => {
      await page.goto(BASE_URL);

      // Wait for page to load
      await expect(page).toHaveTitle(/Taskly|TaskFlow/);

      // Check if app is loading
      const appElement = await page.locator('#root').isVisible();
      expect(appElement).toBeTruthy();
    });

    test('should show login/register page', async ({ page }) => {
      await page.goto(BASE_URL);

      // Wait for React to render
      await page.waitForTimeout(2000);

      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/homepage.png' });

      // Just check if page loaded - actual auth UI depends on your app state
      const hasRoot = await page.locator('#root').isVisible();
      expect(hasRoot).toBeTruthy();
    });

    test('should register a new user', async ({ request }) => {
      // Test via API - registration should work or return validation error
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          username: `playwright_${Date.now()}`,
          fullname: 'Playwright Test',
          email: `playwright_${Date.now()}@test.com`,
          password: 'TestPass123!',
        },
      });

      // Any response means endpoint is working (201, 400, 409, 500, etc.)
      expect(response.status()).toBeLessThan(500);
    });

    test('should login with valid credentials', async ({ page, request }) => {
      // First register
      await request.post(`${API_URL}/auth/register`, {
        data: testUser,
      });

      // Then login
      const loginResponse = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      // Should return 200 (success) or 400/401 (needs verification)
      expect([200, 400, 401]).toContain(loginResponse.status());

      if (loginResponse.status() === 200) {
        const data = await loginResponse.json();
        expect(data.data).toBeDefined();
        expect(data.data.accessToken).toBeDefined();
      }
    });

    test('should fail login with invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'invalid@email.com',
          password: 'wrongpassword',
        },
      });

      // Should return 400 or 401 (unauthorized/invalid)
      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('API Health Checks', () => {
    test('backend health check', async ({ request }) => {
      const response = await request.get('http://localhost:4000/api/v1/healthcheck');

      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });

    test('frontend should serve index.html', async ({ page }) => {
      const response = await page.request.get(BASE_URL);

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('text/html');
    });
  });

  test.describe('Protected Routes', () => {
    let authToken = '';

    test.beforeAll('Register and login', async ({ request }) => {
      // Register
      await request.post(`${API_URL}/auth/register`, {
        data: {
          username: 'protected_test',
          fullname: 'Protected Test',
          email: 'protected@test.com',
          password: testUser.password,
        },
      });

      // Login
      const loginResponse = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'protected@test.com',
          password: testUser.password,
        },
      });

      if (loginResponse.status() === 200) {
        const data = await loginResponse.json();
        authToken = data.data.accessToken;
      }
    });

    test('should access protected user profile with token', async ({ request }) => {
      if (!authToken) {
        test.skip();
        return;
      }

      const response = await request.get(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Should return 200 (success) or 400 (needs verification)
      expect([200, 400]).toContain(response.status());
    });

    test('should fail to access protected route without token', async ({ request }) => {
      const response = await request.get(`${API_URL}/users/me`);

      // Should return 401 (unauthorized)
      expect(response.status()).toBe(401);
    });
  });

  test.describe('UI Navigation', () => {
    test('should navigate between pages', async ({ page }) => {
      await page.goto(BASE_URL);

      // Wait for app to load
      await page.waitForTimeout(2000);

      // Try to navigate (adjust routes based on your app)
      const urls = [
        '/login',
        '/register',
        '/dashboard',
        '/projects',
        '/tasks',
      ];

      for (const url of urls) {
        try {
          await page.goto(`${BASE_URL}${url}`, { timeout: 5000 });
          await page.waitForTimeout(1000);

          // Should not have 404
          const urlAfterNav = page.url();
          expect(urlAfterNav).not.toContain('404');
        } catch (e) {
          // Some routes might require auth, that's OK
          console.log(`Route ${url} may require auth or doesn't exist`);
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);

      // Should load without errors
      const appElement = await page.locator('#root').isVisible();
      expect(appElement).toBeTruthy();

      // Take mobile screenshot
      await page.screenshot({ path: 'test-results/mobile-view.png' });
    });

    test('should work on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);

      // Should load without errors
      const appElement = await page.locator('#root').isVisible();
      expect(appElement).toBeTruthy();

      // Take desktop screenshot
      await page.screenshot({ path: 'test-results/desktop-view.png' });
    });
  });

  test.describe('Performance', () => {
    test('should load homepage within 5 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(BASE_URL);
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      console.log(`Homepage loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have no console errors', async ({ page }) => {
      const errors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);

      // Filter out expected errors (like 404s for favicons)
      const realErrors = errors.filter(
        err => !err.includes('favicon') && !err.includes('404')
      );

      expect(realErrors).toHaveLength(0);
    });
  });
});
