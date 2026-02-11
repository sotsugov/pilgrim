# Pilgrim

Narrative-driven CYOA psychological thriller with a Convex-authoritative runtime:
- **Act I**: hand-authored nodes stored in Convex (migrated from `data/destinations.json`)
- **Act II**: endless generated scenes in the same setting (provider/model configurable)

## Prerequisites

Set these environment variables (for local development, put them in `.env.local`):

```bash
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
OPENAI_API_KEY=...
# optional
OPENAI_MODEL=gpt-4.1-mini
STORY_SLUG=pilgrim
```

## Setup

1. Generate Convex code and run Convex locally:

```bash
bun run convex:dev
```

2. In another terminal, migrate/seed Act I destinations and default story config:

```bash
bun run seed:act1
```

3. Start Next.js:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture Notes

- Convex is the source of truth for sessions, choices, memory, and scene progression.
- API keys stay in env vars only; provider/model live in Convex `storyConfigs`.
- Generated scenes are persisted per-session and remain stable when revisited.
