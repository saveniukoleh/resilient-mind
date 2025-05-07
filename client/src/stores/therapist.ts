import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  TherapistProfile,
  TherapistSearchFilters,
  TherapistAvailability,
} from '@/types/therapist';
import {
  createTherapistProfile,
  getTherapistProfile,
  updateTherapistProfile,
  updateTherapistAvailability,
  searchTherapists,
  submitVerificationDocuments,
  addReview,
} from '@/services/therapist';

export const useTherapistStore = defineStore('therapist', () => {
  const currentTherapist = ref<TherapistProfile | null>(null);
  const searchResults = ref<TherapistProfile[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastSearchDoc = ref<any>(null);
  const hasMoreResults = ref(true);

  const isVerified = computed(() => currentTherapist.value?.verificationStatus === 'verified');
  const isPendingVerification = computed(
    () => currentTherapist.value?.verificationStatus === 'pending'
  );

  const initializeTherapistProfile = async (userId: string) => {
    try {
      loading.value = true;
      error.value = null;
      const profile = await getTherapistProfile(userId);
      if (profile) {
        currentTherapist.value = profile;
      }
    } catch (err) {
      error.value = 'Failed to load therapist profile';
      console.error('Therapist profile initialization error:', err);
    } finally {
      loading.value = false;
    }
  };

  const createProfile = async (
    userId: string,
    profile: Omit<
      TherapistProfile,
      'id' | 'userId' | 'rating' | 'totalSessions' | 'verificationStatus' | 'reviews'
    >
  ) => {
    try {
      loading.value = true;
      error.value = null;
      await createTherapistProfile(userId, profile);
      await initializeTherapistProfile(userId);
      return true;
    } catch (err) {
      error.value = 'Failed to create therapist profile';
      console.error('Profile creation error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (updates: Partial<TherapistProfile>) => {
    if (!currentTherapist.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await updateTherapistProfile(currentTherapist.value.id, updates);
      currentTherapist.value = { ...currentTherapist.value, ...updates };
      return true;
    } catch (err) {
      error.value = 'Failed to update profile';
      console.error('Profile update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateAvailability = async (availability: TherapistAvailability) => {
    if (!currentTherapist.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await updateTherapistAvailability(currentTherapist.value.id, availability);
      currentTherapist.value = {
        ...currentTherapist.value,
        availability,
        isAvailable: availability.schedule.length > 0,
      };
      return true;
    } catch (err) {
      error.value = 'Failed to update availability';
      console.error('Availability update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const search = async (filters: TherapistSearchFilters, reset: boolean = false) => {
    try {
      loading.value = true;
      error.value = null;
      const lastDoc = reset ? undefined : lastSearchDoc.value;
      const { therapists, lastDoc: newLastDoc } = await searchTherapists(filters, lastDoc);

      searchResults.value = reset ? therapists : [...searchResults.value, ...therapists];
      lastSearchDoc.value = newLastDoc;
      hasMoreResults.value = therapists.length === 10; // Assuming pageSize is 10
    } catch (err) {
      error.value = 'Failed to search therapists';
      console.error('Search error:', err);
    } finally {
      loading.value = false;
    }
  };

  const submitDocuments = async (documents: TherapistProfile['verificationDocuments']) => {
    if (!currentTherapist.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await submitVerificationDocuments(currentTherapist.value.id, documents);
      currentTherapist.value = {
        ...currentTherapist.value,
        verificationDocuments: documents,
        verificationStatus: 'pending',
      };
      return true;
    } catch (err) {
      error.value = 'Failed to submit verification documents';
      console.error('Document submission error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const submitReview = async (review: Omit<TherapistProfile['reviews'][0], 'id' | 'createdAt'>) => {
    if (!currentTherapist.value) return false;
    try {
      loading.value = true;
      error.value = null;
      await addReview(currentTherapist.value.id, review);
      // Refresh the therapist profile to get updated reviews
      await initializeTherapistProfile(currentTherapist.value.userId);
      return true;
    } catch (err) {
      error.value = 'Failed to submit review';
      console.error('Review submission error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    currentTherapist,
    searchResults,
    loading,
    error,
    hasMoreResults,
    isVerified,
    isPendingVerification,
    initializeTherapistProfile,
    createProfile,
    updateProfile,
    updateAvailability,
    search,
    submitDocuments,
    submitReview,
  };
});
