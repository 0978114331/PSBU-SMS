/*
# School Management System - Initial Schema

## Overview
Creates the complete database schema for a School Management System with role-based access control (RBAC).
Supports: user profiles with roles, student master list, attendance tracking, score management, class/cleaning schedules, and custom ID card generation.

## New Tables

1. **profiles** - Extends Supabase auth.users with role and full_name
   - `id` (uuid, PK, references auth.users)
   - `role` (text: 'admin' or 'user', default 'user')
   - `full_name` (text)
   - `created_at` (timestamp)

2. **students** - Master student list
   - `id` (uuid, PK)
   - `stu_id` (text, student ID number)
   - `name` (text, not null)
   - `gender` (text)
   - `dob` (date)
   - `pob` (text, place of birth)
   - `note` (text)
   - `created_at` (timestamp)

3. **attendance** - Daily attendance records
   - `id` (uuid, PK)
   - `student_id` (uuid, FK to students)
   - `stu_id` (text, denormalized for QR scan lookups)
   - `name` (text, not null)
   - `gender` (text)
   - `status` (text: present/leave/absent in Khmer)
   - `shift` (text)
   - `date` (date, not null)
   - `time` (text)
   - `room` (text)
   - `teacher` (text)
   - `subject` (text)
   - `created_at` (timestamp)

4. **scores** - Individual subject scores per student
   - `id` (uuid, PK)
   - `student_id` (uuid, FK to students)
   - `subject_name` (text, not null)
   - `score` (numeric, default 0)
   - `created_at` (timestamp)

5. **schedules** - Flexible key-value store for schedules and config
   - `id` (uuid, PK)
   - `type` (text, not null: 'class_schedule', 'cleaning_schedule', 'school_info', 'subjects')
   - `data_json` (jsonb)
   - `created_at` (timestamp)

6. **custom_cards** - Saved ID card data
   - `id` (uuid, PK)
   - `template` (text: student/company/staff/business/press/library)
   - `card_id` (text, not null)
   - `name` (text, not null)
   - `field1` (text)
   - `field2` (text)
   - `photo` (text, base64 data URL)
   - `created_at` (timestamp)

## Security
- RLS enabled on ALL tables.
- profiles: users can read all profiles, update only their own.
- students, attendance, scores, schedules, custom_cards: all authenticated users can SELECT; only admins can INSERT/UPDATE/DELETE.
- Helper function `is_admin()` checks the current user's role.

## Notes
1. A trigger auto-creates a profile row when a new auth user signs up.
2. The `is_admin()` function is SECURITY DEFINER so it can read profiles regardless of RLS.
3. Admin role is assigned during registration (frontend validates admin secret code).
*/

-- profiles table (must be created before is_admin function)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Helper function to check if current user is admin (must come after profiles table)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stu_id text,
  name text NOT NULL,
  gender text,
  dob date,
  pob text,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_select_authenticated" ON students;
CREATE POLICY "students_select_authenticated" ON students FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "students_insert_admin" ON students;
CREATE POLICY "students_insert_admin" ON students FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "students_update_admin" ON students;
CREATE POLICY "students_update_admin" ON students FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "students_delete_admin" ON students;
CREATE POLICY "students_delete_admin" ON students FOR DELETE
  TO authenticated USING (is_admin());

-- attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  stu_id text,
  name text NOT NULL,
  gender text,
  status text NOT NULL,
  shift text,
  date date NOT NULL,
  time text,
  room text,
  teacher text,
  subject text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_select_authenticated" ON attendance;
CREATE POLICY "attendance_select_authenticated" ON attendance FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "attendance_insert_admin" ON attendance;
CREATE POLICY "attendance_insert_admin" ON attendance FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "attendance_update_admin" ON attendance;
CREATE POLICY "attendance_update_admin" ON attendance FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "attendance_delete_admin" ON attendance;
CREATE POLICY "attendance_delete_admin" ON attendance FOR DELETE
  TO authenticated USING (is_admin());

-- scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_name text NOT NULL,
  score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scores_select_authenticated" ON scores;
CREATE POLICY "scores_select_authenticated" ON scores FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "scores_insert_admin" ON scores;
CREATE POLICY "scores_insert_admin" ON scores FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "scores_update_admin" ON scores;
CREATE POLICY "scores_update_admin" ON scores FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "scores_delete_admin" ON scores;
CREATE POLICY "scores_delete_admin" ON scores FOR DELETE
  TO authenticated USING (is_admin());

-- schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  data_json jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedules_select_authenticated" ON schedules;
CREATE POLICY "schedules_select_authenticated" ON schedules FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "schedules_insert_admin" ON schedules;
CREATE POLICY "schedules_insert_admin" ON schedules FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "schedules_update_admin" ON schedules;
CREATE POLICY "schedules_update_admin" ON schedules FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "schedules_delete_admin" ON schedules;
CREATE POLICY "schedules_delete_admin" ON schedules FOR DELETE
  TO authenticated USING (is_admin());

-- custom_cards table
CREATE TABLE IF NOT EXISTS custom_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template text DEFAULT 'student',
  card_id text NOT NULL,
  name text NOT NULL,
  field1 text,
  field2 text,
  photo text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_cards_select_authenticated" ON custom_cards;
CREATE POLICY "custom_cards_select_authenticated" ON custom_cards FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "custom_cards_insert_admin" ON custom_cards;
CREATE POLICY "custom_cards_insert_admin" ON custom_cards FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "custom_cards_update_admin" ON custom_cards;
CREATE POLICY "custom_cards_update_admin" ON custom_cards FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "custom_cards_delete_admin" ON custom_cards;
CREATE POLICY "custom_cards_delete_admin" ON custom_cards FOR DELETE
  TO authenticated USING (is_admin());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (NEW.id, 'user', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Index for frequent queries
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_stu_id ON attendance(stu_id);
CREATE INDEX IF NOT EXISTS idx_scores_student_id ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_students_stu_id ON students(stu_id);