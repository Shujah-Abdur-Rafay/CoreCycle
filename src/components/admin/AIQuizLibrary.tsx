import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAIQuizzes, AIGeneratedQuiz, AIQuizWithQuestions } from "@/hooks/useAIQuizzes";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Sparkles,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronsUpDown,
  Check,
} from "lucide-react";

interface EditForm {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  course_id: string;
}

export function AIQuizLibrary({ courseId }: { courseId?: string }) {
  const { quizzes, loading, getQuizWithQuestions, deleteQuiz, publishQuiz, updateQuiz } = useAIQuizzes(courseId);
  const { courses } = useAdminCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewQuiz, setPreviewQuiz] = useState<AIQuizWithQuestions | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Edit state
  const [editingQuiz, setEditingQuiz] = useState<AIGeneratedQuiz | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '', difficulty: 'medium', course_id: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = async (quizId: string) => {
    setLoadingPreview(true);
    try {
      const quiz = await getQuizWithQuestions(quizId);
      setPreviewQuiz(quiz);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load quiz');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDelete = async (quizId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    
    try {
      await deleteQuiz(quizId);
      toast.success('Quiz deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete quiz');
    }
  };

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await publishQuiz(quizId, !currentStatus);
      toast.success(currentStatus ? 'Quiz unpublished' : 'Quiz published');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quiz');
    }
  };

  const openEditDialog = (quiz: AIGeneratedQuiz) => {
    setEditingQuiz(quiz);
    setEditForm({
      title: quiz.title,
      description: quiz.description || '',
      difficulty: quiz.difficulty,
      course_id: quiz.course_id || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuiz) return;
    if (!editForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSavingEdit(true);
    try {
      await updateQuiz(editingQuiz.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        difficulty: editForm.difficulty,
        course_id: editForm.course_id || null,
      });
      toast.success('Quiz updated');
      setEditingQuiz(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quiz');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );
  const editCourse = courses.find(c => c.id === editForm.course_id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground';
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">AI Quiz Library</h2>
            <p className="text-muted-foreground text-sm">
              {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} generated
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No quizzes match your search' : 'No quizzes generated yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(quiz.difficulty)}
                    >
                      {quiz.difficulty}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(quiz.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(quiz.id, quiz.is_published)}
                        >
                          {quiz.is_published ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(quiz.id, quiz.title)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardTitle className="text-base line-clamp-2">{quiz.title}</CardTitle>
                  {quiz.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {quiz.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{quiz.num_questions} questions</span>
                    {quiz.is_published ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted">
                        Draft
                      </Badge>
                    )}
                  </div>

                  {quiz.course_id && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {courses.find(c => c.id === quiz.course_id)?.title || 'Linked course'}
                      </span>
                    </div>
                  )}

                  {quiz.source_filename && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{quiz.source_filename}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {format(new Date(quiz.created_at), 'MMM d, yyyy')}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handlePreview(quiz.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingQuiz} onOpenChange={(open) => { if (!open) setEditingQuiz(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>Update quiz details and course assignment</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Quiz title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the quiz"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={editForm.difficulty}
                onValueChange={v => setEditForm(f => ({ ...f, difficulty: v as 'easy' | 'medium' | 'hard' }))}
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

            <div className="space-y-2">
              <Label>Linked Course <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Popover open={coursePickerOpen} onOpenChange={setCoursePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {editCourse ? (
                      <span className="flex items-center gap-2 truncate">
                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {editCourse.title}
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
                        {editForm.course_id && (
                          <CommandItem
                            value="__none__"
                            onSelect={() => {
                              setEditForm(f => ({ ...f, course_id: '' }));
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
                              setEditForm(f => ({ ...f, course_id: c.id }));
                              setCoursePickerOpen(false);
                              setCourseSearch('');
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${editForm.course_id === c.id ? 'opacity-100' : 'opacity-0'}`}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuiz(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuiz} onOpenChange={() => setPreviewQuiz(null)}>
        <DialogContent className="max-w-3xl p-0 flex flex-col" style={{ maxHeight: '88vh' }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {previewQuiz?.title}
              <Badge variant="outline" className={getDifficultyColor(previewQuiz?.difficulty || 'medium')}>
                {previewQuiz?.difficulty}
              </Badge>
              {previewQuiz && (
                <span className="text-sm font-normal text-muted-foreground ml-auto">
                  {previewQuiz.questions.length} question{previewQuiz.questions.length !== 1 ? 's' : ''}
                </span>
              )}
            </DialogTitle>
            {previewQuiz?.description && (
              <DialogDescription>{previewQuiz.description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loadingPreview ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : previewQuiz ? (
              <div className="space-y-6">
                {previewQuiz.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="shrink-0 mt-0.5">Q{idx + 1}</Badge>
                      <p className="font-medium leading-relaxed">{q.question}</p>
                    </div>

                    <div className="space-y-2 ml-10">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border text-sm ${
                            optIdx === q.correct_answer_index
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-mono font-medium shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {optIdx === q.correct_answer_index && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                          </div>
                        </div>
                      ))}

                      {q.explanation && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm border border-border/50">
                          <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Explanation: </span>
                            <span className="text-muted-foreground">{q.explanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setPreviewQuiz(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
