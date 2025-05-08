export type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Session {
  id: string;
  therapistId: string;
  userId: string;
  date: Date;
  duration: number; // in minutes
  status: SessionStatus;
  price: number;
  notes?: {
    therapist?: string;
    user?: string;
  };
  feedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  paymentStatus: 'pending' | 'completed' | 'refunded';
  meetingLink?: string;
  reminders: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface SessionBookingRequest {
  therapistId: string;
  date: Date;
  duration: number;
  notes?: string;
}

export interface SessionFilters {
  status?: SessionStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  therapistId?: string;
  userId?: string;
}

export interface SessionReminder {
  id: string;
  sessionId: string;
  type: 'email' | 'sms' | 'push';
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
}
