import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export default function WelcomeScreen() {
  const { user, isLoading, error, signIn, isSignedIn } = useAuth();
  const router = useRouter();

  // Navigate to success screen when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      router.replace('/success');
    }
  }, [isSignedIn, user]);

  // Show loading spinner while checking auth state
  if (isLoading && !error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>OAuthTest</Text>
          </View>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Sign in with your Google account to continue
          </Text>
        </View>

        {/* Sign In Section */}
        <View style={styles.signInSection}>
          <GoogleSignInButton onPress={signIn} isLoading={isLoading} />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 24,
  },
  signInSection: {
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    maxWidth: 300,
  },
  errorText: {
    color: '#C5221F',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9AA0A6',
    textAlign: 'center',
  },
});
