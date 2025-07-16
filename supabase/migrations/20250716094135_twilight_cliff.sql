/*
  # Create Classes Table for Class Management

  1. New Tables
    - `classes` - Store class information
      - Basic info: name, section, academic_year, etc.
      - Teacher assignment: class_teacher_id
      - Student capacity and current count
      - Status: active, inactive

  2. Security
    - Enable RLS on classes table
    - School owners can manage classes in their school
    - Maintain data isolation between schools

  3. Indexes
    - Add indexes for better query performance
    - Unique constraint on class name + section per school per academic year
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  section text DEFAULT '',
  academic_year text NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::text,
  class_teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  capacity integer DEFAULT 50,
  current_students integer DEFAULT 0,
  room_number text,
  schedule jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, name, section, academic_year)
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "School owners can manage their school classes"
  ON classes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = classes.school_id
      AND s.owner_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(name);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(class_teacher_id);

-- Add trigger for updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();