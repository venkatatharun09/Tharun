import { UserProgress, Course, Profile } from '../lib/supabase';
import { Award, TrendingUp, Target, Calendar } from 'lucide-react';

type Props = {
  userProgress: UserProgress[];
  courses: Course[];
  profile: Profile | null;
};

export default function ProgressDashboard({ userProgress, courses, profile }: Props) {
  const calculateWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyProgress = userProgress.filter(
      p => new Date(p.last_accessed_at) >= oneWeekAgo
    );

    const lessonsThisWeek = weeklyProgress.filter(p => p.status === 'completed').length;
    const minutesThisWeek = weeklyProgress.reduce((sum, p) => sum + p.time_spent_minutes, 0);

    return { lessonsThisWeek, minutesThisWeek };
  };

  const getCourseProgress = (courseId: string) => {
    const courseProgress = userProgress.filter(p => p.course_id === courseId);
    const completed = courseProgress.filter(p => p.status === 'completed').length;
    const total = courseProgress.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const { lessonsThisWeek, minutesThisWeek } = calculateWeeklyStats();
  const totalCompleted = userProgress.filter(p => p.status === 'completed').length;
  const totalTime = userProgress.reduce((sum, p) => sum + p.time_spent_minutes, 0);

  const activeCourses = courses.filter(course =>
    userProgress.some(p => p.course_id === course.id && p.status !== 'not_started')
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Progress</h1>
        <p className="text-slate-600">Track your learning journey and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-slate-600">ALL TIME</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalCompleted}</p>
          <p className="text-sm text-slate-600 mt-1">Lessons Completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-slate-600">THIS WEEK</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{lessonsThisWeek}</p>
          <p className="text-sm text-slate-600 mt-1">Lessons This Week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-slate-600">TOTAL</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{Math.floor(totalTime / 60)}h</p>
          <p className="text-sm text-slate-600 mt-1">Learning Time</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-slate-600">THIS WEEK</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{minutesThisWeek}m</p>
          <p className="text-sm text-slate-600 mt-1">Minutes This Week</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 border border-slate-200 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Courses</h2>
        <div className="space-y-6">
          {activeCourses.length > 0 ? (
            activeCourses.map(course => {
              const progress = getCourseProgress(course.id);
              const courseProgress = userProgress.filter(p => p.course_id === course.id);
              const completed = courseProgress.filter(p => p.status === 'completed').length;
              const total = courseProgress.length;

              return (
                <div key={course.id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {completed} of {total} lessons completed
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">No active courses yet. Start learning to see your progress here!</p>
            </div>
          )}
        </div>
      </div>

      {profile && (
        <div className="bg-white rounded-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Learning Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Learning Style</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">
                {profile.learning_style}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Skill Level</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">
                {profile.skill_level}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Member Since</p>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
