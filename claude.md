# OAuthTest - Expo Google Sign-In Android App

## Project Documentation

This document contains all architecture decisions, requirements, setup instructions, and implementation details for the OAuthTest Android application.

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
10. [Troubleshooting](#troubleshooting)
11. [Progress Tracking](#progress-tracking)

---

## Project Overview

**OAuthTest** is an Android application built with Expo React Native that demonstrates Google Sign-In authentication using the native Android SDK. The app features:

- A welcome screen with app branding
- Native Google Sign-In integration
- A success screen displaying all user profile data
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
| Build System | EAS Build | Latest |
| Package Manager | npm | 10.x |

---

## Project Structure

```
OAuthTest/
├── app/                           # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # Root layout - wraps app with AuthProvider
│   ├── index.tsx                 # Welcome screen - entry point
│   └── success.tsx               # Success screen - shows user data
├── components/
│   └── GoogleSignInButton.tsx    # Reusable Google sign-in button
├── contexts/
│   └── AuthContext.tsx           # Authentication state & functions
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build profiles
├── claude.md                     # This documentation file
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

---

## Configuration Values

| Setting | Value |
|---------|-------|
| App Name | OAuthTest |
| Package Name | com.jmcastro.oauthtest |
| Expo Slug | oauthtest |
| Deep Link Scheme | oauthtest |

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-28 | 0.1.0 | Initial project setup and documentation |

---

*This documentation is maintained as part of the OAuthTest project.*
