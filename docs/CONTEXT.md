# Resilient Mind - Mental Health Support App

## Project Overview

Resilient Mind is a dedicated mental health support application designed to provide assistance for war-affected individuals in Ukraine. Our platform focuses on delivering accessible, professional mental health support to those who need it most.

### Target Audience

- Displaced people
- PTSD sufferers
- Individuals seeking emotional support

## Core Features

### 🤖 AI-Powered Chatbot

- 24/7 emotional support using advanced NLP
- Intelligent response system for immediate assistance
- Automated escalation to professionals for severe cases
- Personalized coping strategy suggestions

### 👨‍⚕️ Therapist Booking System

- Seamless appointment scheduling with licensed therapists
- Integration with video call platforms:
  - Zoom
  - Twilio
- Secure and confidential session management

### 🧘‍♂️ PTSD Recovery Program

- Self-guided therapeutic modules
- Breathing exercises and CBT techniques
- Progress tracking and achievement system
- Personalized recovery paths

### 👥 Community Support Forum

- Safe, moderated discussion spaces
- Experience sharing platform
- Content moderation to ensure user safety
- Supportive community environment

### 📱 Offline Mode

- Downloadable self-help resources
- SMS-based support system
- Low-bandwidth optimization
- Accessible without constant internet connection

## Technical Stack

### Frontend

- Vue.js
- TailwindCSS

### Backend

- Node.js
- Express

### Database & Authentication

- Firebase
- Firebase Auth

### API Integrations

- OpenAI API (Chatbot functionality)
- Twilio API (SMS support)
- Zoom API (Video therapy sessions)

### Hosting

- Vercel

## Database Schema

### Users Collection

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  profilePicture?: string;
  language: string;
  createdAt: timestamp;
  lastLogin: timestamp;
  isActive: boolean;
  role: "user" | "therapist" | "admin";
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
}
```

### Therapists Collection

```typescript
interface Therapist {
  id: string;
  userId: string; // Reference to Users collection
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
}
```

### Sessions Collection

```typescript
interface Session {
  id: string;
  therapistId: string; // Reference to Therapists collection
  userId: string; // Reference to Users collection
  date: timestamp;
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled";
  type: "video" | "chat" | "in-person";
  notes?: string;
  payment: {
    amount: number;
    status: "pending" | "completed" | "refunded";
    transactionId?: string;
  };
}
```

### Chat Messages Collection

```typescript
interface ChatMessage {
  id: string;
  sessionId: string; // Reference to Sessions collection
  senderId: string; // Reference to Users collection
  content: string;
  timestamp: timestamp;
  type: "text" | "image" | "file";
  isRead: boolean;
  metadata?: {
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
  };
}
```

### Recovery Programs Collection

```typescript
interface RecoveryProgram {
  id: string;
  title: string;
  description: string;
  modules: {
    id: string;
    title: string;
    content: string;
    duration: number;
    order: number;
    type: "video" | "text" | "exercise";
  }[];
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string[];
  prerequisites?: string[];
  totalDuration: number;
  isActive: boolean;
}
```

### User Progress Collection

```typescript
interface UserProgress {
  id: string;
  userId: string; // Reference to Users collection
  programId: string; // Reference to Recovery Programs collection
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number; // percentage
  lastAccessed: timestamp;
  completedAt?: timestamp;
  notes?: string;
  mood?: {
    rating: number;
    timestamp: timestamp;
    notes?: string;
  }[];
}
```

### Community Posts Collection

```typescript
interface CommunityPost {
  id: string;
  userId: string; // Reference to Users collection
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: timestamp;
  updatedAt: timestamp;
  likes: number;
  comments: number;
  status: "active" | "archived" | "reported";
  isAnonymous: boolean;
  moderationStatus: "pending" | "approved" | "rejected";
}
```

## Project Structure

```
resilient-mind/
├── client/                      # Frontend Vue.js application
│   ├── public/                  # Static files
│   │   ├── assets/             # Images, fonts, etc.
│   │   │   ├── common/         # Shared components
│   │   │   ├── chat/          # Chat-related components
│   │   │   ├── therapy/       # Therapy-related components
│   │   │   └── community/     # Community-related components
│   │   ├── views/             # Page components
│   │   ├── router/            # Vue Router configuration
│   │   ├── store/             # Vuex store modules
│   │   ├── services/          # API services
│   │   ├── utils/             # Helper functions
│   │   ├── styles/            # Global styles
│   │   ├── App.vue
│   │   └── main.js
│   ├── tests/                 # Frontend tests
│   └── package.json
│
├── server/                     # Backend Node.js application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helper functions
│   │   └── app.js             # Express app setup
│   ├── tests/                 # Backend tests
│   └── package.json
│
├── shared/                     # Shared code between frontend and backend
│   ├── constants/
│   ├── types/
│   └── utils/
│
├── docs/                       # Documentation
│   ├── api/
│   ├── deployment/
│   └── development/
│
├── scripts/                    # Build and deployment scripts
├── .github/                    # GitHub Actions workflows
├── .gitignore
├── README.md
└── package.json
```

## Development Roadmap

### Phase 1: MVP Development

- Core chatbot implementation
- Basic therapist booking system
- Essential user authentication

### Phase 2: User Testing

- NGO partnership program
- User feedback collection
- Performance optimization

### Phase 3: Launch & Scale

- Full feature deployment
- Multilingual support
- Community expansion

---

_Resilient Mind is committed to providing accessible mental health support to those affected by conflict in Ukraine. Our platform combines technology and professional expertise to deliver meaningful assistance when it's needed most._
