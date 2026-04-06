import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Certificate {
  id: string;
  certificate_number: string;
  learner_name: string;
  course_title: string;
  course_id: string;
  enrollment_id: string;
  company_name: string | null;
  municipality: string | null;
  issued_at: string;
}

export function useCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCertificates = async () => {
    if (!user) {
      setCertificates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCertificates(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createCertificate = async (
    enrollmentId: string,
    courseId: string,
    courseTitle: string
  ): Promise<Certificate | null> => {
    if (!user) return null;

    try {
      // Guard: don't issue a duplicate certificate for the same enrollment
      const { data: existing } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .eq('enrollment_id', enrollmentId)
        .maybeSingle();

      if (existing) {
        await fetchCertificates();
        return existing as Certificate;
      }

      // Fetch user profile for name and company
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name, municipality')
        .eq('user_id', user.id)
        .single();

      const learnerName = profile?.full_name || user.email?.split('@')[0] || 'Learner';
      const certificateNumber = `OWDA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data, error: insertError } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          enrollment_id: enrollmentId,
          course_id: courseId,
          course_title: courseTitle,
          learner_name: learnerName,
          company_name: profile?.company_name,
          municipality: profile?.municipality,
          certificate_number: certificateNumber,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchCertificates();
      return data;
    } catch (err) {
      console.error('Error creating certificate:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  return {
    certificates,
    loading,
    error,
    createCertificate,
    refetch: fetchCertificates,
  };
}
