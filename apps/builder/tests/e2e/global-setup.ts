import { FullConfig } from '@playwright/test';
import {
  initializeTestEnvironment,
  verifyFirestoreEmulator,
  verifyMinIO,
} from './test-env-setup';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';
const TEST_USER_NAME = 'Test User';

/**
 * Wait for a server to be ready by checking a health endpoint
 */
async function waitForServer(url: string, maxRetries = 30, delay = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Server not ready yet, continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error(`Server at ${url} did not become ready after ${maxRetries * delay}ms`);
}

/**
 * Global setup: Initialize test environment and create test user
 */
async function globalSetup(config: FullConfig) {
  console.log('=== E2E Test Global Setup ===');
  
  try {
    // Step 1: Verify test infrastructure is running
    console.log('\n1. Verifying test infrastructure...');
    await verifyFirestoreEmulator();
    await verifyMinIO();
    
    // Step 2: Initialize test buckets
    console.log('\n2. Initializing test buckets...');
    await initializeTestEnvironment();
    
    // Step 3: Wait for backend server to be ready
    // (Playwright webServer should have started it, but migrations need time)
    console.log('\n3. Waiting for backend server to be ready...');
    const backendHealthUrl = 'http://localhost:3001/health';
    try {
      await waitForServer(backendHealthUrl, 60, 2000); // Wait up to 2 minutes
      console.log('✓ Backend server is ready');
    } catch (error) {
      console.error('✗ Backend server did not become ready');
      console.error('✗ Make sure the backend server can start with test configuration');
      throw error;
    }
    
    // Step 4: Wait for frontend server to be ready
    console.log('\n4. Waiting for frontend server to be ready...');
    const frontendUrl = 'http://localhost:5173';
    try {
      await waitForServer(frontendUrl, 30, 1000); // Wait up to 30 seconds
      console.log('✓ Frontend server is ready');
    } catch (error) {
      console.error('✗ Frontend server did not become ready');
      throw error;
    }
    
    // Step 5: Create test user
    console.log('\n5. Creating test user...');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          name: TEST_USER_NAME,
        }),
      });

      if (response.ok) {
        console.log('✓ Test user created successfully');
      } else if (response.status === 409) {
        // User already exists - that's fine, tests are idempotent
        console.log('✓ Test user already exists (this is fine)');
      } else {
        const error = await response.text();
        console.warn(`⚠ Failed to create test user (status ${response.status}): ${error}`);
        console.warn('⚠ Tests may fail if test user does not exist');
      }
    } catch (error: any) {
      console.error('✗ Error creating test user:', error.message);
      console.error('✗ Make sure the backend server is running on http://localhost:3001');
      // Don't throw - let tests run and fail with clear error messages
    }
    
    console.log('\n=== Setup Complete ===\n');
  } catch (error: any) {
    console.error('\n✗ Global setup failed:', error.message);
    throw error;
  }
}

export default globalSetup;

