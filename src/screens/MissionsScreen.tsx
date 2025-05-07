// src/screens/MissionsScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useUserData } from '@nhost/react';
import Colors from '../constants/Colors';
import MissionItem from './HomeScreen/MissionItem'; // Re-use the MissionItem component
import { ScreenName } from '../../App'; // For navigation type safety if needed

// --- GraphQL Operations ---
// Fetch all active (non-completed) missions for the user, ordered by due date
const GET_ALL_ACTIVE_MISSIONS = gql`
  query GetAllActiveMissions($userId: uuid!, $currentDate: date!) {
    daily_missions: missions(
      where: {
        user_id: { _eq: $userId },
        type: { _eq: DAILY },
        is_completed: { _eq: false },
        due_at: { _gte: $currentDate }
      }
      order_by: { due_at: asc, created_at: asc }
      limit: 10 # Example limit
    ) { id title xp_reward is_completed type description due_at }
    weekly_missions: missions(
      where: {
        user_id: { _eq: $userId },
        type: { _eq: WEEKLY },
        is_completed: { _eq: false },
        due_at: { _gte: $currentDate }
      }
      order_by: { due_at: asc, created_at: asc }
      limit: 10
    ) { id title xp_reward is_completed type description due_at }
    seasonal_missions: missions(
      where: {
        user_id: { _eq: $userId },
        type: { _eq: SEASONAL },
        is_completed: { _eq: false },
        due_at: { _gte: $currentDate }
      }
      order_by: { due_at: asc, created_at: asc }
      limit: 5
    ) { id title xp_reward is_completed type description due_at }
  }
`;

// Re-use COMPLETE_MISSION from HomeScreen or define it here if preferred
const COMPLETE_MISSION = gql`
  mutation CompleteUserMission($missionId: uuid!, $userId: uuid!) {
    update_missions(
      where: {id: {_eq: $missionId}, user_id: {_eq: $userId}},
      _set: {is_completed: true, completed_at: "now()"}
    ) {
      affected_rows
      returning { id is_completed }
    }
  }
`;
// --- End GraphQL Operations ---

interface MissionsScreenProps {
  navigateTo: (screen: ScreenName, params?: any) => void; // For potential navigation from this screen
  // currentActiveScreen: ScreenName; // May not be needed if this screen doesn't host the tab bar
}

const MissionsScreen: React.FC<MissionsScreenProps> = ({ navigateTo }) => {
  const theme = Colors.dark;
  const nHostUserData = useUserData();
  const userId = nHostUserData?.id;

  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

  const { data, loading, error, refetch } = useQuery(GET_ALL_ACTIVE_MISSIONS, {
    variables: { userId, currentDate: todayDateString },
    skip: !userId,
  });

  const [completeMission, { loading: completingMission }] = useMutation(COMPLETE_MISSION, {
    onCompleted: () => {
      refetch(); // Refetch all missions
      // Consider refetching user stats if XP/level changes are significant for this screen
    },
    onError: (err) => Alert.alert("Error", `Failed to complete mission: ${err.message}`),
  });

  const handleCompleteMission = (missionId: string) => {
    if (!userId || completingMission) return;
    completeMission({ variables: { missionId, userId } });
  };

  const renderMissionList = (missionsToList: any[] | undefined, listTitle: string) => {
    if (!missionsToList || missionsToList.length === 0) {
      return (
        <View style={styles.missionGroup}>
          <Text style={[styles.listTitle, { color: theme.missionTitleHeader, fontFamily: theme.headerFont }]}>{listTitle}</Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', fontFamily: theme.bodyFont, paddingVertical: 15 }}>
            No active {listTitle.split(' ')[0].toLowerCase()} missions.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.missionGroup}>
        <Text style={[styles.listTitle, { color: theme.missionTitleHeader, fontFamily: theme.headerFont }]}>{listTitle}</Text>
        {missionsToList.map(mission => (
          <MissionItem
            key={mission.id}
            icon={'🎯'} // Generic or type-based
            title={mission.title}
            xpReward={mission.xp_reward}
            isCompleted={mission.is_completed}
            onPress={() => !mission.is_completed && handleCompleteMission(mission.id)}
            // description={mission.description} // You can add this to MissionItem props
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10, fontFamily: theme.bodyFont }}>Loading Missions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: 'red', fontFamily: theme.bodyFont }}>Error loading missions.</Text>
        <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 10 }}>
          <Text style={{ color: theme.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.screenTitle, { color: theme.text, fontFamily: theme.headerFont }]}>Active Quests</Text>
        {renderMissionList(data?.daily_missions, "Daily Objectives")}
        {renderMissionList(data?.weekly_missions, "Weekly Challenges")}
        {renderMissionList(data?.seasonal_missions, "Seasonal Trials")}
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
    paddingTop: Platform.OS === 'android' ? 30 : 40,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  missionGroup: {
    marginBottom: 25,
    backgroundColor: Colors.dark.secondaryBackground, // Card-like background for each group
    borderRadius: 12,
    padding: 15,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MissionsScreen;
