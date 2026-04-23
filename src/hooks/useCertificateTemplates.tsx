import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StyleConfig {
  fontFamily?: string;
  headerFontSize?: number;
  textAlignment?: 'left' | 'center' | 'right';
  padding?: number;
  overlayOpacity?: number;
  overlayColor?: string;
  showBorder?: boolean;
  borderColor?: string;
  showWatermark?: boolean;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  header_text: string;
  provider_name: string | null;
  background_color: string;
  background_url: string | null;
  logo_url: string | null;
  style_config: StyleConfig;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseCertificateMap {
  id: string;
  course_id: string;
  certificate_template_id: string;
  created_at: string;
}

export type CertificateTemplateInput = Omit<
  CertificateTemplate,
  'id' | 'created_by' | 'created_at' | 'updated_at'
>;

export function useCertificateTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('certificate_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTemplates((data || []) as CertificateTemplate[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (
    input: CertificateTemplateInput
  ): Promise<CertificateTemplate | null> => {
    if (!user) return null;
    try {
      const { data, error: insertError } = await supabase
        .from('certificate_templates')
        .insert({ ...input, created_by: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchTemplates();
      return data as CertificateTemplate;
    } catch (err) {
      console.error('Error creating certificate template:', err);
      return null;
    }
  };

  const updateTemplate = async (
    id: string,
    input: Partial<CertificateTemplateInput>
  ): Promise<CertificateTemplate | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('certificate_templates')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchTemplates();
      return data as CertificateTemplate;
    } catch (err) {
      console.error('Error updating certificate template:', err);
      return null;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('certificate_templates')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchTemplates();
      return true;
    } catch (err) {
      console.error('Error deleting certificate template:', err);
      return false;
    }
  };

  // Course linking

  const linkTemplateToCourse = async (
    courseId: string,
    templateId: string
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      // Upsert: one course → one template
      const { error: upsertError } = await supabase
        .from('course_certificate_map')
        .upsert(
          {
            course_id: courseId,
            certificate_template_id: templateId,
            created_by: user.id,
          },
          { onConflict: 'course_id' }
        );

      if (upsertError) throw upsertError;
      return true;
    } catch (err) {
      console.error('Error linking template to course:', err);
      return false;
    }
  };

  const unlinkTemplateFromCourse = async (courseId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('course_certificate_map')
        .delete()
        .eq('course_id', courseId);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error unlinking template from course:', err);
      return false;
    }
  };

  const getTemplateForCourse = async (
    courseId: string
  ): Promise<CertificateTemplate | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('course_certificate_map')
        .select('certificate_template_id')
        .eq('course_id', courseId)
        .maybeSingle();

      if (fetchError || !data) return null;

      const { data: template, error: templateError } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('id', data.certificate_template_id)
        .single();

      if (templateError) return null;
      return template as CertificateTemplate;
    } catch {
      return null;
    }
  };

  const getCourseMappings = async (): Promise<CourseCertificateMap[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('course_certificate_map')
        .select('*');

      if (fetchError) throw fetchError;
      return (data || []) as CourseCertificateMap[];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    linkTemplateToCourse,
    unlinkTemplateFromCourse,
    getTemplateForCourse,
    getCourseMappings,
    refetch: fetchTemplates,
  };
}
