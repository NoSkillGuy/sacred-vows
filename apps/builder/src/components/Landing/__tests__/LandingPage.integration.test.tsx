/**
 * LandingPage Integration Tests
 * 
 * These tests verify the complete user flow for personalization.
 * To run these tests, a testing framework (Jest + React Testing Library) needs to be set up.
 * 
 * Test Framework Setup Required:
 * - @testing-library/react
 * - @testing-library/jest-dom
 * - @testing-library/user-event
 * - jest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

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
  trackPageView: vi.fn(),
  trackExperiment: vi.fn(),
  trackSectionViewed: vi.fn(),
  trackCTA: vi.fn(),
}));

const renderLandingPage = () => {
  return render(
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  );
};

describe('LandingPage Personalization Integration', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Flow', () => {
    it('should show modal when user visits page for first time', () => {
      renderLandingPage();
      
      expect(screen.getByText('Personalize Your Preview')).toBeInTheDocument();
    });

    it('should save data to localStorage when user fills form and saves', async () => {
      renderLandingPage();
      
      // Fill form
      fireEvent.change(screen.getByLabelText("Bride's Name"), { target: { value: 'Sarah' } });
      fireEvent.change(screen.getByLabelText("Groom's Name"), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Wedding Date'), { target: { value: '2025-12-15' } });
      fireEvent.change(screen.getByLabelText('Venue / Place'), { target: { value: 'Grand Hotel' } });
      
      // Save
      fireEvent.click(screen.getByText('Save & Preview'));
      
      // Verify localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'landing-personalization-data',
        expect.stringContaining('Sarah')
      );
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Personalize Your Preview')).not.toBeInTheDocument();
      });
    });

    it('should not show modal when user visits again after saving', () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: '2025-12-15',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderLandingPage();
      
      expect(screen.queryByText('Personalize Your Preview')).not.toBeInTheDocument();
    });

    it('should show personalized data in showcase card', async () => {
      const personalizationData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: '2025-12-15',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(personalizationData));
      
      renderLandingPage();
      
      await waitFor(() => {
        expect(screen.getByText('Sarah')).toBeInTheDocument();
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('GRAND HOTEL')).toBeInTheDocument();
      });
    });
  });

  describe('Partial Completion', () => {
    it('should save correctly when user fills only bride name', async () => {
      renderLandingPage();
      
      fireEvent.change(screen.getByLabelText("Bride's Name"), { target: { value: 'Sarah' } });
      fireEvent.click(screen.getByText('Save & Preview'));
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.brideName).toBe('Sarah');
      expect(savedData.groomName).toBe('');
    });

    it('should save correctly when user fills only date', async () => {
      renderLandingPage();
      
      fireEvent.change(screen.getByLabelText('Wedding Date'), { target: { value: '2025-12-15' } });
      fireEvent.click(screen.getByText('Save & Preview'));
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.weddingDate).toBe('2025-12-15');
    });

    it('should close modal and show defaults when user skips all fields', async () => {
      renderLandingPage();
      
      fireEvent.click(screen.getByText('Skip'));
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Personalize Your Preview')).not.toBeInTheDocument();
      });
      
      // Defaults should be shown
      expect(screen.getByText('Priya')).toBeInTheDocument();
      expect(screen.getByText('Rahul')).toBeInTheDocument();
    });
  });
});

