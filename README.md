# Muzi - Music Stream Choice

Muzi is a dynamic music streaming platform that empowers creators to engage their audiences like never before. Fans can suggest and upvote songs from YouTube and Spotify, allowing creators to curate their streams in real-time based on audience preferences.

## Features

- **Fan-Driven Playlists**: Let your audience choose the music for your streams through an interactive upvoting system
- **Multi-Platform Support**: Add songs from both YouTube and Spotify
- **Real-Time Updates**: Live stream management with instant audience feedback
- **Creator Dashboards**: Dedicated interfaces for creators to manage their streams
- **Public Profiles**: Share your creator profile and let fans discover your streams
- **Authentication**: Secure Google OAuth integration for user management

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (with Neon hosting)
- **Authentication**: NextAuth.js with Google OAuth
- **UI Components**: Radix UI, Lucide Icons
- **Video/Audio**: YouTube Player integration, Lite YouTube Embed

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 18 or higher)
- PostgreSQL database (or use a cloud service like Neon)
- Google OAuth credentials

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Shubhamkahar196/muzi.git
cd muzi
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables. Copy the `.env` file and update the values:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_postgresql_connection_string
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 
    Live link - https://muzi-xi.vercel.app/       in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Database Schema

The application uses the following main models:

- **User**: Represents authenticated users (creators and fans)
- **Stream**: Music tracks added to playlists with metadata
- **Upvote**: User votes on streams
- **CurrentStream**: Active stream for each creator

## API Endpoints

### Streams
- `GET /api/streams` - Get all active streams
- `POST /api/streams` - Create a new stream
- `GET /api/streams/my` - Get user's streams
- `POST /api/streams/upvote` - Upvote a stream
- `POST /api/streams/downvote` - Downvote a stream

### Authentication
- `/api/auth/[...nextauth]` - NextAuth.js authentication routes

## Project Structure

```
app/
├── api/              # API routes
├── components/       # React components
├── creator/          # Creator-specific pages
├── dashboard/        # Dashboard pages
├── lib/              # Utility functions and database config
├── public/           # Public creator pages
└── schemas/          # Zod validation schemas

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

components/ui/        # Reusable UI components
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request




