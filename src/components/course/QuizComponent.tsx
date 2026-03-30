import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizComponentProps {
  moduleId: string;
  moduleTitle: string;
  passMark: number;
  onComplete: (score: number, passed: boolean) => void;
  onCancel: () => void;
}

export function QuizComponent({
  moduleId,
  moduleTitle,
  passMark,
  onComplete,
  onCancel,
}: QuizComponentProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, [moduleId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedQuestions: QuizQuestion[] = data.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          correctAnswer: q.correct_answer_index,
          explanation: q.explanation || undefined,
        }));
        setQuestions(formattedQuestions);
        setSelectedAnswers(new Array(formattedQuestions.length).fill(null));
      } else {
        // Fallback to sample questions if none in database
        const fallbackQuestions: QuizQuestion[] = [
          {
            id: '1',
            question: 'What is the primary goal of proper waste management in Ontario?',
            options: [
              'To reduce landfill waste',
              'To protect the environment and public health',
              'To save money on disposal',
              'All of the above'
            ],
            correctAnswer: 3
          },
          {
            id: '2',
            question: 'Which of the following should NOT go in the Blue Box?',
            options: [
              'Cardboard boxes',
              'Plastic water bottles',
              'Styrofoam containers',
              'Aluminum cans'
            ],
            correctAnswer: 2
          },
          {
            id: '3',
            question: 'What does contamination mean in recycling?',
            options: [
              'When recyclables get wet',
              'When non-recyclable items are mixed with recyclables',
              'When recycling bins are overfilled',
              'When recyclables are stored too long'
            ],
            correctAnswer: 1
          }
        ];
        setQuestions(fallbackQuestions);
        setSelectedAnswers(new Array(fallbackQuestions.length).fill(null));
      }
    } catch (err) {
      console.error('Error fetching quiz questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    const percentage = Math.round((correct / questions.length) * 100);
    setScore(percentage);
    setShowResults(true);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
    setScore(0);
  };

  const handleFinish = () => {
    onComplete(score, score >= passMark);
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-8 w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No quiz questions available for this module.</p>
          <Button variant="outline" onClick={onCancel} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const passed = score >= passMark;

  if (showResults) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div className={cn(
            "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
            passed ? "bg-leaf/10" : "bg-destructive/10"
          )}>
            {passed ? (
              <CheckCircle className="h-10 w-10 text-leaf" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations!' : 'Not quite there yet'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">{score}%</p>
            <p className="text-muted-foreground">
              You answered {Math.round((score / 100) * questions.length)} out of {questions.length} questions correctly
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Pass mark: {passMark}%
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {passed ? (
              <Button variant="forest" size="lg" onClick={handleFinish}>
                <CheckCircle className="h-5 w-5 mr-2" />
                Complete Module
              </Button>
            ) : (
              <>
                <Button variant="outline" size="lg" onClick={onCancel}>
                  Review Content
                </Button>
                <Button variant="forest" size="lg" onClick={handleRetry}>
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{moduleTitle}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">
          {question.question}
        </h2>

        <RadioGroup
          value={selectedAnswers[currentQuestion]?.toString() || ''}
          onValueChange={handleAnswerSelect}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-3 p-4 rounded-lg border transition-colors",
                selectedAnswers[currentQuestion] === index
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer text-foreground"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            variant="forest"
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === null}
          >
            {currentQuestion === questions.length - 1 ? (
              'Submit Quiz'
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
