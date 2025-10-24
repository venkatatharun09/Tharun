import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, UserProgress, Profile } from '../lib/supabase';
import { LogOut, BookOpen, Award, Clock, TrendingUp, User } from 'lucide-react';
import CourseCard from './CourseCard';
import CourseDetail from './CourseDetail';
import ProgressDashboard from './ProgressDashboard';

type View = 'courses' | 'course-detail' | 'progress' | 'profile';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentView, setCurrentView] = useState<View>('courses');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [coursesResult, progressResult, profileResult] = await Promise.all([
        supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('user_progress').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      ]);

      if (coursesResult.data) setCourses(coursesResult.data);
      if (progressResult.data) setUserProgress(progressResult.data);
      if (profileResult.data) setProfile(profileResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const completedLessons = userProgress.filter(p => p.status === 'completed').length;
    const totalTime = userProgress.reduce((sum, p) => sum + p.time_spent_minutes, 0);
    const inProgressCourses = new Set(
      userProgress.filter(p => p.status === 'in_progress').map(p => p.course_id)
    ).size;

    return { completedLessons, totalTime, inProgressCourses };
  };

  const stats = calculateStats();

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('course-detail');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCurrentView('courses');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">AdaptLearn</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('courses')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'courses' || currentView === 'course-detail'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setCurrentView('progress')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'progress'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'profile'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Profile
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'courses' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {profile?.full_name || 'Learner'}!
              </h1>
              <p className="text-slate-600">Continue your learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed Lessons</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.completedLessons}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Learning Time</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTime}m</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Active Courses</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.inProgressCourses}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={userProgress.filter(p => p.course_id === course.id)}
                    onClick={() => handleCourseClick(course)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {currentView === 'course-detail' && selectedCourse && (
          <CourseDetail
            course={selectedCourse}
            onBack={handleBackToCourses}
            onProgressUpdate={loadData}
          />
        )}

        {currentView === 'progress' && (
          <ProgressDashboard
            userProgress={userProgress}
            courses={courses}
            profile={profile}
          />
        )}

        {currentView === 'profile' && profile && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{profile.full_name}</h2>
                  <p className="text-slate-600">{profile.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => updateProfile({ full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Learning Style
                  </label>
                  <select
                    value={profile.learning_style}
                    onChange={(e) => updateProfile({ learning_style: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="reading">Reading/Writing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Skill Level
                  </label>
                  <select
                    value={profile.skill_level}
                    onChange={(e) => updateProfile({ skill_level: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
