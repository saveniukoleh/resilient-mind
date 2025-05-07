import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Session,
  SessionBookingRequest,
  SessionFilters,
  SessionReminder,
} from '@/types/session';
import {
  createSession,
  getSession,
  updateSession,
  searchSessions,
  createSessionReminder,
  updateSessionReminder,
  deleteSessionReminder,
} from '@/services/session';
import { useUserStore } from './user';

export const useSessionStore = defineStore('session', () => {
  const userStore = useUserStore();
  const currentSession = ref<Session | null>(null);
  const searchResults = ref<Session[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastSearchDoc = ref<any>(null);
  const hasMoreResults = ref(true);

  const upcomingSessions = computed(() =>
    searchResults.value.filter(
      session => session.status === 'scheduled' || session.status === 'confirmed'
    )
  );

  const pastSessions = computed(() =>
    searchResults.value.filter(
      session => session.status === 'completed' || session.status === 'cancelled'
    )
  );

  const initializeSession = async (sessionId: string) => {
    try {
      loading.value = true;
      error.value = null;
      const session = await getSession(sessionId);
      if (session) {
        currentSession.value = session;
      }
    } catch (err) {
      error.value = 'Failed to load session';
      console.error('Session initialization error:', err);
    } finally {
      loading.value = false;
    }
  };

  const bookSession = async (booking: SessionBookingRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const session = await createSession({
        ...booking,
        userId: userStore.currentUser?.uid || '',
      });
      currentSession.value = session;
      return session;
    } catch (err) {
      error.value = 'Failed to book session';
      console.error('Session booking error:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateSessionStatus = async (sessionId: string, status: Session['status']) => {
    try {
      loading.value = true;
      error.value = null;
      await updateSession(sessionId, { status });
      if (currentSession.value?.id === sessionId) {
        currentSession.value = { ...currentSession.value, status };
      }
      return true;
    } catch (err) {
      error.value = 'Failed to update session status';
      console.error('Session status update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateSessionNotes = async (sessionId: string, notes: string, isTherapist: boolean) => {
    try {
      loading.value = true;
      error.value = null;
      const notesField = isTherapist ? 'notes.therapist' : 'notes.user';
      await updateSession(sessionId, { [notesField]: notes });
      if (currentSession.value?.id === sessionId) {
        currentSession.value = {
          ...currentSession.value,
          notes: {
            ...currentSession.value.notes,
            [isTherapist ? 'therapist' : 'user']: notes,
          },
        };
      }
      return true;
    } catch (err) {
      error.value = 'Failed to update session notes';
      console.error('Session notes update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const submitFeedback = async (sessionId: string, rating: number, comment: string) => {
    try {
      loading.value = true;
      error.value = null;
      await updateSession(sessionId, {
        feedback: {
          rating,
          comment,
          createdAt: new Date(),
        },
      });
      if (currentSession.value?.id === sessionId) {
        currentSession.value = {
          ...currentSession.value,
          feedback: {
            rating,
            comment,
            createdAt: new Date(),
          },
        };
      }
      return true;
    } catch (err) {
      error.value = 'Failed to submit feedback';
      console.error('Feedback submission error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const search = async (filters: SessionFilters, reset: boolean = false) => {
    try {
      loading.value = true;
      error.value = null;
      const lastDoc = reset ? undefined : lastSearchDoc.value;
      const { sessions, lastDoc: newLastDoc } = await searchSessions(filters, lastDoc);

      searchResults.value = reset ? sessions : [...searchResults.value, ...sessions];
      lastSearchDoc.value = newLastDoc;
      hasMoreResults.value = sessions.length === 10; // Assuming pageSize is 10
    } catch (err) {
      error.value = 'Failed to search sessions';
      console.error('Search error:', err);
    } finally {
      loading.value = false;
    }
  };

  const createReminder = async (reminder: Omit<SessionReminder, 'id'>) => {
    try {
      loading.value = true;
      error.value = null;
      await createSessionReminder(reminder);
      return true;
    } catch (err) {
      error.value = 'Failed to create reminder';
      console.error('Reminder creation error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateReminder = async (id: string, updates: Partial<SessionReminder>) => {
    try {
      loading.value = true;
      error.value = null;
      await updateSessionReminder(id, updates);
      return true;
    } catch (err) {
      error.value = 'Failed to update reminder';
      console.error('Reminder update error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await deleteSessionReminder(id);
      return true;
    } catch (err) {
      error.value = 'Failed to delete reminder';
      console.error('Reminder deletion error:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    currentSession,
    searchResults,
    loading,
    error,
    hasMoreResults,
    upcomingSessions,
    pastSessions,
    initializeSession,
    bookSession,
    updateSessionStatus,
    updateSessionNotes,
    submitFeedback,
    search,
    createReminder,
    updateReminder,
    deleteReminder,
  };
});
