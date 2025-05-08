<template>
  <div class="min-h-screen bg-gray-50">
    <TopNav title="Therapy Sessions" subtitle="Coming Soon" />
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Available Sessions -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Available Sessions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="session in availableSessions"
            :key="session.id"
            class="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ session.duration }} Minute Session
            </h3>
            <p class="text-gray-600 mb-4">One-on-one session with a licensed therapist</p>
            <div class="flex justify-between items-center">
              <span class="text-primary-600 font-medium">${{ session.price }}</span>
              <button class="btn-primary" @click="bookSession(session)">Book Now</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Sessions -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Upcoming Sessions</h2>
        <div class="bg-white rounded-lg shadow-sm divide-y">
          <div v-for="session in upcomingSessions" :key="session.id" class="p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ session.duration }} Minute Session
                </h3>
                <p class="text-gray-600">{{ formatDate(session.date) }}</p>
                <p class="text-gray-500 mt-1">Price: ${{ session.price }}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  v-if="session.meetingLink"
                  class="btn-primary"
                  @click="joinSession(session)"
                >
                  Join Session
                </button>
                <button
                  v-if="canCancel(session)"
                  class="btn-secondary"
                  @click="cancelSession(session.id)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call Quality Indicator -->
    <CallQualityIndicator v-if="activeSession" />

    <!-- Bandwidth Settings -->
    <BandwidthSettings v-if="activeSession" :session-id="activeSession.id" />

    <!-- Recording Controls (for therapists only) -->
    <RecordingControls
      v-if="activeSession && isTherapist"
      :session-id="activeSession.id"
      :user-id="userStore.user?.uid || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import TopNav from '@/components/TopNav.vue';
import CallQualityIndicator from '@/components/CallQualityIndicator.vue';
import RecordingControls from '@/components/RecordingControls.vue';
import BandwidthSettings from '@/components/BandwidthSettings.vue';
import { useSessionStore } from '@/stores/session';
import { useUserStore } from '@/stores/user';
import type { Session, SessionBookingRequest, SessionStatus } from '@/types/session';
import { joinZoomMeeting } from '@/services/zoom';

const sessionStore = useSessionStore();
const userStore = useUserStore();
const availableSessions = ref<Session[]>([]);
const upcomingSessions = ref<Session[]>([]);
const activeSession = ref<Session | null>(null);

const isTherapist = computed(() => userStore.user?.role === 'therapist');

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

const bookSession = async (session: Session) => {
  try {
    const bookingRequest: SessionBookingRequest = {
      therapistId: session.therapistId,
      date: session.date,
      duration: session.duration,
      notes: session.notes?.user,
    };
    await sessionStore.bookSession(bookingRequest);
    // Refresh sessions after booking
    await loadSessions();
  } catch (error) {
    console.error('Error booking session:', error);
    // TODO: Show error notification
  }
};

const joinSession = async (session: Session) => {
  try {
    if (session.meetingLink) {
      await joinZoomMeeting(session.meetingLink);
      activeSession.value = session;
    }
  } catch (error) {
    console.error('Error joining session:', error);
    // TODO: Show error notification
  }
};

const canCancel = (session: Session) => {
  // Allow cancellation up to 24 hours before the session
  const now = new Date();
  const sessionDate = new Date(session.date);
  const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilSession >= 24;
};

const cancelSession = async (sessionId: string) => {
  try {
    await sessionStore.updateSessionStatus(sessionId, 'cancelled');
    // Refresh sessions after cancellation
    await loadSessions();
  } catch (error) {
    console.error('Error cancelling session:', error);
    // TODO: Show error notification
  }
};

const loadSessions = async () => {
  try {
    const filters = {
      status: ['scheduled', 'confirmed'] as SessionStatus[],
    };
    await sessionStore.search(filters, true);
    upcomingSessions.value = sessionStore.upcomingSessions;
  } catch (error) {
    console.error('Error loading sessions:', error);
    // TODO: Show error notification
  }
};

onMounted(async () => {
  await loadSessions();
});
</script>

<style scoped>
.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-white text-primary-600 border border-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
</style>
