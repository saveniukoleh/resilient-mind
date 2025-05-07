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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
  Session,
  SessionBookingRequest,
  SessionFilters,
  SessionReminder,
} from '@/types/session';
import { getTherapistProfile } from './therapist';
import { createZoomMeeting } from './zoom';

export const createSession = async (booking: SessionBookingRequest): Promise<Session> => {
  try {
    const therapist = await getTherapistProfile(booking.therapistId);
    if (!therapist) {
      throw new Error('Therapist not found');
    }

    // Create Zoom meeting
    const meetingLink = await createZoomMeeting({
      id: '', // Will be set after session creation
      therapistId: booking.therapistId,
      userId: '', // Will be set by the user store
      date: booking.date,
      duration: booking.duration,
      status: 'scheduled',
      price: (therapist.hourlyRate * booking.duration) / 60,
      notes: booking.notes ? { user: booking.notes } : undefined,
      paymentStatus: 'pending',
      reminders: {
        email: true,
        sms: true,
        push: true,
      },
    });

    const sessionRef = doc(collection(db, 'sessions'));
    const session: Omit<Session, 'id'> = {
      therapistId: booking.therapistId,
      userId: '', // Will be set by the user store
      date: booking.date,
      duration: booking.duration,
      status: 'scheduled',
      price: (therapist.hourlyRate * booking.duration) / 60,
      notes: booking.notes ? { user: booking.notes } : undefined,
      paymentStatus: 'pending',
      meetingLink,
      reminders: {
        email: true,
        sms: true,
        push: true,
      },
    };

    await setDoc(sessionRef, {
      ...session,
      id: sessionRef.id,
      date: Timestamp.fromDate(booking.date),
    });

    return {
      ...session,
      id: sessionRef.id,
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const getSession = async (id: string): Promise<Session | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, 'sessions', id));
    if (sessionDoc.exists()) {
      const data = sessionDoc.data();
      return {
        ...data,
        date: data.date.toDate(),
      } as Session;
    }
    return null;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

export const updateSession = async (id: string, updates: Partial<Session>): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessions', id);
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }

    const data = sessionDoc.data();
    const updatedData = {
      ...updates,
      date: updates.date ? Timestamp.fromDate(updates.date) : data.date,
    };

    await updateDoc(sessionRef, updatedData);
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

export const searchSessions = async (
  filters: SessionFilters,
  lastDoc?: any,
  pageSize: number = 10
): Promise<{ sessions: Session[]; lastDoc: any }> => {
  try {
    let q = query(collection(db, 'sessions'));

    // Apply filters
    if (filters.status?.length) {
      q = query(q, where('status', 'in', filters.status));
    }
    if (filters.dateRange) {
      q = query(
        q,
        where('date', '>=', Timestamp.fromDate(filters.dateRange.start)),
        where('date', '<=', Timestamp.fromDate(filters.dateRange.end))
      );
    }
    if (filters.therapistId) {
      q = query(q, where('therapistId', '==', filters.therapistId));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }

    // Apply pagination
    q = query(q, orderBy('date', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(),
      } as Session;
    });
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      sessions,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error('Error searching sessions:', error);
    throw error;
  }
};

export const createSessionReminder = async (
  reminder: Omit<SessionReminder, 'id'>
): Promise<void> => {
  try {
    const reminderRef = doc(collection(db, 'sessionReminders'));
    await setDoc(reminderRef, {
      ...reminder,
      id: reminderRef.id,
      scheduledFor: Timestamp.fromDate(reminder.scheduledFor),
    });
  } catch (error) {
    console.error('Error creating session reminder:', error);
    throw error;
  }
};

export const updateSessionReminder = async (
  id: string,
  updates: Partial<SessionReminder>
): Promise<void> => {
  try {
    const reminderRef = doc(db, 'sessionReminders', id);
    const reminderDoc = await getDoc(reminderRef);
    if (!reminderDoc.exists()) {
      throw new Error('Reminder not found');
    }

    const data = reminderDoc.data();
    const updatedData = {
      ...updates,
      scheduledFor: updates.scheduledFor
        ? Timestamp.fromDate(updates.scheduledFor)
        : data.scheduledFor,
      sentAt: updates.sentAt ? Timestamp.fromDate(updates.sentAt) : data.sentAt,
    };

    await updateDoc(reminderRef, updatedData);
  } catch (error) {
    console.error('Error updating session reminder:', error);
    throw error;
  }
};

export const deleteSessionReminder = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'sessionReminders', id));
  } catch (error) {
    console.error('Error deleting session reminder:', error);
    throw error;
  }
};
