import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Save,
  X,
  Loader2,
  HelpCircle,
  Clock,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminModules, AdminModule } from "@/hooks/useAdminCourses";
import { QuizEditor } from "@/components/admin/QuizEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ModuleManager() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { modules, loading, createModule, updateModule, deleteModule } = useAdminModules(courseId);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AdminModule | null>(null);
  const [saving, setSaving] = useState(false);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    video_url: "",
    duration_minutes: 0,
    has_quiz: false,
    quiz_pass_mark: 70
  });

  // Fetch course title directly
  useEffect(() => {
    const fetchCourseTitle = async () => {
      if (!courseId) return;
      
      const { data, error } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single();
      
      if (data && !error) {
        setCourseTitle(data.title);
      }
    };
    
    fetchCourseTitle();
  }, [courseId]);

  const openNewModuleDialog = () => {
    setSelectedModule(null);
    setFormData({
      title: "",
      description: "",
      content: "",
      video_url: "",
      duration_minutes: 0,
      has_quiz: false,
      quiz_pass_mark: 70
    });
    setEditDialogOpen(true);
  };

  const openEditModuleDialog = (module: AdminModule) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      description: module.description || "",
      content: module.content || "",
      video_url: module.video_url || "",
      duration_minutes: module.duration_minutes,
      has_quiz: module.has_quiz,
      quiz_pass_mark: module.quiz_pass_mark
    });
    setEditDialogOpen(true);
  };

  const openQuizEditor = (module: AdminModule) => {
    setSelectedModule(module);
    setQuizDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!formData.title.trim()) {
      toast.error("Module title is required");
      return;
    }

    setSaving(true);
    try {
      if (selectedModule) {
        await updateModule(selectedModule.id, formData);
        toast.success("Module updated successfully");
      } else {
        await createModule(formData);
        toast.success("Module created successfully");
      }
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!selectedModule) return;
    
    try {
      await deleteModule(selectedModule.id);
      toast.success("Module deleted successfully");
    } catch (error) {
      toast.error("Failed to delete module");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedModule(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/courses")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Manage Modules
            </h1>
            <p className="text-muted-foreground mt-1">
              {courseTitle || "Loading..."}
            </p>
          </div>
        </div>
        <Button onClick={openNewModuleDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Module
        </Button>
      </motion.div>

      {/* Modules List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Course Modules</CardTitle>
            <CardDescription>
              Drag to reorder, click to edit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modules.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No modules yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your first module to get started
                </p>
                <Button onClick={openNewModuleDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Module
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0">
                          {index + 1}
                        </Badge>
                        <h4 className="font-medium text-foreground truncate">
                          {module.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration_minutes} min
                        </span>
                        {module.has_quiz && (
                          <Badge variant="secondary" className="text-xs">
                            Quiz
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {module.has_quiz && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQuizEditor(module)}
                          className="gap-1"
                        >
                          <HelpCircle className="h-3 w-3" />
                          Quiz
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModuleDialog(module)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedModule(module);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Module Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedModule ? "Edit Module" : "Add New Module"}
            </DialogTitle>
            <DialogDescription>
              Configure module content and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Understanding EPR Basics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of this module"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-content">Content</Label>
              <Textarea
                id="module-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Main module content (supports markdown)"
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-video">Video URL</Label>
              <Input
                id="module-video"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-duration">Duration (minutes)</Label>
              <Input
                id="module-duration"
                type="number"
                min={0}
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label htmlFor="has-quiz">Include Quiz</Label>
                <p className="text-sm text-muted-foreground">
                  Add a quiz at the end of this module
                </p>
              </div>
              <Switch
                id="has-quiz"
                checked={formData.has_quiz}
                onCheckedChange={(checked) => setFormData({ ...formData, has_quiz: checked })}
              />
            </div>

            {formData.has_quiz && (
              <div className="space-y-2">
                <Label htmlFor="quiz-pass-mark">Quiz Pass Mark (%)</Label>
                <Input
                  id="quiz-pass-mark"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.quiz_pass_mark}
                  onChange={(e) => setFormData({ ...formData, quiz_pass_mark: parseInt(e.target.value) || 70 })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {selectedModule ? "Save Changes" : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Editor Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Editor</DialogTitle>
            <DialogDescription>
              {selectedModule?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <QuizEditor moduleId={selectedModule.id} onClose={() => setQuizDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedModule?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ModuleManager;
