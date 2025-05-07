// src/screens/HomeScreen/MissionItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors'; // Adjust path as needed

interface MissionItemProps {
  icon: string; // Emoji/Text placeholder
  title: string;
  xpReward: number;
  isCompleted?: boolean;
  onPress?: () => void;
}

const MissionItem: React.FC<MissionItemProps> = ({ icon, title, xpReward, isCompleted, onPress }) => {
  const theme = Colors.dark;
  return (
    <TouchableOpacity
      // The background is now transparent, relying on the parent container for any section background.
      style={[styles.itemContainer, { backgroundColor: 'transparent' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.missionIcon, {color: theme.missionIconColor}]}>{icon}</Text>
      <Text style={[styles.missionTitle, { color: theme.missionTextColor, fontFamily: theme.bodyFont }]}>{title}</Text>
      <Text style={[styles.xpReward, { color: theme.missionXPColor, fontFamily: theme.bodyFont }]}>+{xpReward} XP</Text>
      <View style={[
          styles.checkbox,
          {
            borderColor: theme.missionCheckboxBorder,
            backgroundColor: isCompleted ? theme.missionCheckboxCheckedColor : 'transparent'
          }
        ]}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 8,
  },
  missionIcon: {
    fontSize: 22,
    marginRight: 12,
    width: 25,
    textAlign: 'center',
  },
  missionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  xpReward: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: Colors.dark.background, // Checkmark color against checked background
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default MissionItem;
