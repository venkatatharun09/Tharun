import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, Lesson, UserProgress } from '../lib/supabase';
import { ArrowLeft, PlayCircle, CheckCircle, Circle, Clock } from 'lucide-react';
import LessonView from './LessonView';

type Props = {
  course: Course;
  onBack: () => void;
  onProgressUpdate: () => void;
};

export default function CourseDetail({ course, onBack, onProgressUpdate }: Props) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [course.id, user]);

  const loadLessons = async () => {
    if (!user) return;

    try {
      const [lessonsResult, progressResult] = await Promise.all([
        supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
          .order('order_index', { ascending: true }),
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', course.id),
      ]);

      if (lessonsResult.data) setLessons(lessonsResult.data);
      if (progressResult.data) setUserProgress(progressResult.data);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return userProgress.find(p => p.lesson_id === lessonId);
  };

  const getProgressIcon = (lessonId: string) => {
    const progress = getLessonProgress(lessonId);
    if (!progress || progress.status === 'not_started') {
      return <Circle className="w-5 h-5 text-slate-400" />;
    }
    if (progress.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <PlayCircle className="w-5 h-5 text-blue-600" />;
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonClose = () => {
    setSelectedLesson(null);
    loadLessons();
    onProgressUpdate();
  };

  if (selectedLesson) {
    return (
      <LessonView
        lesson={selectedLesson}
        course={course}
        onClose={handleLessonClose}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedCount = userProgress.filter(p => p.status === 'completed').length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Courses</span>
      </button>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-blue-100 text-lg">{course.description}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-8">
              <div>
                <p className="text-sm text-slate-600">Duration</p>
                <p className="text-lg font-semibold text-slate-900">{course.estimated_hours} hours</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Difficulty</p>
                <p className="text-lg font-semibold text-slate-900 capitalize">{course.difficulty_level}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Progress</p>
                <p className="text-lg font-semibold text-slate-900">{progressPercentage}%</p>
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Content</h2>
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const progress = getLessonProgress(lesson.id);
            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson)}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getProgressIcon(lesson.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-slate-500">
                        Lesson {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        lesson.content_type === 'video' ? 'bg-red-100 text-red-700' :
                        lesson.content_type === 'quiz' ? 'bg-orange-100 text-orange-700' :
                        lesson.content_type === 'interactive' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {lesson.content_type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-slate-600 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.estimated_minutes} min</span>
                      {progress && progress.completion_percentage > 0 && progress.status !== 'completed' && (
                        <span className="ml-2 text-blue-600">
                          {progress.completion_percentage}% complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
