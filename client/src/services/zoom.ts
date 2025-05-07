import axios from 'axios';
import type { Session } from '@/types/session';
import { ZoomMtg } from '@zoom/meetingsdk';

interface ZoomMeetingResponse {
  id: string;
  join_url: string;
  password?: string;
  host_email: string;
  start_time: string;
  duration: number;
}

// Initialize Zoom SDK
ZoomMtg.setZoomJSLib(
  'https://source.zoom.us/2.18.0/zoom-meeting-embedded-2.18.0.min.js',
  'https://source.zoom.us/2.18.0/vendor/react.min.js',
  'https://source.zoom.us/2.18.0/vendor/react-dom.min.js',
  'https://source.zoom.us/2.18.0/vendor/redux.min.js',
  'https://source.zoom.us/2.18.0/vendor/redux-thunk.min.js',
  'https://source.zoom.us/2.18.0/vendor/lodash.min.js'
);

export const createZoomMeeting = async (session: Session): Promise<string> => {
  try {
    // Call our backend API to create a Zoom meeting
    const response = await axios.post<ZoomMeetingResponse>('/api/zoom/meetings', {
      topic: `Therapy Session - ${session.id}`,
      type: 2, // Scheduled meeting
      start_time: session.date.toISOString(),
      duration: session.duration,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        meeting_authentication: true,
      },
    });

    return response.data.join_url;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    throw error;
  }
};

export const joinZoomMeeting = async (meetingLink: string): Promise<void> => {
  try {
    // Initialize Zoom client
    await ZoomMtg.init({
      leaveUrl: window.location.origin,
      success: (success: any) => {
        console.log('Zoom client initialized successfully:', success);
      },
      error: (error: any) => {
        console.error('Failed to initialize Zoom client:', error);
        throw error;
      },
    });

    // Join the meeting
    await ZoomMtg.join({
      meetingNumber: extractMeetingNumber(meetingLink),
      userName: 'User', // TODO: Get from user profile
      userEmail: '', // TODO: Get from user profile
      passWord: '', // TODO: Get from meeting details if required
      success: (success: any) => {
        console.log('Joined meeting successfully:', success);
      },
      error: (error: any) => {
        console.error('Failed to join meeting:', error);
        throw error;
      },
    });
  } catch (error) {
    console.error('Error joining Zoom meeting:', error);
    throw error;
  }
};

const extractMeetingNumber = (meetingLink: string): string => {
  // Extract meeting number from Zoom meeting link
  const match = meetingLink.match(/\/j\/(\d+)/);
  if (!match) {
    throw new Error('Invalid Zoom meeting link');
  }
  return match[1];
};

export const validateZoomMeeting = async (meetingUrl: string): Promise<boolean> => {
  try {
    // Call our backend API to validate the meeting URL
    const response = await axios.post<{ valid: boolean }>('/api/zoom/validate', {
      meetingUrl,
    });
    return response.data.valid;
  } catch (error) {
    console.error('Error validating Zoom meeting:', error);
    return false;
  }
};
