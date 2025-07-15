/*
  # Add Students Table for Student Management

  1. New Tables
    - `students` - Store student information with parent details
      - Basic info: roll_number, full_name, class, section, etc.
      - Contact: phone, address
      - Parent details: father, mother, guardian information
      - Academic: admission_date, status

  2. Security
    - Enable RLS on students table
    - School owners can manage students in their school
    - Maintain data isolation between schools

  3. Indexes
    - Add indexes for better query performance
    - Unique constraint on roll_number per school
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  roll_number text NOT NULL,
  full_name text NOT NULL,
  class text NOT NULL,
  section text DEFAULT '',
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  phone text,
  address text,
  father_name text,
  father_phone text,
  father_occupation text,
  mother_name text,
  mother_phone text,
  mother_occupation text,
  guardian_name text,
  guardian_phone text,
  guardian_relation text,
  admission_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, roll_number)
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "School owners can manage their school students"
  ON students FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = students.school_id
      AND s.owner_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- Add trigger for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();