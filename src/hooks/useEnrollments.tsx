import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  status: 'enrolled' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent_minutes: number;
  course: {
    id: string;
    title: string;
    description: string | null;
    short_description: string | null;
    thumbnail_url: string | null;
    duration_minutes: number;
  };
}

export function useEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnrollments = async () => {
    if (!user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses (
            id,
            title,
            description,
            short_description,
            thumbnail_url,
            duration_minutes
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // An enrollment is itself a permanent grant of access: once a learner has
      // enrolled in (and especially completed) a course, later admin changes to
      // the course's access_type / SME-scope / allocations must NEVER make that
      // course disappear from their "My Courses", dashboard, or certificates.
      // We therefore do NOT re-filter enrollments by current course-access rules.
      // We only drop rows whose course no longer exists (e.g. the course was
      // deleted) so cards never render with null course data.
      const validEnrollments = (data || []).filter(
        (enrollment) => enrollment.course != null
      );

      setEnrollments(validEnrollments as Enrollment[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) throw new Error('Must be logged in to enroll');

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: 'enrolled',
        progress_percentage: 0,
        time_spent_minutes: 0
      })
      .select(`
        *,
        course:courses (
          id,
          title,
          description,
          short_description,
          thumbnail_url,
          duration_minutes
        )
      `)
      .single();

    if (error) throw error;
    
    setEnrollments(prev => [data as Enrollment, ...prev]);
    return data;
  };

  useEffect(() => {
    fetchEnrollments();
  }, [user]);

  return {
    enrollments,
    loading,
    error,
    enrollInCourse,
    refetch: fetchEnrollments
  };
}
