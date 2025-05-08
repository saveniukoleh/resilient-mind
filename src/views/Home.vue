<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation - only show for non-authenticated users -->
    <nav v-if="!isAuthenticated" class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-xl font-bold text-gray-900">
              Resilient Mind
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/login" class="btn-secondary"> Sign in </router-link>
            <router-link to="/register" class="btn-primary"> Create account </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center mb-8">Welcome to Resilient Mind</h1>
      <div class="max-w-3xl mx-auto">
        <p class="text-lg text-gray-700 text-center mb-8">
          Your trusted companion for mental health support and recovery.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            @click="handleNavigation('/chat')"
            class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 class="text-2xl font-semibold mb-4">🤖 AI Chat Support</h2>
            <p class="text-gray-600">
              Get immediate emotional support through our AI-powered chatbot.
            </p>
          </div>
          <div
            @click="handleNavigation('/sessions')"
            class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 class="text-2xl font-semibold mb-4">👨‍⚕️ Book Therapy</h2>
            <p class="text-gray-600">Schedule sessions with licensed therapists.</p>
          </div>
          <div
            @click="handleNavigation('/exercises')"
            class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 class="text-2xl font-semibold mb-4">🧘‍♂️ Recovery Programs</h2>
            <p class="text-gray-600">Access self-guided therapeutic modules and exercises.</p>
          </div>
          <div
            @click="handleNavigation('/community')"
            class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 class="text-2xl font-semibold mb-4">👥 Community</h2>
            <p class="text-gray-600">Connect with others and share experiences in a safe space.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleNavigation = (path: string) => {
  if (!isAuthenticated.value) {
    router.push({
      path: '/login',
      query: { redirect: path },
    });
  } else {
    router.push(path);
  }
};
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}

.btn-secondary {
  @apply inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}
</style>
