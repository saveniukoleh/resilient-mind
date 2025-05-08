import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OpenAI } from 'openai';
import twilio from 'twilio';
import { Zoom } from '@zoom/meetingsdk';
import { z } from 'zod';

// AI Chat Functions
export const handleAIChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { message } = z
    .object({
      message: z.string().min(1),
    })
    .parse(data);

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'gpt-4',
    });

    return {
      response: completion.choices[0].message.content,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error processing AI chat');
  }
});

// SMS Functions
export const sendSMSNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { phoneNumber, message } = z
    .object({
      phoneNumber: z.string(),
      message: z.string(),
    })
    .parse(data);

  try {
    await twilioClient.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error sending SMS');
  }
});

// Video Call Functions
export const createZoomMeeting = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { topic, startTime, duration } = z
    .object({
      topic: z.string(),
      startTime: z.string(),
      duration: z.number(),
    })
    .parse(data);

  try {
    const meeting = await zoom.meetings.create({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration,
    });

    return { meetingId: meeting.id, joinUrl: meeting.join_url };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error creating Zoom meeting');
  }
});

// Exercise Functions
export const trackExerciseProgress = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { exerciseId, progress, mood } = z
    .object({
      exerciseId: z.string(),
      progress: z.number(),
      mood: z.number().optional(),
    })
    .parse(data);

  try {
    await admin.firestore().collection('userProgress').add({
      userId: context.auth.uid,
      exerciseId,
      progress,
      mood,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error tracking exercise progress');
  }
});

// User Management Functions
export const onUserCreated = functions.auth.user().onCreate(async user => {
  try {
    await admin
      .firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        email: user.email,
        displayName: user.displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        preferences: {
          notifications: true,
          darkMode: false,
          language: 'en',
        },
      });
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

// Session Management Functions
export const onSessionCreated = functions.firestore
  .document('sessions/{sessionId}')
  .onCreate(async (snap, context) => {
    const session = snap.data();

    try {
      // Send notifications to participants
      await admin.messaging().send({
        token: session.userId,
        notification: {
          title: 'New Session Scheduled',
          body: `Your session is scheduled for ${session.date}`,
        },
      });
    } catch (error) {
      console.error('Error handling session creation:', error);
    }
  });

// Analytics Functions
export const trackUserEngagement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventType, eventData } = z
    .object({
      eventType: z.string(),
      eventData: z.record(z.any()),
    })
    .parse(data);

  try {
    await admin.firestore().collection('analytics').add({
      userId: context.auth.uid,
      eventType,
      eventData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error tracking user engagement');
  }
});
