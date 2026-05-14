import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type PageState = "loading" | "ready" | "success" | "invalid";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset link.
    // The SDK automatically exchanges the URL hash for a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });

    // If the page loads and a session already exists with the recovery token
    // (e.g. navigated back), check immediately.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState("ready");
      } else {
        // Give the SDK a moment to parse the URL hash before declaring invalid.
        const timer = setTimeout(() => {
          setPageState(prev => prev === "loading" ? "invalid" : prev);
        }, 2000);
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error } = await updatePassword(password);
    setSaving(false);

    if (error) {
      toast.error("Failed to update password. The link may have expired — please request a new one.");
      return;
    }

    setPageState("success");
    toast.success("Password updated successfully!");
    setTimeout(() => navigate("/auth?mode=login"), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <Link to="/" className="inline-flex items-center justify-center mb-6">
                <img src="/logo-text.jpeg" alt="Ontrecycle" className="h-20 w-auto object-contain" />
              </Link>

              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                {pageState === "success" ? "Password Updated" : "Set New Password"}
              </h1>
              <p className="text-muted-foreground">
                {pageState === "success"
                  ? "Redirecting you to sign in…"
                  : "Choose a strong password for your account."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card variant="elevated">
                <CardContent className="p-6 lg:p-8">

                  {/* Loading — waiting for Supabase to parse the hash */}
                  {pageState === "loading" && (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Verifying reset link…</p>
                    </div>
                  )}

                  {/* Invalid / expired link */}
                  {pageState === "invalid" && (
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This reset link is invalid or has expired. Please request a new one.
                      </p>
                      <Button variant="forest" className="w-full" asChild>
                        <Link to="/forgot-password">Request New Link</Link>
                      </Button>
                    </div>
                  )}

                  {/* Success */}
                  {pageState === "success" && (
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your password has been updated. You can now sign in with your new password.
                      </p>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Form */}
                  {pageState === "ready" && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={saving}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="forest"
                        className="w-full"
                        size="lg"
                        disabled={saving}
                      >
                        {saving ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…</>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </form>
                  )}

                </CardContent>
              </Card>

              {(pageState === "ready" || pageState === "invalid") && (
                <div className="mt-6 text-center">
                  <Link
                    to="/auth?mode=login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
