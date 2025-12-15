-- Revert: Remove Elegant Cards Layout
-- This migration removes the elegant-cards layout from the layouts table

DELETE FROM layouts WHERE id = 'elegant-cards';

