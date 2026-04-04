import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, Course } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useModules } from "@/hooks/useModules";
import { useCertificates } from "@/hooks/useCertificates";
import { useAIQuizzes, AIQuizWithQuestions } from "@/hooks/useAIQuizzes";
import { ModuleNavigation } from "@/components/course/ModuleNavigation";
import { ModuleContent } from "@/components/course/ModuleContent";
import { QuizComponent } from "@/components/course/QuizComponent";
import { CourseProgress } from "@/components/course/CourseProgress";
import { ResourceList } from "@/components/course/ResourceList";
import { useCourseResources } from "@/hooks/useAdminCourses";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Menu,
  X,
  Award,
  Home,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const {
    modules,
    completions,
    loading: modulesLoading,
    fetchCompletions,
    startModule,
    completeModule,
    getModuleStatus,
    confirmInstructorAttendance,
    approveInstructorModule,
    isInstructorModuleComplete
  } = useModules(courseId || '');
  const { createCertificate } = useCertificates();
  const { resources } = useCourseResources(courseId);
  const { getQuizWithQuestions } = useAIQuizzes();

  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFinalQuiz, setShowFinalQuiz] = useState(false);
  const [finalQuizData, setFinalQuizData] = useState<AIQuizWithQuestions | null>(null);
  const [finalQuizScore, setFinalQuizScore] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);

  // Find course and enrollment
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse || null);
    }
  }, [courseId, courses]);

  useEffect(() => {
    if (courseId && enrollments.length > 0) {
      const foundEnrollment = enrollments.find(e => e.course_id === courseId);
      setEnrollment(foundEnrollment || null);
      
      if (foundEnrollment) {
        fetchCompletions(foundEnrollment.id);
      }
    }
  }, [courseId, enrollments]);

  // Set initial module
  useEffect(() => {
    if (modules.length > 0 && !currentModuleId) {
      // Find first incomplete module or default to first
      const firstIncomplete = modules.find(m => {
        const status = getModuleStatus(m.id);
        return status !== 'completed';
      });
      setCurrentModuleId(firstIncomplete?.id || modules[0].id);
    }
  }, [modules, completions, currentModuleId]);

  // Start module when selected
  useEffect(() => {
    const initModule = async () => {
      if (currentModuleId && enrollment && user) {
        try {
          await startModule(currentModuleId, enrollment.id);
        } catch (error) {
          console.error('Error starting module:', error);
        }
      }
    };
    initModule();
  }, [currentModuleId, enrollment, user]);

  // Redirect if not enrolled
  useEffect(() => {
    if (!authLoading && !enrollmentsLoading && !user) {
      navigate('/auth?mode=login');
    }
    if (!authLoading && !enrollmentsLoading && user && enrollments.length > 0 && courseId) {
      const isEnrolled = enrollments.some(e => e.course_id === courseId);
      if (!isEnrolled) {
        toast.error('You are not enrolled in this course');
        navigate('/courses');
      }
    }
  }, [authLoading, enrollmentsLoading, user, enrollments, courseId, navigate]);

  const handleModuleSelect = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setShowQuiz(false);
    setSidebarOpen(false);
  };

  const handleModuleComplete = async () => {
    if (!currentModuleId) return;
    
    const currentModuleData = modules.find(m => m.id === currentModuleId);
    
    // For instructor-led modules, check if it's approved
    if (currentModuleData?.requires_instructor_approval) {
      if (!isInstructorModuleComplete(currentModuleId)) {
        // Just move to next module without completing
        const currentIndex = modules.findIndex(m => m.id === currentModuleId);
        if (currentIndex < modules.length - 1) {
          setCurrentModuleId(modules[currentIndex + 1].id);
        }
        return;
      }
    }

    try {
      if (!currentModuleData?.requires_instructor_approval) {
        await completeModule(currentModuleId);
      }
      await updateEnrollmentProgress();
      
      // Move to next module
      const currentIndex = modules.findIndex(m => m.id === currentModuleId);
      if (currentIndex < modules.length - 1) {
        setCurrentModuleId(modules[currentIndex + 1].id);
        toast.success('Module completed! Moving to the next one.');
      } else {
        // Check if all modules are complete including instructor-led ones
        const allComplete = modules.every(m => {
          if (m.requires_instructor_approval) {
            return isInstructorModuleComplete(m.id);
          }
          return getModuleStatus(m.id) === 'completed';
        });
        
        if (allComplete) {
          await markCourseComplete();
          toast.success('Congratulations! You have completed the course!');
        }
      }
    } catch (error) {
      toast.error('Failed to save progress');
    }
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    if (!passed) {
      setShowQuiz(false);
      return;
    }

    try {
      await completeModule(currentModuleId!, score);
      await updateEnrollmentProgress();
      setShowQuiz(false);

      // Move to next module
      const currentIndex = modules.findIndex(m => m.id === currentModuleId);
      if (currentIndex < modules.length - 1) {
        setCurrentModuleId(modules[currentIndex + 1].id);
        toast.success('Quiz passed! Moving to the next module.');
      } else {
        await markCourseComplete();
        toast.success('Congratulations! You have completed the course!');
      }
    } catch (error) {
      toast.error('Failed to save quiz results');
    }
  };

  const updateEnrollmentProgress = async () => {
    if (!enrollment) return;

    const completedCount = completions.filter(c => c.status === 'completed').length + 1;
    const progressPercentage = Math.round((completedCount / modules.length) * 100);

    await supabase
      .from('enrollments')
      .update({
        progress_percentage: progressPercentage,
        status: progressPercentage === 100 ? 'completed' : 'in_progress',
        started_at: enrollment.started_at || new Date().toISOString()
      })
      .eq('id', enrollment.id);
  };

  const markCourseComplete = async () => {
    if (!enrollment || !course) return;

    await supabase
      .from('enrollments')
      .update({
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', enrollment.id);

    // Create certificate
    await createCertificate(enrollment.id, course.id, course.title);

    // If the course has a final quiz, load and show it
    if (course.final_quiz_id) {
      try {
        const quizData = await getQuizWithQuestions(course.final_quiz_id);
        setFinalQuizData(quizData);
        setShowFinalQuiz(true);
      } catch (err) {
        console.error('Failed to load final quiz:', err);
      }
    }
  };

  const handleFinalQuizComplete = (score: number) => {
    setFinalQuizScore(score);
    setShowFinalQuiz(false);
    toast.success(`Final quiz complete! You scored ${score}%.`);
  };

  const currentModule = modules.find(m => m.id === currentModuleId);
  const loading = authLoading || coursesLoading || enrollmentsLoading || modulesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Course not found</h2>
          <Link to="/courses">
            <Button variant="outline">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isComplete = completions.filter(c => c.status === 'completed').length === modules.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>

          <h1 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            {course.title}
          </h1>

          <div className="flex items-center gap-2">
            {isComplete && (
              <Link to="/certificates">
                <Button variant="outline" size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">View Certificate</span>
                </Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-80 
          bg-background border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 space-y-4 h-full overflow-y-auto">
            <CourseProgress
              modules={modules}
              completions={completions}
              courseDuration={course.duration_minutes}
            />
            <ModuleNavigation
              modules={modules}
              completions={completions}
              currentModuleId={currentModuleId || ''}
              onModuleSelect={handleModuleSelect}
            />
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <motion.div
              key={showFinalQuiz ? 'final-quiz' : currentModuleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── Final quiz overlay ── */}
              {showFinalQuiz && finalQuizData ? (
                <FinalQuizPanel
                  quiz={finalQuizData}
                  onComplete={handleFinalQuizComplete}
                  onSkip={() => setShowFinalQuiz(false)}
                />
              ) : showQuiz && currentModule ? (
                <QuizComponent
                  moduleId={currentModule.id}
                  moduleTitle={currentModule.title}
                  passMark={currentModule.quiz_pass_mark}
                  onComplete={handleQuizComplete}
                  onCancel={() => setShowQuiz(false)}
                />
              ) : currentModule ? (
                <ModuleContent
                  module={currentModule}
                  completion={completions.find(c => c.module_id === currentModule.id)}
                  status={getModuleStatus(currentModule.id)}
                  onComplete={handleModuleComplete}
                  onStartQuiz={currentModule.has_quiz ? () => setShowQuiz(true) : undefined}
                  onConfirmAttendance={currentModule.requires_instructor_approval
                    ? (name: string) => confirmInstructorAttendance(currentModule.id, name)
                    : undefined}
                  onApproveInstructorModule={currentModule.requires_instructor_approval
                    ? async () => {
                        await approveInstructorModule(currentModule.id);
                        await updateEnrollmentProgress();
                      }
                    : undefined}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Select a module to begin</p>
                </div>
              )}
            </motion.div>

            {/* Final quiz score summary (after completion) */}
            {finalQuizScore !== null && isComplete && !showFinalQuiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl border bg-primary/5 border-primary/20 flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Final Quiz Complete
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You scored <strong>{finalQuizScore}%</strong> on the final quiz.
                  </p>
                </div>
                {course?.final_quiz_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setShowFinalQuiz(true)}
                  >
                    Retake
                  </Button>
                )}
              </motion.div>
            )}

            {/* Prompt to take final quiz when course is complete but quiz not yet attempted */}
            {isComplete && course?.final_quiz_id && finalQuizScore === null && !showFinalQuiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 flex items-center gap-3"
              >
                <Award className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Final Quiz Available
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete the course final quiz to test your knowledge.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    if (course?.final_quiz_id) {
                      const data = await getQuizWithQuestions(course.final_quiz_id);
                      setFinalQuizData(data);
                      setShowFinalQuiz(true);
                    }
                  }}
                  className="gap-1"
                >
                  Start <ChevronRight className="h-3 w-3" />
                </Button>
              </motion.div>
            )}

            {/* Course Resources */}
            {resources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-8 pt-8 border-t border-border"
              >
                <ResourceList resources={resources} />
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── Inline Final Quiz Panel ────────────────────────────────────────────────

interface FinalQuizPanelProps {
  quiz: AIQuizWithQuestions;
  onComplete: (score: number) => void;
  onSkip: () => void;
}

function FinalQuizPanel({ quiz, onComplete, onSkip }: FinalQuizPanelProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIdx: number, aIdx: number) => {
    if (submitted) return;
    setAnswers(prev => {
      const next = [...prev];
      next[qIdx] = aIdx;
      return next;
    });
  };

  const handleSubmit = () => {
    const correct = quiz.questions.filter(
      (q, i) => answers[i] === q.correct_answer_index
    ).length;
    const pct = Math.round((correct / quiz.questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 space-y-3">
          <div className="text-6xl font-bold text-primary">{score}%</div>
          <p className="text-xl font-semibold text-foreground">
            {score >= 70 ? 'Excellent work!' : 'Keep practising!'}
          </p>
          <p className="text-muted-foreground text-sm">
            {quiz.questions.filter((q, i) => answers[i] === q.correct_answer_index).length} of {quiz.questions.length} correct
          </p>
          <Button onClick={() => onComplete(score)} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Done
          </Button>
        </div>
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="border rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium">{i + 1}. {q.question}</p>
            {q.options.map((opt, oi) => {
              const isSelected = answers[i] === oi;
              const isCorrect = oi === q.correct_answer_index;
              return (
                <div
                  key={oi}
                  className={`text-sm px-3 py-2 rounded-lg ${
                    isCorrect ? 'bg-green-500/10 text-green-700 border border-green-500/30' :
                    isSelected ? 'bg-red-500/10 text-red-700 border border-red-500/30' :
                    'bg-muted/30'
                  }`}
                >
                  {opt}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground italic">{q.explanation}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{quiz.difficulty}</Badge>
          <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
        </div>
      </div>

      {quiz.questions.map((q, i) => (
        <div key={q.id} className="border rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium">{i + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                onClick={() => handleSelect(i, oi)}
                className={`w-full text-left text-sm px-3 py-2.5 rounded-lg border-2 transition-all ${
                  answers[i] === oi
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={answers.some(a => a === null)}
        className="w-full gap-2"
      >
        Submit Final Quiz
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default CoursePlayer;
