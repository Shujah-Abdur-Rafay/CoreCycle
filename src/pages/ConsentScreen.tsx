import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Recycle, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

const ADMIN_ROLES = ['super_admin', 'producer_admin', 'municipality_admin', 'sme_admin'];

export default function ConsentScreen() {
  const { user, loading, consentGiven, consentLoading, submitConsent } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Destination after consent (passed via router state, or default to dashboard)
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  if (loading || consentLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in — send to auth
  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  // Admins bypass consent entirely
  if (ADMIN_ROLES.includes(userRole?.role ?? '')) {
    return <Navigate to={from} replace />;
  }

  // Already consented — skip this screen
  if (consentGiven === true) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async () => {
    if (!checked) return;
    setSubmitting(true);
    const { error } = await submitConsent();
    setSubmitting(false);

    if (error) {
      toast.error("Could not save your consent. Please try again.");
      return;
    }

    toast.success("Thank you for agreeing. Welcome aboard!");
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">OntreCycle</span>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Data & Privacy Consent</h1>
                <p className="text-sm text-muted-foreground">Required before accessing the platform</p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 text-sm text-muted-foreground mb-8">
              <p>
                Welcome to <strong className="text-foreground">OntreCycle</strong>. Before you continue, we need your
                permission to collect and process your personal information in accordance with applicable privacy laws,
                including Ontario's <em>Freedom of Information and Protection of Privacy Act (FIPPA)</em>.
              </p>

              <p>By using this platform, you agree that we may:</p>

              <ul className="list-disc pl-5 space-y-1">
                <li>Collect your name, email address, and account activity data.</li>
                <li>Use this data to deliver training content, track course progress, and issue certificates.</li>
                <li>Share aggregated, anonymized data with municipal or producer program partners to report on compliance outcomes.</li>
                <li>Retain your data for as long as your account is active, or as required by law.</li>
              </ul>

              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Read our full policies
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/cookie-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </Link>
                  <Link
                    to="/acceptable-use-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    Acceptable Use Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg mb-6">
              <Checkbox
                id="consent-checkbox"
                checked={checked}
                onCheckedChange={(val) => setChecked(Boolean(val))}
                className="mt-0.5"
              />
              <Label htmlFor="consent-checkbox" className="text-sm leading-relaxed cursor-pointer">
                I have read and agree to the{" "}
                <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2">
                  Terms of Service
                </Link>
                ,{" "}
                <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2">
                  Privacy Policy
                </Link>
                ,{" "}
                <Link to="/acceptable-use-policy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2">
                  Acceptable Use Policy
                </Link>
                , and{" "}
                <Link to="/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2">
                  Cookie Policy
                </Link>
                . I consent to the collection, use, and sharing of my personal data as described, and confirm I am at
                least 16 years of age.
              </Label>
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
              disabled={!checked || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving your consent…
                </>
              ) : (
                "I Agree — Continue to Platform"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              This consent is recorded once and will not be shown again on future logins.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
