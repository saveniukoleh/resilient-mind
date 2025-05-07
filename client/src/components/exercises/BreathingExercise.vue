<template>
  <div class="breathing-exercise">
    <div
      class="breathing-circle"
      :class="{ 'breathing-in': isBreathingIn, 'breathing-out': isBreathingOut }"
    >
      <div class="breathing-text">{{ breathingText }}</div>
    </div>

    <div class="controls">
      <div class="timer">{{ formatTime(timeRemaining) }}</div>
      <div class="buttons">
        <button class="btn-primary" @click="toggleExercise">
          {{ isStarted ? 'Pause' : 'Start' }}
        </button>
        <button
          class="btn-secondary"
          @click="resetExercise"
          :disabled="!isStarted && timeRemaining === 0"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="settings">
      <div class="setting-group">
        <label>Duration (minutes)</label>
        <input type="number" v-model="duration" min="1" max="30" :disabled="isStarted" />
      </div>
      <div class="setting-group">
        <label>Breathing Pattern</label>
        <select v-model="pattern" :disabled="isStarted">
          <option value="4-7-8">4-7-8 (Relaxation)</option>
          <option value="4-4-4">4-4-4 (Box Breathing)</option>
          <option value="5-5-5">5-5-5 (Equal Breathing)</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const duration = ref(5);
const pattern = ref('4-7-8');
const isStarted = ref(false);
const timeRemaining = ref(0);
const timer = ref<number | null>(null);
const breathingPhase = ref<'in' | 'hold' | 'out'>('in');
const phaseTimer = ref<number | null>(null);
const phaseTimeRemaining = ref(0);

const breathingTimes = computed(() => {
  const [inhale, hold, exhale] = pattern.value.split('-').map(Number);
  return { inhale, hold, exhale };
});

const isBreathingIn = computed(() => breathingPhase.value === 'in');
const isBreathingOut = computed(() => breathingPhase.value === 'out');
const breathingText = computed(() => {
  if (!isStarted.value && timeRemaining.value === 0) {
    return 'Ready';
  }
  const phase = breathingPhase.value;
  const seconds = phaseTimeRemaining.value;
  return `${phase === 'in' ? 'Breathe In' : phase === 'out' ? 'Breathe Out' : 'Hold'} (${seconds}s)`;
});

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const startBreathingCycle = () => {
  let currentPhase = 0;
  const phases = ['in', 'hold', 'out'] as const;

  const updatePhase = () => {
    if (!isStarted.value) return;

    breathingPhase.value = phases[currentPhase];
    const currentTime =
      currentPhase === 0
        ? breathingTimes.value.inhale
        : currentPhase === 1
          ? breathingTimes.value.hold
          : breathingTimes.value.exhale;

    phaseTimeRemaining.value = currentTime;

    const phaseInterval = window.setInterval(() => {
      if (!isStarted.value) {
        clearInterval(phaseInterval);
        return;
      }

      if (phaseTimeRemaining.value > 0) {
        phaseTimeRemaining.value--;
      } else {
        clearInterval(phaseInterval);
        currentPhase = (currentPhase + 1) % phases.length;
        updatePhase();
      }
    }, 1000);

    phaseTimer.value = phaseInterval;
  };

  updatePhase();
};

const toggleExercise = () => {
  if (!isStarted.value) {
    isStarted.value = true;
    timeRemaining.value = duration.value * 60;
    startBreathingCycle();

    timer.value = window.setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
      } else {
        stopExercise();
      }
    }, 1000);
  } else {
    stopExercise();
  }
};

const stopExercise = () => {
  isStarted.value = false;

  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }

  if (phaseTimer.value) {
    clearInterval(phaseTimer.value);
    phaseTimer.value = null;
  }

  breathingPhase.value = 'in';
  phaseTimeRemaining.value = 0;
};

const resetExercise = () => {
  stopExercise();
  timeRemaining.value = 0;
};

onUnmounted(() => {
  stopExercise();
});
</script>

<style scoped>
.breathing-exercise {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

.breathing-circle {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background-color: #93c5fd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 20px rgba(147, 197, 253, 0.3);
  margin: 2rem 0;
}

.breathing-circle.breathing-in {
  transform: scale(1.2);
  background-color: #60a5fa;
  box-shadow: 0 0 40px rgba(96, 165, 250, 0.4);
}

.breathing-circle.breathing-out {
  transform: scale(0.9);
  background-color: #93c5fd;
  box-shadow: 0 0 20px rgba(147, 197, 253, 0.3);
}

.breathing-text {
  font-size: 2rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.timer {
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
  font-family: monospace;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.buttons button {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 9999px;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #d1d5db;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.settings {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 400px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-group label {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
}

.setting-group input,
.setting-group select {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  width: 180px;
  font-size: 1rem;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
}

.setting-group input:focus,
.setting-group select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.setting-group input:disabled,
.setting-group select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
