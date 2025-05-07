import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAIChatStore } from '@/stores/aiChat';
import AIChat from '@/views/AIChat.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/AIChat.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sessions',
      name: 'sessions',
      component: () => import('../views/Sessions.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: () => import('../views/Exercises.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('../views/Community.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ai-chat',
      name: 'AIChat',
      component: AIChat,
      meta: {
        requiresAuth: true,
        title: 'AI Support Chat',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const aiChatStore = useAIChatStore();

  // Wait for auth store to initialize
  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch();
          resolve(true);
        }
      });
    });
  }

  const isAuthenticated = authStore.isAuthenticated;

  // Initialize AI chat store if user is authenticated
  if (isAuthenticated) {
    aiChatStore.initializeChat();
  }

  // Redirect authenticated users to chat from guest-only routes
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'chat' });
  }

  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }

  // Redirect authenticated users to chat when accessing root
  if (to.path === '/' && isAuthenticated) {
    return next({ name: 'chat' });
  }

  next();
});

export default router;
