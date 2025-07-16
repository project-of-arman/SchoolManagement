/*
  # Create School Management System Tables

  1. New Tables
    - `schools` - Store school information with unique slugs
    - `school_content` - Store dynamic content for each school section
    - `applications` - Store student applications
    - `users` - Store user accounts with roles
    - `results` - Store student results

  2. Security
    - Enable RLS on all tables
    - Add policies for school-level data isolation
    - Ensure users can only access their school's data
*/

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  settings jsonb DEFAULT '{}'
);

-- Create school content table
CREATE TABLE IF NOT EXISTS school_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  section text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, section)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  roll_number text NOT NULL,
  application_type text NOT NULL,
  message text DEFAULT '',
  status text DEFAULT 'pending',
  payment_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'teacher',
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  roll_number text NOT NULL,
  class text NOT NULL,
  subject text NOT NULL,
  marks integer NOT NULL,
  total_marks integer NOT NULL,
  exam_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Schools policies
CREATE POLICY "Schools are viewable by everyone"
  ON schools FOR SELECT
  USING (true);

CREATE POLICY "School owners can update their schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- School content policies
CREATE POLICY "School content is viewable by everyone"
  ON school_content FOR SELECT
  USING (true);

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
  );

-- Applications policies
CREATE POLICY "Anyone can create applications"
  ON applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "School users can view their school's applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = applications.school_id
    )
  );

CREATE POLICY "School admins can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = applications.school_id
      AND users.role IN ('super_admin', 'school_owner')
    )
  );

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

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

-- Results policies
CREATE POLICY "Results are viewable by school users"
  ON results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = results.school_id
    )
  );

CREATE POLICY "Teachers can manage results"
  ON results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = results.school_id
      AND users.role IN ('super_admin', 'school_owner', 'teacher')
    )
  );

-- Insert demo data
INSERT INTO schools (name, slug, settings) VALUES
  ('Demo High School', 'demo-school', '{
    "theme": "green",
    "contact": {
      "phone": "+880-1234-567890",
      "email": "info@demoschool.edu.bd",
      "address": "123 Education Street, Dhaka, Bangladesh"
    }
  }');

-- Get the demo school ID
DO $$
DECLARE
  demo_school_id uuid;
BEGIN
  SELECT id INTO demo_school_id FROM schools WHERE slug = 'demo-school';
  
  -- Insert demo content
  INSERT INTO school_content (school_id, section, content) VALUES
    (demo_school_id, 'hero', '{
      "images": [
        {
          "url": "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg",
          "title": "Welcome to Demo High School",
          "description": "Excellence in Education Since 1990"
        }
      ]
    }'),
    (demo_school_id, 'about', '{
      "title": "About Demo High School",
      "description": "We are committed to providing quality education and nurturing young minds to become responsible citizens of tomorrow. Our school has been serving the community for over 30 years.",
      "vision": "To be the leading educational institution in Bangladesh",
      "mission": "Empowering students with knowledge, skills, and values for a better future",
      "stats": {
        "students": "1200+",
        "teachers": "45+"
      }
    }'),
    (demo_school_id, 'gallery', '{
      "images": [
        {
          "url": "https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg",
          "title": "Science Laboratory"
        },
        {
          "url": "https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg",
          "title": "Modern Classroom"
        }
      ]
    }'),
    (demo_school_id, 'notices', '{
      "items": [
        {
          "title": "Annual Sports Day 2024",
          "description": "Join us for our annual sports day celebration on March 15th, 2024.",
          "date": "2024-03-15"
        },
        {
          "title": "Class 10 Board Exam Schedule",
          "description": "SSC examination schedule has been published. Please check with your class teacher.",
          "date": "2024-02-01"
        }
      ]
    }');
END $$;