/*
  # Comprehensive Admission System Update

  1. New Tables
    - `admission_applications` - Enhanced admission applications with all required fields
    - Replace simple applications table for admission-specific data

  2. Security
    - Enable RLS on admission_applications table
    - Allow public insertion for applications
    - School owners can manage applications

  3. Structure
    - Student information (Bangla & English names)
    - Parent/Guardian details with NID
    - Address information (present & permanent)
    - Previous education details
    - Exam results and preferences
    - Contact preferences and consent
*/

-- Create comprehensive admission applications table
CREATE TABLE IF NOT EXISTS admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  
  -- Student Photo
  student_photo_url text,
  
  -- Student Basic Information
  full_name_bangla text NOT NULL,
  full_name_english text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  religion text NOT NULL CHECK (religion IN ('Islam', 'Hindu', 'Christian', 'Buddhist', 'Other')),
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  national_id_birth_cert text NOT NULL,
  father_nid text NOT NULL,
  mother_nid text NOT NULL,
  father_phone text NOT NULL,
  mother_phone text NOT NULL,
  father_occupation text NOT NULL,
  mother_occupation text NOT NULL,
  email text,
  
  -- Present Address
  present_village_ward text NOT NULL,
  present_post_office_code text NOT NULL,
  present_upazila text NOT NULL,
  present_district text NOT NULL,
  
  -- Permanent Address
  permanent_same_as_present boolean DEFAULT false,
  permanent_village_ward text,
  permanent_post_office_code text,
  permanent_upazila text,
  permanent_district text,
  
  -- Guardian Information (if different from parents)
  has_different_guardian boolean DEFAULT false,
  guardian_name text,
  guardian_nid text,
  guardian_phone text,
  guardian_relation text CHECK (guardian_relation IN ('Father', 'Mother', 'Uncle', 'Aunt', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other')),
  guardian_status text CHECK (guardian_status IN ('Alive', 'Dead', 'Abroad', 'Not applicable')),
  
  -- Previous Education
  last_school_name text NOT NULL,
  last_class text NOT NULL,
  year_passed text NOT NULL,
  education_board text NOT NULL,
  previous_school_eiin text,
  tc_ssc_roll text,
  
  -- Exam Results
  jsc_ssc_group text CHECK (jsc_ssc_group IN ('Science', 'Humanities', 'Commerce')),
  gpa numeric(3,2),
  result_education_board text,
  has_scholarship boolean DEFAULT false,
  technical_other_details text,
  
  -- Communication Preferences
  contact_via_sms boolean DEFAULT false,
  contact_via_email boolean DEFAULT false,
  contact_via_phone boolean DEFAULT false,
  contact_via_post boolean DEFAULT false,
  
  -- Class and Group Preferences
  desired_class text NOT NULL CHECK (desired_class IN ('Class 6', 'Class 7', 'Class 8', 'Class 9')),
  desired_group text CHECK (desired_group IN ('Science', 'Commerce', 'Arts')),
  desired_section text,
  
  -- Consent and Status
  terms_accepted boolean DEFAULT false NOT NULL,
  application_status text DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected', 'under_review')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can submit admission applications"
  ON admission_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "School owners can view their school applications"
  ON admission_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = admission_applications.school_id
      AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can update their school applications"
  ON admission_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools s
      WHERE s.id = admission_applications.school_id
      AND s.owner_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admission_applications_school_id ON admission_applications(school_id);
CREATE INDEX IF NOT EXISTS idx_admission_applications_status ON admission_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_admission_applications_created_at ON admission_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_admission_applications_desired_class ON admission_applications(desired_class);

-- Add trigger for updated_at
CREATE TRIGGER update_admission_applications_updated_at BEFORE UPDATE ON admission_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();