import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Recycle, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email();

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSent(true);
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
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-primary">
                  <Recycle className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">OntreCycle</span>
              </Link>

              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                {sent ? "Check Your Email" : "Forgot Password?"}
              </h1>
              <p className="text-muted-foreground">
                {sent
                  ? `We sent a reset link to ${email}`
                  : "Enter your email and we'll send you a reset link."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card variant="elevated">
                <CardContent className="p-6 lg:p-8">
                  {sent ? (
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Click the link in the email to set a new password. The link
                        expires in <strong>1 hour</strong>. If you don't see it, check
                        your spam folder.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => { setEmail(""); setSent(false); }}
                      >
                        Send to a different email
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="forest"
                        className="w-full"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 text-center">
                <Link
                  to="/auth?mode=login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
