import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function SuccessScreen() {
  const { user, isLoading, signOut, isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect to welcome if not signed in
  useEffect(() => {
    if (!isSignedIn && !isLoading) {
      router.replace('/');
    }
  }, [isSignedIn, isLoading]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  // In v16, user data might be directly on user or in user.user
  const userData = user?.user || user;

  if (!user || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.successBadge}>
            <Text style={styles.checkmark}>&#10003;</Text>
          </View>
          <Text style={styles.successTitle}>Login Successful!</Text>
          <Text style={styles.successSubtitle}>
            Welcome back, {userData.givenName || userData.name}
          </Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.profileSection}>
          {userData.photo ? (
            <Image source={{ uri: userData.photo }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Text style={styles.profileInitial}>
                {(userData.givenName || userData.name || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* User Data Card */}
        <View style={styles.dataCard}>
          <Text style={styles.cardTitle}>Your Profile Data</Text>

          <DataRow label="Full Name" value={userData.name} />
          <DataRow label="Email" value={userData.email} />
          <DataRow label="First Name" value={userData.givenName} />
          <DataRow label="Last Name" value={userData.familyName} />
          <DataRow label="User ID" value={userData.id} />

          {user.idToken && (
            <View style={styles.tokenSection}>
              <Text style={styles.tokenLabel}>ID Token</Text>
              <Text style={styles.tokenValue} numberOfLines={3}>
                {user.idToken.substring(0, 100)}...
              </Text>
            </View>
          )}
        </View>

        {/* Chat with AI Button */}
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => router.push('/chat')}
          activeOpacity={0.8}
        >
          <Text style={styles.chatButtonText}>Chat with AI</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DataRowProps {
  label: string;
  value?: string | null;
}

function DataRow({ label, value }: DataRowProps) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue} numberOfLines={1}>
        {value || 'Not provided'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#5F6368',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  dataLabel: {
    fontSize: 14,
    color: '#5F6368',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#202124',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  tokenSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
  },
  tokenLabel: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 12,
    color: '#9AA0A6',
    fontFamily: 'monospace',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  chatButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#EA4335',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
