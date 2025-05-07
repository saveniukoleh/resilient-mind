<template>
  <nav class="bottom-navigation">
    <router-link to="/chat" class="nav-item">
      <i class="fas fa-robot"></i>
      <span>AI Chat</span>
    </router-link>
    <router-link to="/sessions" class="nav-item">
      <i class="fas fa-video"></i>
      <span>Sessions</span>
    </router-link>
    <router-link to="/exercises" class="nav-item">
      <i class="fas fa-dumbbell"></i>
      <span>Exercises</span>
    </router-link>
    <router-link to="/community" class="nav-item">
      <i class="fas fa-users"></i>
      <span>Community</span>
    </router-link>
    <button @click="handleLogout" class="nav-item logout">
      <i class="fas fa-sign-out-alt"></i>
      <span>Logout</span>
    </button>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default defineComponent({
  name: 'BottomNavigation',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const handleLogout = async () => {
      await authStore.logout();
      router.push('/login');
    };

    return {
      handleLogout,
    };
  },
});
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  color: #666;
  text-decoration: none;
  font-size: 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  width: 20%;
}

.nav-item i {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

.nav-item.router-link-active {
  color: #4a90e2;
}

.logout {
  color: #666;
}

.logout:hover {
  color: #e53935;
}
</style>
