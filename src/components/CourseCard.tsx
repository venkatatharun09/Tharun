import { Course, UserProgress } from '../lib/supabase';
import { Clock, BarChart } from 'lucide-react';

type Props = {
  course: Course;
  progress: UserProgress[];
  onClick: () => void;
};

export default function CourseCard({ course, progress, onClick }: Props) {
  const completedLessons = progress.filter(p => p.status === 'completed').length;
  const totalLessons = progress.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficulty_level]}`}>
            {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{course.estimated_hours}h</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart className="w-4 h-4" />
            <span>{progressPercentage}% complete</span>
          </div>
        </div>

        {totalLessons > 0 && (
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
