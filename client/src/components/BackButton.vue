<template>
  <button
    @click="router.push('/chat')"
    class="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
  >
    <i class="fas fa-arrow-left text-lg mr-2"></i>
    <span>Back to Home</span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
