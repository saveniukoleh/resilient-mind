import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
  TherapistProfile,
  TherapistSearchFilters,
  TherapistAvailability,
} from '@/types/therapist';
import { uploadProfilePicture } from './storage';

export const createTherapistProfile = async (
  userId: string,
  profile: Omit<
    TherapistProfile,
    'id' | 'userId' | 'rating' | 'totalSessions' | 'verificationStatus' | 'reviews'
  >
): Promise<void> => {
  try {
    const therapistRef = doc(collection(db, 'therapists'));
    await setDoc(therapistRef, {
      ...profile,
      id: therapistRef.id,
      userId,
      rating: 0,
      totalSessions: 0,
      verificationStatus: 'pending',
      reviews: [],
    });
  } catch (error) {
    console.error('Error creating therapist profile:', error);
    throw error;
  }
};

export const getTherapistProfile = async (id: string): Promise<TherapistProfile | null> => {
  try {
    const therapistDoc = await getDoc(doc(db, 'therapists', id));
    if (therapistDoc.exists()) {
      return therapistDoc.data() as TherapistProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching therapist profile:', error);
    throw error;
  }
};

export const updateTherapistProfile = async (
  id: string,
  updates: Partial<TherapistProfile>
): Promise<void> => {
  try {
    const therapistRef = doc(db, 'therapists', id);
    await updateDoc(therapistRef, updates);
  } catch (error) {
    console.error('Error updating therapist profile:', error);
    throw error;
  }
};

export const updateTherapistAvailability = async (
  id: string,
  availability: TherapistAvailability
): Promise<void> => {
  try {
    const therapistRef = doc(db, 'therapists', id);
    await updateDoc(therapistRef, {
      availability,
      isAvailable: availability.schedule.length > 0,
    });
  } catch (error) {
    console.error('Error updating therapist availability:', error);
    throw error;
  }
};

export const searchTherapists = async (
  filters: TherapistSearchFilters,
  lastDoc?: any,
  pageSize: number = 10
): Promise<{ therapists: TherapistProfile[]; lastDoc: any }> => {
  try {
    let q = query(collection(db, 'therapists'));

    // Apply filters
    if (filters.specialization?.length) {
      q = query(q, where('specialization', 'array-contains-any', filters.specialization));
    }
    if (filters.languages?.length) {
      q = query(q, where('languages', 'array-contains-any', filters.languages));
    }
    if (filters.minRating) {
      q = query(q, where('rating', '>=', filters.minRating));
    }
    if (filters.maxPrice) {
      q = query(q, where('hourlyRate', '<=', filters.maxPrice));
    }
    if (filters.verifiedOnly) {
      q = query(q, where('verificationStatus', '==', 'verified'));
    }

    // Apply pagination
    q = query(q, orderBy('rating', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const therapists = snapshot.docs.map(doc => doc.data() as TherapistProfile);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      therapists,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error searching therapists:', error);
    throw error;
  }
};

export const submitVerificationDocuments = async (
  id: string,
  documents: TherapistProfile['verificationDocuments']
): Promise<void> => {
  try {
    const therapistRef = doc(db, 'therapists', id);
    await updateDoc(therapistRef, {
      verificationDocuments: documents,
      verificationStatus: 'pending',
    });
  } catch (error) {
    console.error('Error submitting verification documents:', error);
    throw error;
  }
};

export const addReview = async (
  therapistId: string,
  review: Omit<TherapistProfile['reviews'][0], 'id' | 'createdAt'>
): Promise<void> => {
  try {
    const therapistRef = doc(db, 'therapists', therapistId);
    const therapistDoc = await getDoc(therapistRef);
    const therapist = therapistDoc.data() as TherapistProfile;

    const newReview = {
      ...review,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const updatedReviews = [...therapist.reviews, newReview];
    const newRating =
      updatedReviews.reduce((acc, rev) => acc + rev.rating, 0) / updatedReviews.length;

    await updateDoc(therapistRef, {
      reviews: updatedReviews,
      rating: newRating,
      totalSessions: therapist.totalSessions + 1,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};
