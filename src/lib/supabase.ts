import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  thumbnail_url: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
  content_type: 'video' | 'text' | 'interactive' | 'quiz';
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  time_spent_minutes: number;
  started_at: string;
  completed_at?: string;
  last_accessed_at: string;
};

export type Assessment = {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
};

export type UserAssessment = {
  id: string;
  user_id: string;
  assessment_id: string;
  user_answer: string;
  is_correct: boolean;
  attempted_at: string;
  time_taken_seconds: number;
};
