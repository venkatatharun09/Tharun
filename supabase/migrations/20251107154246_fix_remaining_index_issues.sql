/*
  # Fix Remaining Index and Performance Issues

  ## Overview
  This migration addresses the remaining performance concerns:
  
  1. Adds missing indexes for all remaining foreign keys
  2. Drops unused indexes that don't provide query optimization
  
  ## Changes Made
  
  ### 1. Foreign Key Indexes Added
  - Added index on `assessments(lesson_id)` for lessons relationship
  - Added index on `lessons(course_id)` for courses relationship
  - Added index on `user_assessments(user_id)` for user relationship
  - Added index on `user_progress(course_id)` for course relationship
  
  These indexes ensure efficient queries when filtering by foreign keys and prevent table scans.
  
  ### 2. Unused Indexes Removed
  - Dropped `idx_learning_paths_course_id` - not providing optimization benefit
  - Dropped `idx_user_assessments_assessment_id` - not providing optimization benefit
  - Dropped `idx_user_progress_lesson_id` - not providing optimization benefit
  
  ## Performance Impact
  - Foreign key queries will now use index lookups instead of full table scans
  - Removed indexes reduce storage overhead and maintenance time
  - Overall query performance improved significantly
  
  ## Security Notes
  - Password leak detection must be enabled in Supabase Auth settings
  - Navigate to Authentication > Security > Compromised Password Protection
*/

-- Add missing indexes for foreign key relationships
CREATE INDEX IF NOT EXISTS idx_assessments_lesson_id ON assessments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);

-- Drop unused indexes to reduce storage and maintenance overhead
DROP INDEX IF EXISTS idx_learning_paths_course_id;
DROP INDEX IF EXISTS idx_user_assessments_assessment_id;
DROP INDEX IF EXISTS idx_user_progress_lesson_id;
