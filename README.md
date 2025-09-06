# TinyWins Monorepo

Monorepo skeleton for TinyWins.

Structure:

- apps/
  - parent-dashboard — React (Vite)
  - tv-app — React (Vite) PWA
  - toy-sim — React (Vite)
- services/
  - worker-api — Cloudflare Worker (Hono) + D1 + KV
  - agent-mesh — Node + solclientjs
- packages/
  - shared — Zod schemas/types + topic helpers

Root stack: pnpm, TypeScript, ESLint, Prettier.

## Setup

- pnpm i
- Add environment variables:
  - .dev.vars (root for Worker)
  - apps/*/.env.local (for apps)
- Dev commands:
  - pnpm dev:worker (Workers local)
  - pnpm dev:mesh (Agent Mesh)

## Worker API

Hono router with endpoints:
- POST /v1/children
- POST /v1/challenges (seeds 3 MicroSteps)
- POST /v1/progress (updates KV streak on win)
- POST /v1/content/compose (stubbed Google AI call; returns placeholder URL)

D1 schema is ensured on first request. KV used for simple streak counters.

## Agent Mesh

Connects to Solace using `solclientjs`, subscribes to topics, and runs simple agents:
- PlannerAgent — logs microstep planning on challenge/created
- ContentAgent — on content/requested calls Worker compose and emits content/generated
- AnalyticsAgent — increments in-memory streaks and emits reward/unlocked on 3x wins

Note: Update SOLACE_* env vars for a real connection.

## Apps

- parent-dashboard — simple UI to create children/challenges and log wins.
- tv-app — PWA shell. Route /story/:childId composes an image then displays it.
- toy-sim — Big Celebrate button posting /v1/progress type:'win'.

Set `VITE_WORKER_API_URL` in each app’s .env.local if not on localhost.

## Root Scripts & CI

- build: pnpm -r build
- lint: pnpm -r lint
- dev:worker, dev:mesh

CI:
- GitHub Pages deploys `site/` with built apps (under /apps/*). For subpath correctness, consider setting `base` in each Vite config to `/apps/<name>/` before deploying.
- Worker API deploy via `wrangler-action` (configure CF_ACCOUNT_ID, CF_API_TOKEN secrets).

## Smoke Tests

1. POST /v1/children → 200 + row exists.
2. POST /v1/challenges → 200 + 3 microsteps seeded.
3. toy-sim “Celebrate” → /v1/progress stored; streak increments (KV).
4. /v1/content/compose with {kind:'image'} → returns URL.
5. tv-app /story/:childId loads asset and renders.

## Prompt Seeds

- Image: Sticker of a friendly broccoli hero giving a thumbs-up to <childName>. Bright, playful.
- Video: 8-second clip: <childName>'s math hero solves a subtraction puzzle and cheers.

