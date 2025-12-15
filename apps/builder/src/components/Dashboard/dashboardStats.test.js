/**
 * Dashboard Stats Calculation Tests
 * 
 * Tests the logic for calculating invitation statistics in the Dashboard component.
 * This utility can be run with Node.js to verify the stats calculation logic.
 */

// Simulate the stats calculation logic from Dashboard.jsx
function calculateStats(invitations) {
  const totalInvitations = invitations.length;
  // Treat undefined/null status as 'draft' for defensive filtering
  const publishedCount = invitations.filter(inv => inv.status === 'published').length;
  const draftCount = invitations.filter(inv => !inv.status || inv.status === 'draft').length;
  
  return {
    totalInvitations,
    publishedCount,
    draftCount,
  };
}

// Test cases
function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, invitations, expected) {
    const result = calculateStats(invitations);
    const success = 
      result.totalInvitations === expected.totalInvitations &&
      result.publishedCount === expected.publishedCount &&
      result.draftCount === expected.draftCount;

    if (success) {
      passed++;
      console.log(`✓ ${name}`);
    } else {
      failed++;
      console.error(`✗ ${name}`);
      console.error(`  Expected:`, expected);
      console.error(`  Got:`, result);
    }
  }

  // Test 1: All invitations without status should be counted as drafts
  test(
    'All invitations without status should be counted as drafts',
    [
      { id: '1', status: undefined },
      { id: '2', status: null },
      { id: '3' }, // no status property
      { id: '4', status: undefined },
      { id: '5', status: null },
    ],
    {
      totalInvitations: 5,
      publishedCount: 0,
      draftCount: 5,
    }
  );

  // Test 2: Mix of published and draft invitations
  test(
    'Mix of published and draft invitations',
    [
      { id: '1', status: 'published' },
      { id: '2', status: 'draft' },
      { id: '3', status: 'published' },
      { id: '4', status: 'draft' },
      { id: '5', status: 'draft' },
    ],
    {
      totalInvitations: 5,
      publishedCount: 2,
      draftCount: 3,
    }
  );

  // Test 3: Invitations with undefined/null status mixed with explicit statuses
  test(
    'Invitations with undefined/null status mixed with explicit statuses',
    [
      { id: '1', status: 'published' },
      { id: '2', status: undefined },
      { id: '3', status: 'draft' },
      { id: '4', status: null },
      { id: '5', status: 'published' },
    ],
    {
      totalInvitations: 5,
      publishedCount: 2,
      draftCount: 3, // undefined, draft, null
    }
  );

  // Test 4: All published invitations
  test(
    'All published invitations',
    [
      { id: '1', status: 'published' },
      { id: '2', status: 'published' },
      { id: '3', status: 'published' },
    ],
    {
      totalInvitations: 3,
      publishedCount: 3,
      draftCount: 0,
    }
  );

  // Test 5: All draft invitations (explicit)
  test(
    'All draft invitations (explicit)',
    [
      { id: '1', status: 'draft' },
      { id: '2', status: 'draft' },
      { id: '3', status: 'draft' },
    ],
    {
      totalInvitations: 3,
      publishedCount: 0,
      draftCount: 3,
    }
  );

  // Test 6: Empty array
  test(
    'Empty array',
    [],
    {
      totalInvitations: 0,
      publishedCount: 0,
      draftCount: 0,
    }
  );

  // Test 7: Real-world scenario - 5 invitations without status (the reported bug)
  test(
    'Real-world scenario - 5 invitations without status',
    [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ],
    {
      totalInvitations: 5,
      publishedCount: 0,
      draftCount: 5, // Should be 5, not 0
    }
  );

  // Summary
  console.log('\n--- Test Summary ---');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  return failed === 0;
}

// Run tests
runTests();

