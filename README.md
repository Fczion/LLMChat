# LLMChat

An Android app built with Expo React Native featuring Google Sign-In authentication and AI-powered chat with ChatGPT.

## Features

- **Native Google Sign-In** - Secure authentication using Android's native Google SDK
- **AI Chat** - Conversational interface powered by OpenAI's gpt-4o-mini
- **Persistent Conversations** - Chat history saved to Supabase and restored across sessions
- **Login Tracking** - User logins recorded with timestamps in database
- **TypeScript** - Full type safety throughout the codebase
- **Expo Router** - File-based navigation

## Screenshots

1. **Welcome Screen** - Sign in with Google button
2. **Success Screen** - User profile data with "Chat with AI" button
3. **Chat Screen** - Message interface with AI responses

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Expo (React Native) |
| Language | TypeScript |
| Auth | @react-native-google-signin/google-signin |
| Database | Supabase (PostgreSQL) |
| AI | OpenAI API (gpt-4o-mini) |
| Navigation | expo-router |
| Build | EAS Build |

## Quick Start

### Prerequisites

- Node.js v18+
- EAS CLI (`npm install -g eas-cli`)
- Expo account (https://expo.dev)
- Google Cloud Console project
- Supabase project
- OpenAI API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Supabase (from Project Settings > API)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (from platform.openai.com/api-keys)
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key
```

### 3. Set up Supabase tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Login tracking tables
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  given_name TEXT,
  family_name TEXT,
  photo_url TEXT,
  first_login_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  login_count INTEGER DEFAULT 1 NOT NULL
);

CREATE TABLE user_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  given_name TEXT,
  family_name TEXT,
  photo_url TEXT,
  id_token TEXT,
  logged_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_google_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_google_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(user_google_id, created_at ASC);
```

### 4. Configure Google Sign-In

1. Create a project at https://console.cloud.google.com
2. Enable Google Identity API
3. Configure OAuth consent screen
4. Create OAuth credentials:
   - **Web Application** client ID (use as `webClientId` in code)
   - **Android** client ID (requires SHA-1 fingerprint)

Update the `webClientId` in [contexts/AuthContext.tsx](contexts/AuthContext.tsx).

### 5. Build the app

```bash
# Get SHA-1 fingerprint for Google Console
eas credentials --platform android

# Development build
eas build --platform android --profile development

# Production APK
eas build --platform android --profile preview
```

## Project Structure

```
LLMChat/
├── app/
│   ├── _layout.tsx          # Root layout with AuthProvider
│   ├── index.tsx            # Welcome screen
│   ├── success.tsx          # Profile screen + chat button
│   └── chat.tsx             # AI chat interface
├── components/
│   └── GoogleSignInButton.tsx
├── contexts/
│   └── AuthContext.tsx      # Auth state + login tracking
├── lib/
│   └── supabase.ts          # Supabase client
├── services/
│   ├── loginTracker.ts      # Login recording to database
│   ├── openaiService.ts     # OpenAI API integration
│   └── chatService.ts       # Chat message storage
├── .env                     # Environment variables (gitignored)
├── CLAUDE.md                # Detailed documentation
└── README.md                # This file
```

## How It Works

### Authentication Flow

```
User taps "Sign In with Google"
         ↓
Native Google Sign-In UI appears
         ↓
User selects Google account
         ↓
Login recorded to Supabase (users + user_logins tables)
         ↓
Success screen shows profile data
```

### Chat Flow

```
User types message and taps Send
         ↓
Message saved to Supabase (chat_messages)
         ↓
Conversation history sent to OpenAI API
         ↓
AI response received
         ↓
Response saved to Supabase
         ↓
UI updated with new message
```

## Documentation

For detailed architecture decisions, troubleshooting, and implementation details, see [CLAUDE.md](CLAUDE.md).

## License

MIT
