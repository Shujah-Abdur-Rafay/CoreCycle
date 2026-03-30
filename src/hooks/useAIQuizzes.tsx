import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AIGeneratedQuiz {
  id: string;
  title: string;
  description: string | null;
  source_content: string;
  source_filename: string | null;
  source_type: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  num_questions: number;
  generated_by: string | null;
  module_id: string | null;
  course_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIQuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  order_index: number;
  created_at: string;
}

export interface AIQuizWithQuestions extends AIGeneratedQuiz {
  questions: AIQuizQuestion[];
}

export function useAIQuizzes(courseId?: string) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<AIGeneratedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ai_generated_quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setQuizzes((data || []) as AIGeneratedQuiz[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (
    quiz: Omit<AIGeneratedQuiz, 'id' | 'created_at' | 'updated_at' | 'generated_by'>,
    questions: Omit<AIQuizQuestion, 'id' | 'quiz_id' | 'created_at'>[]
  ): Promise<AIQuizWithQuestions> => {
    if (!user) throw new Error('Must be logged in');

    // Insert quiz
    const { data: quizData, error: quizError } = await supabase
      .from('ai_generated_quizzes')
      .insert({
        ...quiz,
        generated_by: user.id,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    // Insert questions
    const questionsToInsert = questions.map((q, idx) => ({
      ...q,
      quiz_id: quizData.id,
      order_index: idx,
    }));

    const { data: questionsData, error: questionsError } = await supabase
      .from('ai_quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) throw questionsError;

    await fetchQuizzes();
    return {
      ...quizData,
      questions: questionsData as AIQuizQuestion[],
    } as AIQuizWithQuestions;
  };

  const getQuizWithQuestions = async (quizId: string): Promise<AIQuizWithQuestions> => {
    const { data: quizData, error: quizError } = await supabase
      .from('ai_generated_quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError) throw quizError;

    const { data: questionsData, error: questionsError } = await supabase
      .from('ai_quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    return {
      ...quizData,
      questions: questionsData as AIQuizQuestion[],
    } as AIQuizWithQuestions;
  };

  const updateQuiz = async (
    quizId: string,
    updates: Partial<Omit<AIGeneratedQuiz, 'id' | 'created_at' | 'updated_at' | 'generated_by'>>
  ) => {
    const { error: updateError } = await supabase
      .from('ai_generated_quizzes')
      .update(updates)
      .eq('id', quizId);

    if (updateError) throw updateError;
    await fetchQuizzes();
  };

  const deleteQuiz = async (quizId: string) => {
    const { error: deleteError } = await supabase
      .from('ai_generated_quizzes')
      .delete()
      .eq('id', quizId);

    if (deleteError) throw deleteError;
    await fetchQuizzes();
  };

  const publishQuiz = async (quizId: string, published: boolean) => {
    await updateQuiz(quizId, { is_published: published });
  };

  const attachToModule = async (quizId: string, moduleId: string) => {
    await updateQuiz(quizId, { module_id: moduleId });
  };

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  return {
    quizzes,
    loading,
    error,
    createQuiz,
    getQuizWithQuestions,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    attachToModule,
    refetch: fetchQuizzes,
  };
}
