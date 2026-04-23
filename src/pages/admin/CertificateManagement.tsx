import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateTemplateEditor } from "@/components/admin/CertificateTemplateEditor";
import { CertificateTemplateLibrary } from "@/components/admin/CertificateTemplateLibrary";
import { CertificateTemplateLinking } from "@/components/admin/CertificateTemplateLinking";
import { CertificateTemplate } from "@/hooks/useCertificateTemplates";
import { Loader2, LayoutTemplate, Library, Link2 } from "lucide-react";

type Tab = "library" | "editor" | "linking";

const CertificateManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();

  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);

  const isSuperAdmin = userRole?.role === "super_admin";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin && user) navigate("/dashboard");
  }, [isSuperAdmin, roleLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  const handleEdit = (template: CertificateTemplate) => {
    setEditingTemplate(template);
    setActiveTab("editor");
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setActiveTab("editor");
  };

  const handleEditorDone = () => {
    setEditingTemplate(null);
    setActiveTab("library");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            Certificate Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Design reusable certificate templates and link them to courses
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as Tab)} className="space-y-6">
            <TabsList>
              <TabsTrigger value="library" className="gap-2">
                <Library className="h-4 w-4" />
                Template Library
              </TabsTrigger>
              <TabsTrigger value="editor" className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                {editingTemplate ? "Edit Template" : "New Template"}
              </TabsTrigger>
              <TabsTrigger value="linking" className="gap-2">
                <Link2 className="h-4 w-4" />
                Course Linking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library">
              <CertificateTemplateLibrary
                onEdit={handleEdit}
                onCreateNew={handleCreateNew}
              />
            </TabsContent>

            <TabsContent value="editor">
              <CertificateTemplateEditor
                editingTemplate={editingTemplate}
                onSaved={handleEditorDone}
                onCancel={handleEditorDone}
              />
            </TabsContent>

            <TabsContent value="linking">
              <CertificateTemplateLinking />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default CertificateManagement;
