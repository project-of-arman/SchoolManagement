/*
  # Add subject column to users table

  1. Changes
    - Add `subject` column to `users` table for teacher subject information
    - Add `phone` column to `users` table for contact information
    - Add `qualification` column to `users` table for teacher qualifications
    - Add `experience` column to `users` table for teacher experience

  2. Security
    - No changes to existing RLS policies
*/

-- Add missing columns to users table
DO $$
BEGIN
  -- Add subject column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subject'
  ) THEN
    ALTER TABLE users ADD COLUMN subject text;
  END IF;

  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;

  -- Add qualification column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'qualification'
  ) THEN
    ALTER TABLE users ADD COLUMN qualification text;
  END IF;

  -- Add experience column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'experience'
  ) THEN
    ALTER TABLE users ADD COLUMN experience text;
  END IF;
END $$;