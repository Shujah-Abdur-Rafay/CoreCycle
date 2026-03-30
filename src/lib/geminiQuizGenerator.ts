import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

/**
 * Generate quiz questions from text content using Gemini AI
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

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are an expert educational content creator. Generate ${numQuestions} multiple-choice quiz questions based on the following content.

CONTENT:
${content.slice(0, 15000)} ${content.length > 15000 ? '...(truncated)' : ''}

REQUIREMENTS:
- Generate exactly ${numQuestions} questions
- Difficulty level: ${difficulty}
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE option should be correct
- Include a brief explanation for the correct answer
- Questions should test understanding, not just memorization
- Cover different aspects of the content
- Make distractors (wrong answers) plausible but clearly incorrect

OUTPUT FORMAT (JSON only, no markdown):
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
}

Generate the quiz now:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonText) as QuizGenerationResult;

    // Validate structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response structure: missing questions array');
    }

    // Validate each question
    parsed.questions.forEach((q, idx) => {
      if (!q.question || !q.options || q.options.length !== 4) {
        throw new Error(`Invalid question at index ${idx}: must have question text and exactly 4 options`);
      }
      if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
        throw new Error(`Invalid question at index ${idx}: correctAnswerIndex must be 0-3`);
      }
      if (!q.explanation) {
        throw new Error(`Invalid question at index ${idx}: missing explanation`);
      }
    });

    return parsed;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

/**
 * Extract text from different file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Plain text
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }

  // PDF
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    // We'll use pdf.js via CDN in the browser
    return await extractTextFromPdf(file);
  }

  // Word documents (.docx)
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromDocx(file);
  }

  // Legacy Word (.doc)
  if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported. Please convert to .docx or .txt');
  }

  throw new Error(`Unsupported file type: ${fileType || 'unknown'}`);
}

/**
 * Extract text from PDF using pdf.js
 */
async function extractTextFromPdf(file: File): Promise<string> {
  // Dynamically import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

/**
 * Extract text from DOCX using mammoth
 */
async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Validate content length and quality
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  
  if (trimmed.length < 100) {
    return { valid: false, error: 'Content too short. Need at least 100 characters to generate meaningful questions.' };
  }
  
  if (trimmed.length > 50000) {
    return { valid: false, error: 'Content too long. Maximum 50,000 characters. Please split into smaller sections.' };
  }
  
  // Check if content has enough substance (not just whitespace/special chars)
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < 20) {
    return { valid: false, error: 'Content needs at least 20 words to generate questions.' };
  }
  
  return { valid: true };
}
