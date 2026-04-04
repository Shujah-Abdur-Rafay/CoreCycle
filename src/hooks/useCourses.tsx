import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  duration_minutes: number;
  is_published: boolean;
  access_type: 'public' | 'private' | 'allocated_only';
  final_quiz_id: string | null;
  created_at: string;
  module_count?: number;
}

export function useCourses() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      // Fetch all published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Determine which course IDs the current user is explicitly allocated
      let allocatedCourseIds = new Set<string>();
      if (user) {
        // Direct user allocations
        const { data: userAllocs } = await supabase
          .from('course_allocations')
          .select('course_id')
          .eq('user_id', user.id);

        (userAllocs || []).forEach(a => allocatedCourseIds.add(a.course_id));

        // SME-level allocations (if user belongs to an SME)
        if (profile?.sme_id) {
          const { data: smeAllocs } = await supabase
            .from('course_allocations')
            .select('course_id')
            .eq('sme_id', profile.sme_id);

          (smeAllocs || []).forEach(a => allocatedCourseIds.add(a.course_id));
        }
      }

      // Filter courses by access type
      const visibleCourses = (coursesData || []).filter((course: any) => {
        const accessType = course.access_type ?? 'public';
        if (accessType === 'public') return true;
        // private / allocated_only — only show if explicitly allocated
        return allocatedCourseIds.has(course.id);
      });

      // Fetch module counts
      const coursesWithModules = await Promise.all(
        visibleCourses.map(async (course: any) => {
          const { count } = await supabase
            .from('modules')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            access_type: (course.access_type ?? 'public') as Course['access_type'],
            final_quiz_id: course.final_quiz_id ?? null,
            module_count: count || 0,
          } as Course;
        })
      );

      setCourses(coursesWithModules);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user, profile?.sme_id]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  };
}
