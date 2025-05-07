// src/screens/MenuScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Colors from '../constants/Colors'; // Adjust path as needed
import { useUserData, useSignOut } from '@nhost/react';

// Placeholder icons - replace with actual icon components or SVGs
const ProfileIcon = () => <Text style={styles.optionIcon}>👤</Text>;
const SettingsIcon = () => <Text style={styles.optionIcon}>⚙️</Text>;
const PasswordIcon = () => <Text style={styles.optionIcon}>🔑</Text>;
const DeleteIcon = () => <Text style={styles.optionIcon}>🗑️</Text>;
const SignOutIcon = () => <Text style={styles.optionIcon}>🚪</Text>;


interface MenuScreenProps {
  navigateToCharacterProfile: () => void;
  navigateToSettings: () => void;
  navigateToChangePassword: () => void;
  // onSignOut: () => void; // Handled by App.tsx auth state
}

const MenuScreen: React.FC<MenuScreenProps> = ({
  navigateToCharacterProfile,
  navigateToSettings,
  navigateToChangePassword,
}) => {
  const theme = Colors.dark;
  const userData = useUserData();
  const { signOut } = useSignOut();

  const menuOptions = [
    { id: 'profile', title: 'Character Profile', icon: <ProfileIcon />, onPress: navigateToCharacterProfile },
    { id: 'settings', title: 'Settings', icon: <SettingsIcon />, onPress: navigateToSettings },
    { id: 'password', title: 'Change Password', icon: <PasswordIcon />, onPress: navigateToChangePassword },
    // Delete Account will be handled within settings or as a direct option
  ];

  const handleSignOut = async () => {
    await signOut();
    // Navigation back to auth screens will be handled by App.tsx's useEffect
  };

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.headerFont }]}>
            MENU
          </Text>
          {userData && (
            <Text style={[styles.userEmail, { color: theme.textSecondary, fontFamily: theme.bodyFont }]}>
              {userData.email}
            </Text>
          )}
        </View>

        {menuOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionButton, { backgroundColor: theme.secondaryBackground }]}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            {option.icon}
            <Text style={[styles.optionText, { color: theme.text, fontFamily: theme.bodyFont }]}>
              {option.title}
            </Text>
            <Text style={[styles.optionArrow, {color: theme.textSecondary}]}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
            style={[styles.optionButton, styles.signOutButton, { backgroundColor: theme.secondaryBackground }]}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <SignOutIcon />
            <Text style={[styles.optionText, { color: theme.primary, fontFamily: theme.bodyFont, fontWeight: 'bold' }]}>
              Sign Out
            </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 50, // Adjust for status bar
    paddingBottom: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    // Shadow for depth and "glow"
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
    color: Colors.dark.primary, // Icon color
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  optionArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 20, // More space before sign out
    borderColor: Colors.dark.primary, // Optional: Add a border to highlight it
    // borderWidth: 1,
  }
});

export default MenuScreen;
