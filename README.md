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

- **Node.js** 18+ and **bun** 
- A running backend (see the backend README) reachable from the browser
- A Supabase project (or compatible backend) providing:
  - Auth, Postgres, Storage
  - Deployed edge functions: `chat`, `analyze-meal`, `metabolic-insights`

## Setup

```bash
# 1. Install dependencies
bun install

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
bun dev
```

The app is served at **http://localhost:8080**.

## Other scripts

```bash
bun run build         # Production build
bun run build:dev     # Development-mode build
bun run preview       # Preview the production build locally
bun run lint          # Run ESLint
bun run test          # Run vitest once
bun run test:watch    # Watch-mode tests
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

## Running the Gini chatbot

The Gini chat in the app talks to your **local FastAPI backend** through the `chat` edge function. To get it working end-to-end:

1. **Start the backend** (see `BACKEND_README.md`):
   ```bash
   uvicorn api:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Expose it publicly** with ngrok (the edge function runs in the cloud and can't reach `localhost`):
   ```bash
   ngrok http 8000
   ```
   Copy the generated `https://xxxx.ngrok-free.app` URL.
3. **Configure two backend secrets** in your project's backend dashboard:
   - `CUSTOM_LLM_URL` → `https://xxxx.ngrok-free.app/chat`
   - `CUSTOM_LLM_API_KEY` → the same string as `API_SECRET` on the backend
4. **Start the frontend**:
   ```bash
   bun run dev
   ```
5. Open http://localhost:8080, sign in, and tap the **Gini mascot** (bottom-right) to open the chat. Type a message or tap the mic button for voice input.

> Every time you restart `ngrok` the URL changes — update `CUSTOM_LLM_URL` accordingly.

**Troubleshooting**
- *"I can't reach the model right now"* → backend or ngrok tunnel is down.
- *"Backend rejected the API key"* → `CUSTOM_LLM_API_KEY` ≠ `API_SECRET`.
- *"Backend endpoint not found"* → `CUSTOM_LLM_URL` must end with `/chat`.

## Browser support

- Chrome / Edge / Safari (latest 2 versions)
- Voice input in the Gini chat requires a Chromium-based browser or Safari (Web Speech API)

## Notes

- All AI-generated content shows a disclaimer: *Educational only — does not replace medical advice.*
- Authentication uses email + password (no email confirmation). Do not enable anonymous sign-ups.
