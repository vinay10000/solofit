// src/screens/HomeScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSignOut, useUserData } from '@nhost/react';
import { useQuery, useMutation, gql, ApolloError } from '@apollo/client';
import Colors from '../constants/Colors';
import { ScreenName } from '../../App';

import ProfileSection from './HomeScreen/ProfileSection';
import StatCard from './HomeScreen/StatCard';
import MissionItem from './HomeScreen/MissionItem';
import BottomTabBar from './HomeScreen/BottomTabBar';

// --- GraphQL Operations ---
const GET_USER_STATS_BY_USER_ID = gql`
  query GetUserStatsByUserId($userId: uuid!) {
    user_stats(where: {user_id: {_eq: $userId}}, limit: 1) { id level xp fitness_rank total_workouts_completed total_calories_burned }
  }
`;

interface Mission { id: string; title: string; xp_reward: number; is_completed: boolean; type?: string; description?: string; due_at?: string; }

// MODIFIED: $currentDate is now timestamptz!
const GET_MISSIONS_BY_TYPE = gql`
  query GetMissionsByType($userId: uuid!, $missionType: mission_type_enum!, $limit: Int!, $currentDateStartOfDay: timestamptz!) {
    missions(
      where: {
        user_id: { _eq: $userId },
        type: { _eq: $missionType },
        is_completed: { _eq: false },
        due_at: { _gte: $currentDateStartOfDay } # Compare timestamptz with timestamptz
      }
      order_by: { due_at: asc, created_at: asc },
      limit: $limit
    ) { id title xp_reward is_completed type description due_at }
  }
`;

const GET_CURRENT_WEEK_WORKOUT_SUMMARY = gql`
  query GetCurrentWeekWorkoutSummary($userId: uuid!, $current_week_start_utc: timestamptz!) {
    weekly_workout_summary( where: { user_id: { _eq: $userId }, week_start_date_utc: { _eq: $current_week_start_utc } }, limit: 1 ) { total_workouts }
  }
`;

const GET_CALORIES_BURNED_TODAY = gql`
  query GetCaloriesBurnedToday($userId: uuid!, $today_start: timestamptz!, $today_end: timestamptz!) {
    workouts_aggregate( where: { user_id: {_eq: $userId}, started_at: {_gte: $today_start, _lt: $today_end} } ) { aggregate { sum { calories_burned } } }
  }
`;

const CREATE_USER_STATS = gql`
  mutation CreateUserStats($userId: uuid!) {
    insert_user_stats_one( object: { user_id: $userId, level: 1, xp: 0, fitness_rank: E_RANK }, on_conflict: { constraint: user_stats_user_id_key, update_columns: [] } ) { id user_id level xp fitness_rank }
  }
`;

const COMPLETE_MISSION = gql`
  mutation CompleteUserMission($missionId: uuid!, $userId: uuid!) {
    update_missions( where: {id: {_eq: $missionId}, user_id: {_eq: $userId}}, _set: {is_completed: true, completed_at: "now()"} ) { affected_rows returning { id is_completed } }
  }
`;
// --- End GraphQL Operations ---

const GenerateWorkoutIcon = () => <Text style={{color: Colors.dark.primary, fontSize: 20, marginRight: 8}}>⚙️</Text>;

interface HomeScreenProps { navigateTo: (screen: ScreenName) => void; currentActiveScreen: ScreenName; }

const HomeScreen: React.FC<HomeScreenProps> = ({ navigateTo, currentActiveScreen }) => {
  const { signOut } = useSignOut();
  const nHostUserData = useUserData();
  const theme = Colors.dark;
  const userId = nHostUserData?.id;

  const [createUserStatsAttempted, setCreateUserStatsAttempted] = useState(false);

  useEffect(() => { if (!userId) setCreateUserStatsAttempted(false); }, [userId]);

  const [createUserStats, { loading: creatingUserStats, error: createUserStatsMutationError }] = useMutation(CREATE_USER_STATS);
  const { data: userStatsData, loading: userStatsQueryLoading, error: userStatsQueryError, refetch: refetchUserStats } = useQuery(GET_USER_STATS_BY_USER_ID, { variables: { userId }, skip: !userId, notifyOnNetworkStatusChange: true });

  // Date calculations
  // today_start will be used for $currentDateStartOfDay
  const today_start = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), []);
  const today_end = useMemo(() => new Date(new Date().setHours(23, 59, 59, 999)).toISOString(), []);

  const today = new Date(); // Keep for other date logic if needed
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const current_week_start_utc = useMemo(() => { const monday = new Date(); monday.setDate(monday.getDate() + diffToMonday); monday.setUTCHours(0,0,0,0); return monday.toISOString(); }, [diffToMonday]);

  useEffect(() => {
    const noStatsFound = userStatsData && userStatsData.user_stats && userStatsData.user_stats.length === 0;
    const shouldAttemptCreate = userId && !userStatsQueryLoading && !creatingUserStats && !createUserStatsAttempted && (userStatsQueryError || noStatsFound);
    if (shouldAttemptCreate) {
      console.log("HomeScreen: Attempting to create user stats for user:", userId);
      setCreateUserStatsAttempted(true);
      createUserStats({ variables: { userId } })
        .then(response => { if (response.data?.insert_user_stats_one?.id || !response.errors) refetchUserStats(); if (response.errors) console.error("HomeScreen: GraphQL errors during createUserStats:", response.errors); })
        .catch(err => console.error("HomeScreen: Network/other error creating user stats:", err.message));
    }
    if (createUserStatsMutationError) console.error("HomeScreen: createUserStats useMutation hook error:", createUserStatsMutationError.message);
  }, [ userId, userStatsData, userStatsQueryLoading, userStatsQueryError, creatingUserStats, createUserStats, refetchUserStats, createUserStatsMutationError, createUserStatsAttempted ]);

  const userStatsReady = !!userStatsData?.user_stats?.length && !userStatsQueryError;
  const skipSecondaryQueries = !userId || !userStatsReady;

  useEffect(() => {
      if (!skipSecondaryQueries) {
          console.log("Variables for missions (using today_start as currentDateStartOfDay):", { userId, currentDateStartOfDay: today_start });
      }
  }, [userId, skipSecondaryQueries, today_start]);

  const { data: dailyMissionsData, loading: dailyMissionsLoading, error: dailyMissionsError, refetch: refetchDailyMissions } = useQuery<{ missions: Mission[] }>(GET_MISSIONS_BY_TYPE, { variables: { userId, missionType: 'DAILY', limit: 4, currentDateStartOfDay: today_start }, skip: skipSecondaryQueries });
  const { data: weeklyMissionsData, loading: weeklyMissionsLoading, error: weeklyMissionsError, refetch: refetchWeeklyMissions } = useQuery<{ missions: Mission[] }>(GET_MISSIONS_BY_TYPE, { variables: { userId, missionType: 'WEEKLY', limit: 8, currentDateStartOfDay: today_start }, skip: skipSecondaryQueries });
  const { data: seasonalMissionsData, loading: seasonalMissionsLoading, error: seasonalMissionsError, refetch: refetchSeasonalMissions } = useQuery<{ missions: Mission[] }>(GET_MISSIONS_BY_TYPE, { variables: { userId, missionType: 'SEASONAL', limit: 3, currentDateStartOfDay: today_start }, skip: skipSecondaryQueries });
  
  const { data: weeklySummaryData, loading: weeklySummaryLoading, error: weeklySummaryError } = useQuery(GET_CURRENT_WEEK_WORKOUT_SUMMARY, { variables: { userId, current_week_start_utc }, skip: skipSecondaryQueries });
  const { data: caloriesTodayData, loading: caloriesTodayLoading, error: caloriesTodayError } = useQuery(GET_CALORIES_BURNED_TODAY, { variables: { userId, today_start, today_end }, skip: skipSecondaryQueries });

  const [completeMission, { loading: completingMission }] = useMutation(COMPLETE_MISSION, { onCompleted: () => { refetchDailyMissions(); refetchWeeklyMissions(); refetchSeasonalMissions(); refetchUserStats(); }, onError: (error) => Alert.alert("Error", `Failed to complete mission: ${error.message}`) });
  const handleCompleteMission = (missionId: string) => { if (!userId || completingMission) return; completeMission({ variables: { missionId, userId } }); };

  const isScreenLoading = !userId || userStatsQueryLoading || creatingUserStats;

  useEffect(() => {
    if (dailyMissionsError) console.error("Daily Missions Error:", JSON.stringify(dailyMissionsError, null, 2));
    if (weeklyMissionsError) console.error("Weekly Missions Error:", JSON.stringify(weeklyMissionsError, null, 2));
    if (seasonalMissionsError) console.error("Seasonal Missions Error:", JSON.stringify(seasonalMissionsError, null, 2));
  }, [dailyMissionsError, weeklyMissionsError, seasonalMissionsError]);

  if (isScreenLoading) { return <View style={[styles.fullScreenContainer, styles.centeredFlex]}><ActivityIndicator size="large" color={theme.primary} /><Text style={styles.loadingText}>Preparing Your Realm...</Text></View>; }
  if (userStatsQueryError && !userStatsReady && createUserStatsAttempted) { return <View style={[styles.fullScreenContainer, styles.centeredFlex]}><Text style={styles.errorText}>Failed to initialize your Monarch profile.</Text><TouchableOpacity onPress={() => {setCreateUserStatsAttempted(false); refetchUserStats();}} style={styles.retryButton}><Text style={{color: theme.primary}}>Retry Setup</Text></TouchableOpacity></View>; }
  if (!userStatsReady) { return <View style={[styles.fullScreenContainer, styles.centeredFlex]}><Text style={styles.errorText}>Could not load profile data.</Text><TouchableOpacity onPress={() => refetchUserStats()} style={styles.retryButton}><Text style={{color: theme.primary}}>Retry</Text></TouchableOpacity></View>; }

  const userStats = userStatsData?.user_stats?.[0];
  const dailyMissions: Mission[] = dailyMissionsData?.missions || [];
  const weeklyMissions: Mission[] = weeklyMissionsData?.missions || [];
  const seasonalMissions: Mission[] = seasonalMissionsData?.missions || [];
  const weeklyWorkouts = weeklySummaryData?.weekly_workout_summary?.[0]?.total_workouts || 0;
  const caloriesBurnedToday = caloriesTodayData?.workouts_aggregate?.aggregate?.sum?.calories_burned || 0;

  const statCardData = [
    { id: '1', icon: '⚔️', title: 'Daily Missions Done', valueMain: `${dailyMissionsLoading ? '...' : dailyMissions.filter((m: Mission) => m.is_completed).length} / ${dailyMissionsLoading ? '...' : dailyMissions.length}`, valueSub: 'Today' },
    { id: '2', icon: '🏋️', title: 'Workouts This Week', valueMain: `${weeklySummaryLoading ? '...' : weeklyWorkouts}`, valueSub: 'Sessions' },
    { id: '3', icon: '🔥', title: 'Calories Burned Today', valueMain: `${caloriesTodayLoading ? '...' : caloriesBurnedToday}`, valueSub: 'kcal' },
  ];

  const handleSignOut = async () => await signOut();
  const handleTabPress = (tabName: ScreenName) => navigateTo(tabName);

  const renderMissionList = (missionsToList: Mission[], listTitle: string, specificLoading: boolean, specificError?: ApolloError) => {
    const title = <Text style={[styles.missionsTitleHeader, { color: theme.missionTitleHeader, fontFamily: theme.headerFont }]}>{listTitle.toUpperCase()}</Text>;
    if (specificLoading && !isScreenLoading) { return <View style={styles.missionsSectionContainer}>{title}<ActivityIndicator color={theme.primary} /></View>; }
    if (specificError) { const errorMessage = specificError.graphQLErrors?.[0]?.message || specificError.networkError?.message || specificError.message || 'Unknown error'; console.error(`Error loading ${listTitle}:`, JSON.stringify(specificError, null, 2)); return <View style={styles.missionsSectionContainer}>{title}<Text style={styles.errorTextSmall}>Error loading {listTitle.toLowerCase()}: {errorMessage}</Text></View>; }
    if (missionsToList.length === 0 && !specificLoading) { return <View style={styles.missionsSectionContainer}>{title}<Text style={styles.noMissionsText}>No {listTitle.toLowerCase()} available.</Text></View>; }
    return ( <View style={styles.missionsSectionContainer}>{title}{missionsToList.map((mission: Mission) => ( <MissionItem key={mission.id} icon={'🎯'} title={mission.title} xpReward={mission.xp_reward} isCompleted={mission.is_completed} onPress={() => !mission.is_completed && !completingMission && handleCompleteMission(mission.id)} /> ))}</View> );
  };

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <ProfileSection nHostUser={nHostUserData} userStats={userStats} />
                <View style={styles.statsRowContainer}>{statCardData.map(stat => <StatCard key={stat.id} {...stat} />)}</View>
                {renderMissionList(dailyMissions, "Today's Daily Missions", dailyMissionsLoading, dailyMissionsError)}
                {renderMissionList(weeklyMissions, "This Week's Challenges", weeklyMissionsLoading, weeklyMissionsError)}
                {renderMissionList(seasonalMissions, "Seasonal Quests", seasonalMissionsLoading, seasonalMissionsError)}
                <TouchableOpacity style={[styles.generateWorkoutButton, { borderColor: theme.generateWorkoutButtonBorder, backgroundColor: theme.generateWorkoutButtonBackground }]} activeOpacity={0.8} onPress={() => Alert.alert("Coming Soon!", "AI Workout Generation is under development.")}><GenerateWorkoutIcon /><Text style={[styles.generateWorkoutButtonText, {color: theme.primary, fontFamily: theme.bodyFont}]}>GENERATE AI WORKOUT</Text></TouchableOpacity>
                <View style={styles.secondaryActionsContainer}><TouchableOpacity onPress={() => Alert.alert("Coming Soon!", "Start Workout feature.")}><Text style={[styles.secondaryActionText, {color: theme.secondaryActionButtonColor, fontFamily: theme.bodyFont}]}>Start Workout</Text></TouchableOpacity><TouchableOpacity onPress={() => Alert.alert("Coming Soon!", "Claim Rewards feature.")}><Text style={[styles.secondaryActionText, {color: theme.secondaryActionButtonColor, fontFamily: theme.bodyFont}]}>Claim Rewards</Text></TouchableOpacity></View>
                <TouchableOpacity onPress={handleSignOut} style={styles.tempSignOutButton}><Text style={{color: theme.textSecondary, fontFamily: theme.bodyFont}}>Sign Out (Temp)</Text></TouchableOpacity>
            </View>
        </ScrollView>
        <BottomTabBar onTabPress={handleTabPress} currentActiveScreen={currentActiveScreen} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, },
  centeredFlex: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollViewContent: { paddingBottom: 80, },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 30 : 40, },
  loadingText: {color: Colors.dark.text, marginTop: 10, fontFamily: Colors.dark.bodyFont},
  errorText: {color: 'red', fontFamily: Colors.dark.bodyFont, textAlign: 'center', paddingHorizontal: 20, fontSize: 16, lineHeight: 22 },
  errorTextSmall: {color: 'red', textAlign: 'center', fontFamily: Colors.dark.bodyFont, paddingVertical: 10, fontSize: 13},
  noMissionsText: {color: Colors.dark.textSecondary, textAlign: 'center', fontFamily: Colors.dark.bodyFont, paddingVertical: 10},
  retryButton: {marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: Colors.dark.secondaryBackground, borderRadius: 8},
  statsRowContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20, paddingHorizontal: 5, },
  missionsSectionContainer: { width: '100%', marginBottom: 20, paddingHorizontal: 5, },
  missionsTitleHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, letterSpacing: 0.5, },
  generateWorkoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '90%', paddingVertical: 15, borderRadius: 25, borderWidth: 2, marginBottom: 20, shadowColor: Colors.dark.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10, elevation: 12, },
  generateWorkoutButtonText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5, },
  secondaryActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom: 30, },
  secondaryActionText: { fontSize: 15, fontWeight: '600', },
  tempSignOutButton: { marginTop: 20, padding: 10, }
});

export default HomeScreen;
