/**
 * HeroSection Personalization Tests
 * 
 * These tests verify the HeroSection component's personalization functionality.
 * To run these tests, a testing framework (Jest + React Testing Library) needs to be set up.
 * 
 * Test Framework Setup Required:
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - @testing-library/user-event
 * - jest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock analytics service
vi.mock('../../../services/analyticsService', () => ({
  trackCTA: vi.fn(),
}));

const renderHeroSection = (props = {}) => {
  return render(
    <BrowserRouter>
      <HeroSection onSectionView={vi.fn()} {...props} />
    </BrowserRouter>
  );
};

describe('HeroSection Personalization', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    // Only clean up timers if fake timers were used
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
    vi.clearAllMocks();
  });

  describe('Personalization Data Loading', () => {
    it('should read from localStorage on mount', () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: '2025-12-15',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderHeroSection();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('landing-personalization-data');
    });

    it('should use personalized data in showcase card when available', async () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: '2025-12-15',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderHeroSection();
      
      // Modal should not be visible when data exists
      expect(screen.queryByText('Personalize Your Preview')).not.toBeInTheDocument();
      
      // Check showcase card shows personalized data
      await waitFor(() => {
        const sarahElements = screen.getAllByText('Sarah');
        expect(sarahElements.length).toBeGreaterThan(0);
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('GRAND HOTEL')).toBeInTheDocument();
      });
    });

    it('should fall back to default values when no data exists', () => {
      renderHeroSection();
      
      expect(screen.getByText('Priya')).toBeInTheDocument();
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('December 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('The Grand Palace, Mumbai')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly in UPPERCASE format', async () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: '2025-12-15',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderHeroSection();
      
      // Modal should not be visible when data exists
      expect(screen.queryByText('Personalize Your Preview')).not.toBeInTheDocument();
      
      await waitFor(() => {
        // Date should be formatted as "DECEMBER 15, 2025" - check that at least one exists
        const dateElements = screen.getAllByText(/DECEMBER 15, 2025/i);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('should handle invalid dates gracefully', () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: 'invalid-date',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderHeroSection();
      
      // Should fall back to default date
      expect(screen.getByText('December 15, 2025')).toBeInTheDocument();
    });

    it('should handle missing date field', () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderHeroSection();
      
      // Should use default date
      expect(screen.getByText('December 15, 2025')).toBeInTheDocument();
    });
  });

  describe('Modal Integration', () => {
    it('should show modal on first visit (no localStorage data)', async () => {
      vi.useFakeTimers();
      renderHeroSection();
      
      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });
      
      expect(screen.getByText('Personalize Your Preview')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should not show modal if data exists', () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: '2025-12-15',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderHeroSection();
      
      expect(screen.queryByText('Personalize Your Preview')).not.toBeInTheDocument();
    });

    it('should update showcase card after modal save', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      renderHeroSection();
      
      // Advance timers to trigger modal (15 second delay)
      await act(async () => {
        vi.advanceTimersByTime(15000);
      });
      
      // Modal should be visible
      expect(screen.getByText('Personalize Your Preview')).toBeInTheDocument();
      
      // Switch to real timers for user interactions
      vi.useRealTimers();
      
      // Fill form and save
      await user.type(screen.getByLabelText("Bride's Name"), 'Sarah');
      await user.type(screen.getByLabelText("Groom's Name"), 'John');
      await user.type(screen.getByLabelText('Wedding Date'), '2025-12-15');
      await user.type(screen.getByLabelText('Venue / Place'), 'Grand Hotel');
      
      await user.click(screen.getByText('Save & Preview'));
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Personalize Your Preview')).not.toBeInTheDocument();
      });
      
      // Showcase card should update
      await waitFor(() => {
        expect(screen.getByText('Sarah')).toBeInTheDocument();
        expect(screen.getByText('John')).toBeInTheDocument();
      });
    });
  });

  describe('Partial Data Handling', () => {
    it('should handle partial personalization data', () => {
      const personalizationData = {
        brideName: 'Sarah',
        // Missing other fields
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderHeroSection();
      
      expect(screen.getByText('Sarah')).toBeInTheDocument();
      // Should use defaults for missing fields
      expect(screen.getByText('Rahul')).toBeInTheDocument();
      expect(screen.getByText('December 15, 2025')).toBeInTheDocument();
    });
  });
});

