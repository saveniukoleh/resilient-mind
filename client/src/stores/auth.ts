import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth } from '@/config/firebase';
import {
  signOut,
  signInWithEmailAndPassword as firebaseSignIn,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<FirebaseUser | null>(null);
  const loading = ref(true);

  // Computed property to check if user is authenticated
  const isAuthenticated = computed(() => !!user.value);

  // Initialize auth state listener
  onAuthStateChanged(auth, firebaseUser => {
    user.value = firebaseUser;
    loading.value = false;
  });

  // Sign in with email and password
  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const userCredential = await firebaseSignIn(auth, email, password);
      user.value = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signInWithEmailAndPassword,
    logout,
  };
});
