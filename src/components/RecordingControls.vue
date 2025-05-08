<template>
  <div class="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
    <div class="flex items-center space-x-4">
      <!-- Recording Status -->
      <div class="flex items-center space-x-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="{
            'bg-red-500 animate-pulse': isRecording,
            'bg-gray-300': !isRecording,
          }"
        ></div>
        <span class="text-sm text-gray-600">
          {{ isRecording ? 'Recording in progress' : 'Not recording' }}
        </span>
      </div>

      <!-- Recording Controls -->
      <div class="flex items-center space-x-2">
        <button
          v-if="!isRecording"
          @click="startRecording"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Recording
        </button>
        <button
          v-else
          @click="stopRecording"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Stop Recording
        </button>
      </div>

      <!-- Recording Duration -->
      <div v-if="isRecording" class="text-sm text-gray-600">
        {{ formatDuration(recordingDuration) }}
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CallRecorder } from '@/services/recording';

const props = defineProps<{
  sessionId: string;
  userId: string;
}>();

const isRecording = ref(false);
const recordingDuration = ref(0);
const error = ref<string>('');
let recorder: CallRecorder;
let durationInterval: number;

const startRecording = async () => {
  try {
    await recorder.startRecording();
    startDurationTimer();
  } catch (err) {
    error.value = 'Failed to start recording';
    console.error('Error starting recording:', err);
  }
};

const stopRecording = async () => {
  try {
    await recorder.stopRecording();
    stopDurationTimer();
  } catch (err) {
    error.value = 'Failed to stop recording';
    console.error('Error stopping recording:', err);
  }
};

const startDurationTimer = () => {
  durationInterval = window.setInterval(() => {
    recordingDuration.value++;
  }, 1000);
};

const stopDurationTimer = () => {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = 0;
  }
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

onMounted(() => {
  recorder = new CallRecorder({
    sessionId: props.sessionId,
    userId: props.userId,
    onRecordingStart: () => {
      isRecording.value = true;
      error.value = '';
    },
    onRecordingStop: () => {
      isRecording.value = false;
      recordingDuration.value = 0;
      error.value = '';
    },
    onError: message => {
      error.value = message;
    },
  });
});

onUnmounted(() => {
  stopDurationTimer();
  if (isRecording.value) {
    recorder.stopRecording();
  }
});
</script>
