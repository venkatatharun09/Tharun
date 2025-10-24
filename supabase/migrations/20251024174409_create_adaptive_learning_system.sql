/*
  # Adaptive Knowledge Delivery System - Database Schema

  ## Overview
  This migration creates the complete database schema for an adaptive learning platform
  that personalizes content delivery based on user performance and learning patterns.

  ## New Tables

  ### 1. `profiles`
  User profile information extending Supabase auth
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `learning_style` (text) - Preferred learning style (visual, auditory, kinesthetic, reading)
  - `skill_level` (text) - Current skill level (beginner, intermediate, advanced)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. `courses`
  Available courses in the system
  - `id` (uuid, primary key)
  - `title` (text) - Course name
  - `description` (text) - Course description
  - `difficulty_level` (text) - Course difficulty (beginner, intermediate, advanced)
  - `estimated_hours` (integer) - Estimated completion time
  - `thumbnail_url` (text) - Course image
  - `is_published` (boolean) - Publication status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `lessons`
  Individual lessons within courses
  - `id` (uuid, primary key)
  - `course_id` (uuid) - Foreign key to courses
  - `title` (text) - Lesson name
  - `content` (text) - Lesson content (markdown supported)
  - `order_index` (integer) - Lesson sequence order
  - `difficulty_level` (text) - Lesson difficulty
  - `estimated_minutes` (integer) - Estimated completion time
  - `content_type` (text) - Type of content (video, text, interactive, quiz)
  - `created_at` (timestamptz)

  ### 4. `user_progress`
  Tracks user progress through courses and lessons
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Foreign key to profiles
  - `lesson_id` (uuid) - Foreign key to lessons
  - `course_id` (uuid) - Foreign key to courses
  - `status` (text) - Progress status (not_started, in_progress, completed)
  - `completion_percentage` (integer) - Progress percentage (0-100)
  - `time_spent_minutes` (integer) - Time spent on lesson
  - `started_at` (timestamptz) - When user started
  - `completed_at` (timestamptz) - When user completed
  - `last_accessed_at` (timestamptz) - Last access time

  ### 5. `assessments`
  Quizzes and tests for measuring understanding
  - `id` (uuid, primary key)
  - `lesson_id` (uuid) - Foreign key to lessons
  - `question` (text) - Assessment question
  - `options` (jsonb) - Answer options (array of strings)
  - `correct_answer` (text) - Correct answer
  - `explanation` (text) - Explanation for the answer
  - `difficulty` (text) - Question difficulty
  - `created_at` (timestamptz)

  ### 6. `user_assessments`
  User responses to assessments
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Foreign key to profiles
  - `assessment_id` (uuid) - Foreign key to assessments
  - `user_answer` (text) - User's submitted answer
  - `is_correct` (boolean) - Whether answer was correct
  - `attempted_at` (timestamptz) - When user answered
  - `time_taken_seconds` (integer) - Time to answer

  ### 7. `learning_paths`
  Personalized learning recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Foreign key to profiles
  - `course_id` (uuid) - Foreign key to courses
  - `recommended_order` (jsonb) - Customized lesson order
  - `priority_score` (integer) - Priority ranking
  - `reason` (text) - Why this path was recommended
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only access their own data
  - Public read access for published courses and lessons
  - Authenticated users can track their own progress

  ## Important Notes
  1. All tables use UUID primary keys with automatic generation
  2. Timestamps use timestamptz for proper timezone handling
  3. Foreign keys maintain referential integrity
  4. RLS policies are restrictive by default
  5. Indexes added for frequently queried columns
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  learning_style text DEFAULT 'visual' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  skill_level text DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours integer DEFAULT 0,
  thumbnail_url text DEFAULT '',
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer DEFAULT 15,
  content_type text DEFAULT 'text' CHECK (content_type IN ('video', 'text', 'interactive', 'quiz')),
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  time_spent_minutes integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_accessed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text DEFAULT '',
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now()
);

-- Create user_assessments table
CREATE TABLE IF NOT EXISTS user_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  attempted_at timestamptz DEFAULT now(),
  time_taken_seconds integer DEFAULT 0
);

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  recommended_order jsonb DEFAULT '[]'::jsonb,
  priority_score integer DEFAULT 0,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_lesson_id ON assessments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Courses policies (public read for published courses)
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Lessons policies (public read for lessons of published courses)
CREATE POLICY "Anyone can view lessons of published courses"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.is_published = true
    )
  );

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Assessments policies
CREATE POLICY "Anyone can view assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN courses ON courses.id = lessons.course_id
      WHERE lessons.id = assessments.lesson_id
      AND courses.is_published = true
    )
  );

-- User assessments policies
CREATE POLICY "Users can view own assessment results"
  ON user_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment results"
  ON user_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Learning paths policies
CREATE POLICY "Users can view own learning paths"
  ON learning_paths FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning paths"
  ON learning_paths FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning paths"
  ON learning_paths FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);