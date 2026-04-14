// ─── OpenAI Quiz Generator ────────────────────────────────────────────────────
// Drop-in replacement for geminiQuizGenerator.ts
// Uses OpenAI Chat Completions API — model-agnostic, env-configurable.

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in your .env file.');
  }

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

  const MODELS = getModelList();
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      console.log(`[OpenAI] Attempting quiz generation with model: ${modelName}...`);

      const body: Record<string, unknown> = {
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      };

      // json_object mode guarantees valid JSON — supported by gpt-4o / gpt-4o-mini / gpt-3.5-turbo-1106+
      // Older model versions silently ignore this field, so it's always safe to include.
      body.response_format = { type: 'json_object' };

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Rate limit — try next model
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        console.warn(`[OpenAI] Rate limit on ${modelName}. retry-after: ${retryAfter ?? 'unknown'}s. Trying next model...`);
        lastError = new Error(`Rate limit (429) on model ${modelName}`);
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const rawText: string = data.choices?.[0]?.message?.content ?? '';

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

      console.log(`[OpenAI] Successfully generated quiz using ${modelName}`);
      return parsed;

    } catch (error: any) {
      console.warn(`[OpenAI] Model ${modelName} failed:`, error.message);
      lastError = error;

      // Quota / billing errors apply to the whole account — stop trying
      if (
        error.message?.includes('insufficient_quota') ||
        error.message?.includes('billing') ||
        error.message?.includes('402')
      ) {
        break;
      }

      // Continue to next model for all other errors
    }
  }

  throw new Error(
    `Failed to generate quiz after trying all available models. Last error: ${lastError?.message ?? 'unknown'}`
  );
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
