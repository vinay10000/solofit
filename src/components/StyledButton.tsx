// src/components/StyledButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'google' | 'link'; // Button variants
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode; // For icons like Google 'G'
}

const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled,
  loading,
  icon,
}) => {
  const theme = Colors.dark; // Default to dark theme

  let buttonStyles: ViewStyle = { ...styles.buttonBase };
  let textStyles: TextStyle = { ...styles.textBase };

  switch (variant) {
    case 'primary':
      buttonStyles = {
        ...buttonStyles,
        backgroundColor: theme.primary,
        borderColor: theme.primary,
      };
      textStyles = { ...textStyles, color: '#FFFFFF' }; // White text for primary button
      break;
    case 'google':
      buttonStyles = {
        ...buttonStyles,
        backgroundColor: theme.googleButtonBackground,
        borderColor: theme.googleButtonBackground, // Or a subtle border
        flexDirection: 'row', // Align icon and text
        justifyContent: 'center',
      };
      textStyles = { ...textStyles, color: theme.googleButtonText, marginLeft: icon ? 10 : 0 };
      break;
    case 'link':
      buttonStyles = { paddingVertical: 10 }; // Minimal styling for link
      textStyles = { color: theme.linkTextColor, fontSize: 14, fontWeight: '500' };
      break;
  }

  if (disabled || loading) {
    buttonStyles.opacity = 0.6;
  }

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : theme.primary} />
      ) : (
        <>
          {icon && variant === 'google' && icon}
          <Text style={[textStyles, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1, // For variants that might need it
  },
  textBase: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StyledButton;
