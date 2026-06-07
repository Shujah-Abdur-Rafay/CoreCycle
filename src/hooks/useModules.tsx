import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  order_index: number;
  duration_minutes: number;
  has_quiz: boolean;
  quiz_pass_mark: number;
  version: number;
  created_at: string;
  requires_instructor_approval: boolean;
  is_mandatory_for_certification: boolean;
}

export interface ModuleCompletion {
  id: string;
  user_id: string;
  module_id: string;
  enrollment_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
  time_spent_minutes: number;
  quiz_score: number | null;
  module_version: number;
  instructor_approved: boolean;
  instructor_approved_at: string | null;
  instructor_name: string | null;
  attendance_confirmed: boolean;
  attendance_confirmed_at: string | null;
}

export function useModules(courseId: string) {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = async () => {
    try {
      const { data, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;
      if (import.meta.env.DEV) {
        // Verification log: raw DB rows vs what the UI will render.
        // Compares row count + every column key per module so any drift
        // between DB content and rendered state is visible in DevTools.
        // eslint-disable-next-line no-console
        console.debug('[useModules] DB rows for course', courseId, {
          count: (data || []).length,
          rows: (data || []).map(m => ({
            id: m.id,
            title: m.title,
            keys: Object.keys(m),
            content_length: m.content ? m.content.length : 0,
            description_length: m.description ? m.description.length : 0,
          })),
        });
      }
      setModules(data || []);
    } catch (err) {
      setError(err as Error);
    }
  };

  const fetchCompletions = async (enrollmentId: string) => {
    if (!user) return;

    try {
      const { data, error: completionsError } = await supabase
        .from('module_completions')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;
      setCompletions((data || []) as ModuleCompletion[]);
    } catch (err) {
      console.error('Error fetching completions:', err);
    }
  };

  const startModule = async (moduleId: string, enrollmentId: string) => {
    if (!user) return null;

    const existingCompletion = completions.find(c => c.module_id === moduleId);
    if (existingCompletion) {
      return existingCompletion;
    }

    const module = modules.find(m => m.id === moduleId);
    const { data, error } = await supabase
      .from('module_completions')
      .insert({
        user_id: user.id,
        module_id: moduleId,
        enrollment_id: enrollmentId,
        status: 'in_progress',
        module_version: module?.version || 1
      })
      .select()
      .single();

    if (error) {
      // A completion row already exists for this user+module (e.g. the module was
      // started/completed before, and local state hadn't loaded yet — this can
      // race with fetchCompletions). Fetch and reuse the existing row instead of
      // failing with a 409 duplicate-key error.
      if ((error as { code?: string }).code === '23505') {
        const { data: existing } = await supabase
          .from('module_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .maybeSingle();
        if (existing) {
          setCompletions(prev =>
            prev.some(c => c.id === (existing as ModuleCompletion).id)
              ? prev
              : [...prev, existing as ModuleCompletion]
          );
          return existing as ModuleCompletion;
        }
      }
      throw error;
    }

    setCompletions(prev => [...prev, data as ModuleCompletion]);
    return data;
  };

  const completeModule = async (moduleId: string, quizScore?: number) => {
    if (!user) return;

    const { data: updated, error: updateError } = await supabase
      .from('module_completions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        quiz_score: quizScore
      })
      .eq('module_id', moduleId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    if (updated) {
      setCompletions(prev =>
        prev.map(c => c.module_id === moduleId ? (updated as ModuleCompletion) : c)
      );
      return updated;
    }

    // No row to update — startModule never created one. Insert it directly.
    const { data: mod, error: modError } = await supabase
      .from('modules')
      .select('course_id, version')
      .eq('id', moduleId)
      .single();
    if (modError) throw modError;

    const { data: enr, error: enrError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', mod.course_id)
      .single();
    if (enrError) throw enrError;

    const { data: inserted, error: insertError } = await supabase
      .from('module_completions')
      .insert({
        user_id: user.id,
        module_id: moduleId,
        enrollment_id: enr.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
        quiz_score: quizScore,
        module_version: mod.version || 1
      })
      .select()
      .single();

    if (insertError) throw insertError;

    setCompletions(prev => [...prev, inserted as ModuleCompletion]);
    return inserted;
  };

  const updateTimeSpent = async (moduleId: string, additionalMinutes: number) => {
    if (!user) return;

    const completion = completions.find(c => c.module_id === moduleId);
    if (!completion) return;

    const { error } = await supabase
      .from('module_completions')
      .update({
        time_spent_minutes: completion.time_spent_minutes + additionalMinutes
      })
      .eq('module_id', moduleId)
      .eq('user_id', user.id);

    if (error) console.error('Error updating time:', error);
  };

  const getModuleStatus = (moduleId: string): 'not_started' | 'in_progress' | 'completed' => {
    const completion = completions.find(c => c.module_id === moduleId);
    return completion?.status || 'not_started';
  };

  const confirmInstructorAttendance = async (
    moduleId: string, 
    instructorName: string
  ) => {
    if (!user) return null;

    const completion = completions.find(c => c.module_id === moduleId);
    if (!completion) return null;

    const { data, error } = await supabase
      .from('module_completions')
      .update({
        attendance_confirmed: true,
        attendance_confirmed_at: new Date().toISOString(),
        instructor_name: instructorName
      })
      .eq('id', completion.id)
      .select()
      .single();

    if (error) throw error;

    setCompletions(prev =>
      prev.map(c => c.id === completion.id ? (data as ModuleCompletion) : c)
    );

    return data;
  };

  const approveInstructorModule = async (moduleId: string) => {
    if (!user) return null;

    const completion = completions.find(c => c.module_id === moduleId);
    if (!completion) return null;

    const { data, error } = await supabase
      .from('module_completions')
      .update({
        instructor_approved: true,
        instructor_approved_at: new Date().toISOString(),
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', completion.id)
      .select()
      .single();

    if (error) throw error;

    setCompletions(prev =>
      prev.map(c => c.id === completion.id ? (data as ModuleCompletion) : c)
    );

    return data;
  };

  const isInstructorModuleComplete = (moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    const completion = completions.find(c => c.module_id === moduleId);
    
    if (!module?.requires_instructor_approval) return completion?.status === 'completed';
    
    return completion?.instructor_approved === true;
  };

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      fetchModules().finally(() => setLoading(false));
    }
  }, [courseId]);

  return {
    modules,
    completions,
    loading,
    error,
    fetchCompletions,
    startModule,
    completeModule,
    updateTimeSpent,
    getModuleStatus,
    confirmInstructorAttendance,
    approveInstructorModule,
    isInstructorModuleComplete,
    refetch: fetchModules
  };
}
