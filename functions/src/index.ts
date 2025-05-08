import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OpenAI } from 'openai';
import twilio from 'twilio';
import { Zoom } from '@zoom/meetingsdk';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize Zoom
const zoom = new Zoom({
  apiKey: process.env.ZOOM_API_KEY,
  apiSecret: process.env.ZOOM_API_SECRET,
});

// Export functions
export {
  // AI Chat Functions
  handleAIChat,
  generateAIResponse,

  // SMS Functions
  sendSMSNotification,
  handleSMSResponse,

  // Video Call Functions
  createZoomMeeting,
  joinZoomMeeting,

  // Exercise Functions
  trackExerciseProgress,
  generateExerciseRecommendations,

  // User Management Functions
  onUserCreated,
  onUserDeleted,

  // Session Management Functions
  onSessionCreated,
  onSessionCompleted,

  // Analytics Functions
  trackUserEngagement,
  generateUserInsights,
} from './functions';
