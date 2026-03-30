import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  GripVertical,
  CheckCircle,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAdminQuizQuestions, AdminQuizQuestion } from "@/hooks/useAdminCourses";
import { toast } from "sonner";

interface QuizEditorProps {
  moduleId: string;
  onClose: () => void;
}

export function QuizEditor({ moduleId, onClose }: QuizEditorProps) {
  const { questions, loading, createQuestion, updateQuestion, deleteQuestion } = useAdminQuizQuestions(moduleId);
  const [saving, setSaving] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<AdminQuizQuestion[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | undefined>();

  // Sync local state with fetched questions
  // Keep local state in sync with fetched questions
  if (questions.length > 0 && localQuestions.length !== questions.length) {
    setLocalQuestions(questions);
  }

  const addNewQuestion = async () => {
    setSaving("new");
    try {
      await createQuestion({
        question: "New Question",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_answer_index: 0,
        explanation: ""
      });
      toast.success("Question added");
    } catch (error) {
      toast.error("Failed to add question");
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateQuestion = async (questionId: string, updates: Partial<AdminQuizQuestion>) => {
    setSaving(questionId);
    try {
      await updateQuestion(questionId, updates);
      toast.success("Question saved");
    } catch (error) {
      toast.error("Failed to save question");
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setSaving(questionId);
    try {
      await deleteQuestion(questionId);
      toast.success("Question deleted");
    } catch (error) {
      toast.error("Failed to delete question");
    } finally {
      setSaving(null);
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    
    handleUpdateQuestion(questionId, { options: newOptions });
  };

  const setCorrectAnswer = (questionId: string, optionIndex: number) => {
    handleUpdateQuestion(questionId, { correct_answer_index: optionIndex });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No quiz questions yet. Add your first question to get started.
          </p>
          <Button onClick={addNewQuestion} disabled={saving === "new"} className="gap-2">
            {saving === "new" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Question
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {questions.length} Question{questions.length !== 1 ? 's' : ''}
            </Badge>
            <Button onClick={addNewQuestion} disabled={saving === "new"} size="sm" className="gap-2">
              {saving === "new" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Question
            </Button>
          </div>

          <Accordion
            type="single"
            collapsible
            value={expandedQuestion}
            onValueChange={setExpandedQuestion}
            className="space-y-3"
          >
            {questions.map((question, index) => (
              <AccordionItem
                key={question.id}
                value={question.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium line-clamp-1">
                      {question.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => handleUpdateQuestion(question.id, { question: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      <p className="text-sm text-muted-foreground">
                        Click the circle to mark the correct answer
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCorrectAnswer(question.id, optionIndex)}
                              className="shrink-0"
                            >
                              {question.correct_answer_index === optionIndex ? (
                                <CheckCircle className="h-5 w-5 text-success" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                              )}
                            </button>
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Explanation (shown after answering)</Label>
                      <Textarea
                        value={question.explanation || ""}
                        onChange={(e) => handleUpdateQuestion(question.id, { explanation: e.target.value })}
                        placeholder="Explain why this is the correct answer..."
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={saving === question.id}
                        className="gap-2"
                      >
                        {saving === question.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete Question
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

export default QuizEditor;
