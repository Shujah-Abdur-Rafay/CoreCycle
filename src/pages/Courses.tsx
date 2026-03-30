import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { 
  Clock, 
  BookOpen, 
  Award,
  ArrowRight,
  CheckCircle,
  Loader2,
  Lock,
  PlayCircle
} from "lucide-react";

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canEnroll, isApproved, loading: roleLoading } = useUserRole();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, enrollInCourse, loading: enrollmentsLoading } = useEnrollments();
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.course_id === courseId);
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.status;
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      navigate("/auth?mode=login");
      return;
    }

    if (!canEnroll) {
      toast.error("Your account is pending approval. Please wait for admin approval to enroll in courses.");
      return;
    }

    setEnrollingCourseId(courseId);
    try {
      await enrollInCourse(courseId);
      toast.success("Successfully enrolled! Start your training now.");
    } catch (error: any) {
      if (error.message?.includes('duplicate key')) {
        toast.info("You're already enrolled in this course");
      } else {
        toast.error("Failed to enroll. Please try again.");
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleStartCourse = (courseId: string) => {
    if (!user) {
      navigate("/auth?mode=login");
      return;
    }
    navigate(`/course/${courseId}`);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const loading = coursesLoading || enrollmentsLoading || roleLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero */}
        <section className="py-16 lg:py-20 nature-gradient">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
                Training Courses
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Ontario-specific courses designed to help your staff understand waste management, recycling requirements, and best practices.
              </p>
              
              {user && !isApproved && !roleLoading && (
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Lock className="h-5 w-5" />
                    <span className="font-medium">Account pending approval</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can browse courses, but enrollment requires admin approval.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {loading ? (
                // Loading skeletons
                [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No courses available yet
                  </h3>
                  <p className="text-muted-foreground">
                    Check back soon for new training content.
                  </p>
                </div>
              ) : (
                courses.map((course, index) => {
                  const enrolled = isEnrolled(course.id);
                  const status = getEnrollmentStatus(course.id);
                  const isEnrolling = enrollingCourseId === course.id;
                  const isFeatured = index === 0; // First course is featured

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card 
                        variant={isFeatured ? "elevated" : "feature"} 
                        className={isFeatured ? "border-2 border-leaf/30" : ""}
                      >
                        <CardContent className="p-6 lg:p-8">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex-1">
                              <div className="flex flex-wrap gap-2 mb-3">
                                {isFeatured && (
                                  <>
                                    <Badge className="bg-leaf/10 text-leaf hover:bg-leaf/20">
                                      Required
                                    </Badge>
                                    <Badge className="bg-forest text-primary-foreground">
                                      Featured
                                    </Badge>
                                  </>
                                )}
                                {enrolled && (
                                  <Badge className="bg-primary/10 text-primary">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Enrolled
                                  </Badge>
                                )}
                                {status === 'completed' && (
                                  <Badge className="bg-leaf/10 text-leaf">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="text-xl lg:text-2xl font-display font-semibold text-foreground mb-3">
                                {course.title}
                              </h3>
                              
                              <p className="text-muted-foreground mb-4 leading-relaxed">
                                {course.description || course.short_description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{course.module_count || 0} modules</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDuration(course.duration_minutes)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Award className="h-4 w-4" />
                                  <span>Certificate included</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 lg:min-w-[180px]">
                              {enrolled ? (
                                <Button 
                                  variant={isFeatured ? "forest" : "default"} 
                                  className="w-full"
                                  onClick={() => handleStartCourse(course.id)}
                                >
                                  {status === 'completed' ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Review Course
                                    </>
                                  ) : status === 'in_progress' ? (
                                    <>
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Continue
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Start Learning
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button 
                                  variant={isFeatured ? "forest" : "default"} 
                                  className="w-full"
                                  onClick={() => handleEnroll(course.id)}
                                  disabled={isEnrolling || (user && !canEnroll)}
                                >
                                  {isEnrolling ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Enrolling...
                                    </>
                                  ) : user && !canEnroll ? (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Pending Approval
                                    </>
                                  ) : (
                                    <>
                                      Enroll Now
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                  )}
                                </Button>
                              )}
                              <Link to={`/course/${course.id}/preview`}>
                                <Button variant="ghost" className="w-full">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Ready to Train Your Team?
              </h2>
              <p className="text-muted-foreground mb-8">
                Register your business to get started with Ontario-certified training for your entire organization.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!user ? (
                  <>
                    <Link to="/auth?mode=register">
                      <Button variant="forest" size="lg">
                        Get Started Free
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/for-smes">
                      <Button variant="outline" size="lg">
                        Learn More for SMEs
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard">
                    <Button variant="forest" size="lg">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
