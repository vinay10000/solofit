// src/screens/MenuScreen/SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import Colors from '../../constants/Colors';

interface SettingsScreenProps {
  onBack: () => void;
  onDeleteAccountRequest: () => void; // Changed prop name
}

const ThemeIcon = () => <Text style={styles.settingIcon}>🎨</Text>;
const NotificationIcon = () => <Text style={styles.settingIcon}>🔔</Text>;
const DeleteAccountIcon = () => <Text style={[styles.settingIcon, {color: '#FF6B6B'}]}>🗑️</Text>;


const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onDeleteAccountRequest }) => {
  const theme = Colors.dark;
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme(previousState => !previousState);
    Alert.alert("Theme Toggle", "Full theme switching requires app restart or more complex state management (not implemented in this example).");
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  return (
    <ScrollView style={{flex:1, backgroundColor: theme.background}} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonTouchable} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={styles.backButtonView}>
                <Text style={{color: theme.primary, fontFamily: theme.bodyFont, fontSize: 16}}>‹</Text>
                <Text style={{color: theme.primary, fontFamily: theme.bodyFont, fontSize: 16, marginLeft: 5}}>Back</Text>
            </View>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, fontFamily: theme.headerFont }]}>Settings</Text>

        <View style={[styles.settingItem, {backgroundColor: theme.secondaryBackground}]}>
          <ThemeIcon />
          <Text style={[styles.settingText, { color: theme.text, fontFamily: theme.bodyFont }]}>Dark Theme</Text>
          <Switch
            trackColor={{ false: theme.tertiary, true: theme.primary }}
            thumbColor={isDarkTheme ? theme.secondaryBackground : theme.tertiary}
            ios_backgroundColor={theme.tertiary}
            onValueChange={toggleTheme}
            value={isDarkTheme}
          />
        </View>

        <View style={[styles.settingItem, {backgroundColor: theme.secondaryBackground}]}>
          <NotificationIcon />
          <Text style={[styles.settingText, { color: theme.text, fontFamily: theme.bodyFont }]}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: theme.tertiary, true: theme.primary }}
            thumbColor={notificationsEnabled ? theme.secondaryBackground : theme.tertiary}
            ios_backgroundColor={theme.tertiary}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

        <TouchableOpacity
            style={[styles.deleteButton, {borderColor: '#FF6B6B'}]}
            onPress={onDeleteAccountRequest} // Use the new prop
            activeOpacity={0.7}
        >
            <DeleteAccountIcon />
            <Text style={[styles.deleteButtonText, {color: '#FF6B6B', fontFamily: theme.bodyFont}]}>
                Delete Account
            </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles (from previous version)
const styles = StyleSheet.create({
  scrollContentContainer:{ flexGrow: 1, },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 30, paddingBottom: 30, },
  backButtonTouchable: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 15, zIndex: 10, padding: 10, },
  backButtonView: { flexDirection: 'row', alignItems: 'center', },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, marginTop: 50, textAlign: 'center', },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: 18, paddingHorizontal: 20, borderRadius: 10, marginBottom: 18, shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, },
  settingIcon: { fontSize: 22, marginRight: 18, color: Colors.dark.primary, },
  settingText: { flex: 1, fontSize: 16, fontWeight: '500', },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 35, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1.5, },
  deleteButtonText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10, }
});

export default SettingsScreen;
