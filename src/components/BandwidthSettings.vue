<template>
  <div class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-900">Bandwidth Settings</h3>
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

    <!-- Bandwidth Status -->
    <div class="flex items-center space-x-2 mb-2">
      <div
        class="w-3 h-3 rounded-full"
        :class="{
          'bg-green-500': bandwidthStatus === 'good',
          'bg-yellow-500': bandwidthStatus === 'fair',
          'bg-red-500': bandwidthStatus === 'poor',
        }"
      ></div>
      <span class="text-sm text-gray-600">{{ bandwidthStatusText }}</span>
    </div>

    <!-- Detailed Metrics -->
    <div v-if="showDetails" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Current Bitrate</span>
        <span class="font-medium">{{ metrics.currentBitrate.toFixed(1) }} Mbps</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Available Bandwidth</span>
        <span class="font-medium">{{ metrics.availableBandwidth.toFixed(1) }} Mbps</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Packet Loss</span>
        <span class="font-medium">{{ metrics.packetLoss.toFixed(1) }}%</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Latency</span>
        <span class="font-medium">{{ metrics.latency }} ms</span>
      </div>

      <!-- Quality Settings -->
      <div class="mt-4 pt-4 border-t">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Adaptive Quality</span>
          <button
            @click="toggleAdaptiveQuality"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            :class="{ 'bg-primary-600': settings.adaptiveBitrate }"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="{ 'translate-x-5': settings.adaptiveBitrate }"
            ></span>
          </button>
        </div>

        <div v-if="!settings.adaptiveBitrate" class="space-y-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">Video Quality</label>
            <select
              v-model="settings.videoQuality"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Audio Quality</label>
            <select
              v-model="settings.audioQuality"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
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
import { BandwidthOptimizer } from '@/services/bandwidthOptimizer';
import type { BandwidthMetrics, BandwidthSettings } from '@/services/bandwidthOptimizer';

const props = defineProps<{
  sessionId: string;
}>();

const showDetails = ref(false);
const metrics = ref<BandwidthMetrics>({
  currentBitrate: 0,
  availableBandwidth: 0,
  packetLoss: 0,
  latency: 0,
});
const settings = ref<BandwidthSettings>({
  videoQuality: 'high',
  audioQuality: 'high',
  maxBitrate: 2.5,
  adaptiveBitrate: true,
});
const warning = ref<string>('');
let optimizer: BandwidthOptimizer;

const bandwidthStatus = computed(() => {
  const { packetLoss, latency } = metrics.value;
  if (packetLoss > 5 || latency > 200) return 'poor';
  if (packetLoss > 2 || latency > 100) return 'fair';
  return 'good';
});

const bandwidthStatusText = computed(() => {
  switch (bandwidthStatus.value) {
    case 'good':
      return 'Connection Good';
    case 'fair':
      return 'Connection Fair';
    case 'poor':
      return 'Connection Poor';
    default:
      return 'Unknown';
  }
});

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const toggleAdaptiveQuality = () => {
  settings.value.adaptiveBitrate = !settings.value.adaptiveBitrate;
  optimizer.updateSettings({ adaptiveBitrate: settings.value.adaptiveBitrate });
};

onMounted(() => {
  optimizer = new BandwidthOptimizer(settings.value, {
    onMetricsUpdate: newMetrics => {
      metrics.value = newMetrics;
    },
    onQualityChange: newSettings => {
      settings.value = newSettings;
    },
    onWarning: message => {
      warning.value = message;
    },
  });
  optimizer.startMonitoring();
});

onUnmounted(() => {
  optimizer.stopMonitoring();
});
</script>
