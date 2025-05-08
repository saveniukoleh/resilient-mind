<template>
  <div class="min-h-screen bg-gray-50">
    <TopNav title="Mental Health Exercises" />
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div v-if="!selectedExercise" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Breathing Exercise -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Breathing Exercise</h2>
          <p class="text-gray-600 mb-4">Practice deep breathing to reduce stress and anxiety.</p>
          <button class="btn-primary" @click="selectedExercise = 'breathing'">
            Start Exercise
          </button>
        </div>

        <!-- CBT Exercise -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">CBT Exercise</h2>
          <p class="text-gray-600 mb-4">
            Practice cognitive behavioral therapy techniques to manage thoughts and behaviors.
          </p>
          <button class="btn-primary" @click="selectedExercise = 'cbt'">Start Exercise</button>
        </div>

        <!-- Meditation -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Meditation</h2>
          <p class="text-gray-600 mb-4">
            Guided meditation sessions for mindfulness and relaxation.
          </p>
          <button class="btn-primary">Start Exercise</button>
        </div>

        <!-- Progressive Muscle Relaxation -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Progressive Muscle Relaxation</h2>
          <p class="text-gray-600 mb-4">Release tension through systematic muscle relaxation.</p>
          <button class="btn-primary">Start Exercise</button>
        </div>

        <!-- Grounding Techniques -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Grounding Techniques</h2>
          <p class="text-gray-600 mb-4">Stay present and connected to the moment.</p>
          <button class="btn-primary">Start Exercise</button>
        </div>
      </div>

      <div v-else class="bg-white rounded-lg shadow-sm">
        <div class="p-4 border-b">
          <button class="text-gray-600 hover:text-gray-900" @click="selectedExercise = null">
            ← Back to Exercises
          </button>
        </div>
        <div class="p-6">
          <BreathingExercise v-if="selectedExercise === 'breathing'" />
          <CBTExercise v-if="selectedExercise === 'cbt'" />
          <!-- Add other exercise components here as they are implemented -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TopNav from '@/components/TopNav.vue';
import BreathingExercise from '@/components/exercises/BreathingExercise.vue';
import CBTExercise from '@/components/exercises/CBTExercise.vue';

const selectedExercise = ref<string | null>(null);
</script>

<style scoped>
.btn-primary {
  @apply w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
</style>
