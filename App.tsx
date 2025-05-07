// App.tsx
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Text, Alert } from 'react-native';
import { NhostProvider, useAuthenticationStatus } from '@nhost/react'; // useNhostClient not needed for Apollo here
import { ApolloProvider } from '@apollo/client';
import { nhost } from './src/utils/nhost'; // Your Nhost client for NhostProvider
import apolloClient from './src/utils/apollo'; // Your dedicated Apollo Client
import Colors from './src/constants/Colors';

// Import Screens
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import MenuScreen from './src/screens/MenuScreen';
import CharacterProfileScreen from './src/screens/MenuScreen/CharacterProfileScreen';
import SettingsScreen from './src/screens/MenuScreen/SettingsScreen';
import ChangePasswordScreen from './src/screens/MenuScreen/ChangePasswordScreen';
import MissionsScreen from './src/screens/MissionsScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import LogWorkoutScreen from './src/screens/LogWorkoutScreen';
import FriendsScreen from './src/screens/FriendsScreen';

// Define screen names for navigation state
export type ScreenName =
  | 'SignIn' | 'SignUp' | 'ForgotPassword'
  | 'Home' | 'Missions' | 'Workouts' | 'Friends' | 'Menu'
  | 'CharacterProfile' | 'Settings' | 'ChangePassword' | 'LogWorkout'
  | 'Loading';

const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Loading');
  const [previousScreen, setPreviousScreen] = useState<ScreenName | null>(null);

  const { isLoading, isAuthenticated } = useAuthenticationStatus();

  useEffect(() => {
    console.log(`Auth state changed: isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, currentScreen: ${currentScreen}`);
    if (isLoading) {
      if (currentScreen !== 'Loading') {
        console.log("Transitioning to Loading screen");
        setCurrentScreen('Loading');
      }
    } else { // Not loading
      if (isAuthenticated) {
        const unauthOrLoadingScreens: ScreenName[] = ['SignIn', 'SignUp', 'ForgotPassword', 'Loading'];
        if (unauthOrLoadingScreens.includes(currentScreen)) {
          console.log(`User authenticated, on ${currentScreen}. Navigating to Home.`);
          setCurrentScreen('Home');
        }
        // If already on an authenticated screen (Home, Menu, etc.), do nothing.
      } else { // Not authenticated
        const authRequiredScreens: ScreenName[] = ['Home', 'Missions', 'Workouts', 'Friends', 'Menu', 'CharacterProfile', 'Settings', 'ChangePassword', 'LogWorkout'];
        if (authRequiredScreens.includes(currentScreen)) {
          console.log(`User not authenticated, on ${currentScreen}. Navigating to SignIn.`);
          setCurrentScreen('SignIn');
        }
        // If already on SignIn, SignUp, ForgotPassword, do nothing.
      }
    }
  }, [isLoading, isAuthenticated, currentScreen]); // currentScreen is needed if logic depends on it.

  const navigateTo = (screen: ScreenName, params?: any) => {
    if (screen !== currentScreen) {
        console.log(`Navigating from ${currentScreen} to ${screen}`);
        setPreviousScreen(currentScreen);
        setCurrentScreen(screen);
    } else {
        console.log(`Already on screen ${screen}, no navigation.`);
    }
  };

  const goBack = () => {
    console.log(`goBack called. Current: ${currentScreen}, Previous: ${previousScreen}`);
    if (previousScreen && previousScreen !== currentScreen) {
      navigateTo(previousScreen); // Use navigateTo to correctly set previousScreen for further backs
      setPreviousScreen(null); // previousScreen is now currentScreen's previous
    } else if (isAuthenticated) {
      if (currentScreen !== 'Home') navigateTo('Home');
    } else {
      if (currentScreen !== 'SignIn') navigateTo('SignIn');
    }
  };

  const handleDeleteAccountRequest = () => {
    Alert.alert(
        "Delete Account Confirmation",
        "Are you sure you want to request account deletion? This action, once processed, cannot be undone. You will be signed out.",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Request Deletion",
                style: "destructive",
                onPress: async () => {
                    Alert.alert(
                        "Deletion Requested",
                        "Your account deletion request has been submitted. You will now be signed out."
                    );
                    console.log("Account deletion requested for user:", nhost.auth.getUser()?.id);
                    await nhost.auth.signOut();
                }
            }
        ]
    );
  };

  const renderScreen = () => {
    const screensWithTabBar: ScreenName[] = ['Home', 'Missions', 'Workouts', 'Friends'];
    if (screensWithTabBar.includes(currentScreen)) {
        switch(currentScreen) {
            case 'Home':
                return <HomeScreen navigateTo={navigateTo} currentActiveScreen={currentScreen} />;
            case 'Missions':
                return <MissionsScreen navigateTo={navigateTo} />;
            case 'Workouts':
                return <WorkoutsScreen navigateTo={navigateTo} />;
            case 'Friends':
                return <FriendsScreen navigateTo={navigateTo} />;
            default:
                return <HomeScreen navigateTo={navigateTo} currentActiveScreen={'Home'} />;
        }
    }

    switch (currentScreen) {
      case 'Loading':
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.dark.primary} /><Text style={styles.loadingText}>Initializing...</Text></View>;
      case 'SignIn':
        return <SignInScreen onSignUpPress={() => navigateTo('SignUp')} onForgotPasswordPress={() => navigateTo('ForgotPassword')} onSignInSuccess={() => { /* useEffect handles nav */ }} />;
      case 'SignUp':
        return <SignUpScreen onSignInPress={() => navigateTo('SignIn')} onSignUpSuccess={() => navigateTo('SignIn')} />;
      case 'ForgotPassword':
        return <ForgotPasswordScreen onBackToSignInPress={() => navigateTo('SignIn')} />;
      case 'Menu':
        return <MenuScreen navigateToCharacterProfile={() => navigateTo('CharacterProfile')} navigateToSettings={() => navigateTo('Settings')} navigateToChangePassword={() => navigateTo('ChangePassword')} />;
      case 'CharacterProfile':
        return <CharacterProfileScreen onBack={goBack} />;
      case 'Settings':
        return <SettingsScreen onBack={goBack} onDeleteAccountRequest={handleDeleteAccountRequest} />;
      case 'ChangePassword':
        return <ChangePasswordScreen onBack={goBack} />;
      case 'LogWorkout':
        return <LogWorkoutScreen onBack={goBack} />;
      default:
        if (isAuthenticated) {
            console.warn("Unknown screen, defaulting to Home:", currentScreen);
            return <HomeScreen navigateTo={navigateTo} currentActiveScreen={'Home'} />;
        }
        console.warn("Unexpected screen state, defaulting to SignIn:", currentScreen);
        return <SignInScreen onSignUpPress={() => navigateTo('SignUp')} onForgotPasswordPress={() => navigateTo('ForgotPassword')} onSignInSuccess={() => {}} />;
    }
  };

  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.dark.background }]}>
        {renderScreen()}
        <StatusBar style="light" backgroundColor={Colors.dark.background} />
      </SafeAreaView>
    </ApolloProvider>
  );
};

export default function App() {
  return (
    <NhostProvider nhost={nhost}>
      <AppNavigator />
    </NhostProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background, },
  loadingText: { color: Colors.dark.text, marginTop: 10, fontFamily: Colors.dark.bodyFont }
});
