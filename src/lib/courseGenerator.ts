// ─── AI Course Generator ──────────────────────────────────────────────────────
// Turns uploaded documents (PDF / DOCX / TXT) or pasted text into full course
// modules that follow the SAME structure, tone, and interactive style as the
// existing hand-authored courses (see COURSE_STYLE_GUIDE below). Also powers
// prompt-based AI editing of an individual module's content.
//
// Uses the OpenAI Chat Completions API, mirroring the model-fallback approach in
// openaiQuizGenerator.ts so behaviour and configuration stay consistent.

import {
  extractTextFromFile,
  validateContent,
  type GeneratedQuestion,
} from "./openaiQuizGenerator";

// Re-export so UI components only need to import from one place.
export { extractTextFromFile, validateContent };
export type { GeneratedQuestion };

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// ─── Generated shapes ─────────────────────────────────────────────────────────

export interface GeneratedModule {
  title: string;
  /** Short one-line description of the module. */
  description: string;
  /** Module body as clean HTML matching COURSE_STYLE_GUIDE. */
  content: string;
  duration_minutes: number;
  /** Optional per-module quiz questions. */
  quiz?: GeneratedQuestion[];
}

export interface GeneratedCourse {
  title: string;
  short_description: string;
  description: string;
  modules: GeneratedModule[];
}

// ─── The "pattern" the AI must follow (Task 4: train on existing modules) ──────
//
// This is distilled from the existing published courses (e.g. "Battery Recycling
// in Ontario", "Recycling & Waste Management for SMEs"). It describes the exact
// HTML structure and interactive conventions the lesson renderer understands, so
// generated modules look and behave identically to the hand-authored ones.

export const COURSE_STYLE_GUIDE = `
You are authoring modules for OntreCycle, an Ontario EPR (Extended Producer
Responsibility) recycling & waste-management training platform. New modules MUST
match the established house style exactly.

CONTENT FORMAT — each module's "content" field is a single HTML string:
- Start the module body with one <h2> that names the module's main theme.
- Break the body into 3–6 focused sections, each introduced by an <h3> heading.
- Use <p> for explanatory prose. Keep paragraphs tight (2–4 sentences).
- Use <strong> to emphasise the FIRST occurrence of an important term only.
- Use <ul><li>…</li></ul> for plain lists of examples or steps.

INTERACTIVE ELEMENTS (the renderer auto-detects these — do NOT describe them):
- KEY TERMS / FLASHCARDS: a <ul> whose items are "<strong>Term</strong> — definition"
  is rendered as interactive term cards/flashcards. Use this for glossaries and
  definition lists. 2–4 such items render as Key-Term cards; 5+ become flashcards.
- CALLOUTS: a <p> that STARTS with one of these labels becomes a coloured callout:
  "Important:", "Key:", "Tip:", "Note:", "Warning:", "Caution:", "Did you know:".
  Use callouts sparingly for the single most critical takeaway of a section.

ABSOLUTE RULE — NO DUPLICATION (Task 2):
- Every fact, statistic, term, definition, or instruction must appear EXACTLY ONCE.
- Never restate a list item in a following paragraph, never echo a callout's text
  in a nearby paragraph, never define the same term in both prose and a key-terms
  list. If something belongs in a key-terms list or a callout, do NOT also write
  it as ordinary prose.

TONE: clear, practical, encouraging, plain-language (accessible to new Canadians,
students, seniors, and SMEs). Canadian spelling. Ontario/RPRA context where
relevant. Never invent statistics — only use figures present in the source
material; otherwise speak qualitatively.

Return ONLY valid HTML inside the "content" field. No markdown, no code fences.
`.trim();

// ─── Model fallback list (shared convention with the quiz generator) ──────────

function getModelList(): string[] {
  return [
    import.meta.env.VITE_OPENAI_MODEL,
    "gpt-4o",        // most capable — best for long structured course content
    "gpt-4o-mini",   // fast / cost-efficient fallback
    "gpt-3.5-turbo", // universal last resort
  ].filter(Boolean) as string[];
}

/**
 * Call OpenAI chat completions expecting a JSON object back, with automatic
 * model fallback on rate limits / transient errors. Returns the parsed object.
 */
async function callOpenAIJson<T>(
  systemPrompt: string,
  userPrompt: string,
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<T> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in your .env file."
    );
  }

  const { maxTokens = 8000, temperature = 0.6 } = opts;
  const MODELS = getModelList();
  let lastError: Error | null = null;

  for (const modelName of MODELS) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
        }),
      });

      if (response.status === 429) {
        lastError = new Error(`Rate limit (429) on model ${modelName}`);
        continue; // try next model
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const rawText: string = data.choices?.[0]?.message?.content ?? "";

      let jsonText = rawText.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      }

      return JSON.parse(jsonText) as T;
    } catch (error: any) {
      lastError = error;
      // Account-level quota/billing errors won't be fixed by trying another model
      if (
        error.message?.includes("insufficient_quota") ||
        error.message?.includes("billing") ||
        error.message?.includes("402")
      ) {
        break;
      }
      // Otherwise fall through to the next model
    }
  }

  throw new Error(
    `AI request failed after trying all available models. Last error: ${
      lastError?.message ?? "unknown"
    }`
  );
}

// ─── Light HTML sanitisation ──────────────────────────────────────────────────
// Strips wrapping markdown fences / stray prose the model may add around HTML.

function cleanHtml(html: string): string {
  let out = (html || "").trim();
  if (out.startsWith("```")) {
    out = out.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return out;
}

// ─── Course generation (Task 4) ───────────────────────────────────────────────

export interface CourseGenerationOptions {
  /** Suggested course title (the AI may refine it). */
  title?: string;
  /** Target number of modules to generate. */
  numModules?: number;
  /** Generate a short multiple-choice quiz for each module. */
  includeQuizzes?: boolean;
  /** Questions per module quiz when includeQuizzes is true. */
  questionsPerQuiz?: number;
}

/**
 * Generate a full course (title, descriptions, and modules) from source text,
 * following the existing course pattern and avoiding duplicated content.
 */
export async function generateCourseFromText(
  sourceContent: string,
  options: CourseGenerationOptions = {}
): Promise<GeneratedCourse> {
  const {
    title = "",
    numModules = 5,
    includeQuizzes = true,
    questionsPerQuiz = 4,
  } = options;

  const quizSpec = includeQuizzes
    ? `For EACH module also include a "quiz" array of ${questionsPerQuiz} multiple-choice questions. Each question: { "question": string, "options": [4 strings], "correctAnswerIndex": 0-3, "explanation": string }. Questions must test understanding of THAT module only.`
    : `Do NOT include any quiz arrays.`;

  const systemPrompt =
    "You are an expert instructional designer. You respond with valid JSON only — " +
    "no markdown, no code fences, no commentary.\n\n" +
    COURSE_STYLE_GUIDE;

  const userPrompt = `Create a structured training course from the SOURCE MATERIAL below.

${title ? `Suggested course title: "${title}". Refine it if a clearer title fits.` : ""}

REQUIREMENTS:
- Produce exactly ${numModules} modules in a logical learning order.
- Each module covers a DISTINCT sub-topic — modules must not overlap or repeat each other.
- Each module's "content" is clean HTML following the house style described above.
- Use interactive key-term lists and callouts where they genuinely add value.
- Obey the NO-DUPLICATION rule both within and across modules.
- Set a realistic "duration_minutes" per module (typically 8–15).
- ${quizSpec}

SOURCE MATERIAL:
${sourceContent.slice(0, 24000)}${sourceContent.length > 24000 ? "\n...(truncated)" : ""}

Return JSON in EXACTLY this shape:
{
  "title": "Course title",
  "short_description": "One sentence for course cards (max ~140 chars)",
  "description": "2–3 sentence overview of the course",
  "modules": [
    {
      "title": "Module title",
      "description": "One-line module summary",
      "content": "<h2>…</h2><p>…</p>…",
      "duration_minutes": 10${includeQuizzes ? `,
      "quiz": [ { "question": "…", "options": ["…","…","…","…"], "correctAnswerIndex": 0, "explanation": "…" } ]` : ""}
    }
  ]
}`;

  const parsed = await callOpenAIJson<GeneratedCourse>(systemPrompt, userPrompt, {
    maxTokens: 12000,
    temperature: 0.6,
  });

  // Validate + normalise
  if (!parsed.modules || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
    throw new Error("AI response did not contain any modules.");
  }

  parsed.title = parsed.title?.trim() || title || "Untitled Course";
  parsed.short_description = parsed.short_description?.trim() || "";
  parsed.description = parsed.description?.trim() || "";

  parsed.modules = parsed.modules.map((m, idx) => {
    const content = cleanHtml(m.content || "");
    if (!m.title?.trim()) {
      m.title = `Module ${idx + 1}`;
    }
    return {
      title: m.title.trim(),
      description: (m.description || "").trim(),
      content,
      duration_minutes:
        typeof m.duration_minutes === "number" && m.duration_minutes > 0
          ? m.duration_minutes
          : 10,
      quiz: Array.isArray(m.quiz) ? m.quiz : undefined,
    };
  });

  return parsed;
}

// ─── Per-module AI editing (Task 3) ───────────────────────────────────────────

/**
 * Apply a natural-language instruction to a single module's HTML content,
 * returning the rewritten HTML. The AI must preserve the overall structure and
 * house style, change only what the instruction asks for, and never introduce
 * duplicated content.
 */
export async function editModuleContent(
  currentContent: string,
  instruction: string,
  context: { moduleTitle?: string } = {}
): Promise<string> {
  const trimmedInstruction = instruction.trim();
  if (!trimmedInstruction) {
    throw new Error("Please enter an editing instruction.");
  }

  const systemPrompt =
    "You are an expert course editor for OntreCycle. You edit a single module's " +
    "HTML content and respond with valid JSON only.\n\n" +
    COURSE_STYLE_GUIDE;

  const userPrompt = `Edit the MODULE CONTENT below according to the INSTRUCTION.

${context.moduleTitle ? `Module title: "${context.moduleTitle}".` : ""}

RULES:
- Apply ONLY what the instruction asks. Leave everything else unchanged.
- Keep the existing HTML structure and house style (headings, lists, callouts, key-term lists).
- Never introduce duplicated content. If the edit would repeat existing text, integrate it instead.
- Return the COMPLETE updated module content as HTML (not just the changed part).

INSTRUCTION:
${trimmedInstruction}

MODULE CONTENT:
${currentContent || "(the module currently has no content — create appropriate content based on the instruction)"}

Return JSON in EXACTLY this shape:
{ "content": "<h2>…</h2>…the full updated HTML…" }`;

  const parsed = await callOpenAIJson<{ content: string }>(systemPrompt, userPrompt, {
    maxTokens: 8000,
    temperature: 0.4,
  });

  const content = cleanHtml(parsed.content || "");
  if (!content) {
    throw new Error("The AI returned empty content. Please try a different instruction.");
  }
  return content;
}
