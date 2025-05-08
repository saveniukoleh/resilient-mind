import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthUser } from '@/services/auth';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '@/services/auth';
import {
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  createUserProfile,
  updateProfilePicture,
  deleteProfilePicture,
  updateEmergencyContact,
  updateUserPreferences,
} from '@/services/userProfile';

export const useUserStore = defineStore('user', () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Computed properties for role-based access
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isTherapist = computed(() => user.value?.role === 'therapist');
  const isUser = computed(() => user.value?.role === 'user');

  const initialize = async () => {
    try {
      loading.value = true;
      const authUser = await getCurrentUser();
      if (authUser) {
        const profile = await getUserProfile(authUser.uid);
        if (profile) {
          user.value = profile;
        } else {
          // Create new profile if it doesn't exist
          await createUserProfile(authUser);
          user.value = authUser;
        }
      }
    } catch (err) {
      error.value = 'Failed to initialize user session';
      console.error('User initialization error:', err);
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      loading.value = true;
      error.value = null;
      const authUser = await loginUser(email, password);
      const profile = await getUserProfile(authUser.uid);
      user.value = profile || authUser;
      return true;
    } catch (err) {
      error.value = 'Invalid email or password';
      console.error('Login error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      loading.value = true;
      error.value = null;
      const authUser = await registerUser(email, password);
      await createUserProfile(authUser);
      user.value = authUser;
      return true;
    } catch (err) {
      error.value = 'Failed to create account';
      console.error('Registration error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;
      await logoutUser();
      user.value = null;
      return true;
    } catch (err) {
      error.value = 'Failed to logout';
      console.error('Logout error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser['profile']>) => {
    if (!user.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await updateUserProfile(user.value.uid, updates);
      user.value = {
        ...user.value,
        profile: { ...user.value.profile, ...updates },
      };
      return true;
    } catch (err) {
      error.value = 'Failed to update profile';
      console.error('Profile update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateRole = async (role: AuthUser['role']) => {
    if (!user.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await updateUserRole(user.value.uid, role);
      user.value = { ...user.value, role };
      return true;
    } catch (err) {
      error.value = 'Failed to update role';
      console.error('Role update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateProfilePicture = async (file: File) => {
    if (!user.value) return false;
    try {
      loading.value = true;
      error.value = null;
      const downloadURL = await updateProfilePicture(user.value.uid, file);
      user.value = {
        ...user.value,
        profile: {
          ...user.value.profile,
          profilePicture: downloadURL,
        },
      };
      return true;
    } catch (err) {
      error.value = 'Failed to update profile picture';
      console.error('Profile picture update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const removeProfilePicture = async () => {
    if (!user.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await deleteProfilePicture(user.value.uid);
      user.value = {
        ...user.value,
        profile: {
          ...user.value.profile,
          profilePicture: undefined,
        },
      };
      return true;
    } catch (err) {
      error.value = 'Failed to remove profile picture';
      console.error('Profile picture removal error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateEmergencyContactInfo = async (contact: AuthUser['profile']['emergencyContact']) => {
    if (!user.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await updateEmergencyContact(user.value.uid, contact);
      user.value = {
        ...user.value,
        profile: {
          ...user.value.profile,
          emergencyContact: contact,
        },
      };
      return true;
    } catch (err) {
      error.value = 'Failed to update emergency contact';
      console.error('Emergency contact update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updatePreferences = async (preferences: AuthUser['profile']['preferences']) => {
    if (!user.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await updateUserPreferences(user.value.uid, preferences);
      user.value = {
        ...user.value,
        profile: {
          ...user.value.profile,
          preferences,
        },
      };
      return true;
    } catch (err) {
      error.value = 'Failed to update preferences';
      console.error('Preferences update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    isAdmin,
    isTherapist,
    isUser,
    initialize,
    login,
    register,
    logout,
    updateProfile,
    updateRole,
    updateProfilePicture,
    removeProfilePicture,
    updateEmergencyContactInfo,
    updatePreferences,
  };
});
