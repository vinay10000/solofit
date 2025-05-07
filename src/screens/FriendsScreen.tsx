// src/screens/FriendsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { ScreenName } from '../../App';

interface FriendsScreenProps {
  navigateTo: (screen: ScreenName, params?: any) => void;
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigateTo }) => {
  const theme = Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.screenTitle, { color: theme.text, fontFamily: theme.headerFont }]}>Friends & Guilds</Text>
      <View style={styles.content}>
        <Text style={[styles.placeholderText, { color: theme.textSecondary, fontFamily: theme.bodyFont }]}>
          The Monarch's network is vast, but this realm is still under construction.
        </Text>
        <Text style={[styles.placeholderText, { color: theme.textSecondary, fontFamily: theme.bodyFont, marginTop: 10 }]}>
          Friend lists, leaderboards, and guild features coming soon!
        </Text>
         <Text style={[styles.placeholderIcon, {marginTop: 30}]}>🛡️⚔️🤝</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', // Center content for placeholder
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 30 : 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  placeholderIcon: {
      fontSize: 40,
  }
});

export default FriendsScreen;
