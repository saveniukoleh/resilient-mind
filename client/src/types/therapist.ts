export interface TherapistProfile {
  id: string;
  userId: string;
  specialization: string[];
  credentials: {
    license: string;
    education: string[];
    certifications: string[];
  };
  availability: {
    timezone: string;
    schedule: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
  };
  rating: number;
  totalSessions: number;
  bio: string;
  languages: string[];
  hourlyRate: number;
  isAvailable: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: {
    license: string;
    education: string[];
    idProof: string;
  };
  reviews: {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
}

export interface TherapistSearchFilters {
  specialization?: string[];
  languages?: string[];
  minRating?: number;
  maxPrice?: number;
  availability?: {
    day: string;
    time: string;
  };
  verifiedOnly?: boolean;
}

export interface TherapistAvailability {
  timezone: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  exceptions?: {
    date: string;
    isAvailable: boolean;
  }[];
}
