import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, ImageIcon, Upload, FileText, Video, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { ResourcesManager } from "@/components/admin/ResourcesManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'video/mp4': 'MP4',
  'video/webm': 'WebM',
  'video/quicktime': 'MOV',
  'text/csv': 'CSV',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

const getFileIcon = (contentType: string | null) => {
  if (!contentType) return <File className="h-8 w-8" />;
  if (contentType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
  if (contentType.includes('presentation') || contentType.includes('powerpoint')) 
    return <FileText className="h-8 w-8 text-orange-500" />;
  if (contentType.includes('video')) return <Video className="h-8 w-8 text-blue-500" />;
  return <File className="h-8 w-8" />;
};

const getFileTypeLabel = (contentType: string | null) => {
  if (!contentType) return 'Unknown';
  return ACCEPTED_TYPES[contentType as keyof typeof ACCEPTED_TYPES] || contentType.split('/')[1]?.toUpperCase() || 'File';
};

export function CourseEditor() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditing = Boolean(courseId);
  const { courses, createCourse, updateCourse } = useAdminCourses();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    thumbnail_url: "",
    duration_minutes: 0,
    is_published: false,
    content_url: "",
    content_type: ""
  });

  useEffect(() => {
    if (isEditing && courses.length > 0) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setFormData({
          title: course.title,
          description: course.description || "",
          short_description: course.short_description || "",
          thumbnail_url: course.thumbnail_url || "",
          duration_minutes: course.duration_minutes,
          is_published: course.is_published,
          content_url: course.content_url || "",
          content_type: course.content_type || ""
        });
      }
    }
  }, [courseId, courses, isEditing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedTypes = Object.keys(ACCEPTED_TYPES);
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, PPT/PPTX, Video, CSV, DOC, or DOCX");
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 100MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `courses/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-content')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        content_url: publicUrl,
        content_type: file.type
      }));

      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      content_url: "",
      content_type: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && courseId) {
        await updateCourse(courseId, formData);
        toast.success("Course updated successfully");
      } else {
        const newCourse = await createCourse(formData);
        toast.success("Course created successfully");
        navigate(`/admin/courses/${newCourse.id}/modules`);
        return;
      }
      navigate("/admin/courses");
    } catch (error) {
      toast.error(isEditing ? "Failed to update course" : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/courses")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update course details" : "Add a new training course"}
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  Basic information about the course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Introduction to EPR Compliance"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief overview for course cards"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed course description..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={0}
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Content Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  Upload PDF, PowerPoint, or Video content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.mp4,.webm,.mov,.csv,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {formData.content_url ? (
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    {getFileIcon(formData.content_type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {getFileTypeLabel(formData.content_type)} Content
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {formData.content_url.split('/').pop()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-10 w-10 mx-auto text-muted-foreground animate-spin" />
                        <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, PPT, PPTX, MP4, WebM, MOV, CSV, DOC, DOCX (max 100MB)
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
                <CardDescription>
                  Course cover image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Image URL</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                {formData.thumbnail_url ? (
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>
                  Control course visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="published">Published</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this course visible to learners
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Resources Manager — only available after course is created */}
        {isEditing && courseId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ResourcesManager courseId={courseId} />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end gap-3"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/courses")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? "Save Changes" : "Create Course"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

export default CourseEditor;
