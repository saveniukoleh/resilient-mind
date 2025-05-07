<template>
  <div id="app">
    <router-view></router-view>
    <BottomNavigation v-if="isAuthenticated" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAIChatStore } from '@/stores/aiChat';
import BottomNavigation from '@/components/BottomNavigation.vue';

export default defineComponent({
  name: 'App',
  components: {
    BottomNavigation,
  },
  setup() {
    const authStore = useAuthStore();
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const aiChatStore = useAIChatStore();

    onMounted(() => {
      aiChatStore.initializeChat();
    });

    return {
      isAuthenticated,
    };
  },
});
</script>

<style>
#app {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Add padding to the bottom to account for the navigation bar */
.router-view-container {
  padding-bottom: 60px;
}

/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
