# ChatGPT Clone with Supabase & OpenAI

A full-stack ChatGPT clone built with Next.js 16, Supabase PostgreSQL, OpenAI API, and modern UI components.

## Features

- **Real AI Responses**: Powered by OpenAI GPT-4o-mini with streaming
- **Supabase Authentication**: Secure email/password authentication
- **PostgreSQL Database**: Chat history stored in Supabase
- **Row Level Security**: Data protected with RLS policies
- **Beautiful UI**: Modern gradient design with dark mode
- **Real-time Streaming**: AI responses stream word-by-word
- **Chat Management**: Create, view, and delete conversations
- **Markdown Support**: Formatted code blocks and text
- **Voice Features**: Speech-to-text and text-to-speech

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **AI**: OpenAI API (GPT-4o-mini) via Vercel AI SDK
- **Auth**: Supabase Auth with JWT
- **UI**: shadcn/ui, Framer Motion
- **Database**: Supabase PostgreSQL with RLS

## Setup Instructions

### 1. Database Setup

The SQL scripts are already included in the `scripts` folder. Run them in v0:

- `scripts/001_create_tables.sql` - Creates tables and RLS policies
- `scripts/002_create_functions.sql` - Creates triggers for auto-updating timestamps

### 2. Environment Variables

Your environment variables are already configured in v0:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key

### 3. Run the Application

1. The database tables will be created automatically when you run the scripts
2. Sign up for a new account at `/signup`
3. Check your email for confirmation link
4. Sign in at `/login`
5. Start chatting at `/chat`

## Database Schema

### Tables

**chats**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `title` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**messages**
- `id` (UUID, Primary Key)
- `chat_id` (UUID, Foreign Key to chats)
- `role` (TEXT: 'user' or 'assistant')
- `content` (TEXT)
- `created_at` (TIMESTAMPTZ)

### Row Level Security (RLS)

All tables are protected with RLS policies that ensure users can only access their own data.

## API Routes

- `POST /api/chat` - Send message and get AI response
- `GET /api/chats` - Get all user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[id]` - Get specific chat with messages
- `DELETE /api/chats/[id]` - Delete chat

## Deployment

Deploy to Vercel with one click. All environment variables are already configured in your v0 project.

## Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Secure API routes with auth checks
- HTTPS-only in production
- Environment variable protection

## License

MIT
