import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
  type User,
} from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
// TODO: Replace with your Web Client ID from Google Cloud Console
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  scopes: ['profile', 'email'],
});

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already signed in on app start
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      // hasPreviousSignIn is synchronous in v12+
      const hasPreviousSignIn = GoogleSignin.hasPreviousSignIn();
      if (hasPreviousSignIn) {
        const currentUser = GoogleSignin.getCurrentUser();
        setUser(currentUser);
      }
    } catch (err) {
      console.error('Error checking current user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Perform sign-in
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        setUser(response.data);
      } else {
        // Sign in was cancelled
        setError('Sign-in was cancelled');
      }
    } catch (err: unknown) {
      let errorMessage = 'An error occurred during sign-in';

      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = 'Sign-in was cancelled';
            break;
          case statusCodes.IN_PROGRESS:
            errorMessage = 'Sign-in is already in progress';
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = 'Google Play Services is not available';
            break;
          default:
            errorMessage = err.message || 'Unknown error occurred';
        }
      }

      setError(errorMessage);
      console.error('Sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await GoogleSignin.signOut();
      setUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error signing out';
      setError(errorMessage);
      console.error('Sign-out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    isSignedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
