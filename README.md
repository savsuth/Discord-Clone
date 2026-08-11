# Discord Application

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/github/license/savsuth/discord-app)

A Discord-style communication platform built with Next.js, Prisma, and LiveKit. Supports servers, channels, text and audio/video chat, file uploads, invites, member roles, and realtime presence.

---

## Features

- Authentication via Clerk, with automatic user profile bootstrapping
- Servers, text/audio/video channels, direct messages, and 1:1 video calls
- Realtime messaging through Socket.io, with a polling fallback indicator
- File uploads via UploadThing, with emoji picker support
- LiveKit-powered audio/video rooms with in-room chat
- Invite links and member management (roles, kick)
- Infinite message loading using `@tanstack/react-query`
- Light and dark theme support, responsive UI built with Tailwind CSS and Radix primitives

## Tech Stack

| Category | Technologies |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | PostgreSQL (Supabase), Prisma ORM via `pg` adapter |
| Realtime | Socket.io, LiveKit |
| Auth | Clerk |
| Uploads | UploadThing |
| UI | Tailwind CSS v4, shadcn/Radix UI |

## Prerequisites

- Node.js 18.17 or higher (20.x recommended)
- A PostgreSQL or Supabase database URL
- Clerk API keys (publishable and secret)
- LiveKit API key, secret, and URL
- An UploadThing app and token

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Create a `.env` file** (already excluded by `.gitignore`)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

DATABASE_URL=postgresql://user:password@host:5432/db

UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
UPLOADTHING_TOKEN=

LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
**3. Generate the Prisma client and apply the schema**
```bash
npx prisma generate
npx prisma db push
```

**4. Run the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Run the linter |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |

## Notes

- The LiveKit URL must be publicly accessible over `wss`.
- Re-run `npx prisma generate` and `npx prisma db push` after any schema changes.
- Keep all secrets out of version control; confirm `.env` remains untracked before committing.

## License

Distributed under the MIT License. See `LICENSE` for details.
