# Expo Google Sign-In Template

A ready-to-use Expo React Native template with native Google Sign-In authentication.

## Features

- Native Google Sign-In (not web-based OAuth)
- Welcome screen with sign-in button
- Success screen displaying user profile data
- TypeScript support
- Expo Router for navigation
- EAS Build configured for APK generation

## Quick Start

### 1. Clone/Copy this template

```bash
# Clone or copy the template to your new project
cp -r OAuthTest MyNewProject
cd MyNewProject
```

### 2. Install dependencies

```bash
npm install
```

### 3. Update configuration

#### app.json
Update these values:
- `name`: Your app name
- `slug`: Your app slug (lowercase, no spaces)
- `scheme`: Your deep link scheme
- `android.package`: Your package name (e.g., `com.yourname.appname`)
- `ios.bundleIdentifier`: Your iOS bundle ID

#### contexts/AuthContext.tsx
Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID from Google Cloud Console.

### 4. Google Cloud Console Setup

1. Create a project at https://console.cloud.google.com
2. Enable Google Identity API
3. Configure OAuth consent screen
4. Create credentials:
   - **Web Application** OAuth Client ID (use this as `webClientId`)
   - **Android** OAuth Client ID (requires SHA-1 fingerprint)

### 5. EAS Setup

```bash
npm install -g eas-cli
eas login
eas build:configure
eas credentials --platform android  # Get SHA-1 for Google Cloud
```

Add the SHA-1 to your Android OAuth Client ID in Google Cloud Console.

### 6. Build & Test

```bash
# Development build (with hot reload)
eas build --platform android --profile development

# Production APK
eas build --platform android --profile preview
```

## Project Structure

```
├── app/
│   ├── _layout.tsx      # Root layout with AuthProvider
│   ├── index.tsx        # Welcome screen
│   └── success.tsx      # Success screen with user data
├── components/
│   └── GoogleSignInButton.tsx
├── contexts/
│   └── AuthContext.tsx  # Google Sign-In logic
├── app.json             # Expo configuration
├── eas.json             # EAS Build profiles
└── claude.md            # Detailed documentation
```

## User Data Available

After sign-in, you have access to:
- `user.name` - Full name
- `user.email` - Email address
- `user.photo` - Profile photo URL
- `user.givenName` - First name
- `user.familyName` - Last name
- `user.id` - Google user ID
- `idToken` - JWT for backend auth

## Troubleshooting

See [claude.md](claude.md) for detailed troubleshooting guide.

## License

MIT
