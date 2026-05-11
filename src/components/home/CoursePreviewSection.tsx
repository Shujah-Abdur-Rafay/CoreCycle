import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle,
  Users,
  Loader2,
} from "lucide-react";

interface HomepageCourse {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  duration_minutes: number;
  is_featured: boolean;
  modules: { title: string }[];
}

function formatDuration(minutes: number) {
  if (!minutes) return "Self-paced";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  const lower = Math.floor(hours);
  const upper = Math.ceil(hours);
  return lower === upper ? `${lower} hours` : `${lower}-${upper} hours`;
}

export function CoursePreviewSection() {
  const { user } = useAuth();
  const [course, setCourse] = useState<HomepageCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data: courseRow } = await supabase
          .from("courses")
          .select("id, title, description, short_description, duration_minutes, is_featured")
          .eq("show_on_homepage" as any, true)
          .eq("is_published", true)
          .maybeSingle();

        if (!courseRow) {
          if (!cancelled) setCourse(null);
          return;
        }

        const { data: moduleRows } = await supabase
          .from("modules")
          .select("title, order_index")
          .eq("course_id", courseRow.id)
          .order("order_index", { ascending: true })
          .limit(6);

        if (!cancelled) {
          setCourse({
            id: courseRow.id,
            title: courseRow.title,
            description: courseRow.description,
            short_description: courseRow.short_description,
            duration_minutes: courseRow.duration_minutes,
            is_featured: (courseRow as any).is_featured ?? false,
            modules: (moduleRows ?? []).map((m: any) => ({ title: m.title })),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-20 lg:py-32 nature-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-leaf" />
        </div>
      </section>
    );
  }

  if (!course) return null;

  const ctaTo = user ? `/courses/${course.id}` : "/auth";
  const ctaLabel = user ? "Start This Course" : "Sign In to Start";
  const description =
    course.description ||
    course.short_description ||
    "Complete this training to strengthen your recycling knowledge.";

  return (
    <section className="py-20 lg:py-32 nature-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-leaf/10 text-leaf text-sm font-medium mb-4">
            {course.is_featured ? "Featured Course" : "Recommended Course"}
          </span>
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-lg text-muted-foreground">
            {course.short_description || "Get started with our recommended Ontario recycling training."}
          </p>
        </motion.div>

        {/* Course Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <Card variant="elevated" className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left - Course Info */}
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.is_featured && (
                    <Badge className="bg-leaf/10 text-leaf hover:bg-leaf/20">
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline">Ontario Certified</Badge>
                </div>

                <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-4">
                  {course.title}
                </h3>

                <p className="text-muted-foreground mb-8 leading-relaxed line-clamp-4">
                  {description}
                </p>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-5 w-5 text-leaf" />
                    <span className="text-muted-foreground">
                      {formatDuration(course.duration_minutes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-5 w-5 text-leaf" />
                    <span className="text-muted-foreground">Open enrollment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-5 w-5 text-leaf" />
                    <span className="text-muted-foreground">Certificate included</span>
                  </div>
                </div>

                <Link to={ctaTo}>
                  <Button variant="forest" size="lg">
                    {ctaLabel}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>

              {/* Right - Module List */}
              <div className="bg-secondary/50 p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="h-5 w-5 text-leaf" />
                  <h4 className="font-semibold text-foreground">Course Modules</h4>
                </div>

                <div className="space-y-4">
                  {course.modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Modules coming soon.</p>
                  ) : (
                    course.modules.map((module, index) => (
                      <motion.div
                        key={`${module.title}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-leaf/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-leaf">{index + 1}</span>
                        </div>
                        <span className="text-foreground">{module.title}</span>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Completion certificate included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Audit-ready training records</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
