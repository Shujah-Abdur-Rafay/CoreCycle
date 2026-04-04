import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SMEComplianceRow {
  sme_id: string;
  company_name: string;
  municipality: string;
  industry_sector: string;
  total_staff: number;
  approved_staff: number;
  compliance_rate: number;
  total_enroll: number;
  completed: number;
  certificates: number;
}

export interface ComplianceSummary {
  totalSMEs: number;
  totalUsers: number;
  totalTrainingHours: number;
  overallCompletionRate: number;
  rows: SMEComplianceRow[];
}

export function useComplianceStats() {
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [
        { data: profiles },
        { data: smes },
        { data: enrollments },
        { data: certs },
        { data: roles },
        { data: moduleComps },
      ] = await Promise.all([
        supabase.from('profiles').select('user_id, company_name, sme_id, municipality'),
        supabase.from('smes').select('sme_id, company_name, municipality, industry_sector'),
        supabase.from('enrollments').select('user_id, status, time_spent_minutes'),
        supabase.from('certificates').select('sme_id'),
        supabase.from('user_roles').select('user_id, is_approved'),
        supabase.from('module_completions').select('time_spent_minutes'),
      ]);

      const approvedSet = new Set(
        (roles || []).filter(r => r.is_approved).map(r => r.user_id)
      );
      const userToSme = new Map(
        (profiles || []).filter(p => p.sme_id).map(p => [p.user_id, p.sme_id!])
      );

      type Agg = {
        company_name: string;
        municipality: string;
        industry_sector: string;
        total_staff: number;
        approved_staff: number;
        total_enroll: number;
        completed: number;
        certificates: number;
      };

      const map = new Map<string, Agg>();

      (smes || []).forEach((s: any) => {
        map.set(s.sme_id, {
          company_name: s.company_name ?? '',
          municipality: s.municipality ?? '',
          industry_sector: s.industry_sector ?? '',
          total_staff: 0,
          approved_staff: 0,
          total_enroll: 0,
          completed: 0,
          certificates: 0,
        });
      });

      (profiles || []).forEach((p: any) => {
        if (!p.sme_id || !map.has(p.sme_id)) return;
        const r = map.get(p.sme_id)!;
        r.total_staff++;
        if (approvedSet.has(p.user_id)) r.approved_staff++;
      });

      (enrollments || []).forEach((e: any) => {
        const smeId = userToSme.get(e.user_id);
        if (!smeId || !map.has(smeId)) return;
        const r = map.get(smeId)!;
        r.total_enroll++;
        if (e.status === 'completed') r.completed++;
      });

      (certs || []).forEach((c: any) => {
        if (c.sme_id && map.has(c.sme_id)) map.get(c.sme_id)!.certificates++;
      });

      const rows: SMEComplianceRow[] = Array.from(map.entries()).map(([sme_id, r]) => ({
        sme_id,
        ...r,
        compliance_rate:
          r.total_staff > 0 ? Math.round((r.approved_staff / r.total_staff) * 100) : 0,
      }));

      // Summary stats
      const totalUsers = (profiles || []).length;
      const totalSMEs  = (smes || []).length;
      const totalTrainingMinutes = (moduleComps || []).reduce(
        (sum: number, mc: any) => sum + (mc.time_spent_minutes ?? 0), 0
      );
      const totalTrainingHours = Math.round(totalTrainingMinutes / 60);

      const allEnrollments = enrollments || [];
      const overallCompletionRate =
        allEnrollments.length > 0
          ? Math.round(
              (allEnrollments.filter((e: any) => e.status === 'completed').length /
                allEnrollments.length) *
                100
            )
          : 0;

      setData({ totalSMEs, totalUsers, totalTrainingHours, overallCompletionRate, rows });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { data, loading, error, refetch: fetchStats };
}
