import { test, expect } from '@playwright/test';

// Shared state to track if login succeeded
let loginSucceeded = false;

test.describe('Create Website Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset login state
    loginSucceeded = false;
    
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form and wait for navigation
    await Promise.all([
      page.waitForURL(/.*app|.*dashboard|.*layouts/, { timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);
    
    // Verify we're on an authenticated page
    await expect(page).toHaveURL(/.*app|.*dashboard|.*layouts/, { timeout: 5000 });
    loginSucceeded = true;
  });

  test('should navigate to dashboard', async ({ page }) => {
    expect(loginSucceeded).toBe(true);
    
    await page.goto('/dashboard');
    
    // Should see dashboard content - use first() to handle multiple matches
    await expect(page.locator('text=/dashboard|invitations|create/i').first()).toBeVisible();
  });

  test('should create new invitation', async ({ page }) => {
    expect(loginSucceeded).toBe(true);
    
    await page.goto('/dashboard');

    // Click create button
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create")').first();
    await createButton.click();

    // Should navigate to layouts page or create flow
    await expect(page).toHaveURL(/.*layouts|.*builder|.*create/);
  });

  test('should select layout', async ({ page }) => {
    expect(loginSucceeded).toBe(true);
    
    await page.goto('/layouts');

    // Wait for layouts to load - use a more specific locator
    // Look for the heading "Choose Your Perfect Layout" or a layout title
    await expect(page.locator('h2:has-text("Choose Your Perfect Layout"), h3:has-text("Classic Scroll"), h3:has-text("Editorial Elegance")').first()).toBeVisible({ timeout: 10000 });

    // Click on a layout card - use the "Select Layout" button which is more specific
    const selectButton = page.locator('button:has-text("Select Layout")').first();
    await selectButton.click();

    // Should navigate to builder or show layout details
    await expect(page).toHaveURL(/.*builder|.*layout/, { timeout: 10000 });
  });

  test('should navigate to builder with invitation', async ({ page }) => {
    expect(loginSucceeded).toBe(true);
    
    // Assuming we have an invitation ID from previous test or setup
    await page.goto('/dashboard');

    // Click on an existing invitation card
    const invitationCard = page.locator('.invitation-card, [data-invitation-id]').first();
    
    if (await invitationCard.count() > 0) {
      await invitationCard.click();
      
      // Should navigate to builder
      await expect(page).toHaveURL(/.*builder/);
    } else {
      // If no invitations, create one first
      const createButton = page.locator('button:has-text("Create"), a:has-text("Create")').first();
      await createButton.click();
      
      // Then select layout
      await expect(page).toHaveURL(/.*layouts|.*builder/);
    }
  });
});

