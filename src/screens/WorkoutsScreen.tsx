// src/screens/WorkoutsScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useQuery, gql } from '@apollo/client';
import { useUserData } from '@nhost/react';
import Colors from '../constants/Colors';
import StyledButton from '../components/StyledButton';
import { ScreenName } from '../../App'; // For navigation

// --- GraphQL Operations ---
const GET_USER_WORKOUTS = gql`
  query GetUserWorkouts($userId: uuid!, $limit: Int = 20, $offset: Int = 0) {
    workouts(
      where: { user_id: { _eq: $userId } }
      order_by: { started_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      workout_name
      category
      started_at
      duration_minutes
      calories_burned
      notes
    }
  }
`;
// --- End GraphQL Operations ---

interface WorkoutsScreenProps {
  navigateTo: (screen: ScreenName, params?: any) => void;
}

const WorkoutItem: React.FC<{item: any}> = ({ item }) => {
    const theme = Colors.dark;
    return (
        <View style={[styles.workoutItem, {backgroundColor: theme.secondaryBackground}]}>
            <Text style={[styles.workoutName, {color: theme.text, fontFamily: theme.headerFont}]}>{item.workout_name || `Workout on ${new Date(item.started_at).toLocaleDateString()}`}</Text>
            <Text style={[styles.workoutDetail, {color: theme.textSecondary, fontFamily: theme.bodyFont}]}>
                Category: {item.category || 'N/A'}
            </Text>
            <Text style={[styles.workoutDetail, {color: theme.textSecondary, fontFamily: theme.bodyFont}]}>
                Date: {new Date(item.started_at).toLocaleString()}
            </Text>
            <Text style={[styles.workoutDetail, {color: theme.textSecondary, fontFamily: theme.bodyFont}]}>
                Duration: {item.duration_minutes} mins
            </Text>
            {item.calories_burned && (
                <Text style={[styles.workoutDetail, {color: theme.textSecondary, fontFamily: theme.bodyFont}]}>
                    Calories: {item.calories_burned} kcal
                </Text>
            )}
            {item.notes && (
                <Text style={[styles.workoutNotes, {color: theme.textSecondary, fontFamily: theme.bodyFont}]}>
                    Notes: {item.notes}
                </Text>
            )}
        </View>
    );
};


const WorkoutsScreen: React.FC<WorkoutsScreenProps> = ({ navigateTo }) => {
  const theme = Colors.dark;
  const nHostUserData = useUserData();
  const userId = nHostUserData?.id;

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_USER_WORKOUTS, {
    variables: { userId, limit: 15 }, // Initial limit
    skip: !userId,
    notifyOnNetworkStatusChange: true, // Important for fetchMore
  });

  const workouts = data?.workouts || [];

  const handleLoadMore = () => {
    if (workouts.length === 0 || loading) return; // Don't fetch if no initial items or already loading
    fetchMore({
      variables: {
        offset: workouts.length
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          workouts: [...prev.workouts, ...fetchMoreResult.workouts],
        });
      }
    });
  };


  if (loading && workouts.length === 0) { // Show full screen loader only on initial load
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10, fontFamily: theme.bodyFont }}>Loading Workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: 'red', fontFamily: theme.bodyFont }}>Error loading workouts.</Text>
         <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 10 }}>
          <Text style={{ color: theme.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.fullScreenContainer, {backgroundColor: theme.background}]}>
        <View style={styles.headerContainer}>
            <Text style={[styles.screenTitle, { color: theme.text, fontFamily: theme.headerFont }]}>Workout Log</Text>
            <StyledButton
                title="+ Log New Workout"
                onPress={() => navigateTo('LogWorkout')} // Ensure 'LogWorkout' is a ScreenName
                variant="primary"
                style={styles.logNewButton}
                textStyle={{fontSize: 14, fontWeight: 'bold'}}
            />
        </View>
        {workouts.length === 0 && !loading ? (
            <View style={styles.emptyStateContainer}>
                <Text style={[styles.emptyStateText, {color: theme.textSecondary, fontFamily: theme.bodyFont}]}>No workouts logged yet. Get started!</Text>
            </View>
        ) : (
            <FlatList
                data={workouts}
                renderItem={({item}) => <WorkoutItem item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContentContainer}
                onEndReached={handleLoadMore} // For infinite scroll
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading && workouts.length > 0 ? <ActivityIndicator color={theme.primary} style={{marginVertical: 20}} /> : null}
            />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 30 : 40,
    paddingHorizontal: 15,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.inputBorder,
  },
  screenTitle: { fontSize: 24, fontWeight: 'bold', },
  logNewButton: { paddingVertical: 8, paddingHorizontal: 12, width: 'auto' /* Override StyledButton default width */ },
  listContentContainer: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 20, },
  workoutItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, },
  workoutDetail: { fontSize: 14, marginBottom: 3, },
  workoutNotes: { fontSize: 13, fontStyle: 'italic', marginTop: 5, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
  emptyStateText: { fontSize: 16, textAlign: 'center', }
});

export default WorkoutsScreen;
