import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Link2, Link2Off, Loader2, GraduationCap, Award } from 'lucide-react';
import { useCertificateTemplates, CourseCertificateMap } from '@/hooks/useCertificateTemplates';
import { useCourses } from '@/hooks/useCourses';
import { CertificateCard } from '@/components/certificate/CertificateCard';

export function CertificateTemplateLinking() {
  const { templates, loading: templatesLoading, linkTemplateToCourse, unlinkTemplateFromCourse, getCourseMappings } = useCertificateTemplates();
  const { courses, loading: coursesLoading } = useCourses();

  const [mappings, setMappings] = useState<CourseCertificateMap[]>([]);
  const [loadingMappings, setLoadingMappings] = useState(true);
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const fetchMappings = async () => {
    setLoadingMappings(true);
    const data = await getCourseMappings();
    setMappings(data);
    // Seed local selection state from DB
    const sel: Record<string, string> = {};
    data.forEach(m => { sel[m.course_id] = m.certificate_template_id; });
    setSelections(sel);
    setLoadingMappings(false);
  };

  useEffect(() => {
    fetchMappings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLinkedTemplateId = (courseId: string) =>
    mappings.find(m => m.course_id === courseId)?.certificate_template_id ?? null;

  const handleLink = async (courseId: string) => {
    const templateId = selections[courseId];
    if (!templateId) { toast.error('Select a template first'); return; }
    setSavingCourseId(courseId);
    const ok = await linkTemplateToCourse(courseId, templateId);
    if (ok) {
      toast.success('Template linked to course');
      await fetchMappings();
    } else {
      toast.error('Failed to link template');
    }
    setSavingCourseId(null);
  };

  const handleUnlink = async (courseId: string) => {
    setSavingCourseId(courseId);
    const ok = await unlinkTemplateFromCourse(courseId);
    if (ok) {
      toast.success('Template unlinked');
      setSelections(prev => { const n = { ...prev }; delete n[courseId]; return n; });
      await fetchMappings();
    } else {
      toast.error('Failed to unlink template');
    }
    setSavingCourseId(null);
  };

  const loading = templatesLoading || coursesLoading || loadingMappings;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-1">No templates available</h4>
          <p className="text-sm text-muted-foreground">
            Create at least one certificate template before linking to courses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Course → Template Mapping</h3>
        <p className="text-sm text-muted-foreground">
          Each course can have one active certificate template. Learners see this on course completion.
        </p>
      </div>

      <div className="space-y-4">
        {courses.map(course => {
          const linkedId = getLinkedTemplateId(course.id);
          const linkedTemplate = linkedId ? templates.find(t => t.id === linkedId) : null;
          const selectedId = selections[course.id] ?? '';
          const isSaving = savingCourseId === course.id;
          const hasChanged = selectedId !== (linkedId ?? '');

          return (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold truncate">{course.title}</CardTitle>
                      {linkedTemplate ? (
                        <Badge variant="secondary" className="text-xs mt-0.5 gap-1">
                          <Link2 className="h-3 w-3" />
                          {linkedTemplate.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs mt-0.5 text-muted-foreground">
                          No template linked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Certificate Template
                    </label>
                    <Select
                      value={selectedId}
                      onValueChange={v => setSelections(prev => ({ ...prev, [course.id]: v }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a template…" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasChanged && selectedId && (
                      <Button
                        size="sm"
                        variant="forest"
                        disabled={isSaving}
                        onClick={() => handleLink(course.id)}
                        className="gap-1.5"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                        {linkedId ? 'Update' : 'Link'}
                      </Button>
                    )}
                    {linkedId && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => handleUnlink(course.id)}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                        Unlink
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mini preview of selected/linked template */}
                {(selectedId || linkedId) && (() => {
                  const previewId = selectedId || linkedId;
                  const previewTpl = templates.find(t => t.id === previewId);
                  if (!previewTpl) return null;
                  return (
                    <>
                      <Separator className="mt-4 mb-4" />
                      <div className="flex items-center gap-4">
                        {/* Render at 320px then scale down 0.3× so text fits without wrapping */}
                        <div className="shrink-0 overflow-hidden rounded-2xl shadow-sm" style={{ width: 96, height: 96 }}>
                          <div style={{ width: 320, height: 320, transform: 'scale(0.3)', transformOrigin: 'top left' }}>
                            <CertificateCard
                              template={previewTpl}
                              preview={false}
                              className="w-[320px] h-[320px]"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p className="font-medium text-foreground">{previewTpl.name}</p>
                          <p>{previewTpl.header_text}</p>
                          {previewTpl.provider_name && <p>{previewTpl.provider_name}</p>}
                          {hasChanged && selectedId && selectedId !== linkedId && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs mt-1">
                              Unsaved change
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
