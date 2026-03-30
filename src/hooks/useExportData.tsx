import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toCsvString, downloadCsv, safeFilename, fmtDate, fmtMinutes, CsvRow } from '@/lib/exportCsv';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ─── Export type definitions ─────────────────────────────────────────────────

export type ExportType =
  | 'user_progress'       // per-user per-course progress + quiz scores
  | 'training_summary'    // one row per enrollment
  | 'quiz_results'        // one row per module completion with a quiz score
  | 'certificate_audit'   // all certificates
  | 'user_activity'       // user registrations + roles
  | 'compliance'          // per-company compliance rate
  | 'sme_report';         // per-SME aggregated metrics

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: Record<ExportType, { key: string; label: string }[]> = {
  user_progress: [
    { key: 'learner_name',       label: 'Learner Name' },
    { key: 'email',              label: 'Email' },
    { key: 'company_name',       label: 'Company' },
    { key: 'sme_id',             label: 'SME ID' },
    { key: 'municipality',       label: 'Municipality' },
    { key: 'role',               label: 'Role' },
    { key: 'course_title',       label: 'Course' },
    { key: 'status',             label: 'Status' },
    { key: 'progress_pct',       label: 'Progress (%)' },
    { key: 'time_spent',         label: 'Time Spent' },
    { key: 'enrolled_at',        label: 'Enrolled At' },
    { key: 'started_at',         label: 'Started At' },
    { key: 'completed_at',       label: 'Completed At' },
    { key: 'certificate_number', label: 'Certificate #' },
  ],
  training_summary: [
    { key: 'course_title',   label: 'Course' },
    { key: 'total',          label: 'Total Enrollments' },
    { key: 'completed',      label: 'Completed' },
    { key: 'in_progress',    label: 'In Progress' },
    { key: 'not_started',    label: 'Not Started' },
    { key: 'completion_pct', label: 'Completion Rate (%)' },
    { key: 'avg_progress',   label: 'Avg Progress (%)' },
    { key: 'total_time',     label: 'Total Time Spent' },
  ],
  quiz_results: [
    { key: 'learner_name',  label: 'Learner Name' },
    { key: 'email',         label: 'Email' },
    { key: 'company_name',  label: 'Company' },
    { key: 'course_title',  label: 'Course' },
    { key: 'module_title',  label: 'Module' },
    { key: 'quiz_score',    label: 'Quiz Score (%)' },
    { key: 'pass_mark',     label: 'Pass Mark (%)' },
    { key: 'passed',        label: 'Passed' },
    { key: 'attempts',      label: 'Status' },
    { key: 'completed_at',  label: 'Completed At' },
  ],
  certificate_audit: [
    { key: 'certificate_number', label: 'Certificate #' },
    { key: 'learner_name',       label: 'Learner Name' },
    { key: 'course_title',       label: 'Course' },
    { key: 'company_name',       label: 'Company' },
    { key: 'sme_id',             label: 'SME ID' },
    { key: 'municipality',       label: 'Municipality' },
    { key: 'issued_at',          label: 'Issued At' },
  ],
  user_activity: [
    { key: 'full_name',     label: 'Full Name' },
    { key: 'email',         label: 'Email' },
    { key: 'company_name',  label: 'Company' },
    { key: 'sme_id',        label: 'SME ID' },
    { key: 'municipality',  label: 'Municipality' },
    { key: 'role',          label: 'Role' },
    { key: 'user_type',     label: 'User Type' },
    { key: 'status',        label: 'Approval Status' },
    { key: 'registered_at', label: 'Registered At' },
  ],
  compliance: [
    { key: 'company_name',    label: 'Company' },
    { key: 'sme_id',          label: 'SME ID' },
    { key: 'municipality',    label: 'Municipality' },
    { key: 'industry_sector', label: 'Industry Sector' },
    { key: 'total_staff',     label: 'Total Staff' },
    { key: 'approved_staff',  label: 'Approved Staff' },
    { key: 'compliance_rate', label: 'Compliance Rate (%)' },
    { key: 'total_enroll',    label: 'Total Enrollments' },
    { key: 'completed',       label: 'Completed' },
    { key: 'certificates',    label: 'Certificates Earned' },
  ],
  sme_report: [
    { key: 'sme_id',          label: 'SME ID' },
    { key: 'company_name',    label: 'Company' },
    { key: 'municipality',    label: 'Municipality' },
    { key: 'industry_sector', label: 'Industry Sector' },
    { key: 'member_count',    label: 'Members' },
    { key: 'total_enroll',    label: 'Total Enrollments' },
    { key: 'completed',       label: 'Completed' },
    { key: 'in_progress',     label: 'In Progress' },
    { key: 'completion_rate', label: 'Completion Rate (%)' },
    { key: 'avg_progress',    label: 'Avg Progress (%)' },
    { key: 'time_spent',      label: 'Total Time Spent' },
    { key: 'certificates',    label: 'Certificates Earned' },
  ],
};

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function fetchUserProgressRows(
  dateFrom?: string,
  dateTo?: string
): Promise<CsvRow[]> {
  let query = supabase
    .from('enrollments')
    .select(`
      user_id,
      course_id,
      status,
      progress_percentage,
      time_spent_minutes,
      enrolled_at,
      started_at,
      completed_at,
      course:courses(title),
      profile:profiles!enrollments_user_id_fkey(
        full_name, email, company_name, sme_id, municipality
      )
    `)
    .order('enrolled_at', { ascending: false });

  if (dateFrom) query = query.gte('enrolled_at', dateFrom);
  if (dateTo)   query = query.lte('enrolled_at', dateTo + 'T23:59:59');

  const { data: enrollments, error } = await query;
  if (error) throw error;

  // Fetch roles map
  const { data: roles } = await supabase
    .from('user_roles')
    .select('user_id, role');
  const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

  // Fetch certificates map (enrollment_id → certificate_number)
  const { data: certs } = await supabase
    .from('certificates')
    .select('enrollment_id, certificate_number');
  const certMap = new Map((certs || []).map(c => [c.enrollment_id, c.certificate_number]));

  return (enrollments || []).map((e: any) => ({
    learner_name:       e.profile?.full_name   ?? '',
    email:              e.profile?.email        ?? '',
    company_name:       e.profile?.company_name ?? '',
    sme_id:             e.profile?.sme_id       ?? '',
    municipality:       e.profile?.municipality ?? '',
    role:               roleMap.get(e.user_id)  ?? 'learner',
    course_title:       e.course?.title         ?? '',
    status:             e.status,
    progress_pct:       e.progress_percentage   ?? 0,
    time_spent:         fmtMinutes(e.time_spent_minutes),
    enrolled_at:        fmtDate(e.enrolled_at),
    started_at:         fmtDate(e.started_at),
    completed_at:       fmtDate(e.completed_at),
    certificate_number: certMap.get(e.id)       ?? '',
  }));
}

async function fetchTrainingSummaryRows(
  dateFrom?: string,
  dateTo?: string
): Promise<CsvRow[]> {
  let query = supabase
    .from('enrollments')
    .select('course_id, status, progress_percentage, time_spent_minutes, enrolled_at, course:courses(title)');

  if (dateFrom) query = query.gte('enrolled_at', dateFrom);
  if (dateTo)   query = query.lte('enrolled_at', dateTo + 'T23:59:59');

  const { data, error } = await query;
  if (error) throw error;

  // Aggregate by course
  const map = new Map<string, {
    title: string; total: number; completed: number;
    in_progress: number; not_started: number;
    progress_sum: number; time_sum: number;
  }>();

  (data || []).forEach((e: any) => {
    const key = e.course_id;
    if (!map.has(key)) {
      map.set(key, {
        title: e.course?.title ?? e.course_id,
        total: 0, completed: 0, in_progress: 0, not_started: 0,
        progress_sum: 0, time_sum: 0,
      });
    }
    const r = map.get(key)!;
    r.total++;
    if (e.status === 'completed')   r.completed++;
    else if (e.status === 'in_progress') r.in_progress++;
    else r.not_started++;
    r.progress_sum += e.progress_percentage ?? 0;
    r.time_sum     += e.time_spent_minutes  ?? 0;
  });

  return Array.from(map.values()).map(r => ({
    course_title:   r.title,
    total:          r.total,
    completed:      r.completed,
    in_progress:    r.in_progress,
    not_started:    r.not_started,
    completion_pct: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
    avg_progress:   r.total > 0 ? Math.round(r.progress_sum / r.total)      : 0,
    total_time:     fmtMinutes(r.time_sum),
  }));
}

async function fetchQuizResultRows(
  dateFrom?: string,
  dateTo?: string
): Promise<CsvRow[]> {
  let query = supabase
    .from('module_completions')
    .select(`
      user_id,
      quiz_score,
      status,
      completed_at,
      module:modules(title, quiz_pass_mark, course_id, course:courses(title)),
      enrollment:enrollments(
        profile:profiles!enrollments_user_id_fkey(full_name, email, company_name)
      )
    `)
    .not('quiz_score', 'is', null)
    .order('completed_at', { ascending: false });

  if (dateFrom) query = query.gte('completed_at', dateFrom);
  if (dateTo)   query = query.lte('completed_at', dateTo + 'T23:59:59');

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((mc: any) => {
    const passMark = mc.module?.quiz_pass_mark ?? 70;
    const score    = mc.quiz_score ?? 0;
    return {
      learner_name: mc.enrollment?.profile?.full_name   ?? '',
      email:        mc.enrollment?.profile?.email        ?? '',
      company_name: mc.enrollment?.profile?.company_name ?? '',
      course_title: mc.module?.course?.title             ?? '',
      module_title: mc.module?.title                     ?? '',
      quiz_score:   score,
      pass_mark:    passMark,
      passed:       score >= passMark ? 'Yes' : 'No',
      attempts:     mc.status,
      completed_at: fmtDate(mc.completed_at),
    };
  });
}

async function fetchCertificateRows(
  dateFrom?: string,
  dateTo?: string
): Promise<CsvRow[]> {
  let query = supabase
    .from('certificates')
    .select('*')
    .order('issued_at', { ascending: false });

  if (dateFrom) query = query.gte('issued_at', dateFrom);
  if (dateTo)   query = query.lte('issued_at', dateTo + 'T23:59:59');

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((c: any) => ({
    certificate_number: c.certificate_number,
    learner_name:       c.learner_name,
    course_title:       c.course_title,
    company_name:       c.company_name  ?? '',
    sme_id:             c.sme_id        ?? '',
    municipality:       c.municipality  ?? '',
    issued_at:          fmtDate(c.issued_at),
  }));
}

async function fetchUserActivityRows(): Promise<CsvRow[]> {
  const { data: profiles, error: pe } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (pe) throw pe;

  const { data: roles, error: re } = await supabase
    .from('user_roles')
    .select('user_id, role, is_approved');
  if (re) throw re;

  const roleMap = new Map((roles || []).map(r => [r.user_id, r]));

  return (profiles || []).map((p: any) => {
    const r = roleMap.get(p.user_id);
    return {
      full_name:     p.full_name    ?? '',
      email:         p.email        ?? '',
      company_name:  p.company_name ?? '',
      sme_id:        p.sme_id       ?? '',
      municipality:  p.municipality ?? '',
      role:          r?.role        ?? 'learner',
      user_type:     p.user_type    ?? '',
      status:        r?.is_approved ? 'Approved' : 'Pending',
      registered_at: fmtDate(p.created_at),
    };
  });
}

async function fetchComplianceRows(): Promise<CsvRow[]> {
  const [
    { data: profiles },
    { data: smes },
    { data: enrollments },
    { data: certs },
    { data: roles },
  ] = await Promise.all([
    supabase.from('profiles').select('user_id, company_name, sme_id, municipality'),
    supabase.from('smes').select('sme_id, company_name, municipality, industry_sector'),
    supabase.from('enrollments').select('user_id, status'),
    supabase.from('certificates').select('sme_id'),
    supabase.from('user_roles').select('user_id, is_approved'),
  ]);

  const approvedSet = new Set(
    (roles || []).filter(r => r.is_approved).map(r => r.user_id)
  );
  const userToSme = new Map((profiles || []).filter(p => p.sme_id).map(p => [p.user_id, p.sme_id!]));

  type SmeAgg = {
    company_name: string; municipality: string; industry_sector: string;
    total_staff: number; approved_staff: number;
    total_enroll: number; completed: number; certificates: number;
  };

  const map = new Map<string, SmeAgg>();

  (smes || []).forEach((s: any) => {
    map.set(s.sme_id, {
      company_name: s.company_name, municipality: s.municipality ?? '',
      industry_sector: s.industry_sector ?? '',
      total_staff: 0, approved_staff: 0,
      total_enroll: 0, completed: 0, certificates: 0,
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

  return Array.from(map.entries()).map(([sme_id, r]) => ({
    company_name:    r.company_name,
    sme_id,
    municipality:    r.municipality,
    industry_sector: r.industry_sector,
    total_staff:     r.total_staff,
    approved_staff:  r.approved_staff,
    compliance_rate: r.total_staff > 0
      ? Math.round((r.approved_staff / r.total_staff) * 100) : 0,
    total_enroll:    r.total_enroll,
    completed:       r.completed,
    certificates:    r.certificates,
  }));
}

async function fetchSmeReportRows(): Promise<CsvRow[]> {
  const [
    { data: smes },
    { data: profiles },
    { data: enrollments },
    { data: certs },
  ] = await Promise.all([
    supabase.from('smes').select('*'),
    supabase.from('profiles').select('user_id, sme_id'),
    supabase.from('enrollments').select('user_id, status, progress_percentage, time_spent_minutes'),
    supabase.from('certificates').select('sme_id'),
  ]);

  const userToSme = new Map((profiles || []).filter(p => p.sme_id).map(p => [p.user_id, p.sme_id!]));
  const membersBySme = new Map<string, Set<string>>();
  (profiles || []).forEach((p: any) => {
    if (!p.sme_id) return;
    if (!membersBySme.has(p.sme_id)) membersBySme.set(p.sme_id, new Set());
    membersBySme.get(p.sme_id)!.add(p.user_id);
  });

  type Agg = {
    total: number; completed: number; in_progress: number;
    progress_sum: number; time_sum: number; certificates: number;
  };
  const agg = new Map<string, Agg>();
  (smes || []).forEach((s: any) => agg.set(s.sme_id, {
    total: 0, completed: 0, in_progress: 0,
    progress_sum: 0, time_sum: 0, certificates: 0,
  }));

  (enrollments || []).forEach((e: any) => {
    const smeId = userToSme.get(e.user_id);
    if (!smeId || !agg.has(smeId)) return;
    const r = agg.get(smeId)!;
    r.total++;
    if (e.status === 'completed')        r.completed++;
    else if (e.status === 'in_progress') r.in_progress++;
    r.progress_sum += e.progress_percentage ?? 0;
    r.time_sum     += e.time_spent_minutes  ?? 0;
  });

  (certs || []).forEach((c: any) => {
    if (c.sme_id && agg.has(c.sme_id)) agg.get(c.sme_id)!.certificates++;
  });

  return (smes || []).map((s: any) => {
    const r = agg.get(s.sme_id)!;
    const members = membersBySme.get(s.sme_id)?.size ?? 0;
    return {
      sme_id:          s.sme_id,
      company_name:    s.company_name,
      municipality:    s.municipality    ?? '',
      industry_sector: s.industry_sector ?? '',
      member_count:    members,
      total_enroll:    r.total,
      completed:       r.completed,
      in_progress:     r.in_progress,
      completion_rate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
      avg_progress:    r.total > 0 ? Math.round(r.progress_sum / r.total)      : 0,
      time_spent:      fmtMinutes(r.time_sum),
      certificates:    r.certificates,
    };
  });
}

// ─── Learner self-export (scoped to one user) ─────────────────────────────────

export async function exportMyProgress(userId: string): Promise<void> {
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id, status, progress_percentage, time_spent_minutes,
      enrolled_at, started_at, completed_at,
      course:courses(title)
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) throw error;

  const { data: certs } = await supabase
    .from('certificates')
    .select('enrollment_id, certificate_number')
    .eq('user_id', userId);
  const certMap = new Map((certs || []).map(c => [c.enrollment_id, c.certificate_number]));

  const { data: completions } = await supabase
    .from('module_completions')
    .select('enrollment_id, quiz_score, module:modules(title, quiz_pass_mark)')
    .eq('user_id', userId)
    .not('quiz_score', 'is', null);

  // Group quiz scores by enrollment
  const quizByEnrollment = new Map<string, { scores: number[]; pass_marks: number[] }>();
  (completions || []).forEach((mc: any) => {
    if (!quizByEnrollment.has(mc.enrollment_id)) {
      quizByEnrollment.set(mc.enrollment_id, { scores: [], pass_marks: [] });
    }
    quizByEnrollment.get(mc.enrollment_id)!.scores.push(mc.quiz_score);
    quizByEnrollment.get(mc.enrollment_id)!.pass_marks.push(mc.module?.quiz_pass_mark ?? 70);
  });

  const headers = [
    { key: 'course_title',       label: 'Course' },
    { key: 'status',             label: 'Status' },
    { key: 'progress_pct',       label: 'Progress (%)' },
    { key: 'avg_quiz_score',     label: 'Avg Quiz Score (%)' },
    { key: 'time_spent',         label: 'Time Spent' },
    { key: 'enrolled_at',        label: 'Enrolled At' },
    { key: 'started_at',         label: 'Started At' },
    { key: 'completed_at',       label: 'Completed At' },
    { key: 'certificate_number', label: 'Certificate #' },
  ];

  const rows: CsvRow[] = (enrollments || []).map((e: any) => {
    const qd = quizByEnrollment.get(e.id);
    const avgScore = qd && qd.scores.length > 0
      ? Math.round(qd.scores.reduce((a, b) => a + b, 0) / qd.scores.length)
      : '';
    return {
      course_title:       e.course?.title ?? '',
      status:             e.status,
      progress_pct:       e.progress_percentage ?? 0,
      avg_quiz_score:     avgScore,
      time_spent:         fmtMinutes(e.time_spent_minutes),
      enrolled_at:        fmtDate(e.enrolled_at),
      started_at:         fmtDate(e.started_at),
      completed_at:       fmtDate(e.completed_at),
      certificate_number: certMap.get(e.id) ?? '',
    };
  });

  const csv = toCsvString(headers, rows);
  downloadCsv(csv, `My_Training_Progress_${format(new Date(), 'yyyy-MM-dd')}`);
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useExportData() {
  const [exporting, setExporting] = useState<ExportType | null>(null);

  const exportCsv = async (
    type: ExportType,
    options: { dateFrom?: string; dateTo?: string; label?: string } = {}
  ) => {
    setExporting(type);
    try {
      let rows: CsvRow[] = [];

      switch (type) {
        case 'user_progress':
          rows = await fetchUserProgressRows(options.dateFrom, options.dateTo);
          break;
        case 'training_summary':
          rows = await fetchTrainingSummaryRows(options.dateFrom, options.dateTo);
          break;
        case 'quiz_results':
          rows = await fetchQuizResultRows(options.dateFrom, options.dateTo);
          break;
        case 'certificate_audit':
          rows = await fetchCertificateRows(options.dateFrom, options.dateTo);
          break;
        case 'user_activity':
          rows = await fetchUserActivityRows();
          break;
        case 'compliance':
          rows = await fetchComplianceRows();
          break;
        case 'sme_report':
          rows = await fetchSmeReportRows();
          break;
      }

      if (rows.length === 0) {
        toast.info('No data found for the selected filters.');
        return;
      }

      const label = options.label ?? type;
      const filename = safeFilename(`${label}_${format(new Date(), 'yyyy-MM-dd')}`);
      const csv = toCsvString(COLUMNS[type], rows);
      downloadCsv(csv, filename);
      toast.success(`Exported ${rows.length} rows to ${filename}.csv`);
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error(err.message ?? 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  return { exportCsv, exporting };
}
