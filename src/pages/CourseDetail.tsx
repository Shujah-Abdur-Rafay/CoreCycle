import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  Loader2,
  Lock,
  PlayCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useUserRole } from "@/hooks/useUserRole";
import { Course } from "@/hooks/useCourses";
import { Module } from "@/hooks/useModules";
import { toast } from "sonner";

function formatDuration(minutes: number) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canEnroll } = useUserRole();
  const { enrollments, enrollInCourse } = useEnrollments();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!courseId) return;
      setLoading(true);
      setNotFound(false);
      try {
        const [{ data: c, error: ce }, { data: ms, error: me }] = await Promise.all([
          supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
          supabase
            .from("modules")
            .select("*")
            .eq("course_id", courseId)
            .order("order_index", { ascending: true }),
        ]);
        if (!alive) return;
        if (ce || !c) {
          setNotFound(true);
        } else {
          setCourse({
            ...(c as any),
            access_type: (c as any).access_type ?? "public",
            module_count: (ms || []).length,
          });
          setModules((ms as Module[]) || []);
        }
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [courseId]);

  const isEnrolled = !!course && enrollments.some((e) => e.course_id === course.id);

  const handlePrimary = async () => {
    if (!course) return;
    if (!user) {
      navigate(`/auth?mode=login&redirect=/courses/${course.id}`);
      return;
    }
    if (isEnrolled) {
      navigate(`/course/${course.id}`);
      return;
    }
    if (!canEnroll) {
      toast.error("Your account is pending approval before enrolling.");
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse(course.id);
      toast.success("Enrolled! Starting your course…");
      navigate(`/course/${course.id}`);
    } catch (e: any) {
      if (e?.message?.includes("duplicate key")) {
        navigate(`/course/${course.id}`);
      } else {
        toast.error("Failed to enroll. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 lg:pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-5xl space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-64 w-full" />
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 lg:pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center py-16">
            <h1 className="text-3xl font-display font-bold mb-2">Course not found</h1>
            <p className="text-muted-foreground mb-6">
              The course you&rsquo;re looking for doesn&rsquo;t exist or is no longer available.
            </p>
            <Link to="/courses">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse all courses
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalModules = modules.length;
  const totalQuizzes = modules.filter((m) => m.has_quiz).length;
  const instructorLed = modules.some((m) => m.requires_instructor_approval);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 lg:pt-32 pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-leaf/5">
          <div className="container mx-auto px-4 py-10 lg:py-14 max-w-5xl">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              All courses
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Course
                  </Badge>
                  {course.access_type !== "public" && (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
                      <Lock className="h-3 w-3 mr-1" />
                      {course.access_type === "allocated_only" ? "Allocated only" : "Private"}
                    </Badge>
                  )}
                  {instructorLed && (
                    <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                      <Users className="h-3 w-3 mr-1" />
                      Instructor-Led
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
                  {course.title}
                </h1>
                {course.short_description && (
                  <p className="text-base lg:text-lg text-foreground/75 leading-relaxed max-w-3xl">
                    {course.short_description}
                  </p>
                )}
                {course.description && !course.short_description && (
                  <p className="text-base lg:text-lg text-foreground/75 leading-relaxed max-w-3xl whitespace-pre-line">
                    {course.description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {formatDuration(course.duration_minutes)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {totalModules} module{totalModules === 1 ? "" : "s"}
                  </span>
                  {totalQuizzes > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {totalQuizzes} quiz{totalQuizzes === 1 ? "" : "zes"}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    Certificate of completion
                  </span>
                </div>
              </div>

              {/* CTA card */}
              <Card className="lg:sticky lg:top-24 h-fit shadow-lg border-primary/20">
                <CardContent className="p-5 space-y-4">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="aspect-video w-full rounded-lg object-cover bg-secondary"
                    />
                  ) : (
                    <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-primary/15 via-leaf/10 to-primary/5 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary/60" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      What you&rsquo;ll get
                    </p>
                    <ul className="text-sm space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-leaf mt-0.5 shrink-0" />
                        Self-paced training modules
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-leaf mt-0.5 shrink-0" />
                        Interactive quizzes & flashcards
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-leaf mt-0.5 shrink-0" />
                        Downloadable certificate
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-leaf mt-0.5 shrink-0" />
                        Ontario EPR-aligned content
                      </li>
                    </ul>
                  </div>

                  <Button
                    variant="forest"
                    size="lg"
                    className="w-full"
                    onClick={handlePrimary}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enrolling…
                      </>
                    ) : !user ? (
                      <>
                        Sign in to enroll
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : isEnrolled ? (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue course
                      </>
                    ) : (
                      <>
                        Enroll now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      Free account • Takes under 1 minute
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Outline */}
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                Course Outline
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalModules} module{totalModules === 1 ? "" : "s"} &middot;{" "}
                {formatDuration(course.duration_minutes)} total
              </p>
            </div>
          </div>

          {course.description && (
            <Card className="mb-6">
              <CardContent className="p-5 lg:p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  About this course
                </p>
                <p className="text-foreground/85 leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </CardContent>
            </Card>
          )}

          {totalModules === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
                Module outline will be published soon.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {modules.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <Card className="hover:border-primary/40 hover:shadow-md transition-all">
                    <CardContent className="p-4 lg:p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 lg:h-12 lg:w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-leaf/10 text-primary font-bold text-base">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-foreground text-base lg:text-lg leading-tight">
                            {m.title}
                          </h3>
                          {m.description && (
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">
                              {m.description}
                            </p>
                          )}
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="font-normal">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDuration(m.duration_minutes)}
                            </Badge>
                            {m.has_quiz && (
                              <Badge variant="outline" className="font-normal">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Quiz
                              </Badge>
                            )}
                            {m.requires_instructor_approval && (
                              <Badge className="font-normal bg-amber-500/10 text-amber-700 border-amber-500/30">
                                <Users className="h-3 w-3 mr-1" />
                                Instructor-led
                              </Badge>
                            )}
                            {m.is_mandatory_for_certification && (
                              <Badge className="font-normal bg-red-500/10 text-red-700 border-red-500/30">
                                Mandatory
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <Card className="mt-10 bg-gradient-to-br from-primary/5 via-leaf/5 to-transparent border-primary/20">
            <CardContent className="p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">
                  Ready to start learning?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEnrolled
                    ? "You're enrolled — pick up where you left off."
                    : "Enroll now and earn your certificate at your own pace."}
                </p>
              </div>
              <Button variant="forest" size="lg" onClick={handlePrimary} disabled={enrolling}>
                {enrolling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : !user ? (
                  "Sign in to enroll"
                ) : isEnrolled ? (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue course
                  </>
                ) : (
                  "Enroll now"
                )}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
