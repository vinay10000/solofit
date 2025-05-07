// src/screens/LogWorkoutScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useMutation, gql } from '@apollo/client';
import { useUserData } from '@nhost/react';
import Colors from '../constants/Colors';
import StyledTextInput from '../components/StyledTextInput';
import StyledButton from '../components/StyledButton';

const LOG_WORKOUT = gql`
  mutation LogWorkout(
    $userId: uuid!,
    $workoutName: String,
    $category: String = "CUSTOM",
    $durationMinutes: Int!,
    $caloriesBurned: Int, # This is nullable Int
    $notes: String,
    $startedAt: timestamptz = "now()"
  ) {
    insert_workouts_one(object: {
      user_id: $userId,
      workout_name: $workoutName,
      category: $category,
      duration_minutes: $durationMinutes,
      calories_burned: $caloriesBurned,
      notes: $notes,
      started_at: $startedAt
    }) {
      id
    }
  }
`;

interface LogWorkoutScreenProps {
  onBack: () => void;
}

const LogWorkoutScreen: React.FC<LogWorkoutScreenProps> = ({ onBack }) => {
  const theme = Colors.dark;
  const nHostUserData = useUserData();
  const userId = nHostUserData?.id;

  const [workoutName, setWorkoutName] = useState('');
  const [category, setCategory] = useState('CUSTOM');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  const [logWorkout, { loading, error }] = useMutation(LOG_WORKOUT, {
    onCompleted: () => {
      Alert.alert("Success", "Workout logged successfully!");
      onBack();
    },
    onError: (err) => {
      Alert.alert("Error", `Failed to log workout: ${err.message}`);
    }
  });

  const handleLogWorkout = () => {
    if (!userId) {
      Alert.alert("Error", "User not identified.");
      return;
    }
    const durationMinutes = parseInt(duration, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid duration in minutes.");
      return;
    }

    let caloriesBurnedValue: number | null = null; // Initialize as null
    if (calories) {
        const parsedCalories = parseInt(calories, 10);
        if (isNaN(parsedCalories) || parsedCalories < 0) {
            Alert.alert("Invalid Input", "Please enter valid calories burned or leave blank.");
            return;
        }
        caloriesBurnedValue = parsedCalories;
    }

    logWorkout({
      variables: {
        userId,
        workoutName: workoutName || null,
        category: category || 'CUSTOM',
        durationMinutes,
        caloriesBurned: caloriesBurnedValue, // Pass null if not set or invalid
        notes: notes || null,
      }
    });
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
        <Text style={[styles.title, { color: theme.text, fontFamily: theme.headerFont }]}>Log New Workout</Text>

        <StyledTextInput
            label="Workout Name (Optional)"
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="e.g., Morning Run, Chest Day"
            style={styles.inputContainer}
        />
        <StyledTextInput
            label="Category (Optional)"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., CARDIO, STRENGTH, CUSTOM"
            style={styles.inputContainer}
        />
        <StyledTextInput
            label="Duration (minutes)*"
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g., 30"
            keyboardType="number-pad"
            style={styles.inputContainer}
        />
        <StyledTextInput
            label="Calories Burned (Optional)"
            value={calories}
            onChangeText={setCalories}
            placeholder="e.g., 350"
            keyboardType="number-pad"
            style={styles.inputContainer}
        />
        <StyledTextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it feel? Any PRs?"
            multiline
            numberOfLines={3}
            style={[styles.inputContainer, {minHeight: 80}]} // Use minHeight for multiline
            // inputStyle={{height: 70, textAlignVertical: 'top'}} // If StyledTextInput allows inner style
        />

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{marginTop: 20}}/>
        ) : (
          <StyledButton
            title="Log Workout"
            onPress={handleLogWorkout}
            variant="primary"
            style={{width: '90%', marginTop: 25}}
            textStyle={{fontFamily: theme.bodyFont, fontWeight: 'bold'}}
          />
        )}
         {error && <Text style={styles.errorText}>Error logging workout: {error.message}</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContentContainer:{ flexGrow: 1, },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 30, paddingBottom: 30, },
  backButtonTouchable: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 15, zIndex: 10, padding: 10, },
  backButtonView: { flexDirection: 'row', alignItems: 'center', },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, marginTop: 50, textAlign: 'center', },
  inputContainer: { width: '90%', marginBottom: 18, },
  errorText: { color: 'red', marginTop: 10, fontFamily: Colors.dark.bodyFont, textAlign: 'center' },
});

export default LogWorkoutScreen;
