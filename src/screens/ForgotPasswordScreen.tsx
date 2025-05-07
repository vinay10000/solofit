// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNhostClient } from '@nhost/react'; // Direct client usage for this
import StyledTextInput from '../components/StyledTextInput';
import StyledButton from '../components/StyledButton';
import Colors from '../constants/Colors';

interface ForgotPasswordScreenProps {
  onBackToSignInPress: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToSignInPress }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success/error messages
  const nhost = useNhostClient();
  const theme = Colors.dark;

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    setMessage('');

    // ***** CORRECTED METHOD CALL *****
    // Use nhost.auth.resetPassword to send the email
    const { error } = await nhost.auth.resetPassword({
      email: email,
      options: {
        // redirectTo: 'YOUR_APP_SCHEME://reset-password-landing' // Important for deep linking
        // Ensure this redirectTo URL is configured in your Nhost project's email templates
        // and your app is set up to handle this deep link to a page where the user can enter their new password.
        // The link in the email will contain a ticket/token.
      }
    });
    setLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
      Alert.alert('Password Reset Failed', error.message);
    } else {
      setMessage('If an account exists for this email, a password reset link has been sent. Please check your inbox.');
      Alert.alert('Check Your Email', 'If an account exists for this email, a password reset link has been sent.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: theme.placeholderText }]}>
        Enter your email address and we'll send you a link to reset your password.
      </Text>

      {message ? (
        <Text style={[styles.messageText, {color: message.startsWith("Error") ? 'red' : theme.text}]}>
            {message}
        </Text>
      ) : null}

      <StyledTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter your registered email"
      />

      <StyledButton
        title="Send Reset Link"
        onPress={handlePasswordReset}
        loading={loading}
        disabled={loading}
        variant="primary"
        style={styles.buttonSpacing}
      />

      <StyledButton
        title="Back to Sign In"
        onPress={onBackToSignInPress}
        variant="link"
        style={styles.linkButton}
      />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonSpacing: {
    marginTop: 10,
    marginBottom: 10,
  },
  linkButton: {
    marginTop: 20,
  },
  messageText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default ForgotPasswordScreen;
