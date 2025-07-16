/*
  # Fix Users Table RLS Infinite Recursion

  1. Problem
    - Users table policies are causing infinite recursion
    - Policies reference the same table they're protecting
    - This prevents user creation and authentication

  2. Solution
    - Drop problematic recursive policies
    - Create simpler, non-recursive policies
    - Allow authenticated users to manage their own records
    - Use auth.uid() directly instead of joining users table

  3. Security
    - Maintain data isolation between schools
    - Allow users to create and read their own records
    - Prevent unauthorized access to other users' data
*/

-- Drop all existing users policies to prevent recursion
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can create their own record" ON users;
DROP POLICY IF EXISTS "School admins can manage users in their school" ON users;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- For school management, we'll use a different approach
-- School owners can manage users in their school (non-recursive)
CREATE POLICY "School owners can manage school users"
  ON users FOR ALL
  TO authenticated
  USING (
    -- Allow if the current user is a school owner of the same school
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = users.school_id
      AND s.owner_id = auth.uid()
    )
  );

-- Also update applications policies to be non-recursive
DROP POLICY IF EXISTS "School users can view their school's applications" ON applications;
DROP POLICY IF EXISTS "School admins can update applications" ON applications;

CREATE POLICY "School owners can view their school applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = applications.school_id
      AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can update their school applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = applications.school_id
      AND s.owner_id = auth.uid()
    )
  );

-- Update results policies to be non-recursive
DROP POLICY IF EXISTS "Results are viewable by school users" ON results;
DROP POLICY IF EXISTS "Teachers can manage results" ON results;

CREATE POLICY "School owners can view their school results"
  ON results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = results.school_id
      AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can manage their school results"
  ON results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = results.school_id
      AND s.owner_id = auth.uid()
    )
  );