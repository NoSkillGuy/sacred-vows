import { test, expect } from "@playwright/test";

// Shared state to track if login succeeded
let loginSucceeded = false;

test.describe("Create Website Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Reset login state
    loginSucceeded = false;

    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    // Submit form and wait for navigation
    await Promise.all([
      page.waitForURL(/.*app|.*dashboard|.*layouts/, { timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);

    // Verify we're on an authenticated page
    await expect(page).toHaveURL(/.*app|.*dashboard|.*layouts/, { timeout: 5000 });
    loginSucceeded = true;
  });

  test("should navigate to dashboard", async ({ page }) => {
    expect(loginSucceeded).toBe(true);

    await page.goto("/dashboard");

    // Should see dashboard content - use first() to handle multiple matches
    await expect(page.locator("text=/dashboard|invitations|create/i").first()).toBeVisible();
  });

  test("should create new invitation", async ({ page }) => {
    expect(loginSucceeded).toBe(true);

    await page.goto("/dashboard");

    // Click create button
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create")').first();
    await createButton.click();

    // Should navigate to layouts page or create flow
    await expect(page).toHaveURL(/.*layouts|.*builder|.*create/);
  });

  test("should select layout", async ({ page }) => {
    expect(loginSucceeded).toBe(true);

    await page.goto("/layouts");

    // Wait for layouts to load - use a more specific locator
    // Look for the heading "Choose Your Perfect Layout" or a layout title
    await expect(
      page
        .locator(
          'h2:has-text("Choose Your Perfect Layout"), h3:has-text("Classic Scroll"), h3:has-text("Editorial Elegance")'
        )
        .first()
    ).toBeVisible({ timeout: 10000 });

    // Click on a layout card - use the "Select Layout" button which is more specific
    const selectButton = page.locator('button:has-text("Select Layout")').first();
    await selectButton.click();

    // Should navigate to builder or show layout details
    await expect(page).toHaveURL(/.*builder|.*layout/, { timeout: 10000 });
  });

  test("should navigate to builder with invitation", async ({ page }) => {
    expect(loginSucceeded).toBe(true);

    // Assuming we have an invitation ID from previous test or setup
    await page.goto("/dashboard");

    // Click on an existing invitation card
    const invitationCard = page.locator(".invitation-card, [data-invitation-id]").first();

    if ((await invitationCard.count()) > 0) {
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

  test.describe("Preset Selection Flow", () => {
    test("should show preset modal when selecting editorial-elegance layout", async ({ page }) => {
      expect(loginSucceeded).toBe(true);

      await page.goto("/layouts");

      // Wait for layouts to load
      await expect(
        page
          .locator('h2:has-text("Choose Your Perfect Layout"), h3:has-text("Editorial Elegance")')
          .first()
      ).toBeVisible({ timeout: 10000 });

      // Find and click the Editorial Elegance layout
      const editorialLayout = page
        .locator(
          '[data-layout-id="editorial-elegance"], .layout-card:has-text("Editorial Elegance")'
        )
        .first();

      // If we can't find by data attribute, try finding by text and then the Select button
      if ((await editorialLayout.count()) === 0) {
        const layoutCard = page.locator("text=Editorial Elegance").first();
        await layoutCard.scrollIntoViewIfNeeded();
        const selectButton = layoutCard
          .locator("..")
          .locator('button:has-text("Select Layout")')
          .first();
        await selectButton.click();
      } else {
        const selectButton = editorialLayout.locator('button:has-text("Select Layout")').first();
        await selectButton.click();
      }

      // Wait for preset modal to appear
      await expect(page.locator('h2:has-text("Choose Your Invitation Flow")')).toBeVisible({
        timeout: 10000,
      });
    });

    test("should display all 3 presets in modal", async ({ page }) => {
      expect(loginSucceeded).toBe(true);

      await page.goto("/layouts");

      // Wait for layouts to load
      await expect(
        page
          .locator('h2:has-text("Choose Your Perfect Layout"), h3:has-text("Editorial Elegance")')
          .first()
      ).toBeVisible({ timeout: 10000 });

      // Find and click Editorial Elegance layout
      const editorialLayout = page.locator("text=Editorial Elegance").first();
      await editorialLayout.scrollIntoViewIfNeeded();

      const selectButton = page.locator('button:has-text("Select Layout")').first();
      await selectButton.click();

      // Wait for preset modal
      await expect(page.locator('h2:has-text("Choose Your Invitation Flow")')).toBeVisible({
        timeout: 10000,
      });

      // Verify all 3 presets are displayed
      await expect(page.locator("text=Modern Editorial")).toBeVisible();
      await expect(page.locator("text=Love Story Feature")).toBeVisible();
      await expect(page.locator("text=Guest Experience")).toBeVisible();

      // Verify preset details
      await expect(page.locator("text=Minimal & Luxe")).toBeVisible();
      await expect(page.locator("text=Romantic & Narrative")).toBeVisible();
      await expect(page.locator("text=Clean & Thoughtful")).toBeVisible();
    });

    test("should create invitation with correct sections when selecting Modern Editorial preset", async ({
      page,
    }) => {
      expect(loginSucceeded).toBe(true);

      await page.goto("/layouts");

      // Wait for layouts to load
      await expect(
        page
          .locator('h2:has-text("Choose Your Perfect Layout"), h3:has-text("Editorial Elegance")')
          .first()
      ).toBeVisible({ timeout: 10000 });

      // Find and click Editorial Elegance layout
      const selectButton = page.locator('button:has-text("Select Layout")').first();
      await selectButton.click();

      // Wait for preset modal
      await expect(page.locator('h2:has-text("Choose Your Invitation Flow")')).toBeVisible({
        timeout: 10000,
      });

      // Click Modern Editorial preset
      const modernEditorialPreset = page
        .locator('.preset-card:has-text("Modern Editorial")')
        .first();
      await modernEditorialPreset.click();

      // Should navigate to builder
      await expect(page).toHaveURL(/.*builder\/[^/]+/, { timeout: 10000 });

      // Wait for builder to load - check for common builder elements
      await expect(page.locator("text=/editor|preview|sections/i").first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("should allow starting from scratch without preset", async ({ page }) => {
      expect(loginSucceeded).toBe(true);

      await page.goto("/layouts");

      // Wait for layouts to load
      await expect(
        page
          .locator('h2:has-text("Choose Your Perfect Layout"), h3:has-text("Editorial Elegance")')
          .first()
      ).toBeVisible({ timeout: 10000 });

      // Find and click Editorial Elegance layout
      const selectButton = page.locator('button:has-text("Select Layout")').first();
      await selectButton.click();

      // Wait for preset modal
      await expect(page.locator('h2:has-text("Choose Your Invitation Flow")')).toBeVisible({
        timeout: 10000,
      });

      // Click "Start from Scratch" button
      const startFromScratchButton = page.locator('button:has-text("Start from Scratch")').first();
      await startFromScratchButton.click();

      // Should navigate to builder
      await expect(page).toHaveURL(/.*builder\/[^/]+/, { timeout: 10000 });
    });

    test("should close preset modal when clicking overlay", async ({ page }) => {
      expect(loginSucceeded).toBe(true);

      await page.goto("/layouts");

      // Wait for layouts to load
      await expect(
        page
          .locator('h2:has-text("Choose Your Perfect Layout"), h3:has-text("Editorial Elegance")')
          .first()
      ).toBeVisible({ timeout: 10000 });

      // Find and click Editorial Elegance layout
      const selectButton = page.locator('button:has-text("Select Layout")').first();
      await selectButton.click();

      // Wait for preset modal
      await expect(page.locator('h2:has-text("Choose Your Invitation Flow")')).toBeVisible({
        timeout: 10000,
      });

      // Click on overlay (outside modal)
      const overlay = page.locator(".preset-modal-overlay").first();
      await overlay.click({ position: { x: 10, y: 10 } });

      // Modal should be closed
      await expect(page.locator('h2:has-text("Choose Your Invitation Flow")')).not.toBeVisible({
        timeout: 5000,
      });
    });
  });
});
