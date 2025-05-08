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
- Vite

### Backend

- Firebase Cloud Functions
- Firebase Authentication
- Firebase Firestore
- Firebase Storage

### API Integrations

- OpenAI API (Chatbot functionality)
- Twilio API (SMS support)
- Zoom API (Video therapy sessions)

### Hosting

- Firebase Hosting
- Vercel (Optional)

## Project Structure

```
resilient-mind/
├── src/                      # Vue.js application source
│   ├── components/          # Reusable Vue components
│   ├── views/              # Page components
│   ├── router/            # Vue Router configuration
│   ├── stores/           # Pinia store modules
│   ├── services/        # API and service integrations
│   ├── styles/         # Global styles and TailwindCSS
│   ├── types/         # TypeScript type definitions
│   ├── config/       # Application configuration
│   ├── App.vue      # Root component
│   └── main.ts     # Application entry point
│
├── functions/              # Firebase Cloud Functions
│   ├── src/              # Functions source code
│   │   ├── functions/   # Function implementations
│   │   └── index.ts    # Functions entry point
│   ├── package.json    # Functions dependencies
│   └── tsconfig.json  # TypeScript configuration
│
├── android/                # Android app files
├── ios/                   # iOS app files
├── electron/             # Desktop app files
│
├── docs/                   # Documentation
│   ├── CONTEXT.md         # Project context and overview
│   ├── DEVELOPMENT_PLAN.md # Development roadmap
│   └── EXERCISES_DEVELOPMENT_PLAN.md # Exercise system plan
│
├── .env                    # Environment variables
├── .env.example           # Example environment variables
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # TailwindCSS configuration
├── postcss.config.js      # PostCSS configuration
├── capacitor.config.ts    # Capacitor configuration
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
└── package.json           # Project dependencies and scripts
```

## Development Workflow

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Update with your Firebase and API credentials

3. Start development server:

   ```bash
   npm run dev
   ```

4. Start Firebase emulators:
   ```bash
   npm run functions:serve
   ```

### Building for Production

1. Build the application:

   ```bash
   npm run build:prod
   ```

2. Deploy Firebase Functions:
   ```bash
   npm run functions:deploy
   ```

### Mobile Development

1. Sync Capacitor:

   ```bash
   npm run mobile:sync
   ```

2. Open platform-specific IDE:
   ```bash
   npm run mobile:open:android  # For Android
   npm run mobile:open:ios      # For iOS
   ```

### Desktop Development

1. Start Electron development:

   ```bash
   npm run electron:dev
   ```

2. Build desktop application:
   ```bash
   npm run electron:build
   ```

## Security Considerations

1. Environment Variables:

   - Never commit `.env` file
   - Use different values for development/staging/production
   - Keep API keys secure

2. Firebase Security Rules:

   - Implement proper access control
   - Validate user authentication
   - Protect sensitive data

3. API Security:
   - Use Firebase Authentication
   - Implement rate limiting
   - Validate all inputs

## Deployment

### Firebase Deployment

1. Configure Firebase project:

   ```bash
   firebase init
   ```

2. Deploy functions:

   ```bash
   npm run functions:deploy
   ```

3. Deploy hosting:
   ```bash
   firebase deploy --only hosting
   ```

### Mobile App Deployment

1. Android:

   - Build release APK
   - Sign with release key
   - Upload to Play Store

2. iOS:
   - Archive in Xcode
   - Upload to App Store Connect

### Desktop App Deployment

1. Build platform-specific packages:

   ```bash
   npm run electron:build
   ```

2. Sign and notarize (macOS)
3. Code sign (Windows)

---

_Resilient Mind is committed to providing accessible mental health support to those affected by conflict in Ukraine. Our platform combines technology and professional expertise to deliver meaningful assistance when it's needed most._
