import { FullConfig } from "@playwright/test";
import { clearTestBuckets } from "./test-env-setup";

const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3100/api";
const TEST_USER_EMAIL = "test@example.com";
const TEST_USER_PASSWORD = "password123";

// Environment variable to control whether to preserve test data for debugging
const PRESERVE_TEST_DATA = process.env.PRESERVE_TEST_DATA === "true";

/**
 * Global teardown: Clean up test data after all tests run
 */
async function globalTeardown(config: FullConfig) {
  console.log("\n=== E2E Test Global Teardown ===");

  if (PRESERVE_TEST_DATA) {
    console.log("\n⚠ PRESERVE_TEST_DATA is set - skipping cleanup");
    console.log("⚠ Test data will remain in database and storage");
    return;
  }

  try {
    // Step 1: Clean up test user
    console.log("\n1. Cleaning up test user...");
    try {
      // First, try to login to get an auth token
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        }),
        credentials: "include",
      });

      if (!loginResponse.ok) {
        console.log("⚠ Could not login to delete test user (user may not exist)");
      } else {
        const loginData = (await loginResponse.json()) as { accessToken?: string };
        const token = loginData.accessToken;

        if (token) {
          // Delete user using test-only endpoint
          try {
            const deleteResponse = await fetch(`${API_BASE_URL}/auth/user`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (deleteResponse.ok) {
              console.log("✓ Test user deleted successfully");
            } else {
              const errorText = await deleteResponse.text();
              console.log(
                `⚠ Failed to delete test user (status ${deleteResponse.status}): ${errorText}`
              );
              console.log("⚠ Test user will remain in database");
            }
          } catch (deleteError: unknown) {
            const errorMessage =
              deleteError instanceof Error ? deleteError.message : String(deleteError);
            console.log("⚠ Error deleting test user:", errorMessage);
            console.log("⚠ Test user will remain in database");
          }
        } else {
          console.log("⚠ No access token received, skipping user deletion");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("⚠ Could not clean up test user:", errorMessage);
      console.log("⚠ Test user will remain in database");
    }

    // Step 2: Clean up test storage buckets
    console.log("\n2. Cleaning up test storage buckets...");
    try {
      await clearTestBuckets();
      console.log("✓ Test storage buckets cleared");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("⚠ Error clearing test buckets:", errorMessage);
      console.log("⚠ Test data will remain in storage");
    }

    // Note: We don't delete the entire Firestore database here because:
    // 1. The test database is isolated (FIRESTORE_DATABASE=test)
    // 2. Migrations will run automatically on next startup
    // 3. Test data in collections will be minimal and can be cleaned up manually if needed
    // 4. The test database can be reset by restarting the Firestore emulator with a fresh volume

    console.log("\n=== Teardown Complete ===\n");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n✗ Global teardown failed:", errorMessage);
    // Don't throw - teardown failures shouldn't fail the test run
  }
}

export default globalTeardown;
