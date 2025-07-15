/*
  # Fix School Creation RLS Policy

  1. Updates
    - Update schools table RLS policy to allow authenticated users to create schools
    - Ensure proper policy for school creation workflow

  2. Security
    - Allow authenticated users to insert schools where they are the owner
    - Maintain existing read permissions for everyone
    - Keep update permissions for school owners only
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "School owners can update their schools" ON schools;
DROP POLICY IF EXISTS "Authenticated users can create schools" ON schools;

-- Recreate policies with proper permissions
CREATE POLICY "Schools are viewable by everyone"
  ON schools FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "School owners can update their schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Also ensure users table allows self-insertion for school owners
DROP POLICY IF EXISTS "Users can create their own record" ON users;

CREATE POLICY "Users can create their own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure school_content can be created by school owners
DROP POLICY IF EXISTS "School content can be managed by school users" ON school_content;

CREATE POLICY "School content can be managed by school users"
  ON school_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = school_content.school_id
      AND users.role IN ('super_admin', 'school_owner')
    )
    OR
    EXISTS (
      SELECT 1 FROM schools
      WHERE schools.id = school_content.school_id
      AND schools.owner_id = auth.uid()
    )
  );

-- Allow school owners to create initial content during school setup
CREATE POLICY "School owners can create content for their schools"
  ON school_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schools
      WHERE schools.id = school_content.school_id
      AND schools.owner_id = auth.uid()
    )
  );