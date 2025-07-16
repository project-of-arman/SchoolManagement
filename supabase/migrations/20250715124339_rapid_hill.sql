/*
  # Add School Registration Support

  1. Updates
    - Add trigger to automatically update updated_at timestamps
    - Add indexes for better performance
    - Add constraints for data validation

  2. Functions
    - Create function to handle timestamp updates
    - Add slug validation function

  3. Security
    - Update RLS policies for school creation
    - Allow authenticated users to create schools
*/

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_content_updated_at BEFORE UPDATE ON school_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_owner_id ON schools(owner_id);
CREATE INDEX IF NOT EXISTS idx_school_content_school_id ON school_content(school_id);
CREATE INDEX IF NOT EXISTS idx_applications_school_id ON applications(school_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_results_school_id ON results(school_id);
CREATE INDEX IF NOT EXISTS idx_results_roll_number ON results(roll_number);

-- Add constraints
ALTER TABLE schools ADD CONSTRAINT schools_slug_length CHECK (char_length(slug) >= 3 AND char_length(slug) <= 50);
ALTER TABLE schools ADD CONSTRAINT schools_slug_format CHECK (slug ~ '^[a-z0-9-]+$');

-- Update RLS policies for school creation
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
DROP POLICY IF EXISTS "School owners can update their schools" ON schools;

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

-- Update users policies to allow self-insertion
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "School admins can manage users in their school" ON users;

CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "School admins can manage users in their school"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.school_id = users.school_id
      AND u.role IN ('super_admin', 'school_owner')
    )
  );

-- Function to validate slug format
CREATE OR REPLACE FUNCTION validate_slug(slug_input text)
RETURNS boolean AS $$
BEGIN
  RETURN slug_input ~ '^[a-z0-9-]+$' AND char_length(slug_input) >= 3 AND char_length(slug_input) <= 50;
END;
$$ LANGUAGE plpgsql;