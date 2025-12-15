-- Rollback: Remove Editorial Elegance layout from database
-- This migration removes the editorial-elegance layout if needed

DELETE FROM layouts WHERE id = 'editorial-elegance';

