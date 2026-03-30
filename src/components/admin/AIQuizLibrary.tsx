import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAIQuizzes, AIQuizWithQuestions } from "@/hooks/useAIQuizzes";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Sparkles,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function AIQuizLibrary({ courseId }: { courseId?: string }) {
  const { quizzes, loading, getQuizWithQuestions, deleteQuiz, publishQuiz } = useAIQuizzes(courseId);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewQuiz, setPreviewQuiz] = useState<AIQuizWithQuestions | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

      {/* Preview Dialog */}
      <Dialog open={!!previewQuiz} onOpenChange={() => setPreviewQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewQuiz?.title}
              <Badge variant="outline" className={getDifficultyColor(previewQuiz?.difficulty || 'medium')}>
                {previewQuiz?.difficulty}
              </Badge>
            </DialogTitle>
            {previewQuiz?.description && (
              <DialogDescription>{previewQuiz.description}</DialogDescription>
            )}
          </DialogHeader>

          {loadingPreview ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : previewQuiz ? (
            <div className="space-y-6 mt-4">
              {previewQuiz.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Q{idx + 1}</Badge>
                    <p className="font-medium">{q.question}</p>
                  </div>

                  <div className="space-y-2 ml-12">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border text-sm ${
                          optIdx === q.correct_answer_index
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-medium shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {optIdx === q.correct_answer_index && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
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
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
