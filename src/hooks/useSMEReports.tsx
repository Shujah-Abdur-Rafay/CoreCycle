import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export interface SMEReport {
  sme_id: string;
  company_name: string;
  municipality: string | null;
  industry_sector: string | null;
  member_count: number;
  total_enrollments: number;
  completed_enrollments: number;
  in_progress_enrollments: number;
  completion_rate: number;
  avg_progress: number;
  total_time_spent_minutes: number;
  certificates_earned: number;
}

export function useSMEReports() {
  const { isSuperAdmin } = useUserRole();
  const [reports, setReports] = useState<SMEReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Fetch SMEs
      const { data: smes, error: smeError } = await supabase
        .from('smes')
        .select('*');

      if (smeError) throw smeError;

      // Fetch profiles with sme_id
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, sme_id')
        .not('sme_id', 'is', null);

      if (profileError) throw profileError;

      // Fetch all enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('*');

      if (enrollError) throw enrollError;

      // Fetch certificates
      const { data: certificates, error: certError } = await supabase
        .from('certificates')
        .select('sme_id');

      if (certError) throw certError;

      // Build reports
      const reportMap = new Map<string, SMEReport>();

      (smes || []).forEach(sme => {
        reportMap.set(sme.sme_id, {
          sme_id: sme.sme_id,
          company_name: sme.company_name,
          municipality: sme.municipality,
          industry_sector: sme.industry_sector,
          member_count: 0,
          total_enrollments: 0,
          completed_enrollments: 0,
          in_progress_enrollments: 0,
          completion_rate: 0,
          avg_progress: 0,
          total_time_spent_minutes: 0,
          certificates_earned: 0
        });
      });

      // Count members per SME
      const membersBySme = new Map<string, Set<string>>();
      (profiles || []).forEach(p => {
        if (!membersBySme.has(p.sme_id)) {
          membersBySme.set(p.sme_id, new Set());
        }
        membersBySme.get(p.sme_id)!.add(p.user_id);
      });

      // Map user to sme
      const userToSme = new Map<string, string>();
      (profiles || []).forEach(p => {
        userToSme.set(p.user_id, p.sme_id);
      });

      // Process enrollments
      (enrollments || []).forEach(e => {
        const smeId = userToSme.get(e.user_id);
        if (smeId && reportMap.has(smeId)) {
          const report = reportMap.get(smeId)!;
          report.total_enrollments++;
          if (e.status === 'completed') {
            report.completed_enrollments++;
          } else if (e.status === 'in_progress') {
            report.in_progress_enrollments++;
          }
          report.total_time_spent_minutes += e.time_spent_minutes || 0;
        }
      });

      // Count certificates per SME
      (certificates || []).forEach(c => {
        if (c.sme_id && reportMap.has(c.sme_id)) {
          reportMap.get(c.sme_id)!.certificates_earned++;
        }
      });

      // Calculate final metrics
      reportMap.forEach((report, smeId) => {
        report.member_count = membersBySme.get(smeId)?.size || 0;
        if (report.total_enrollments > 0) {
          report.completion_rate = Math.round((report.completed_enrollments / report.total_enrollments) * 100);
        }
      });

      setReports(Array.from(reportMap.values()));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchReports();
    }
  }, [isSuperAdmin]);

  return { reports, loading, error, refetch: fetchReports };
}
