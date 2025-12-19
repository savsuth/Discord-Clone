# Discord Application 

Next.js + Prisma + LiveKit Discord-style app with servers, channels, text/audio/video chat, uploads, invites, member roles, and realtime presence. 

## Features
- Auth with Clerk; auto-bootstraps user profiles
- Servers, text/audio/video channels, DM + 1:1 video
- Realtime messaging via Socket.io (polling fallback indicator)
- File uploads via UploadThing; emoji picker
- LiveKit-powered audio/video rooms with in-room chat
- Invite links, member management (roles, kick), server settings
- Infinite message loading with @tanstack/react-query
- Light/dark theme, responsive UI with Tailwind + Radix primitives

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- Prisma + PostgreSQL (Supabase) via `pg` adapter
- Socket.io, LiveKit, UploadThing
- Clerk for authentication
- Tailwind CSS v4 + shadcn/Radix UI

## Prerequisites
- Node.js 18.17+ (20.x recommended)
- PostgreSQL/Supabase database URL in `DATABASE_URL`
- Clerk keys (publishable + secret)
- LiveKit API key/secret + URL
- UploadThing app and token

## Setup
1) Install dependencies  
```bash
npm install
```

2) Create `.env` (keep it private; `.gitignore` already ignores it)  
```
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
```

3) Generate Prisma client and apply schema  
```bash
npx prisma generate
npx prisma db push
```

4) Run the app  
```bash
npm run dev
```

## Scripts
- `npm run dev` — start dev server
- `npm run lint` — lint
- `npm run build` — production build
- `npm run start` — run built app

## Notes
- LiveKit URL must be accessible (wss). Re-run `prisma generate` + `db push` after schema changes.
- Keep secrets out of git; confirm `.env` stays untracked before committing.
