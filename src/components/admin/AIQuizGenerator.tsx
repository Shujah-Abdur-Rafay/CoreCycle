import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAIQuizzes } from "@/hooks/useAIQuizzes";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import {
  generateQuizFromText,
  extractTextFromFile,
  validateContent,
  GeneratedQuestion,
} from "@/lib/openaiQuizGenerator";
import { toast } from "sonner";
import {
  Sparkles,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save,
  Eye,
  ChevronsUpDown,
  Check,
  BookOpen,
} from "lucide-react";

type GenerationStep = 'input' | 'processing' | 'review' | 'saved';

export function AIQuizGenerator({ courseId }: { courseId?: string }) {
  const { createQuiz } = useAIQuizzes(courseId);
  const { courses } = useAdminCourses();

  const [step, setStep] = useState<GenerationStep>('input');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');

  // Input state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [extractedText, setExtractedText] = useState('');

  // Generation options
  const [quizTitle, setQuizTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  
  // Generated quiz
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [quizSummary, setQuizSummary] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }
    
    setSelectedFile(file);
    setQuizTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const handleGenerate = async () => {
    setProcessing(true);
    setProgress(0);
    setStep('processing');

    try {
      // Step 1: Extract text
      setProgress(20);
      let content = '';
      
      if (inputMode === 'file' && selectedFile) {
        toast.info('Extracting text from file...');
        content = await extractTextFromFile(selectedFile);
        setExtractedText(content);
      } else {
        content = textContent;
        setExtractedText(content);
      }

      // Step 2: Validate
      setProgress(30);
      const validation = validateContent(content);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 3: Generate quiz
      setProgress(40);
      toast.info('Generating quiz questions with AI...');
      
      const result = await generateQuizFromText(content, {
        numQuestions,
        difficulty,
        topic: quizTitle || 'the content',
      });

      setProgress(90);
      setGeneratedQuestions(result.questions);
      setQuizSummary(result.summary);
      
      setProgress(100);
      setStep('review');
      toast.success(`Generated ${result.questions.length} questions!`);
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate quiz');
      setStep('input');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    setProcessing(true);
    try {
      await createQuiz(
        {
          title: quizTitle,
          description: quizSummary,
          source_content: extractedText,
          source_filename: selectedFile?.name || null,
          source_type: inputMode === 'file' ? selectedFile?.type || 'unknown' : 'text',
          difficulty,
          num_questions: generatedQuestions.length,
          module_id: null,
          course_id: selectedCourseId || courseId || null,
          is_published: false,
        },
        generatedQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correct_answer_index: q.correctAnswerIndex,
          explanation: q.explanation,
          order_index: 0, // will be set by the hook
        }))
      );

      toast.success('Quiz saved successfully!');
      setStep('saved');
      
      // Reset after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save quiz');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setStep('input');
    setSelectedFile(null);
    setTextContent('');
    setExtractedText('');
    setQuizTitle('');
    setNumQuestions(5);
    setDifficulty('medium');
    setSelectedCourseId(courseId || '');
    setGeneratedQuestions([]);
    setQuizSummary('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const removeQuestion = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">AI Quiz Generator</h2>
          <p className="text-muted-foreground text-sm">
            Upload a document or paste text to generate quiz questions automatically
          </p>
        </div>
      </div>

      {/* Input Step */}
      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Content Source</CardTitle>
              <CardDescription>Choose how you want to provide the content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'file' | 'text')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="text">Paste Text</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4 mt-4">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                      >
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
                      <p className="text-sm text-muted-foreground">
                        PDF, TXT, or DOCX (max 10MB)
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="text" className="space-y-4 mt-4">
                  <Textarea
                    placeholder="Paste your content here... (minimum 100 characters)"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {textContent.length} characters • {textContent.split(/\s+/).filter(Boolean).length} words
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>Configure how the quiz should be generated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Ontario Recycling Regulations Quiz"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              {/* Course link */}
              <div className="space-y-2">
                <Label>Link to Course <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Popover open={coursePickerOpen} onOpenChange={setCoursePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {selectedCourse ? (
                        <span className="flex items-center gap-2 truncate">
                          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {selectedCourse.title}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a course…</span>
                      )}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search courses…"
                        value={courseSearch}
                        onValueChange={setCourseSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No courses found.</CommandEmpty>
                        <CommandGroup>
                          {selectedCourseId && (
                            <CommandItem
                              value="__none__"
                              onSelect={() => {
                                setSelectedCourseId('');
                                setCoursePickerOpen(false);
                                setCourseSearch('');
                              }}
                            >
                              <span className="text-muted-foreground">— No course —</span>
                            </CommandItem>
                          )}
                          {filteredCourses.map(c => (
                            <CommandItem
                              key={c.id}
                              value={c.id}
                              onSelect={() => {
                                setSelectedCourseId(c.id);
                                setCoursePickerOpen(false);
                                setCourseSearch('');
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${selectedCourseId === c.id ? 'opacity-100' : 'opacity-0'}`}
                              />
                              <span className="truncate">{c.title}</span>
                              {!c.is_published && (
                                <Badge variant="outline" className="ml-auto text-xs">Draft</Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numQuestions">Number of Questions</Label>
                  <Select
                    value={String(numQuestions)}
                    onValueChange={(v) => setNumQuestions(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10, 15].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} questions</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={
                  processing ||
                  !quizTitle.trim() ||
                  (inputMode === 'file' ? !selectedFile : textContent.length < 100)
                }
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                Generate Quiz with AI
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div>
                  <p className="font-medium text-lg">Generating quiz questions...</p>
                  <p className="text-sm text-muted-foreground">This may take 10-30 seconds</p>
                </div>
                <Progress value={progress} className="max-w-xs mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Review Step */}
      {step === 'review' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-900 dark:text-emerald-100">
                    Generated {generatedQuestions.length} questions
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    {quizSummary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {generatedQuestions.map((q, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2">Question {idx + 1}</Badge>
                  <CardTitle className="text-base">{q.question}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-lg border ${
                      optIdx === q.correctAnswerIndex
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-sm font-medium shrink-0">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="text-sm">{opt}</span>
                      {optIdx === q.correctAnswerIndex && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                  <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Explanation: </span>
                    <span className="text-muted-foreground">{q.explanation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetForm} className="flex-1">
              Start Over
            </Button>
            <Button
              onClick={handleSave}
              disabled={processing || generatedQuestions.length === 0}
              className="flex-1 gap-2"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Quiz
            </Button>
          </div>
        </motion.div>
      )}

      {/* Saved Step */}
      {step === 'saved' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
                <div>
                  <p className="font-semibold text-xl text-emerald-900 dark:text-emerald-100">
                    Quiz Saved Successfully!
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Redirecting...
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
