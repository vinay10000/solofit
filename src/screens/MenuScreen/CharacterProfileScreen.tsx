// src/screens/MenuScreen/CharacterProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useNhostClient, useUserData } from '@nhost/react';
import { useMutation, gql } from '@apollo/client'; // Import useMutation and gql
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
import StyledButton from '../../components/StyledButton';
import StyledTextInput from '../../components/StyledTextInput';

// Define a more specific type for the file response
interface NhostFileResponse {
  id: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

// Define the structure of the successful upload response based on error messages
interface NhostStorageUploadSuccessResponse {
  processedFiles: NhostFileResponse[];
}

interface NhostStorageUploadErrorResponse {
  error: { message: string };
  processedFiles?: null; // Or undefined
}

type NhostStorageUploadResponseType = NhostStorageUploadSuccessResponse | NhostStorageUploadErrorResponse;


// GraphQL Mutation to update user's displayName and avatarUrl (in metadata)
const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfile($userId: uuid!, $displayName: String, $avatarUrlInMetadata: String) {
    update_users_by_pk(
      pk_columns: { id: $userId },
      _set: {
        displayName: $displayName,
        # Nhost convention: avatarUrl is stored in the metadata.avatarUrl field
        # The useUserData() hook and Nhost's system will then reflect this as user.avatarUrl
        metadata: { avatarUrl: $avatarUrlInMetadata }
      }
    ) {
      id
      displayName
      avatarUrl # This should reflect the updated metadata.avatarUrl
      email   # Include other fields you might want to refetch or confirm
    }
  }
`;


interface CharacterProfileScreenProps {
  onBack: () => void;
}

const CharacterProfileScreen: React.FC<CharacterProfileScreenProps> = ({ onBack }) => {
  const theme = Colors.dark;
  const nhost = useNhostClient();
  const userData = useUserData(); // Provides live updates to user data

  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(userData?.avatarUrl || null);
  const [newImage, setNewImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');

  // Apollo Client mutation hook
  const [updateUserProfile, { loading: updatingProfile, error: updateProfileError }] = useMutation(UPDATE_USER_PROFILE_MUTATION);

  useEffect(() => {
    // Update local state when userData from Nhost hook changes
    setProfilePicUrl(userData?.avatarUrl || null);
    setDisplayName(userData?.displayName || '');
  }, [userData]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Access to photos is needed.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewImage(result.assets[0]);
      setProfilePicUrl(result.assets[0].uri); // Local preview
    }
  };

  const handleUploadAndSave = async () => {
    if (!userData?.id) {
        Alert.alert("Error", "User not identified. Please try again.");
        return;
    }

    const displayNameChanged = displayName !== (userData?.displayName || '');
    if (!newImage && !displayNameChanged) {
      Alert.alert("No Changes", "No new image or display name change.");
      return;
    }
    setIsLoading(true);

    try {
      let uploadedFileIdForAvatarMetadata: string | undefined = undefined;

      if (newImage && newImage.uri) {
        const formData = new FormData();
        formData.append('file', {
          uri: newImage.uri,
          type: newImage.mimeType || 'image/jpeg',
          name: newImage.fileName || `profile-${userData.id}-${Date.now()}.jpg`,
        } as any);

        const uploadResponse = await nhost.storage.upload({ formData }) as NhostStorageUploadResponseType;

        if ('error' in uploadResponse && uploadResponse.error) {
          throw uploadResponse.error;
        }
        if ('processedFiles' in uploadResponse && uploadResponse.processedFiles && uploadResponse.processedFiles.length > 0 && uploadResponse.processedFiles[0].id) {
          uploadedFileIdForAvatarMetadata = uploadResponse.processedFiles[0].id;
        } else {
          console.warn("Upload response structure unexpected or no files processed:", uploadResponse);
          throw new Error("File upload succeeded but no file ID was found.");
        }
      }

      // Prepare variables for the GraphQL mutation
      const mutationVariables: { userId: string; displayName?: string; avatarUrlInMetadata?: string } = {
        userId: userData.id,
      };

      if (displayNameChanged) {
        mutationVariables.displayName = displayName;
      }
      // If a new image was uploaded, use its ID for avatarUrlInMetadata.
      // If no new image, but display name changed, we still might want to send current avatarUrl
      // or let the mutation handle partial updates (if avatarUrlInMetadata is undefined, it won't be set).
      if (uploadedFileIdForAvatarMetadata) {
        mutationVariables.avatarUrlInMetadata = uploadedFileIdForAvatarMetadata;
      } else if (displayNameChanged && userData.avatarUrl) {
        // If only display name changed, keep existing avatarUrl.
        // The mutation structure expects avatarUrlInMetadata to be the file ID.
        // Nhost's user.avatarUrl is derived from metadata.avatarUrl.
        // So, if we are not changing the avatar, we don't need to pass this field
        // unless the mutation requires it. For _set, undefined fields are usually ignored.
      }


      if (Object.keys(mutationVariables).length > 1) { // Check if there's more than just userId
        await updateUserProfile({ variables: mutationVariables });
        // The useUserData() hook should automatically reflect changes after mutation,
        // as Apollo Client cache updates or Nhost syncs.
        // If not, you might need to manually refetch user data or update Apollo cache.
      }

      setNewImage(null); // Clear new image selection
      Alert.alert("Success", "Profile updated successfully!");

    } catch (error: any) {
      console.error("Profile Update Error:", error, error.message, error.stack);
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{flex:1, backgroundColor: theme.background}} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonTouchable} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={styles.backButtonView}><Text style={{color: theme.primary, fontFamily: theme.bodyFont, fontSize: 16}}>‹</Text><Text style={{color: theme.primary, fontFamily: theme.bodyFont, fontSize: 16, marginLeft: 5}}>Back</Text></View>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, fontFamily: theme.headerFont }]}>Character Profile</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {profilePicUrl ? <Image source={{ uri: profilePicUrl }} style={styles.profileImage} /> : <Image source={require('../../../assets/default_profile.png')} style={styles.profileImage} />}
          <View style={styles.editIconOverlay}><Text style={styles.editIcon}>✏️</Text></View>
        </TouchableOpacity>
        <Text style={[styles.label, {color: theme.textSecondary}]}>Display Name:</Text>
        <StyledTextInput value={displayName} onChangeText={setDisplayName} placeholder="Enter your display name" style={styles.textInputContainer} />
        {isLoading || updatingProfile ? <ActivityIndicator size="large" color={theme.primary} style={styles.loader} /> : <StyledButton title="Save Profile" onPress={handleUploadAndSave} variant="primary" style={styles.saveButton} textStyle={{fontFamily: theme.bodyFont, fontWeight: 'bold'}} />}
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, marginTop: 50, textAlign: 'center', },
  imagePicker: { marginBottom: 25, borderRadius: 75, borderWidth: 3, borderColor: Colors.dark.primary, width: 150, height: 150, justifyContent: 'center', alignItems: 'center', position: 'relative', backgroundColor: Colors.dark.secondaryBackground, },
  profileImage: { width: '100%', height: '100%', borderRadius: 72, },
  editIconOverlay: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 15, },
  editIcon: { fontSize: 16, color: '#fff', },
  label: { fontSize: 14, alignSelf: 'flex-start', marginLeft: '5%', marginBottom: 8, fontFamily: Colors.dark.bodyFont, },
  textInputContainer: { width: '90%', marginBottom: 25, },
  saveButton: { width: '90%', marginTop: 15, },
  loader: { marginTop: 20, }
});

export default CharacterProfileScreen;
