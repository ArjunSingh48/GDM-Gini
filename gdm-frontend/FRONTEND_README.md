# GDM Guide — Frontend

A mobile-first React web app that helps people manage Gestational Diabetes Mellitus (GDM) with personalized nutrition, glucose insights, an AI companion (Gini), and educational content.

## Tech stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS v3** + **shadcn/ui** components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Supabase JS** client for auth, database, storage, and edge functions
- **Web Speech API** for voice input in the Gini chat

## Prerequisites

- **Node.js** 18+ and **npm** (or `bun` / `pnpm` if you prefer)
- A running backend (see the backend README) reachable from the browser
- A Supabase project (or compatible backend) providing:
  - Auth, Postgres, Storage
  - Deployed edge functions: `chat`, `analyze-meal`, `metabolic-insights`

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env   # if an example exists, otherwise create .env manually
```

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
VITE_SUPABASE_PROJECT_ID="YOUR-PROJECT-REF"
```

> The `chat` edge function additionally needs two server-side secrets configured in your backend dashboard:
> - `CUSTOM_LLM_URL` — public URL of the FastAPI `/chat` endpoint (e.g. your ngrok tunnel + `/chat`)
> - `CUSTOM_LLM_API_KEY` — must match `API_SECRET` set on the backend

## Run locally

```bash
# Start the dev server with hot reload
npm run dev
```

The app is served at **http://localhost:8080**.

## Other scripts

```bash
npm run build       # Production build
npm run build:dev   # Development-mode build
npm run preview     # Preview the production build locally
npm run lint        # Run ESLint
npm run test        # Run vitest once
npm run test:watch  # Watch-mode tests
```

## Project structure

```
src/
├── components/      # UI + feature components (gini, nutrition, health, layout, ui)
├── pages/           # Route-level pages (Index, Auth, Onboarding, Nutrition, ...)
├── hooks/           # Custom hooks (useAuth, useDailyRecommendations, ...)
├── integrations/    # Supabase client + generated types
├── data/            # Static content (daily recommendations, etc.)
├── lib/             # Utilities
└── index.css        # Design tokens (HSL semantic colors)
supabase/
├── functions/       # Edge functions: chat, analyze-meal, metabolic-insights
└── config.toml
```

## Browser support

- Chrome / Edge / Safari (latest 2 versions)
- Voice input in the Gini chat requires a Chromium-based browser or Safari (Web Speech API)

## Notes

- All AI-generated content shows a disclaimer: *Educational only — does not replace medical advice.*
- Authentication uses email + password (no email confirmation). Do not enable anonymous sign-ups.
