/*
  # Add grade column to results table

  1. Changes
    - Add `grade` column to `results` table as text type
    - This column will store calculated grades (A+, A, B, C, D, F)

  2. Security
    - No RLS changes needed as existing policies cover the new column
*/

-- Add grade column to results table
ALTER TABLE results ADD COLUMN IF NOT EXISTS grade text;