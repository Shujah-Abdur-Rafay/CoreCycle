import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCertificates, Certificate } from "@/hooks/useCertificates";
import { CertificateTemplate } from "@/hooks/useCertificateTemplates";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CertificateCard } from "@/components/certificate/CertificateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { generateCertificatePdf } from "@/lib/generateCertificatePdf";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Award,
  Download,
  Calendar,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface CertificateWithTemplate {
  certificate: Certificate;
  template: CertificateTemplate | null;
}

const Certificates = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { certificates, loading: certificatesLoading, getTemplateForCourse } = useCertificates();
  const [enriched, setEnriched] = useState<CertificateWithTemplate[]>([]);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  // Fetch linked template for each certificate
  useEffect(() => {
    if (certificatesLoading || certificates.length === 0) {
      setEnriched(certificates.map(c => ({ certificate: c, template: null })));
      return;
    }

    let cancelled = false;
    const enrich = async () => {
      setEnriching(true);
      const results = await Promise.all(
        certificates.map(async cert => {
          const template = await getTemplateForCourse(cert.course_id);
          return { certificate: cert, template };
        })
      );
      if (!cancelled) {
        setEnriched(results);
        setEnriching(false);
      }
    };
    enrich();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificates, certificatesLoading]);

  const handleDownload = (item: CertificateWithTemplate) => {
    const { certificate } = item;
    try {
      generateCertificatePdf({
        learnerName: certificate.learner_name,
        courseTitle: certificate.course_title,
        completionDate: format(new Date(certificate.issued_at), 'MMMM d, yyyy'),
        certificateNumber: certificate.certificate_number,
        companyName: certificate.company_name || undefined,
      });
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate certificate');
      console.error('PDF generation error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isLoading = certificatesLoading || enriching;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            My Certificates
          </h1>
          <p className="text-muted-foreground mt-1">
            Certificates are issued when you complete all course modules and required quizzes.
          </p>
        </motion.div>

        {/* Certificates Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : enriched.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No certificates yet
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Complete a course's modules and all required quizzes to earn your first certificate.
                </p>
                <Button variant="forest" onClick={() => navigate('/courses')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {enriched.map(({ certificate, template }, index) => (
                <motion.div
                  key={certificate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-4"
                >
                  {/* ── Template-based square card (if linked) ── */}
                  {template ? (
                    <CertificateCard
                      template={template}
                      data={{
                        learnerName: certificate.learner_name,
                        courseTitle: certificate.course_title,
                        completionDate: format(new Date(certificate.issued_at), 'MMMM d, yyyy'),
                        certificateNumber: certificate.certificate_number,
                      }}
                      className="w-full max-w-sm mx-auto shadow-lg"
                    />
                  ) : (
                    /* ── Fallback: original gradient card ── */
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-leaf/20">
                      <div className="bg-gradient-to-r from-forest to-leaf p-6 text-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Award className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm text-white/80">Certificate of Completion</p>
                            <p className="font-medium text-sm">{certificate.certificate_number}</p>
                          </div>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-2">{certificate.course_title}</CardTitle>
                        <CardDescription>Awarded to {certificate.learner_name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>Issued: {format(new Date(certificate.issued_at), 'MMMM d, yyyy')}</span>
                        </div>
                        {certificate.company_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4 shrink-0" />
                            <span>{certificate.company_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="font-mono text-xs">{certificate.certificate_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-medium">All modules & quizzes completed</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Download button — always shown */}
                  <Button
                    className="w-full max-w-sm mx-auto flex"
                    variant="forest"
                    onClick={() => handleDownload({ certificate, template })}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Certificates;
