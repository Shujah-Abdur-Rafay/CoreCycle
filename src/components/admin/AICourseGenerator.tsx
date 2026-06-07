import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  generateCourseFromText,
  extractTextFromFile,
  validateContent,
  type GeneratedCourse,
} from "@/lib/courseGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  Trash2,
  Save,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Clock,
  Wand2,
} from "lucide-react";

type Step = "input" | "processing" | "review" | "saved";

export function AICourseGenerator() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");

  // Input
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options
  const [courseTitle, setCourseTitle] = useState("");
  const [numModules, setNumModules] = useState(5);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [publishNow, setPublishNow] = useState(false);

  // Output
  const [generated, setGenerated] = useState<GeneratedCourse | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 15MB.");
      return;
    }
    setSelectedFile(file);
    if (!courseTitle) setCourseTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleGenerate = async () => {
    setProcessing(true);
    setProgress(10);
    setStatusText("Reading source material…");
    setStep("processing");

    try {
      let content = "";
      if (inputMode === "file" && selectedFile) {
        content = await extractTextFromFile(selectedFile);
      } else {
        content = textContent;
      }

      setProgress(30);
      const validation = validateContent(content);
      if (!validation.valid) throw new Error(validation.error);

      setProgress(45);
      setStatusText("Generating course modules with AI…");

      const result = await generateCourseFromText(content, {
        title: courseTitle,
        numModules,
        includeQuizzes,
      });

      setProgress(100);
      setGenerated(result);
      setStep("review");
      toast.success(`Generated ${result.modules.length} modules!`);
    } catch (error: any) {
      console.error("Course generation error:", error);
      toast.error(error.message || "Failed to generate course");
      setStep("input");
    } finally {
      setProcessing(false);
    }
  };

  const removeModule = (index: number) => {
    setGenerated((prev) =>
      prev ? { ...prev, modules: prev.modules.filter((_, i) => i !== index) } : prev
    );
  };

  const handleSave = async () => {
    if (!generated) return;
    if (!generated.title.trim()) {
      toast.error("The course needs a title");
      return;
    }
    if (generated.modules.length === 0) {
      toast.error("Add at least one module before saving");
      return;
    }

    setProcessing(true);
    try {
      const totalDuration = generated.modules.reduce(
        (sum, m) => sum + (m.duration_minutes || 0),
        0
      );

      // 1. Create the course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          title: generated.title,
          description: generated.description || null,
          short_description: generated.short_description || null,
          duration_minutes: totalDuration,
          is_published: publishNow,
          access_type: "public",
        } as any)
        .select()
        .single();

      if (courseError) throw courseError;

      // 2. Create modules (and their quizzes) in order
      for (let i = 0; i < generated.modules.length; i++) {
        const m = generated.modules[i];
        const hasQuiz = !!(m.quiz && m.quiz.length > 0);

        const { data: mod, error: moduleError } = await supabase
          .from("modules")
          .insert({
            course_id: course.id,
            title: m.title,
            description: m.description || null,
            content: m.content || null,
            duration_minutes: m.duration_minutes || 0,
            order_index: i,
            has_quiz: hasQuiz,
            quiz_pass_mark: 70,
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        if (hasQuiz && m.quiz) {
          const rows = m.quiz.map((q, qi) => ({
            module_id: mod.id,
            question: q.question,
            options: q.options,
            correct_answer_index: q.correctAnswerIndex,
            explanation: q.explanation,
            order_index: qi,
          }));
          const { error: quizError } = await supabase.from("quiz_questions").insert(rows);
          if (quizError) throw quizError;
        }
      }

      toast.success("Course created successfully!");
      setStep("saved");
      setTimeout(() => navigate(`/admin/courses/${course.id}/modules`), 1200);
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save course");
    } finally {
      setProcessing(false);
    }
  };

  const canGenerate =
    !processing &&
    (inputMode === "file" ? !!selectedFile : textContent.trim().length >= 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Generate Course with AI
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload a PDF, Word, or text file — the AI builds modules that match your
            existing course style.
          </p>
        </div>
      </div>

      {/* Input */}
      {step === "input" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Source Material</CardTitle>
              <CardDescription>
                The course content is generated from this material.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "file" | "text")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="text">Paste Text</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium mb-1">Click to upload</p>
                      <p className="text-sm text-muted-foreground">PDF, TXT, or DOCX (max 15MB)</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="text" className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Paste your source content here… (minimum 100 characters)"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {textContent.length} characters •{" "}
                    {textContent.split(/\s+/).filter(Boolean).length} words
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>Configure how the course is generated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">
                  Course Title{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="course-title"
                  placeholder="e.g., Ontario Recycling Fundamentals"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Modules</Label>
                <Select value={String(numModules)} onValueChange={(v) => setNumModules(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 10].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} modules
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="inc-quiz">Generate a quiz per module</Label>
                  <p className="text-xs text-muted-foreground">
                    Adds 4 multiple-choice questions to each module.
                  </p>
                </div>
                <Switch id="inc-quiz" checked={includeQuizzes} onCheckedChange={setIncludeQuizzes} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="pub-now">Publish immediately</Label>
                  <p className="text-xs text-muted-foreground">
                    Leave off to save as a draft you can review first.
                  </p>
                </div>
                <Switch id="pub-now" checked={publishNow} onCheckedChange={setPublishNow} />
              </div>

              <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full gap-2" size="lg">
                <Wand2 className="h-5 w-5" />
                Generate Course with AI
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Processing */}
      {step === "processing" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div>
                  <p className="font-medium text-lg">{statusText || "Working…"}</p>
                  <p className="text-sm text-muted-foreground">
                    Generating a full course can take 30–90 seconds.
                  </p>
                </div>
                <Progress value={progress} className="max-w-xs mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Review */}
      {step === "review" && generated && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Course Title</Label>
                    <Input
                      value={generated.title}
                      onChange={(e) =>
                        setGenerated({ ...generated, title: e.target.value })
                      }
                      className="font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Short Description</Label>
                    <Input
                      value={generated.short_description}
                      onChange={(e) =>
                        setGenerated({ ...generated, short_description: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{generated.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {generated.modules.length} Module{generated.modules.length !== 1 ? "s" : ""}
            </h2>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {generated.modules.reduce((s, m) => s + (m.duration_minutes || 0), 0)} min total
            </Badge>
          </div>

          {generated.modules.map((m, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline">Module {idx + 1}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {m.duration_minutes} min
                    </span>
                    {m.quiz && m.quiz.length > 0 && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <HelpCircle className="h-3 w-3" />
                        {m.quiz.length} quiz Qs
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{m.title}</CardTitle>
                  {m.description && (
                    <CardDescription className="mt-1">{m.description}</CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeModule(idx)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-primary list-none flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Preview content
                  </summary>
                  <div
                    className="prose prose-sm max-w-none mt-3 rounded-lg border bg-muted/20 p-4 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: m.content }}
                  />
                </details>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
              Start Over
            </Button>
            <Button
              onClick={handleSave}
              disabled={processing || generated.modules.length === 0}
              className="flex-1 gap-2"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {publishNow ? "Save & Publish Course" : "Save as Draft"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Saved */}
      {step === "saved" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
                <div>
                  <p className="font-semibold text-xl text-emerald-900 dark:text-emerald-100">
                    Course Created!
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Opening the module manager…
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default AICourseGenerator;
