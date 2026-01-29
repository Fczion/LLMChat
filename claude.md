# LLMChat - Expo Google Sign-In Android App

## Project Documentation

This document contains all architecture decisions, requirements, setup instructions, and implementation details for the LLMChat Android application.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Requirements](#requirements)
3. [Architecture Decisions](#architecture-decisions)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Google Cloud Console Setup](#google-cloud-console-setup)
7. [EAS Build Configuration](#eas-build-configuration)
8. [Implementation Details](#implementation-details)
9. [User Data Available](#user-data-available)
10. [Supabase Integration](#supabase-integration)
11. [ChatGPT Integration](#chatgpt-integration)
12. [Troubleshooting](#troubleshooting)
13. [Progress Tracking](#progress-tracking)

---

## Project Overview

**LLMChat** is an Android application built with Expo React Native that demonstrates Google Sign-In authentication using the native Android SDK. The app features:

- A welcome screen with app branding
- Native Google Sign-In integration
- A success screen displaying all user profile data
- Supabase database integration for login tracking
- ChatGPT-powered AI chat with conversation persistence
- Built as an APK for direct device installation

---

## Requirements

### Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-01 | Display a welcome screen on app launch | Done |
| FR-02 | Provide Google Sign-In button | Done |
| FR-03 | Show native Google Sign-In UI | Done |
| FR-04 | Display login success confirmation | Done |
| FR-05 | Show user data: name, email, photo, ID | Done |
| FR-06 | Provide sign-out functionality | Done |
| FR-07 | Navigate back to welcome after sign-out | Done |
| FR-08 | Record user login to database on sign-in | Done |
| FR-09 | Capture all user data (name, email, photo, ID) in database | Done |
| FR-10 | Store login timestamp for each sign-in | Done |
| FR-11 | Provide chat interface accessible from success screen | Done |
| FR-12 | Send user messages to ChatGPT (gpt-4o-mini) | Done |
| FR-13 | Display AI responses in chat interface | Done |
| FR-14 | Store all chat messages in database | Done |
| FR-15 | Persist chat history across app sessions | Done |

### Non-Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-01 | Use Expo managed workflow | Done |
| NFR-02 | Build APK for Android installation | Pending (requires EAS build) |
| NFR-03 | Support development mode with hot reload | Done |
| NFR-04 | Use TypeScript for type safety | Done |

### Prerequisites

- [ ] Node.js v18 or higher
- [ ] EAS CLI installed globally (`npm install -g eas-cli`)
- [ ] Expo account (free at https://expo.dev)
- [ ] Google Cloud Console access
- [ ] Android device for testing (Expo Go will NOT work)

---

## Architecture Decisions

### Decision 1: Native Google Sign-In vs Web-based OAuth

**Decision**: Use native Google Sign-In SDK (`@react-native-google-signin/google-signin`)

**Alternatives Considered**:
- `expo-auth-session` (web-based OAuth flow)

**Rationale**:
- Native SDK provides better user experience with familiar Google UI
- No browser redirect required
- More secure (uses system-level Google account)
- Returns richer user data

**Trade-off**: Requires development build (cannot use Expo Go for testing)

### Decision 2: Navigation Library

**Decision**: Use `expo-router`

**Alternatives Considered**:
- `@react-navigation/native`
- Custom navigation

**Rationale**:
- File-based routing is intuitive
- Built specifically for Expo
- Simpler setup and configuration
- Modern approach recommended by Expo team

### Decision 3: State Management

**Decision**: Use React Context API

**Alternatives Considered**:
- Redux
- Zustand
- MobX

**Rationale**:
- Simple app with minimal global state
- Only need to share auth state between screens
- No external dependencies required
- Sufficient for current requirements

### Decision 4: Build System

**Decision**: EAS Build

**Alternatives Considered**:
- Local Android Studio builds
- Classic `expo build` (deprecated)

**Rationale**:
- Required for native modules like Google Sign-In
- Managed keystore and credentials
- Cloud-based builds (no local Android setup needed)
- Supports APK output for direct installation

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Expo | Latest SDK |
| Language | TypeScript | 5.x |
| Auth Library | @react-native-google-signin/google-signin | Latest |
| Navigation | expo-router | 3.x |
| Database | Supabase | Latest |
| Build System | EAS Build | Latest |
| Package Manager | npm | 10.x |

---

## Project Structure

```
LLMChat/
├── app/                           # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # Root layout - wraps app with AuthProvider
│   ├── index.tsx                 # Welcome screen - entry point
│   ├── success.tsx               # Success screen - shows user data + chat button
│   └── chat.tsx                  # Chat screen - AI conversation interface
├── components/
│   └── GoogleSignInButton.tsx    # Reusable Google sign-in button
├── contexts/
│   └── AuthContext.tsx           # Authentication state & functions + login tracking
├── lib/
│   └── supabase.ts               # Supabase client initialization
├── services/
│   ├── loginTracker.ts           # Login tracking service for Supabase
│   ├── openaiService.ts          # OpenAI API integration (ChatGPT)
│   └── chatService.ts            # Chat message storage in Supabase
├── .env                          # Environment variables (gitignored)
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build profiles
├── CLAUDE.md                     # This documentation file
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

---

## Google Cloud Console Setup

### Step 1: Create Project

1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name: `OAuthTest`
4. Click "Create"

### Step 2: Enable APIs

1. Go to "APIs & Services" → "Library"
2. Search for "Google Identity Services"
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in required fields:
   - App name: `OAuthTest`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your Google email)
6. Save (keep in "Testing" mode)

### Step 4: Create OAuth Credentials

#### Android Client ID (for native sign-in)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Android**
4. Name: `OAuthTest Android`
5. Package name: `com.jmcastro.oauthtest`
6. SHA-1 certificate fingerprint: (see EAS section below)
7. Click "Create"

#### Web Client ID (required for idToken)

1. Click "Create Credentials" → "OAuth client ID"
2. Application type: **Web application**
3. Name: `OAuthTest Web Client`
4. No redirect URIs needed
5. Click "Create"
6. **Copy this Client ID** - used as `webClientId` in code

---

## EAS Build Configuration

### Getting SHA-1 Fingerprint

After running `eas build:configure`, get the SHA-1:

```bash
eas credentials --platform android
```

Select:
1. "Keystore: Manage everything needed to build your project"
2. "Set up a new keystore" (if first time)
3. View the SHA-1 fingerprint
4. Add this to your Android OAuth Client ID in Google Cloud Console

### Build Profiles (eas.json)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### Build Commands

```bash
# Development build (with dev client for hot reload)
eas build --platform android --profile development

# Preview build (standalone APK)
eas build --platform android --profile preview

# Production build (for Play Store - AAB format)
eas build --platform android --profile production
```

---

## Implementation Details

### Authentication Flow

```
┌─────────────────┐
│  Welcome Screen │
│                 │
│  [Sign In Btn]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GoogleSignin   │
│  .signIn()      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Native Google  │
│  Sign-In UI     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AuthContext    │
│  stores user    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success Screen  │
│ displays data   │
│                 │
│ [Sign Out Btn]  │
└─────────────────┘
```

### Key Configuration

```typescript
// GoogleSignin configuration
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email'],
});
```

---

## User Data Available

After successful Google Sign-In, the following user data is available:

| Field | Type | Description |
|-------|------|-------------|
| `user.id` | string | Unique Google user ID |
| `user.name` | string | Full display name |
| `user.email` | string | Email address |
| `user.photo` | string | Profile photo URL |
| `user.givenName` | string | First name |
| `user.familyName` | string | Last name |
| `idToken` | string | JWT token for backend auth |
| `serverAuthCode` | string | Auth code for server exchange |

---

## Supabase Integration

### Overview

Supabase is used to store user login records. Every time a user signs in with Google, the app records their profile information and a timestamp to the database.

### Database Schema

The database uses two tables:
1. **`user_logins`**: Records every login event (audit trail/analytics)
2. **`users`**: Tracks unique users with aggregated stats (login count, first/last login)

#### Table 1: `user_logins` (Login Events)

Stores every login event for analytics and audit purposes.

```sql
CREATE TABLE user_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  given_name TEXT,
  family_name TEXT,
  photo_url TEXT,
  id_token TEXT,
  login_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_logins_google_id ON user_logins(google_id);
CREATE INDEX idx_user_logins_email ON user_logins(email);
CREATE INDEX idx_user_logins_timestamp ON user_logins(login_timestamp DESC);
```

#### Table 2: `users` (Unique Users)

Tracks unique users with aggregated login statistics.

```sql
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
  login_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
```

#### Complete SQL Script

Run this in Supabase SQL Editor to create both tables:

```sql
-- Create user_logins table (login events)
CREATE TABLE user_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  given_name TEXT,
  family_name TEXT,
  photo_url TEXT,
  id_token TEXT,
  login_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_logins_google_id ON user_logins(google_id);
CREATE INDEX idx_user_logins_email ON user_logins(email);
CREATE INDEX idx_user_logins_timestamp ON user_logins(login_timestamp DESC);

-- Create users table (unique users with stats)
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
  login_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
```

### Supabase Setup Instructions

#### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: `oauthtest`
   - Database Password: (create a strong password and save it)
   - Region: Select closest to your users
4. Click "Create new project"
5. Wait for project to be provisioned (~2 minutes)

#### Step 2: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste the `user_logins` table SQL from above
4. Click "Run" to execute
5. Verify table created in **Table Editor**

#### Step 3: Configure Table Permissions

For development/testing (disable RLS):

1. Go to **Table Editor** → `user_logins`
2. Click on **RLS** tab
3. Ensure RLS is disabled (or configure policies if needed)

For production, consider enabling RLS with appropriate policies.

#### Step 4: Get API Credentials

1. Go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJI...`

### Environment Variables

Create a `.env` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Add `.env` to `.gitignore` to avoid committing credentials.

### Project Structure with Supabase

```
LLMChat/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── success.tsx
├── components/
│   └── GoogleSignInButton.tsx
├── contexts/
│   └── AuthContext.tsx          # Modified - calls loginTracker
├── lib/
│   └── supabase.ts              # Supabase client
├── services/
│   └── loginTracker.ts          # Login tracking logic
├── .env                          # Credentials (gitignored)
├── app.json
├── eas.json
├── CLAUDE.md
└── package.json
```

### Architecture Decision: Supabase

**Decision**: Use Supabase for database backend

**Alternatives Considered**:
- Firebase Firestore
- AWS Amplify
- Custom backend with PostgreSQL

**Rationale**:
- PostgreSQL-based (familiar, powerful SQL capabilities)
- Generous free tier for development
- Built-in REST API (no backend code needed)
- Real-time subscriptions available for future features
- Easy dashboard for viewing/managing data
- Works well with React Native/Expo

**Trade-off**: Requires internet connection for login tracking (handled gracefully with try/catch)

### Verifying the Integration

After implementation, verify the setup:

1. **Check tables exist**:
   ```sql
   SELECT * FROM user_logins LIMIT 1;
   SELECT * FROM users LIMIT 1;
   ```

2. **Sign in and verify records**:
   - Open the app and sign in with Google
   - In Supabase dashboard, go to Table Editor
   - Check `user_logins` - should have a new row with login data
   - Check `users` - should have a row with login_count = 1

3. **Sign in again and verify count increments**:
   - Sign out and sign in again
   - `user_logins` should have 2 rows
   - `users` should have login_count = 2

4. **Query login history**:
   ```sql
   SELECT email, full_name, login_timestamp
   FROM user_logins
   ORDER BY login_timestamp DESC
   LIMIT 10;
   ```

5. **Query user stats**:
   ```sql
   SELECT email, full_name, login_count, first_login_at, last_login_at
   FROM users
   ORDER BY last_login_at DESC;
   ```

### Troubleshooting Supabase

#### Login not being recorded

1. Check browser console/metro logs for errors
2. Verify Supabase URL and key are correct
3. Ensure table exists with correct column names
4. Check RLS is disabled or policies allow inserts

#### "relation does not exist" error

- Table wasn't created. Run the CREATE TABLE SQL in SQL Editor.

#### Network/connection errors

- Check internet connectivity
- Verify Supabase project is active (not paused)
- Confirm URL doesn't have typos

---

## ChatGPT Integration

### Overview

The app includes an AI chat feature powered by OpenAI's gpt-4o-mini model. Users can have conversations with ChatGPT, and all messages are stored in Supabase for persistence across sessions.

### Database Schema

#### Table: `chat_messages`

```sql
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

### OpenAI API Setup

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add to `.env` file:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
   ```

### Architecture

**Data Flow:**
```
User types message
       ↓
Save user message to Supabase (chat_messages)
       ↓
Build conversation history array
       ↓
Send to OpenAI API (gpt-4o-mini)
       ↓
Receive assistant response
       ↓
Save assistant message to Supabase
       ↓
Update UI with new message
```

**Files:**
- `services/openaiService.ts` - Handles OpenAI API calls
- `services/chatService.ts` - Manages chat message storage in Supabase
- `app/chat.tsx` - Chat screen UI component

### Chat Screen Features

- Message bubbles (user = right/blue, assistant = left/gray)
- Text input with send button
- Loading indicator while waiting for AI response
- Auto-scroll to latest message
- Empty state with helpful prompt
- Error display for API failures
- Chat history loads on screen mount

### Verifying the Integration

1. **After creating chat_messages table**:
   ```sql
   SELECT * FROM chat_messages LIMIT 1;
   ```

2. **Test the chat**:
   - Log in with Google
   - Tap "Chat with AI" button
   - Send a test message
   - Verify response appears
   - Check Supabase `chat_messages` table

3. **Test persistence**:
   - Close and reopen app
   - Navigate to chat
   - Previous messages should load

### Troubleshooting Chat

#### "OpenAI API key not configured" error
- Ensure `EXPO_PUBLIC_OPENAI_API_KEY` is set in `.env`
- Restart the Expo dev server after adding the key

#### Messages not saving
- Verify `chat_messages` table exists in Supabase
- Check RLS is disabled or policies allow inserts
- Check console for Supabase errors

#### Slow responses
- gpt-4o-mini typically responds in 1-3 seconds
- Check network connectivity
- OpenAI may have rate limits during high usage

---

## Troubleshooting

### Common Issues

#### 1. "Developer Error" on Google Sign-In

**Cause**: SHA-1 fingerprint mismatch

**Solution**:
1. Run `eas credentials --platform android`
2. Copy the SHA-1 fingerprint
3. Update your Android OAuth Client ID in Google Cloud Console
4. Wait 5-10 minutes for propagation
5. Rebuild the app

#### 2. Sign-In works but no idToken

**Cause**: Missing or incorrect `webClientId`

**Solution**:
1. Ensure you created a **Web Application** OAuth Client ID
2. Use that Client ID as `webClientId` in `GoogleSignin.configure()`
3. Do NOT use the Android Client ID here

#### 3. "Error: SIGN_IN_CANCELLED"

**Cause**: User cancelled the sign-in flow

**Solution**: This is expected behavior. Handle gracefully in your code.

#### 4. App crashes on Google Sign-In

**Cause**: Using Expo Go instead of development build

**Solution**:
- Native modules require a development build
- Run: `eas build --platform android --profile development`
- Install the APK and use `npx expo start --dev-client`

#### 5. User not authorized

**Cause**: OAuth consent screen in "Testing" mode

**Solution**:
1. Go to Google Cloud Console → OAuth consent screen
2. Add your Google email as a test user
3. Or publish the app (for broader access)

### Debug Checklist

- [ ] Using development build (not Expo Go)
- [ ] SHA-1 matches between EAS and Google Cloud Console
- [ ] Package name matches: `com.jmcastro.oauthtest`
- [ ] webClientId is from Web Application (not Android)
- [ ] Test user is added to OAuth consent screen
- [ ] Google Identity API is enabled

---

## Progress Tracking

### Phase 1: Project Setup
- [x] Initialize Expo project
- [x] Install dependencies
- [x] Configure app.json

### Phase 2: Google Cloud Setup
- [ ] Create Google Cloud project
- [ ] Configure OAuth consent screen
- [ ] Create Android OAuth Client ID
- [ ] Create Web OAuth Client ID

### Phase 3: EAS Setup
- [ ] Configure EAS Build (run `eas build:configure`)
- [ ] Get SHA-1 fingerprint
- [ ] Add SHA-1 to Google Cloud Console
- [x] Create eas.json

### Phase 4: Implementation
- [x] Create AuthContext
- [x] Create Welcome Screen
- [x] Create Success Screen
- [x] Create GoogleSignInButton component
- [x] Create root layout

### Phase 5: Testing & Build
- [ ] Build development client
- [ ] Test sign-in flow
- [ ] Build preview APK
- [ ] Test on device

### Phase 6: Supabase Integration
- [x] Create Supabase project
- [x] Create `user_logins` table (login events)
- [x] Create `users` table (unique users with stats)
- [x] Get API credentials (URL and anon key)
- [x] Install `@supabase/supabase-js` package
- [x] Create `lib/supabase.ts` - Supabase client
- [x] Create `services/loginTracker.ts` - Login tracking service
- [x] Modify `contexts/AuthContext.tsx` - Add login recording
- [x] Create `.env` with Supabase credentials
- [x] Test login recording (verify both tables)
- [x] Verify user stats increment on repeat login

### Phase 7: ChatGPT Integration
- [x] Get OpenAI API key from platform.openai.com
- [x] Create `chat_messages` table in Supabase
- [x] Create `services/openaiService.ts` - OpenAI API calls
- [x] Create `services/chatService.ts` - Chat message storage
- [x] Create `app/chat.tsx` - Chat screen UI
- [x] Modify `app/success.tsx` - Add "Chat with AI" button
- [x] Update `.env` with OpenAI API key
- [x] Test chat functionality end-to-end
- [x] Verify messages persist across sessions

---

## Configuration Values

| Setting | Value |
|---------|-------|
| App Name | LLMChat |
| Package Name | com.jmcastro.llmchat |
| Expo Slug | llmchat |
| Deep Link Scheme | llmchat |
| Supabase Project | zdjdavmokokspsurzfiq |
| OpenAI Model | gpt-4o-mini |
| GitHub Repo | https://github.com/Fczion/LLMChat |

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-28 | 0.1.0 | Initial project setup and documentation |
| 2026-01-29 | 0.2.0 | Added Supabase integration plan for login tracking |
| 2026-01-29 | 0.3.0 | Implemented Supabase integration - login tracking fully functional |
| 2026-01-29 | 0.4.0 | Added ChatGPT chat feature with message persistence |

---

*This documentation is maintained as part of the LLMChat project.*
