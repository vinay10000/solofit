// src/screens/MenuScreen/ChangePasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useNhostClient } from '@nhost/react';
import Colors from '../../constants/Colors';
import StyledTextInput from '../../components/StyledTextInput';
import StyledButton from '../../components/StyledButton';

interface ChangePasswordScreenProps {
  onBack: () => void;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ onBack }) => {
  const theme = Colors.dark;
  const nhost = useNhostClient();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Missing Fields", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Password Mismatch", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        Alert.alert("Weak Password", "New password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    const { error } = await nhost.auth.changePassword({
      newPassword: newPassword,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert("Change Password Failed", error.message);
    } else {
      Alert.alert("Success", "Your password has been changed successfully.", [{ text: "OK", onPress: onBack }]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: theme.background}} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backButtonTouchable} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <View style={styles.backButtonView}>
                    <Text style={{color: theme.primary, fontFamily: theme.bodyFont, fontSize: 16}}>‹</Text>
                    <Text style={{color: theme.primary, fontFamily: theme.bodyFont, fontSize: 16, marginLeft: 5}}>Back</Text>
                </View>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text, fontFamily: theme.headerFont }]}>Change Password</Text>

            <StyledTextInput
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.inputContainer}
            />
            <StyledTextInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.inputContainer}
            />
            <StyledTextInput
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                style={styles.inputContainer}
            />

            {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
            ) : (
            <StyledButton
                title="Update Password"
                onPress={handleChangePassword}
                variant="primary"
                style={styles.updateButton}
                textStyle={{fontFamily: theme.bodyFont, fontWeight: 'bold'}}
            />
            )}
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContentContainer:{
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 30,
    paddingBottom: 30,
  },
  backButtonTouchable: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 15,
    zIndex: 10,
    padding: 10, // Increased touch area
  },
  backButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 50, // Add margin to clear back button
    textAlign: 'center',
  },
  inputContainer: { // Renamed from 'input' to clarify it's for StyledTextInput's container
    width: '90%',
    marginBottom: 18, // Increased margin
  },
  updateButton: {
    width: '90%',
    marginTop: 25, // Increased margin
  },
  loader: {
    marginTop: 20,
  }
});

export default ChangePasswordScreen;
