import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export interface CourseResource {
  id: string;
  course_id: string;
  title: string;
  resource_type: 'file' | 'link';
  url: string;
  file_type: string | null;
  created_at: string;
}

export type CourseAccessType = 'public' | 'private' | 'allocated_only';

export interface AdminCourse {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  content_url: string | null;
  content_type: string | null;
  duration_minutes: number;
  is_published: boolean;
  access_type: CourseAccessType;
  final_quiz_id: string | null;
  created_at: string;
  updated_at: string;
  module_count?: number;
  enrollment_count?: number;
}

export interface AdminModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  has_quiz: boolean;
  quiz_pass_mark: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AdminQuizQuestion {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export function useAdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userRole, loading: roleLoading } = useUserRole();
  const isSuperAdmin = userRole?.role === 'super_admin';

  const fetchCourses = async () => {
    // Wait for role to be determined
    if (roleLoading) return;
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Fetch all courses (including unpublished)
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Fetch module and enrollment counts
      const coursesWithCounts = await Promise.all(
        (coursesData || []).map(async (course) => {
          const [moduleResult, enrollmentResult] = await Promise.all([
            supabase
              .from('modules')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id),
            supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id)
          ]);

          return {
            ...course,
            module_count: moduleResult.count || 0,
            enrollment_count: enrollmentResult.count || 0
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: Partial<AdminCourse>) => {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title!,
        description: courseData.description,
        short_description: courseData.short_description,
        thumbnail_url: courseData.thumbnail_url,
        content_url: courseData.content_url,
        content_type: courseData.content_type,
        duration_minutes: courseData.duration_minutes || 0,
        is_published: courseData.is_published || false,
        access_type: courseData.access_type || 'public',
        final_quiz_id: courseData.final_quiz_id || null,
      } as any)
      .select()
      .single();

    if (error) throw error;
    await fetchCourses();
    return data;
  };

  const updateCourse = async (courseId: string, courseData: Partial<AdminCourse>) => {
    const { data, error } = await supabase
      .from('courses')
      .update({
        title: courseData.title,
        description: courseData.description,
        short_description: courseData.short_description,
        thumbnail_url: courseData.thumbnail_url,
        content_url: courseData.content_url,
        content_type: courseData.content_type,
        duration_minutes: courseData.duration_minutes,
        is_published: courseData.is_published,
        access_type: courseData.access_type,
        final_quiz_id: courseData.final_quiz_id,
      } as any)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    await fetchCourses();
    return data;
  };

  const deleteCourse = async (courseId: string) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    await fetchCourses();
  };

  const togglePublish = async (courseId: string, isPublished: boolean) => {
    const { data, error } = await supabase
      .from('courses')
      .update({ is_published: isPublished })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update course');
    await fetchCourses();
    return data;
  };

  useEffect(() => {
    if (!roleLoading) {
      fetchCourses();
    }
  }, [isSuperAdmin, roleLoading]);

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    togglePublish,
    refetch: fetchCourses
  };
}

export function useAdminModules(courseId: string | undefined) {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;
      setModules(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createModule = async (moduleData: Partial<AdminModule>) => {
    const maxOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order_index)) : -1;
    
    const { data, error } = await supabase
      .from('modules')
      .insert({
        course_id: courseId!,
        title: moduleData.title!,
        description: moduleData.description,
        content: moduleData.content,
        video_url: moduleData.video_url,
        duration_minutes: moduleData.duration_minutes || 0,
        order_index: maxOrder + 1,
        has_quiz: moduleData.has_quiz || false,
        quiz_pass_mark: moduleData.quiz_pass_mark || 70
      })
      .select()
      .single();

    if (error) throw error;
    await fetchModules();
    return data;
  };

  const updateModule = async (moduleId: string, moduleData: Partial<AdminModule>) => {
    const { data, error } = await supabase
      .from('modules')
      .update({
        title: moduleData.title,
        description: moduleData.description,
        content: moduleData.content,
        video_url: moduleData.video_url,
        duration_minutes: moduleData.duration_minutes,
        has_quiz: moduleData.has_quiz,
        quiz_pass_mark: moduleData.quiz_pass_mark
      })
      .eq('id', moduleId)
      .select()
      .single();

    if (error) throw error;
    await fetchModules();
    return data;
  };

  const deleteModule = async (moduleId: string) => {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);

    if (error) throw error;
    await fetchModules();
  };

  const reorderModules = async (newOrder: string[]) => {
    const updates = newOrder.map((id, index) => 
      supabase
        .from('modules')
        .update({ order_index: index })
        .eq('id', id)
    );

    await Promise.all(updates);
    await fetchModules();
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  return {
    modules,
    loading,
    error,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    refetch: fetchModules
  };
}

export function useCourseResources(courseId: string | undefined) {
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResources = async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('course_resources')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });
      if (fetchError) throw fetchError;
      setResources((data || []) as CourseResource[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (
    resource: Pick<CourseResource, 'title' | 'resource_type' | 'url' | 'file_type'>
  ): Promise<CourseResource> => {
    const { data, error } = await supabase
      .from('course_resources')
      .insert({ course_id: courseId!, ...resource })
      .select()
      .single();
    if (error) throw error;
    setResources(prev => [...prev, data as CourseResource]);
    return data as CourseResource;
  };

  const deleteResource = async (resourceId: string) => {
    // If it's a file stored in Supabase storage, remove it too
    const resource = resources.find(r => r.id === resourceId);
    if (resource?.resource_type === 'file') {
      // Extract storage path from public URL
      const url = resource.url;
      const storagePathMatch = url.match(/course-resources\/(.+)$/);
      if (storagePathMatch) {
        await supabase.storage
          .from('course-resources')
          .remove([storagePathMatch[1]]);
      }
    }
    const { error } = await supabase
      .from('course_resources')
      .delete()
      .eq('id', resourceId);
    if (error) throw error;
    setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  const uploadResourceFile = async (file: File): Promise<{ url: string; file_type: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${courseId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-resources')
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('course-resources')
      .getPublicUrl(filePath);

    return { url: publicUrl, file_type: file.type };
  };

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  return {
    resources,
    loading,
    error,
    addResource,
    deleteResource,
    uploadResourceFile,
    refetch: fetchResources,
  };
}

export function useAdminQuizQuestions(moduleId: string | undefined) {
  const [questions, setQuestions] = useState<AdminQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = async () => {
    if (!moduleId) return;
    
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;
      
      // Parse options from JSONB
      const parsedData = (data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : []
      }));
      
      setQuestions(parsedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData: Partial<AdminQuizQuestion>) => {
    const maxOrder = questions.length > 0 ? Math.max(...questions.map(q => q.order_index)) : -1;
    
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        module_id: moduleId!,
        question: questionData.question!,
        options: questionData.options || [],
        correct_answer_index: questionData.correct_answer_index || 0,
        explanation: questionData.explanation,
        order_index: maxOrder + 1
      })
      .select()
      .single();

    if (error) throw error;
    await fetchQuestions();
    return data;
  };

  const updateQuestion = async (questionId: string, questionData: Partial<AdminQuizQuestion>) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update({
        question: questionData.question,
        options: questionData.options,
        correct_answer_index: questionData.correct_answer_index,
        explanation: questionData.explanation
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    await fetchQuestions();
    return data;
  };

  const deleteQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    await fetchQuestions();
  };

  useEffect(() => {
    fetchQuestions();
  }, [moduleId]);

  return {
    questions,
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    refetch: fetchQuestions
  };
}
