<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-center items-center h-16">
        <div v-if="title" class="flex flex-col items-center justify-center w-full">
          <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
          <span v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>
