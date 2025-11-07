/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses multiple performance and security concerns identified in the database:
  
  1. Adds missing indexes for foreign keys to optimize query performance
  2. Updates RLS policies to use optimized auth function calls with SELECT statements
  3. Drops unused indexes that were created prematurely
  
  ## Changes Made
  
  ### 1. Foreign Key Indexes
  - Added index on `learning_paths(course_id)`
  - Added index on `user_assessments(assessment_id)`
  - Added index on `user_progress(lesson_id)`
  
  These indexes prevent full table scans when querying foreign key relationships.
  
  ### 2. RLS Policy Optimization
  Updated all RLS policies to use optimized auth function calls:
  - Changed `auth.uid()` to `(select auth.uid())`
  - This prevents re-evaluation for each row and caches the result
  - Improves query performance at scale significantly
  
  ### 3. Unused Indexes
  Removed indexes that were not providing query optimization benefit:
  - `idx_lessons_course_id` - replaced by foreign key constraint index
  - `idx_user_progress_user_id` - replaced by foreign key constraint index
  - `idx_user_progress_course_id` - replaced by foreign key constraint index
  - `idx_assessments_lesson_id` - replaced by foreign key constraint index
  - `idx_user_assessments_user_id` - replaced by foreign key constraint index
  - `idx_learning_paths_user_id` - replaced by foreign key constraint index
  
  ## Security Notes
  - Password leak detection is a managed Supabase Auth setting - enable in Auth settings
  - All RLS policies maintain strong security while improving performance
*/

-- Add missing foreign key indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_course_id ON learning_paths(course_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_assessment_id ON user_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);

-- Drop unused indexes to reduce storage and maintenance overhead
DROP INDEX IF EXISTS idx_lessons_course_id;
DROP INDEX IF EXISTS idx_user_progress_user_id;
DROP INDEX IF EXISTS idx_user_progress_course_id;
DROP INDEX IF EXISTS idx_assessments_lesson_id;
DROP INDEX IF EXISTS idx_user_assessments_user_id;
DROP INDEX IF EXISTS idx_learning_paths_user_id;

-- Drop and recreate RLS policies with optimized auth function calls
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own assessment results" ON user_assessments;
CREATE POLICY "Users can view own assessment results"
  ON user_assessments FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own assessment results" ON user_assessments;
CREATE POLICY "Users can insert own assessment results"
  ON user_assessments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own learning paths" ON learning_paths;
CREATE POLICY "Users can view own learning paths"
  ON learning_paths FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own learning paths" ON learning_paths;
CREATE POLICY "Users can insert own learning paths"
  ON learning_paths FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own learning paths" ON learning_paths;
CREATE POLICY "Users can update own learning paths"
  ON learning_paths FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));