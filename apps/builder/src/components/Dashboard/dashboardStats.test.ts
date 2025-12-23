/**
 * Dashboard Stats Calculation Tests
 * 
 * Tests the logic for calculating invitation statistics in the Dashboard component.
 */

import { describe, it, expect } from 'vitest';

interface Invitation {
  id: string;
  status?: string | null;
}

interface Stats {
  totalInvitations: number;
  publishedCount: number;
  draftCount: number;
}

// Simulate the stats calculation logic from Dashboard.tsx
function calculateStats(invitations: Invitation[]): Stats {
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

describe('Dashboard Stats Calculation', () => {
  it('should count all invitations without status as drafts', () => {
    const invitations: Invitation[] = [
      { id: '1', status: undefined },
      { id: '2', status: null as string | null },
      { id: '3' }, // no status property
      { id: '4', status: undefined },
      { id: '5', status: null as string | null },
    ];
    
    const result = calculateStats(invitations);
    
    expect(result.totalInvitations).toBe(5);
    expect(result.publishedCount).toBe(0);
    expect(result.draftCount).toBe(5);
  });

  it('should handle mix of published and draft invitations', () => {
    const invitations: Invitation[] = [
      { id: '1', status: 'published' },
      { id: '2', status: 'draft' },
      { id: '3', status: 'published' },
      { id: '4', status: 'draft' },
      { id: '5', status: 'draft' },
    ];
    
    const result = calculateStats(invitations);
    
    expect(result.totalInvitations).toBe(5);
    expect(result.publishedCount).toBe(2);
    expect(result.draftCount).toBe(3);
  });

  it('should handle invitations with undefined/null status mixed with explicit statuses', () => {
    const invitations: Invitation[] = [
      { id: '1', status: 'published' },
      { id: '2', status: undefined },
      { id: '3', status: 'draft' },
      { id: '4', status: null as string | null },
      { id: '5', status: 'published' },
    ];
    
    const result = calculateStats(invitations);
    
    expect(result.totalInvitations).toBe(5);
    expect(result.publishedCount).toBe(2);
    expect(result.draftCount).toBe(3); // undefined, draft, null
  });

  it('should handle all published invitations', () => {
    const invitations: Invitation[] = [
      { id: '1', status: 'published' },
      { id: '2', status: 'published' },
      { id: '3', status: 'published' },
    ];
    
    const result = calculateStats(invitations);
    
    expect(result.totalInvitations).toBe(3);
    expect(result.publishedCount).toBe(3);
    expect(result.draftCount).toBe(0);
  });

  it('should handle all draft invitations (explicit)', () => {
    const invitations: Invitation[] = [
      { id: '1', status: 'draft' },
      { id: '2', status: 'draft' },
      { id: '3', status: 'draft' },
    ];
    
    const result = calculateStats(invitations);
    
    expect(result.totalInvitations).toBe(3);
    expect(result.publishedCount).toBe(0);
    expect(result.draftCount).toBe(3);
  });

  it('should handle empty array', () => {
    const invitations: Invitation[] = [];
    
    const result = calculateStats(invitations);
    
    expect(result.totalInvitations).toBe(0);
    expect(result.publishedCount).toBe(0);
    expect(result.draftCount).toBe(0);
  });

  it('should handle real-world scenario - 5 invitations without status', () => {
    const invitations: Invitation[] = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ];
    
    const result = calculateStats(invitations);
    
    expect(result.totalInvitations).toBe(5);
    expect(result.publishedCount).toBe(0);
    expect(result.draftCount).toBe(5); // Should be 5, not 0
  });
});

