// src/screens/HomeScreen/BottomTabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { ScreenName } from '../../../App'; // Import ScreenName from App.tsx

// Placeholder icons
const HomeIcon = ({ active }: { active: boolean }) => <Text style={[styles.tabIcon, { color: active ? Colors.dark.bottomNavActive : Colors.dark.bottomNavInactive }]}>🏠</Text>;
const MissionsIcon = ({ active }: { active: boolean }) => <Text style={[styles.tabIcon, { color: active ? Colors.dark.bottomNavActive : Colors.dark.bottomNavInactive }]}>🎯</Text>;
const WorkoutsIcon = ({ active }: { active: boolean }) => <Text style={[styles.tabIcon, { color: active ? Colors.dark.bottomNavActive : Colors.dark.bottomNavInactive }]}>🏋️</Text>;
const FriendsIcon = ({ active }: { active: boolean }) => <Text style={[styles.tabIcon, { color: active ? Colors.dark.bottomNavActive : Colors.dark.bottomNavInactive }]}>👥</Text>;
const MenuIcon = ({ active }: { active: boolean }) => <Text style={[styles.tabIcon, { color: active ? Colors.dark.bottomNavActive : Colors.dark.bottomNavInactive }]}>☰</Text>;

interface BottomTabBarProps {
  onTabPress: (tabName: ScreenName) => void; // Use ScreenName
  currentActiveScreen: ScreenName;      // Use ScreenName
}

// Ensure the 'name' property matches a value in the ScreenName type from App.tsx
const tabs: { name: ScreenName; icon: React.FC<{ active: boolean }> }[] = [
  { name: 'Home', icon: HomeIcon },
  { name: 'Missions', icon: MissionsIcon }, // Placeholder navigation
  { name: 'Workouts', icon: WorkoutsIcon }, // Placeholder navigation
  { name: 'Friends', icon: FriendsIcon },   // Placeholder navigation
  { name: 'Menu', icon: MenuIcon },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({ onTabPress, currentActiveScreen }) => {
  const theme = Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: theme.bottomNavBackground }]}>
      {tabs.map((tab) => {
        const isActive = currentActiveScreen === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <tab.icon active={isActive} />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? theme.bottomNavActive : theme.bottomNavInactive, fontFamily: theme.bodyFont },
                isActive && styles.activeTabLabel
              ]}
            >
              {/* Display name might need adjustment if ScreenName is different from desired label */}
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 65,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.inputBorder,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
  },
  activeTabLabel: {
    fontWeight: 'bold',
  },
});

export default BottomTabBar;
