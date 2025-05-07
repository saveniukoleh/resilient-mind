<template>
  <nav class="auth-navigation">
    <div class="auth-buttons">
      <router-link to="/login" class="auth-button"> Sign in </router-link>
      <router-link to="/register" class="auth-button"> Create account </router-link>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AuthNavigation',
});
</script>

<style scoped>
.auth-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.auth-buttons {
  display: flex;
  gap: 20px;
}

.auth-button {
  padding: 8px 16px;
  color: #4a90e2;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.auth-button:hover {
  color: #357abd;
}
</style>
