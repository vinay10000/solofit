// src/screens/SignInScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useSignInEmailPassword, useNhostClient } from '@nhost/react';
import StyledTextInput from '../components/StyledTextInput';
import StyledButton from '../components/StyledButton';
import Colors from '../constants/Colors';

interface SignInScreenProps {
  onSignUpPress: () => void;
  onForgotPasswordPress: () => void;
  onSignInSuccess: () => void; // Callback for successful sign-in
}

const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignUpPress,
  onForgotPasswordPress,
  onSignInSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nhost = useNhostClient(); // Get Nhost client for OAuth

  const {
    signInEmailPassword,
    isLoading,
    isError,
    error,
    needsEmailVerification,
  } = useSignInEmailPassword();

  const theme = Colors.dark;

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    const { isSuccess, error: signInError } = await signInEmailPassword(email, password);

    if (isSuccess) {
      // The useAuthenticationStatus hook in App.tsx will handle navigation
      // or you can call onSignInSuccess if immediate action is needed before auth state propagates
      onSignInSuccess();
    } else if (signInError) {
      Alert.alert('Sign In Failed', signInError.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error: googleError } = await nhost.auth.signIn({
        provider: 'google',
        // For Expo Go, you might need to configure redirect URL and use expo-web-browser
        // For standalone apps, deep linking setup is required.
        // options: { redirectTo: 'YOUR_APP_SCHEME://callback' }
      });
      if (googleError) {
        Alert.alert('Google Sign-In Error', googleError.message);
      }
      // On successful Google sign-in, Nhost's auth state will change,
      // and the useAuthenticationStatus hook in App.tsx will trigger redirection.
    } catch (e: any) {
      Alert.alert('Google Sign-In Error', e.message || 'An unexpected error occurred.');
    }
  };


  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.imagePlaceholder}>
        {/* Replace with your actual image component if available */}
        <Text style={styles.imagePlaceholderText}>App Logo/Image</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Sign In</Text>

      {isError && error && (
        <Text style={styles.apiErrorText}>{error.message}</Text>
      )}
      {needsEmailVerification && (
        <Text style={styles.warningText}>
          Please verify your email to complete sign in.
        </Text>
      )}

      <StyledTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter your email"
      />
      <StyledTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter your password"
      />

      <StyledButton
        title="Sign In"
        onPress={handleSignIn}
        loading={isLoading}
        disabled={isLoading}
        variant="primary"
        style={styles.buttonSpacing}
      />

      <Text style={[styles.orText, { color: theme.orTextColor }]}>OR</Text>

      <StyledButton
        title="Sign in with Google"
        onPress={handleGoogleSignIn}
        variant="google"
        // You can use an actual Google icon here
        // icon={<Image source={require('../assets/google_icon.png')} style={styles.googleIcon} />}
        icon={<Text style={{fontWeight: 'bold', fontSize: 18, color: theme.googleButtonText}}>G</Text>}
        style={styles.buttonSpacing}
        disabled={isLoading} // Disable if email/password sign-in is in progress
      />

      <StyledButton
        title="Forgot password?"
        onPress={onForgotPasswordPress}
        variant="link"
        style={styles.linkButton}
      />
      <View style={styles.footer}>
        <Text style={{ color: theme.text }}>Don't have an account? </Text>
        <StyledButton title="Sign Up" onPress={onSignUpPress} variant="link" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#333', // Placeholder color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePlaceholderText: {
    color: '#777',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonSpacing: {
    marginTop: 10,
    marginBottom: 10,
  },
  orText: {
    marginVertical: 20,
    fontSize: 14,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  apiErrorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  warningText: {
    color: Colors.dark.placeholderText, // Or a specific warning color
    marginBottom: 15,
    textAlign: 'center',
  },
  googleIcon: { // Example style if using an image for Google icon
    width: 20,
    height: 20,
    marginRight: 10,
  }
});

export default SignInScreen;
