// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useSignUpEmailPassword, useNhostClient } from '@nhost/react';
import StyledTextInput from '../components/StyledTextInput';
import StyledButton from '../components/StyledButton';
import Colors from '../constants/Colors';

interface SignUpScreenProps {
  onSignInPress: () => void;
  onSignUpSuccess: () => void; // Callback for successful sign-up
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignInPress, onSignUpSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // Username state
  const [password, setPassword] = useState('');
  const nhost = useNhostClient();

  const {
    signUpEmailPassword,
    isLoading,
    isError,
    error,
    needsEmailVerification,
  } = useSignUpEmailPassword();

  const theme = Colors.dark;

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const { isSuccess, error: signUpError } = await signUpEmailPassword(email, password, {
      displayName: username, // Store username as displayName
      // metadata: { username: username } // Alternatively, use metadata
      // Nhost does not enforce displayName uniqueness by default.
      // You would need custom Hasura permissions/functions or database constraints for that.
    });

    if (isSuccess) {
       Alert.alert(
        'Sign Up Successful',
        needsEmailVerification
          ? 'Please check your email to verify your account.'
          : 'You can now sign in.'
      );
      // The useAuthenticationStatus hook in App.tsx will handle navigation if auto-signin occurs
      // or if email verification is not required and sign-up leads to authenticated state.
      // Otherwise, user might need to go to sign-in page.
      onSignUpSuccess(); // Or navigate to sign in: onSignInPress();
    } else if (signUpError) {
      Alert.alert('Sign Up Failed', signUpError.message);
    }
  };

  const handleGoogleSignUp = async () => {
     try {
      const { error: googleError } = await nhost.auth.signIn({ // signIn is used for OAuth registration too
        provider: 'google',
        // options: { redirectTo: 'YOUR_APP_SCHEME://callback' }
      });
      if (googleError) {
        Alert.alert('Google Sign-Up Error', googleError.message);
      }
      // On successful Google sign-up, Nhost's auth state will change.
    } catch (e: any) {
      Alert.alert('Google Sign-Up Error', e.message || 'An unexpected error occurred.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>App Logo/Image</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Sign Up</Text>

      {isError && error && (
        <Text style={styles.apiErrorText}>{error.message}</Text>
      )}
      {/* needsEmailVerification message is shown in Alert for now */}

      <StyledTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter your email"
      />
      <StyledTextInput
        label="Username (unique)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="Choose a username"
      />
      <StyledTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Create a password"
      />

      <StyledButton
        title="Sign Up"
        onPress={handleSignUp}
        loading={isLoading}
        disabled={isLoading}
        variant="primary"
        style={styles.buttonSpacing}
      />

      <Text style={[styles.orText, { color: theme.orTextColor }]}>OR</Text>

      <StyledButton
        title="Sign up with Google"
        onPress={handleGoogleSignUp}
        variant="google"
        icon={<Text style={{fontWeight: 'bold', fontSize: 18, color: theme.googleButtonText}}>G</Text>}
        style={styles.buttonSpacing}
        disabled={isLoading}
      />

      <View style={styles.footer}>
        <Text style={{ color: theme.text }}>Already have an account? </Text>
        <StyledButton title="Sign In" onPress={onSignInPress} variant="link" />
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
    backgroundColor: '#333',
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
});

export default SignUpScreen;
