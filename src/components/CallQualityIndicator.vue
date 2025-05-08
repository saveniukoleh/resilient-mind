<template>
  <div class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-900">Call Quality</h3>
      <button @click="toggleDetails" class="text-gray-500 hover:text-gray-700">
        <span class="sr-only">Toggle details</span>
        <svg
          class="w-5 h-5"
          :class="{ 'transform rotate-180': showDetails }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Quality Status -->
    <div class="flex items-center space-x-2 mb-2">
      <div
        class="w-3 h-3 rounded-full"
        :class="{
          'bg-green-500': overallQuality >= 80,
          'bg-yellow-500': overallQuality >= 60 && overallQuality < 80,
          'bg-red-500': overallQuality < 60,
        }"
      ></div>
      <span class="text-sm text-gray-600">{{ qualityStatus }}</span>
    </div>

    <!-- Detailed Metrics -->
    <div v-if="showDetails" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Audio Quality</span>
        <span class="font-medium">{{ metrics.audioQuality }}%</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Video Quality</span>
        <span class="font-medium">{{ metrics.videoQuality }}%</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Bandwidth</span>
        <span class="font-medium">{{ metrics.bandwidth.toFixed(1) }} Mbps</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Latency</span>
        <span class="font-medium">{{ metrics.latency }} ms</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Packet Loss</span>
        <span class="font-medium">{{ metrics.packetLoss.toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Warning Message -->
    <div
      v-if="warning"
      class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800"
    >
      {{ warning }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { CallQualityMonitor } from '@/services/callQuality';
import type { CallQualityMetrics } from '@/services/callQuality';

const showDetails = ref(false);
const metrics = ref<CallQualityMetrics>({
  audioQuality: 100,
  videoQuality: 100,
  bandwidth: 0,
  latency: 0,
  packetLoss: 0,
});
const warning = ref<string>('');
let monitor: CallQualityMonitor;

const overallQuality = computed(() => {
  return (metrics.value.audioQuality + metrics.value.videoQuality) / 2;
});

const qualityStatus = computed(() => {
  if (overallQuality.value >= 80) return 'Excellent';
  if (overallQuality.value >= 60) return 'Good';
  return 'Poor';
});

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

onMounted(() => {
  monitor = new CallQualityMonitor({
    onQualityUpdate: newMetrics => {
      metrics.value = newMetrics;
    },
    onQualityWarning: message => {
      warning.value = message;
    },
    onQualityError: error => {
      console.error('Call quality error:', error);
    },
  });
  monitor.startMonitoring();
});

onUnmounted(() => {
  monitor.stopMonitoring();
});
</script>
