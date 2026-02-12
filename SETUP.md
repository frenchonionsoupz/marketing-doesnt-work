# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization, enter a project name and database password
4. Select a region close to your users
5. Click **Create new project** and wait for it to finish provisioning

## 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` and paste it into the editor
4. Click **Run** to execute

This creates:
- `profiles` table (user display names, linked to Supabase Auth)
- `progress` table (level completion, current position)
- `answers` table (all question responses)
- Row Level Security (RLS) policies so users can only access their own data
- A database trigger that auto-creates profile and progress rows on signup

## 3. Configure Authentication

1. In the Supabase dashboard, go to **Authentication > Providers**
2. Ensure **Email** provider is enabled (it is by default)
3. Optional: Under **Authentication > Settings**, you can:
   - Disable email confirmation for faster testing (toggle off "Enable email confirmations")
   - Set minimum password length

## 4. Get Your API Keys

1. Go to **Settings > API** in your Supabase dashboard
2. Copy the **Project URL** (looks like `https://abcdefg.supabase.co`)
3. Copy the **anon public** key (the long JWT string)

## 5. Set Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 6. Run the App

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## 7. Deploy

### Frontend (Vercel)
1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel's project settings
4. Deploy

### Frontend (Netlify)
1. Push your code to GitHub
2. Import the repo in [netlify.com](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in site settings
6. Deploy

### Domain
Connect `MarketingDoesntWork.com` to your Vercel/Netlify deployment via DNS settings.

## Database Schema Reference

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | References auth.users |
| email | text | User email |
| display_name | text | Player name |
| created_at | timestamptz | Account creation |
| last_login | timestamptz | Last login time |

### progress
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| user_id | uuid (FK) | References auth.users |
| current_level | text | '1', '2', '3', or 'boss' |
| current_sublevel | text | '1a', '1b', '1c', 'fields', or null |
| current_question_index | int | Current question position |
| level_1_completed | boolean | Level 1 done? |
| level_2_completed | boolean | Level 2 done? |
| level_3_completed | boolean | Level 3 done? |
| boss_completed | boolean | Boss done? |
| overall_completion_percentage | int | 0-100 |
| start_time | timestamptz | When user started |
| updated_at | timestamptz | Last update |

### answers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| user_id | uuid (FK) | References auth.users |
| question_id | text | Unique question identifier |
| question_text | text | The question |
| answer_text | text | User's answer |
| level | text | '1', '2', '3', or 'boss' |
| sublevel | text | '1a', '1b', '1c', 'fields', or null |
| answered_at | timestamptz | First answered |
| updated_at | timestamptz | Last updated |
