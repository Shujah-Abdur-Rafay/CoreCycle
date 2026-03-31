# AI Quiz Generator - Installation & Usage

## Overview
The AI Quiz Generator uses Google's Gemini AI to automatically create multiple-choice quizzes from uploaded documents (PDF, DOCX, TXT) or pasted text.

## Installation

### 1. Install Required Dependencies

```bash
npm install @google/generative-ai pdfjs-dist mammoth
```

Or with yarn:
```bash
yarn add @google/generative-ai pdfjs-dist mammoth
```

### 2. Run Database Migration

Execute the SQL migration in your Supabase SQL Editor:
```
supabase/migrations/20260114010000_ai_generated_quizzes.sql
```

This creates:
- `ai_generated_quizzes` table
- `ai_quiz_questions` table
- RLS policies
- Indexes

### 3. Configure API Keys

The AI Quiz Generator requires a Google Gemini API key. 

1. Create a `.env` file in the project root (if not already present).
2. Add your Gemini API key to `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. The system will automatically use this key via `import.meta.env.VITE_GEMINI_API_KEY`.

### 4. Configure Gemini Model (Optional)

By default, the system uses `gemini-1.5-flash`. You can override this in `.env`:
```env
VITE_GEMINI_MODEL=gemini-1.5-pro
```

## Features

### For Admins

**AI Quiz Generator** (`/admin/ai-quizzes`)
- Upload PDF, DOCX, or TXT files (max 10MB)
- Or paste text directly (min 100 chars, max 50,000 chars)
- Configure:
  - Quiz title
  - Number of questions (3, 5, 7, 10, or 15)
  - Difficulty (easy, medium, hard)
- AI generates:
  - Multiple-choice questions with 4 options each
  - Correct answer identification
  - Explanations for each answer
  - Quiz summary
- Review and edit generated questions
- Save to database
- Publish/unpublish quizzes

**Quiz Library**
- View all generated quizzes
- Search by title or description
- Preview questions
- Publish/unpublish
- Delete quizzes
- Filter by difficulty

### Supported File Types

| Format | Extension | Notes |
|--------|-----------|-------|
| PDF | `.pdf` | Extracted using pdf.js |
| Word | `.docx` | Extracted using mammoth |
| Text | `.txt` | Direct read |

**Not supported:** Legacy `.doc` files (convert to `.docx` first)

## Usage Flow

### 1. Generate Quiz

1. Navigate to **Admin → AI Quiz Generator**
2. Choose input method:
   - **Upload File**: Click to select PDF/DOCX/TXT
   - **Paste Text**: Type or paste content
3. Configure settings:
   - Enter quiz title
   - Select number of questions
   - Choose difficulty level
4. Click **"Generate Quiz with AI"**
5. Wait 10-30 seconds for AI processing

### 2. Review Questions

- Each question shows:
  - Question text
  - 4 multiple-choice options (A, B, C, D)
  - Correct answer highlighted in green
  - Explanation
- Remove unwanted questions with trash icon
- Click **"Save Quiz"** when satisfied

### 3. Manage Quizzes

In the **Quiz Library** tab:
- View all generated quizzes
- Click **Preview** to see full quiz
- Use dropdown menu to:
  - Publish (make visible to learners)
  - Unpublish (hide from learners)
  - Delete

## Database Schema

### `ai_generated_quizzes`
```sql
id                uuid PRIMARY KEY
title             text NOT NULL
description       text
source_content    text NOT NULL
source_filename   text
source_type       text (pdf/docx/txt/manual)
difficulty        text (easy/medium/hard)
num_questions     integer
generated_by      uuid (references auth.users)
module_id         uuid (references modules)
course_id         uuid (references courses)
is_published      boolean DEFAULT false
created_at        timestamptz
updated_at        timestamptz
```

### `ai_quiz_questions`
```sql
id                    uuid PRIMARY KEY
quiz_id               uuid (references ai_generated_quizzes)
question              text NOT NULL
options               jsonb (array of 4 strings)
correct_answer_index  integer (0-3)
explanation           text NOT NULL
order_index           integer
created_at            timestamptz
```

## API Integration

### Gemini AI Prompt Structure

The system sends a structured prompt to Gemini (defaults to `gemini-flash-latest`):
- Content excerpt (max 15,000 chars)
- Number of questions requested
- Difficulty level
- Output format specification (JSON)
- Quality requirements

### Response Validation

The system validates:
- JSON structure
- Exactly 4 options per question
- Valid correct answer index (0-3)
- Presence of explanations
- Question quality

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Content too short" | < 100 characters | Add more content |
| "Content too long" | > 50,000 characters | Split into sections |
| "File too large" | > 10MB | Compress or split file |
| "Unsupported file type" | Wrong format | Convert to PDF/DOCX/TXT |
| "Failed to generate quiz" | AI API error | Retry or check API key |

## Permissions

### RLS Policies

**Super Admins:**
- Full CRUD on all quizzes
- Can generate, edit, delete any quiz

**Learners:**
- Read-only access to published quizzes
- Only for courses they're enrolled in

## Performance

### Generation Time
- **3-5 questions**: ~10-15 seconds
- **7-10 questions**: ~15-25 seconds
- **15 questions**: ~25-35 seconds

### File Processing
- **PDF extraction**: 1-3 seconds per page
- **DOCX extraction**: < 1 second
- **TXT**: Instant

## Best Practices

1. **Content Quality**
   - Use well-structured documents
   - Include clear headings and sections
   - Avoid tables/images (text only)

2. **Question Generation**
   - Start with 5 questions to test quality
   - Review all generated questions
   - Remove or regenerate poor questions

3. **Difficulty Levels**
   - **Easy**: Basic recall, definitions
   - **Medium**: Application, understanding
   - **Hard**: Analysis, synthesis

4. **Publishing**
   - Review before publishing
   - Test with a learner account
   - Unpublish if issues found

## Troubleshooting

### AI generates poor questions
- **Solution**: Improve source content quality, try different difficulty level

### PDF text extraction fails
- **Solution**: Ensure PDF has selectable text (not scanned images)

### DOCX extraction incomplete
- **Solution**: Remove complex formatting, tables, images

### API rate limits
- **Solution**: Wait 1 minute between generations, or upgrade API quota

## Future Enhancements

Potential additions:
- [ ] Attach quizzes directly to modules
- [ ] Bulk quiz generation
- [ ] Question bank management
- [ ] Export quizzes to PDF
- [ ] Import existing quizzes
- [ ] AI-powered question improvement
- [ ] Multi-language support
- [ ] Image-based questions

## Support

For issues or questions:
1. Check error messages in browser console
2. Verify API key is valid
3. Ensure database migrations ran successfully
4. Test with simple text input first
