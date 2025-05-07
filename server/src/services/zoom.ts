import { ZoomMtg } from '@zoom/meetingsdk';
import axios from 'axios';
import { config } from '../config';

interface ZoomMeetingRequest {
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    waiting_room: boolean;
    meeting_authentication: boolean;
  };
}

interface ZoomMeetingResponse {
  id: string;
  join_url: string;
  password?: string;
  host_email: string;
  start_time: string;
  duration: number;
}

export class ZoomService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.zoom.apiKey;
    this.apiSecret = config.zoom.apiSecret;
    this.baseUrl = 'https://api.zoom.us/v2';
  }

  private generateJWT(): string {
    const payload = {
      iss: this.apiKey,
      exp: Date.now() + 5000,
    };
    return ZoomMtg.generateSDKSignature();
  }

  async createMeeting(meetingRequest: ZoomMeetingRequest): Promise<ZoomMeetingResponse> {
    try {
      const token = this.generateJWT();
      const response = await axios.post<ZoomMeetingResponse>(
        `${this.baseUrl}/users/me/meetings`,
        meetingRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  }

  async validateMeeting(meetingUrl: string): Promise<boolean> {
    try {
      const meetingId = this.extractMeetingId(meetingUrl);
      if (!meetingId) return false;

      const token = this.generateJWT();
      await axios.get(`${this.baseUrl}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Error validating Zoom meeting:', error);
      return false;
    }
  }

  private extractMeetingId(meetingUrl: string): string | null {
    const match = meetingUrl.match(/\/j\/(\d+)/);
    return match ? match[1] : null;
  }
}
