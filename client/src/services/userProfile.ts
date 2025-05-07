import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { AuthUser } from './auth';
import { uploadProfilePicture, deleteProfilePicture } from './storage';

export const getUserProfile = async (uid: string): Promise<AuthUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as AuthUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<AuthUser['profile']>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      profile: updates,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserRole = async (uid: string, role: AuthUser['role']): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const createUserProfile = async (user: AuthUser): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', user.uid), user);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateProfilePicture = async (uid: string, file: File): Promise<string> => {
  try {
    // Upload the new profile picture
    const downloadURL = await uploadProfilePicture(file, uid);

    // Update the user profile with the new picture URL
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'profile.profilePicture': downloadURL,
    });

    return downloadURL;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};

export const deleteProfilePicture = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'profile.profilePicture': null,
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};

export const updateEmergencyContact = async (
  uid: string,
  emergencyContact: AuthUser['profile']['emergencyContact']
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'profile.emergencyContact': emergencyContact,
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
};

export const updateUserPreferences = async (
  uid: string,
  preferences: AuthUser['profile']['preferences']
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'profile.preferences': preferences,
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};
