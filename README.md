# Ontario Recycle Mentor

A comprehensive learning management system (LMS) for Ontario's recycling and waste management training.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun
- Supabase account
- Google Gemini API Key (for AI Quiz Generator)
- Brevo Account (for transactional emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shujah-Abdur-Rafay/OntreCycle.git
   cd ontario-recycle-mentor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following variables (use `.env.example` as a template):
   ```env
   # Supabase
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"

   # Email Service (Brevo)
   VITE_BREVO_API_KEY="your-brevo-api-key"

   # AI Services (Google Gemini)
   VITE_GEMINI_API_KEY="your-gemini-api-key"

   # App URL
   VITE_BASE_URL="http://localhost:8080"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Lucide Icons, Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL, Auth, Functions)
- **AI**: Google Gemini Pro (Quiz Generation)
- **Email**: Brevo (SMTP & Transactional)

## 📁 Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Main application views
- `src/hooks`: Custom React hooks for data and logic
- `src/lib`: Utility functions and third-party integrations
- `supabase/migrations`: Database schema and RLS policies
- `supabase/functions`: Edge Functions for external logic

## 🔐 Security & Best Practices

- All sensitive keys are stored in environment variables.
- Never commit your `.env` file to version control.
- Row-Level Security (RLS) is enabled for all database tables.
- Role-based access control (RBAC) manages Admin vs Learner permissions.

## 📄 License

This project is proprietary. All rights reserved.
