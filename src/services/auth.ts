import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'therapist' | 'admin';
  profile: {
    phoneNumber?: string;
    language: string;
    createdAt: Date;
    lastLogin: Date;
    isActive: boolean;
    profilePicture?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    preferences: {
      notifications: boolean;
      darkMode: boolean;
      language: string;
    };
  };
}

export const registerUser = async (email: string, password: string): Promise<AuthUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName,
    role: 'user',
    profile: {
      language: 'en',
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en',
      },
    },
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName,
    role: 'user',
    profile: {
      language: 'en',
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en',
      },
    },
  };
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentUser = (): Promise<AuthUser | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user: User | null) => {
        unsubscribe();
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'user',
            profile: {
              language: 'en',
              createdAt: new Date(),
              lastLogin: new Date(),
              isActive: true,
              preferences: {
                notifications: true,
                darkMode: false,
                language: 'en',
              },
            },
          });
        } else {
          resolve(null);
        }
      },
      reject
    );
  });
};

// Auth state observer
export const onAuthStateChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'user',
        profile: {
          language: 'en',
          createdAt: new Date(),
          lastLogin: new Date(),
          isActive: true,
          preferences: {
            notifications: true,
            darkMode: false,
            language: 'en',
          },
        },
      });
    } else {
      callback(null);
    }
  });
};
