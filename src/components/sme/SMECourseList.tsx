import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock } from "lucide-react";

interface AllocatedCourse {
  id: string;
  title: string;
  short_description: string | null;
  duration_minutes: number | null;
  is_published: boolean;
  allocated_at: string;
}

interface SMECourseListProps {
  smeId: string;
}

export function SMECourseList({ smeId }: SMECourseListProps) {
  const [courses, setCourses] = useState<AllocatedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!smeId) return;

    const fetchAllocatedCourses = async () => {
      try {
        const { data: allocations, error: aErr } = await supabase
          .from("course_allocations")
          .select("course_id, allocated_at")
          .eq("sme_id", smeId);

        if (aErr) throw aErr;
        if (!allocations || allocations.length === 0) {
          setCourses([]);
          return;
        }

        const courseIds = allocations.map((a) => a.course_id);
        const allocMap = new Map(
          allocations.map((a) => [a.course_id, a.allocated_at])
        );

        const { data: coursesData, error: cErr } = await supabase
          .from("courses")
          .select("id, title, short_description, duration_minutes, is_published")
          .in("id", courseIds);

        if (cErr) throw cErr;

        setCourses(
          (coursesData || []).map((c) => ({
            id: c.id,
            title: c.title,
            short_description: c.short_description,
            duration_minutes: c.duration_minutes,
            is_published: c.is_published ?? false,
            allocated_at: allocMap.get(c.id) ?? "",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch allocated courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocatedCourses();
  }, [smeId]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Allocated Courses
          {!loading && (
            <Badge variant="secondary" className="ml-auto">
              {courses.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No courses have been allocated to your organisation yet.
          </p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-muted/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {course.title}
                  </p>
                  {course.short_description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {course.short_description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(course.duration_minutes)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={course.is_published ? "default" : "secondary"}
                  className="ml-3 shrink-0 text-xs"
                >
                  {course.is_published ? "Live" : "Draft"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
