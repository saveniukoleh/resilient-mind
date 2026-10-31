# Resilient Mind

A mental health support application designed to provide assistance for war-affected individuals in Ukraine. Our platform combines technology and professional expertise to deliver accessible, professional mental health support to those who need it most.

The public site is [saveniukoleh.com/resilient-mind](https://saveniukoleh.com/resilient-mind).

## 🌟 Features

- 🤖 AI-Powered Chatbot for 24/7 emotional support
- 👨‍⚕️ Therapist Booking System with video call integration
- 🧘‍♂️ PTSD Recovery Program with self-guided therapeutic modules
- 👥 Community Support Forum for safe, moderated discussions
- 📱 Offline Mode with downloadable resources and SMS support

The chatbot replies in the language of the user's latest message. Its opening message stays in English.

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or newer for the Vue app
- Node.js 22 for Cloud Functions
- Yarn
- Firebase CLI (`npx firebase-tools`)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/saveniukoleh/resilient-mind.git
   cd resilient-mind
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a local env file:

   ```bash
   cp .env.example .env
   ```

   Put the Firebase web config in `.env`. Do not put an OpenAI key there. `VITE_` variables are copied into the public JavaScript bundle.

4. Install function dependencies:

   ```bash
   cd functions
   npm install
   ```

### Development

Start the app at [http://localhost:3000](http://localhost:3000):

```bash
yarn dev
```

The production build uses the `/resilient-mind/` base path. The dev server stays at `/`.

### Chatbot

The browser calls the Firebase function `handleAIChat`. The OpenAI key lives only in Firebase Secret Manager.

From `functions`, sign in, store a new key, and deploy. Cloud Functions require the Blaze plan, and the function runtime is Node.js 22.

```bash
npx firebase-tools login
npx firebase-tools functions:secrets:set OPENAI_API_KEY --project resilient-mind-cca45
npx firebase-tools deploy --only functions:handleAIChat --project resilient-mind-cca45
```

The function runs as `resilient-mind-cca45@appspot.gserviceaccount.com` because this project has no default Compute Engine service account.

Add `saveniukoleh.com` and `localhost` under Firebase **Authentication → Settings → Authorized domains** so sign-in works on the public site and locally.

### Hosting

Pushes to `master` build the app and deploy it with GitHub Actions to GitHub Pages. In the repository, **Settings → Pages → Source** must be **GitHub Actions**.

The Pages site is served at [saveniukoleh.com/resilient-mind](https://saveniukoleh.com/resilient-mind). Firebase client config used by that build is in `.env.production`.

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
│   ├── src/index.ts      # handleAIChat, the deployed function
│   ├── package.json    # Functions dependencies
│   └── tsconfig.json  # TypeScript configuration
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
- **Hosting**: GitHub Pages

## 📚 Documentation

- [Project Context](docs/CONTEXT.md)
- [Development Plan](docs/DEVELOPMENT_PLAN.md)
- [Exercise System Plan](docs/EXERCISES_DEVELOPMENT_PLAN.md)

## 🔒 Security

- The OpenAI key is a Firebase secret. Never commit it or expose it as a `VITE_` variable. GitHub secret scanning revokes keys that land in this public repository.
- Firebase web config in `.env.production` is public by design. Firestore and Storage rules control access.
- The chatbot function accepts calls only from a signed-in user.

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
