# Triage Signal — AI Agent Guide

## Project Overview

**Triage Signal** is an AI-powered emergency intelligence platform built with Next.js 16.2.1. It converts messy, panicked, multilingual emergency descriptions (text and images) into structured, verified, life-saving action cards.

## Project Structure

```
main/
├── app/
│   ├── page.tsx                        # Emergency triage UI (root /)
│   ├── docs/page.tsx                   # Landing/docs page (/docs)
│   ├── layout.tsx                      # Root layout (fonts, metadata, Toaster)
│   ├── globals.css                     # Design system tokens + animations
│   ├── api/
│   │   ├── analyze/route.ts            # POST /api/analyze — main triage endpoint
│   │   ├── nearby-hospitals/route.ts   # GET — Google Maps Places hospital lookup
│   │   ├── weather/route.ts            # GET — Open-Meteo weather data
│   │   ├── health/route.ts             # GET — Health check
│   │   └── services/                   # Backend service layer
│   │       ├── ai-provider.ts          # LLM client (multimodal vision)
│   │       ├── incident-analyzer.ts    # Triage orchestrator (retry + parse)
│   │       ├── prompts.ts              # System/user prompt templates
│   │       ├── schemas.ts              # Zod request/response schemas
│   │       ├── verifier.ts             # Deterministic safety guardrails
│   │       ├── action-composer.ts      # Action enrichment logic
│   │       ├── logger.ts               # Structured JSON logger
│   │       ├── logger.test.ts          # Logger unit tests
│   │       ├── types.ts                # TypeScript interfaces
│   │       └── README.md               # Services documentation
├── components/
│   ├── emergency/                      # Emergency-specific components
│   │   ├── input-panel.tsx             # Text + image + language selector
│   │   ├── result-card.tsx             # Triage result card
│   │   ├── action-list.tsx             # Immediate actions list
│   │   ├── verification-panel.tsx      # AI verification status
│   │   ├── nearby-hospitals.tsx        # Hospital listing
│   │   ├── weather-panel.tsx           # Weather conditions
│   │   ├── demo-samples.tsx            # Demo scenario cards
│   │   └── share-panel.tsx             # Result sharing
│   └── ui/                             # shadcn/ui primitives
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── constants.ts                    # App constants, severity config, languages
│   ├── firebase.ts                     # Firebase Web SDK client
│   └── utils.ts                        # Tailwind CSS utilities (cn)
├── public/
│   └── triage_signal_logo.png          # App logo (shield + ECG pulse)
├── .env.example                        # Environment template
├── package.json                        # Dependencies & scripts
├── next.config.ts                      # Next.js config (motionwind wrapper)
├── tsconfig.json                       # TypeScript strict config
├── components.json                     # shadcn/ui configuration
└── README.md                           # Project documentation
```

## Technology Stack

- **Next.js 16.2.1** with App Router & TypeScript
- **Tailwind CSS v4** with postCSS
- **shadcn/ui** component library
- **LiteLLM** for LLM API (OpenAI Vision format, multimodal)
- **Zod v4** for schema validation at all boundaries
- **Google Maps Places API** for nearby hospital routing
- **Open-Meteo** for real-time weather data
- **React 19.2.4** with hooks-based state management
- **Lucide React** for iconography
- **Sonner** for toast notifications
- **Motion + Motionwind** for animations

## Key Features for AI Agents

### 1. Multilingual Support (18 languages)
The `outputLanguage` parameter flows through the entire pipeline:
- **Frontend**: `InputPanel` → language selector dropdown → `onSubmit(text, image, outputLanguage)`
- **API Route**: `route.ts` extracts `outputLanguage` from request body
- **Analyzer**: `incident-analyzer.ts` passes it to `buildUserPrompt()`
- **Prompts**: `prompts.ts` appends `OUTPUT LANGUAGE:` instruction for non-English
- **Schema**: `schemas.ts` validates with `z.string().max(10).default("en")`

Supported: en, hi, te, ta, es, fr, ar, zh, pt, ru, ja, de, ko, bn, ur, mr, kn, ml

### 2. Multimodal Vision Pipeline
Image data flows as base64 data URIs:
- **Frontend**: File → FileReader → base64 data URI → `onSubmit(text, imageBase64)`
- **API Route**: Extracted from request, validated by Zod (max ~7MB base64)
- **AI Provider**: Sent as OpenAI Vision `image_url` content part
- **Prompts**: `hasImage` flag triggers visual analysis instructions

### 3. Safety Architecture
```
Input → Rate Limiter → Zod Validation → AI Call → JSON Parse → Zod Response Validation → Verifier → Action Composer → Output
```
- **Rate limiter**: 10 req/min per IP (in-memory)
- **Verifier**: Blocks diagnostic language, ensures disclaimers, enforces severity thresholds
- **Safe fallback**: Always returns actionable output even on total AI failure

### 4. Design System
The UI uses a dark, high-contrast "Marvel Rivals" aesthetic defined in `globals.css`:
- `--mr-base`: #0a0a14 (dark background)
- `--mr-gold`: #FFD700 (primary accent)
- `--mr-cyan`: #00DDFF (secondary accent)
- `--font-headline`: Space Grotesk (bold italic headers)
- `--font-label`: Plus Jakarta Sans (labels)
- `--font-sans`: Inter (body text)

## Environment Variables

```bash
# Required
LITELLM_API_KEY=          # LLM provider API key
LITELLM_BASE_URL=         # LLM proxy base URL
MODEL_NAME=               # Model name (e.g., gpt-4o)
GOOGLE_MAPS_API_KEY=      # Google Maps Places API key

# Optional (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Available Scripts

```bash
npm run dev     # Start development server (Webpack)
npm run build   # Production build
npm start       # Start production server
npm run lint    # Run ESLint
```

## Agent-Specific Guidance

### Adding a New Language
1. Add entry to `OUTPUT_LANGUAGES` in `lib/constants.ts`
2. No backend changes needed — the ISO code is passed directly to the LLM

### Adding a New Emergency Feature
1. Create API route in `app/api/[feature]/route.ts`
2. Add Zod schemas in `services/schemas.ts`
3. Create component in `components/emergency/`
4. Integrate into `app/page.tsx`

### Modifying AI Behavior
- System prompt: `services/prompts.ts` → `SYSTEM_PROMPT`
- User prompt builder: `services/prompts.ts` → `buildUserPrompt()`
- Safety rules: `services/verifier.ts` → `verifyAnalysis()`
- Response enrichment: `services/action-composer.ts` → `composeActions()`

### Testing
- Logger tests: `services/logger.test.ts` (existing)
- Build verification: `npm run build` (TypeScript + static analysis)
- Manual testing: Use demo scenarios on the home page
