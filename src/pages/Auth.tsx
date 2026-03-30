import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useIndustrySectors } from "@/hooks/useIndustrySectors";
import { toast } from "sonner";
import { sendWelcomeEmail, sendRegistrationConfirmationEmail } from "@/lib/emailWorkflows";
import { z } from "zod";
import { 
  Recycle, 
  Mail, 
  Lock, 
  User,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Briefcase
} from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { sectors, loading: sectorsLoading } = useIndustrySectors();
  
  const inviteCode = searchParams.get("invite");
  const initialMode = inviteCode ? "register" : (searchParams.get("mode") || "login");
  
  const [mode, setMode] = useState<"login" | "register">(initialMode as "login" | "register");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"individual" | "business">(inviteCode ? "individual" : "individual");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
    industrySector: "",
  });

  // Automatically update mode and user type if inviteCode changes
  useEffect(() => {
    if (inviteCode) {
      setMode("register");
      setUserType("individual");
    }
  }, [inviteCode]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(formData.email);
    } catch {
      toast.error("Please enter a valid email address");
      return false;
    }

    try {
      passwordSchema.parse(formData.password);
    } catch {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (mode === "register") {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("Please enter your full name");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
      if (userType === "business" && !formData.companyName.trim()) {
        toast.error("Please enter your company name");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        // Generate SME ID for business accounts if not provided via invite
        const smeId = inviteCode || (userType === "business" 
          ? `SME-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
          : undefined);
        
        const { error } = await signUp(formData.email, formData.password, {
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          user_type: inviteCode ? "learner" : (userType === "business" ? "sme_admin" : "individual"),
          company_name: userType === "business" ? formData.companyName : undefined,
          sme_id: smeId,
          industry_sector: userType === "business" ? formData.industrySector : undefined,
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("An account with this email already exists. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully! Welcome to Corecycle.");
          // Send welcome + registration confirmation emails
          const userName = `${formData.firstName} ${formData.lastName}`.trim();
          sendWelcomeEmail({ email: formData.email, userName }).catch(console.error);
          sendRegistrationConfirmationEmail({
            email: formData.email,
            userName,
            userType: userType === 'business' ? 'sme_admin' : 'individual',
            companyName: userType === 'business' ? formData.companyName : undefined,
            approvalRequired: userType === 'business',
          }).catch(console.error);
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-primary">
                  <Recycle className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">Corecycle</span>
              </Link>
              
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                {mode === "login" ? "Welcome Back" : "Create Your Account"}
              </h1>
              <p className="text-muted-foreground">
                {mode === "login" 
                  ? "Sign in to continue your training"
                  : "Start your Ontario recycling training journey"
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card variant="elevated">
                <CardContent className="p-6 lg:p-8">
                  {/* Mode Toggle */}
                  <div className="flex rounded-lg bg-secondary p-1 mb-6">
                    <button
                      onClick={() => setMode("login")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        mode === "login"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setMode("register")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        mode === "register"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "register" && (
                      <>
                        {/* Registration Type */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <button
                            type="button"
                            onClick={() => setUserType("individual")}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              userType === "individual"
                                ? "border-leaf bg-leaf/5"
                                : "border-border hover:border-leaf/50"
                            }`}
                          >
                            <User className="h-6 w-6 text-leaf mx-auto mb-2" />
                            <div className="text-sm font-medium text-foreground">Individual</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserType("business")}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              userType === "business"
                                ? "border-leaf bg-leaf/5"
                                : "border-border hover:border-leaf/50"
                            }`}
                          >
                            <Building2 className="h-6 w-6 text-leaf mx-auto mb-2" />
                            <div className="text-sm font-medium text-foreground">Business</div>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <div className="relative mt-1">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="firstName"
                                placeholder="John"
                                className="pl-10"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <div className="relative mt-1">
                              <Input
                                id="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                disabled={loading}
                              />
                            </div>
                          </div>
                        </div>

                        {userType === "business" && (
                          <>
                            <div>
                              <Label htmlFor="companyName">Company Name</Label>
                              <div className="relative mt-1">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="companyName"
                                  placeholder="Acme Corp"
                                  className="pl-10"
                                  value={formData.companyName}
                                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                  disabled={loading}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="industrySector">Industry Sector</Label>
                              <Select
                                value={formData.industrySector}
                                onValueChange={(value) => setFormData({ ...formData, industrySector: value })}
                                disabled={loading}
                              >
                                <SelectTrigger className="mt-1">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder={sectorsLoading ? "Loading..." : "Select industry sector"} />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-background border shadow-lg z-50">
                                  {sectors.map((sector) => (
                                    <SelectItem key={sector.id} value={sector.name}>
                                      {sector.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {mode === "register" && (
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {mode === "login" && (
                      <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-leaf hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                    )}

                    <Button type="submit" variant="forest" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {mode === "login" ? "Signing in..." : "Creating account..."}
                        </>
                      ) : (
                        <>
                          {mode === "login" ? "Sign In" : "Create Account"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    {mode === "login" ? (
                      <p>
                        Don't have an account?{" "}
                        <button
                          onClick={() => setMode("register")}
                          className="text-leaf font-medium hover:underline"
                        >
                          Create one
                        </button>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{" "}
                        <button
                          onClick={() => setMode("login")}
                          className="text-leaf font-medium hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="text-leaf hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-leaf hover:underline">Privacy Policy</Link>.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
