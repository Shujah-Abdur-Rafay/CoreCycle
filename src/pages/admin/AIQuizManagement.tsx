import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIQuizGenerator } from "@/components/admin/AIQuizGenerator";
import { AIQuizLibrary } from "@/components/admin/AIQuizLibrary";
import { Loader2, Sparkles, Library } from "lucide-react";

const AIQuizManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();

  const actualIsSuperAdmin = userRole?.role === 'super_admin';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !actualIsSuperAdmin && user) {
      navigate("/dashboard");
    }
  }, [actualIsSuperAdmin, roleLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !actualIsSuperAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            AI Quiz Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate quizzes automatically from documents using AI
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="generator" className="space-y-6">
            <TabsList>
              <TabsTrigger value="generator" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generator
              </TabsTrigger>
              <TabsTrigger value="library" className="gap-2">
                <Library className="h-4 w-4" />
                Quiz Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator">
              <AIQuizGenerator />
            </TabsContent>

            <TabsContent value="library">
              <AIQuizLibrary />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AIQuizManagement;
