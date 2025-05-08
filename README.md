# Resilient Mind

A mental health support application designed to provide assistance for war-affected individuals in Ukraine. Our platform combines technology and professional expertise to deliver accessible, professional mental health support to those who need it most.

## 🌟 Features

- 🤖 AI-Powered Chatbot for 24/7 emotional support
- 👨‍⚕️ Therapist Booking System with video call integration
- 🧘‍♂️ PTSD Recovery Program with self-guided therapeutic modules
- 👥 Community Support Forum for safe, moderated discussions
- 📱 Offline Mode with downloadable resources and SMS support

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Firebase CLI
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/resilient-mind.git
   cd resilient-mind
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration values.

4. Initialize Firebase:
   ```bash
   firebase init
   ```

### Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Start Firebase emulators:
   ```bash
   npm run functions:serve
   ```

### Building

1. Build for production:

   ```bash
   npm run build:prod
   ```

2. Deploy Firebase Functions:

   ```bash
   npm run functions:deploy
   ```

3. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

## 📱 Mobile Development

### Android

1. Sync Capacitor:

   ```bash
   npm run mobile:sync
   ```

2. Open Android Studio:
   ```bash
   npm run mobile:open:android
   ```

### iOS

1. Sync Capacitor:

   ```bash
   npm run mobile:sync
   ```

2. Open Xcode:
   ```bash
   npm run mobile:open:ios
   ```

## 🖥️ Desktop Development

1. Start Electron development:

   ```bash
   npm run electron:dev
   ```

2. Build desktop application:
   ```bash
   npm run electron:build
   ```

## 🏗️ Project Structure

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
```

## 🛠️ Tech Stack

- **Frontend**: Vue.js, TailwindCSS, Vite
- **Backend**: Firebase Cloud Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting
- **Mobile**: Capacitor
- **Desktop**: Electron

## 📚 Documentation

- [Project Context](docs/CONTEXT.md)
- [Development Plan](docs/DEVELOPMENT_PLAN.md)
- [Exercise System Plan](docs/EXERCISES_DEVELOPMENT_PLAN.md)

## 🔒 Security

- Environment variables are used for sensitive data
- Firebase Security Rules protect data access
- API rate limiting is implemented
- Input validation is enforced
- Regular security audits are performed

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All contributors who have helped shape this project
- The mental health professionals who provided guidance
- The open-source community for their invaluable tools and resources

---

_Resilient Mind is committed to providing accessible mental health support to those affected by conflict in Ukraine. Our platform combines technology and professional expertise to deliver meaningful assistance when it's needed most._
