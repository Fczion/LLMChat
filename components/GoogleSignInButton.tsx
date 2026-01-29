import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onPress,
  isLoading = false,
  disabled = false,
}: GoogleSignInButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (isLoading || disabled) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#757575" />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.text}>Sign in with Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    borderWidth: 1,
    borderColor: '#DADCE0',
    minWidth: 240,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  text: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
});
