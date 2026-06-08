// ─── OpenAI Quiz Generator ────────────────────────────────────────────────────
// Drop-in replacement for geminiQuizGenerator.ts
// Calls the `openai-chat` Supabase edge function (server-side proxy) so the API
// key never ships to the browser and there are no CORS issues with api.openai.com.

import { supabase } from '@/integrations/supabase/client';

// ─── Shared OpenAI proxy call ─────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Send a chat request to the server-side OpenAI proxy and return the assistant's
 * message content. Model fallback and the API key are handled by the edge
 * function; an optional VITE_OPENAI_MODEL override is passed through first.
 */
export async function callOpenAIChat(opts: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke('openai-chat', {
    body: {
      messages: opts.messages,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      jsonMode: opts.jsonMode ?? true,
      models: getModelList(),
    },
  });

  if (error) {
    // Surface the function's JSON error body when present
    const detail =
      (error as { context?: { body?: unknown } })?.context?.body ?? error.message;
    throw new Error(typeof detail === 'string' ? detail : error.message);
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  const content = data?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI returned an empty response.');
  }
  return content;
}

// ─── Interfaces (identical to Gemini version for full component compatibility) ─

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizGenerationResult {
  questions: GeneratedQuestion[];
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ─── Model priority list (model-agnostic, easily extensible) ─────────────────
//
// 1st: VITE_OPENAI_MODEL  — operator override (set any current/future model)
// 2nd: gpt-4o-mini        — fast, cost-efficient, excellent for structured JSON
// 3rd: gpt-4o             — most capable, used when mini is rate-limited
// 4th: gpt-3.5-turbo      — universal fallback

function getModelList(): string[] {
  return [
    import.meta.env.VITE_OPENAI_MODEL,
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-3.5-turbo',
  ].filter(Boolean) as string[];
}

// ─── Core generation function ─────────────────────────────────────────────────

/**
 * Generate quiz questions from text content using OpenAI
 */
export async function generateQuizFromText(
  content: string,
  options: {
    numQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    topic?: string;
  } = {}
): Promise<QuizGenerationResult> {
  const {
    numQuestions = 5,
    difficulty = 'medium',
    topic = 'the provided content',
  } = options;

  const systemPrompt =
    'You are an expert educational content creator. ' +
    'You always respond with valid JSON only — no markdown, no code fences, no extra text.';

  const userPrompt = `Generate ${numQuestions} multiple-choice quiz questions about "${topic}" based on the content below.

CONTENT:
${content.slice(0, 15000)}${content.length > 15000 ? '\n...(truncated)' : ''}

REQUIREMENTS:
- Generate exactly ${numQuestions} questions
- Difficulty level: ${difficulty}
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE option should be correct
- Include a brief explanation for the correct answer
- Questions should test understanding, not just memorization
- Cover different aspects of the content
- Make distractors (wrong answers) plausible but clearly incorrect

OUTPUT FORMAT (JSON only):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ],
  "summary": "Brief 1-2 sentence summary of what this quiz covers",
  "difficulty": "${difficulty}"
}`;

  const rawText = await callOpenAIChat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    maxTokens: 4096,
    jsonMode: true,
  });

  // Defensive: strip any accidental markdown fences even with json_object mode
  let jsonText = rawText.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(jsonText) as QuizGenerationResult;

  // Validate top-level structure
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid response: missing questions array');
  }

  // Validate each question
  parsed.questions.forEach((q, idx) => {
    if (!q.question) {
      throw new Error(`Question ${idx + 1}: missing question text`);
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${idx + 1}: must have exactly 4 options`);
    }
    if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
      throw new Error(`Question ${idx + 1}: correctAnswerIndex must be 0–3`);
    }
    if (!q.explanation) {
      throw new Error(`Question ${idx + 1}: missing explanation`);
    }
  });

  // Ensure difficulty is set (some models omit it)
  if (!parsed.difficulty) {
    parsed.difficulty = difficulty;
  }

  return parsed;
}

// ─── File extraction (unchanged from Gemini version) ─────────────────────────

/**
 * Extract text from different file types (PDF, DOCX, TXT)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPdf(file);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromDocx(file);
  }

  if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported. Please convert to .docx or .txt');
  }

  throw new Error(`Unsupported file type: ${fileType || 'unknown'}`);
}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ─── Content validation (unchanged) ──────────────────────────────────────────

/**
 * Validate content length and quality before sending to OpenAI
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();

  if (trimmed.length < 100) {
    return {
      valid: false,
      error: 'Content too short. Need at least 100 characters to generate meaningful questions.',
    };
  }

  if (trimmed.length > 50000) {
    return {
      valid: false,
      error: 'Content too long. Maximum 50,000 characters. Please split into smaller sections.',
    };
  }

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < 20) {
    return {
      valid: false,
      error: 'Content needs at least 20 words to generate questions.',
    };
  }

  return { valid: true };
}
