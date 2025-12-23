/**
 * PersonalizationModal Component Tests
 * 
 * These tests verify the PersonalizationModal component functionality.
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
import PersonalizationModal from '../PersonalizationModal';

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

describe('PersonalizationModal', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Personalize Your Preview')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      const { container } = render(<PersonalizationModal isOpen={false} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it('should display all form fields', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByLabelText("Bride's Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Groom's Name")).toBeInTheDocument();
      expect(screen.getByLabelText('Wedding Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Venue / Place')).toBeInTheDocument();
    });

    it('should display explanation text about live preview', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText(/We'd love to personalize your preview!/)).toBeInTheDocument();
      expect(screen.getByText(/see them update in real-time/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in bride name field', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      const brideInput = screen.getByLabelText("Bride's Name");
      fireEvent.change(brideInput, { target: { value: 'Sarah' } });
      expect(brideInput.value).toBe('Sarah');
    });

    it('should allow typing in groom name field', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      const groomInput = screen.getByLabelText("Groom's Name");
      fireEvent.change(groomInput, { target: { value: 'John' } });
      expect(groomInput.value).toBe('John');
    });

    it('should allow selecting date in date field', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      const dateInput = screen.getByLabelText('Wedding Date');
      fireEvent.change(dateInput, { target: { value: '2025-12-15' } });
      expect(dateInput.value).toBe('2025-12-15');
    });

    it('should allow typing in venue field', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      const venueInput = screen.getByLabelText('Venue / Place');
      fireEvent.change(venueInput, { target: { value: 'Grand Hotel' } });
      expect(venueInput.value).toBe('Grand Hotel');
    });

    it('should allow submitting with empty fields (partial completion)', () => {
      const onSave = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} onSave={onSave} />);
      const saveButton = screen.getByText('Save & Preview');
      fireEvent.click(saveButton);
      expect(onSave).toHaveBeenCalled();
    });
  });

  describe('LocalStorage', () => {
    it('should save data to localStorage on submit', () => {
      const onSave = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} onSave={onSave} />);
      
      fireEvent.change(screen.getByLabelText("Bride's Name"), { target: { value: 'Sarah' } });
      fireEvent.change(screen.getByLabelText("Groom's Name"), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Wedding Date'), { target: { value: '2025-12-15' } });
      fireEvent.change(screen.getByLabelText('Venue / Place'), { target: { value: 'Grand Hotel' } });
      
      fireEvent.click(screen.getByText('Save & Preview'));
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'landing-personalization-data',
        expect.stringContaining('Sarah')
      );
    });

    it('should save partial data correctly', () => {
      const onSave = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} onSave={onSave} />);
      
      fireEvent.change(screen.getByLabelText("Bride's Name"), { target: { value: 'Sarah' } });
      fireEvent.click(screen.getByText('Save & Preview'));
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.brideName).toBe('Sarah');
      expect(savedData.groomName).toBe('');
    });

    it('should load existing data from localStorage on open', () => {
      const existingData = {
        brideName: 'Sarah',
        groomName: 'John',
        weddingDate: '2025-12-15',
        venue: 'Grand Hotel',
      };
      localStorageMock.setItem('landing-personalization-data', JSON.stringify(existingData));
      
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByLabelText("Bride's Name").value).toBe('Sarah');
      expect(screen.getByLabelText("Groom's Name").value).toBe('John');
    });
  });

  describe('Event Handling', () => {
    it('should call onClose when Skip button is clicked', () => {
      const onClose = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={onClose} />);
      fireEvent.click(screen.getByText('Skip'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={onClose} />);
      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', () => {
      const onClose = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={onClose} />);
      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    });

    it('should not call onClose when modal content is clicked', () => {
      const onClose = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={onClose} />);
      const modalContent = screen.getByRole('dialog').querySelector('.personalization-modal-content');
      fireEvent.click(modalContent);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onSave and onClose when Save button is clicked', () => {
      const onSave = vi.fn();
      const onClose = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={onClose} onSave={onSave} />);
      
      fireEvent.change(screen.getByLabelText("Bride's Name"), { target: { value: 'Sarah' } });
      fireEvent.click(screen.getByText('Save & Preview'));
      
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should not save data when Skip is clicked', () => {
      const onClose = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={onClose} />);
      
      fireEvent.change(screen.getByLabelText("Bride's Name"), { target: { value: 'Sarah' } });
      fireEvent.click(screen.getByText('Skip'));
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should handle ESC key to close modal', () => {
      const onClose = vi.fn();
      render(<PersonalizationModal isOpen={true} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'personalization-modal-title');
    });

    it('should have proper labels for form inputs', () => {
      render(<PersonalizationModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByLabelText("Bride's Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Groom's Name")).toBeInTheDocument();
      expect(screen.getByLabelText('Wedding Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Venue / Place')).toBeInTheDocument();
    });
  });
});

