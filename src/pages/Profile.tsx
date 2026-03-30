import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your personal organization details
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="max-w-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-foreground">
                    {profile?.full_name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Role</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {profile?.user_type?.replace('_', ' ') || 'Learner'}
                    </p>
                  </div>
                  {profile?.company_name && (
                    <div>
                      <p className="text-sm font-medium text-foreground">Organization</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.company_name}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  Need to update this information? Please contact your administrator.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
