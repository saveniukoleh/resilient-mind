# Resilient Mind

A mental health support application designed to provide assistance for war-affected individuals in Ukraine.

## Features

- 🤖 AI-Powered Chatbot
- 👨‍⚕️ Therapist Booking System
- 🧘‍♂️ PTSD Recovery Program
- 👥 Community Support Forum
- 📱 Offline Mode

## Tech Stack

- Frontend: Vue.js + TailwindCSS
- Backend: Node.js + Express
- Database: Firebase
- Authentication: Firebase Auth
- APIs: OpenAI, Twilio, Zoom

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Firebase CLI (optional)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/resilient-mind.git
   cd resilient-mind
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` in both client and server directories
   - Fill in the required environment variables

4. Start development servers:
   ```bash
   npm run dev
   ```

## Project Structure

```
resilient-mind/
├── client/          # Frontend Vue.js application
├── server/          # Backend Node.js application
├── shared/          # Shared code between frontend and backend
├── docs/           # Documentation
└── scripts/        # Build and deployment scripts
```

## Development

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
