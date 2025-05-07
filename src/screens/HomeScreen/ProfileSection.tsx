// src/screens/HomeScreen/ProfileSection.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../../constants/Colors';
// NHost User type can be imported if you have specific typings from @nhost/nhost-js or @nhost/react
// For now, we'll use a simple interface for props.

// Define expected prop types
interface NHostUser {
    id?: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    // Add other fields from nHostUserData if needed
}

interface UserStats {
    level?: number;
    xp?: number;
    fitness_rank?: string; // Assuming fitness_rank_enum is string here
    // Add other fields from userStats if needed
}

interface ProfileSectionProps {
  nHostUser?: NHostUser | null; // From useUserData()
  userStats?: UserStats | null; // From your custom user_stats query
}

const XPIcon = () => <Text style={{ color: Colors.dark.xpBarColor, fontSize: 20, marginRight: 5 }}>💎</Text>;
const RankIcon = () => <Text style={{ color: Colors.dark.rankTextColor, fontSize: 22, marginRight: 8 }}>🛡️</Text>;

const ProfileSection: React.FC<ProfileSectionProps> = ({ nHostUser, userStats }) => {
  const theme = Colors.dark;

  const username = nHostUser?.displayName || "Adventurer";
  const profilePicUrl = nHostUser?.avatarUrl;

  const level = userStats?.level || 1;
  const currentXP = userStats?.xp || 0;
  const nextLevelXP = (userStats?.level || 0) * 5000 + 5000; // Simplified: level * 5000 is start of current, so +5000 for next
                                                           // Or more simply: 5000 (if level 1 is 0-4999)
                                                           // The SQL function calculates level based on total XP.
                                                           // For display, if level is X, next is (X*XP_PER_LEVEL).
                                                           // Current XP is total XP. XP for current level start is (level-1)*XP_PER_LEVEL
  const xpForCurrentLevelStart = (level - 1) * 5000;
  const xpIntoCurrentLevel = currentXP - xpForCurrentLevelStart;
  const xpToNextLevelFromCurrent = 5000; // Assuming 5000 XP per level

  const xpPercentage = xpToNextLevelFromCurrent > 0 ? (xpIntoCurrentLevel / xpToNextLevelFromCurrent) * 100 : 0;
  const rank = userStats?.fitness_rank || "E_RANK";


  return (
    <View style={styles.container}>
      <View style={styles.profilePicContainer}>
        {profilePicUrl ? (
          <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
        ) : (
          <Image source={require('../../../assets/default_profile.png')} style={styles.profilePic} />
        )}
      </View>

      <Text style={[styles.username, { color: theme.profileNameColor, fontFamily: theme.headerFont }]}>
        {username.toUpperCase()}
      </Text>

      <View style={styles.rankContainer}>
        <RankIcon />
        <Text style={[styles.rankText, { color: theme.rankTextColor, fontFamily: theme.fantasyRankFont }]}>
          {(rank as string).replace('_', ' ').toUpperCase()} {/* Format rank string */}
        </Text>
        <View style={styles.xpCrystalContainer}>
            <XPIcon />
        </View>
      </View>

      <View style={styles.xpBarOuterContainer}>
        <View style={[styles.xpBarBackground, { backgroundColor: theme.xpBarBackground }]}>
          <View style={[styles.xpBarForeground, { width: `${Math.min(xpPercentage, 100)}%`, backgroundColor: theme.xpBarColor }]} />
        </View>
        <Text style={[styles.xpText, { color: theme.xpTextColor, fontFamily: theme.bodyFont }]}>
          {currentXP} / {(level * 5000)} XP {/* Show total XP / XP for next level up */}
        </Text>
         <Text style={[styles.levelDisplay, {color: theme.textSecondary, fontFamily: theme.bodyFont}]}>Level: {level}</Text>
      </View>
    </View>
  );
};

// Styles remain largely the same, added levelDisplay
const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
    paddingTop: 10,
  },
  profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 15,
    backgroundColor: Colors.dark.secondaryBackground,
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  xpCrystalContainer: {
    marginLeft: 10,
  },
  xpBarOuterContainer: {
    width: '85%',
    alignItems: 'center',
  },
  xpBarBackground: {
    height: 7,
    width: '100%',
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  xpBarForeground: {
    height: '100%',
    borderRadius: 3.5,
  },
  xpText: {
    fontSize: 11,
    marginTop: 6,
  },
  levelDisplay: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  }
});

export default ProfileSection;
