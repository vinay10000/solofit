// src/components/StyledTextInput.tsx
import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';
import Colors from '../constants/Colors'; // Assuming Colors.ts is in src/constants/

interface StyledTextInputProps extends TextInputProps {
  label?: string; // Optional label for the input
  error?: string; // Optional error message to display
}

const StyledTextInput: React.FC<StyledTextInputProps> = ({ label, error, style, ...props }) => {
  const theme = Colors.dark; // Using dark theme by default

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            borderColor: error ? 'red' : theme.inputBorder, // Highlight border if error
            color: theme.text,
          },
          style, // Allow overriding styles
        ]}
        placeholderTextColor={theme.placeholderText}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15, // Space below each input group
  },
  label: {
    fontSize: 14,
    marginBottom: 5, // Space between label and input
    fontWeight: '500',
  },
  input: {
    height: 50, // Standard height for inputs
    borderWidth: 1,
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 15, // Horizontal padding inside input
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 3, // Space above error message
  },
});

export default StyledTextInput;
