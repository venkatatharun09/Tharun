import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Lesson, Course, Assessment, UserProgress } from '../lib/supabase';
import { X, CheckCircle, ChevronRight } from 'lucide-react';

type Props = {
  lesson: Lesson;
  course: Course;
  onClose: () => void;
};

export default function LessonView({ lesson, course, onClose }: Props) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (lesson.content_type === 'quiz') {
      loadAssessments();
    }
    updateProgress('in_progress', 0);
  }, [lesson.id]);

  const loadAssessments = async () => {
    const { data } = await supabase
      .from('assessments')
      .select('*')
      .eq('lesson_id', lesson.id);

    if (data) setAssessments(data);
  };

  const updateProgress = async (status: string, completionPercentage: number) => {
    if (!user) return;

    const timeSpent = Math.round((Date.now() - startTime) / 60000);

    const progressData = {
      user_id: user.id,
      lesson_id: lesson.id,
      course_id: course.id,
      status,
      completion_percentage: completionPercentage,
      time_spent_minutes: timeSpent,
      last_accessed_at: new Date().toISOString(),
      ...(status === 'completed' && { completed_at: new Date().toISOString() }),
    };

    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_progress')
        .update(progressData)
        .eq('id', existing.id);
    } else {
      await supabase.from('user_progress').insert(progressData);
    }
  };

  const handleCompleteLesson = async () => {
    await updateProgress('completed', 100);
    onClose();
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !user) return;

    const currentAssessment = assessments[currentQuestion];
    const correct = selectedAnswer === currentAssessment.correct_answer;
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      setScore(score + 1);
    }

    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    await supabase.from('user_assessments').insert({
      user_id: user.id,
      assessment_id: currentAssessment.id,
      user_answer: selectedAnswer,
      is_correct: correct,
      time_taken_seconds: timeTaken,
    });

    const progress = Math.round(((currentQuestion + 1) / assessments.length) * 100);
    await updateProgress('in_progress', progress);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < assessments.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsCorrect(null);
    } else {
      setQuizCompleted(true);
      updateProgress('completed', 100);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{lesson.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-8">
          {lesson.content_type === 'quiz' && assessments.length > 0 ? (
            quizCompleted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h3>
                <p className="text-xl text-slate-600 mb-8">
                  You scored {score} out of {assessments.length}
                </p>
                <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-4 mb-8">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(score / assessments.length) * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Continue Learning
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-600">
                      Question {currentQuestion + 1} of {assessments.length}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      assessments[currentQuestion].difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      assessments[currentQuestion].difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {assessments[currentQuestion].difficulty}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / assessments.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">
                    {assessments[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {assessments[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => !showExplanation && setSelectedAnswer(option)}
                        disabled={showExplanation}
                        className={`w-full text-left p-4 border-2 rounded-lg transition ${
                          selectedAnswer === option
                            ? showExplanation
                              ? isCorrect
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === option
                              ? showExplanation
                                ? isCorrect
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-red-500 bg-red-500'
                                : 'border-blue-500 bg-blue-500'
                              : 'border-slate-300'
                          }`}>
                            {selectedAnswer === option && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="font-medium text-slate-900">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {showExplanation && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-semibold mb-2 ${
                      isCorrect ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-slate-700">{assessments[currentQuestion].explanation}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  {!showExplanation ? (
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedAnswer}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      <span>{currentQuestion < assessments.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            <div>
              <div className="prose max-w-none mb-8">
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {lesson.content}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCompleteLesson}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark as Complete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
