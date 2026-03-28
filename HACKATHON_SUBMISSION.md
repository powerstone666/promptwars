# 🛡️ rakshak ai — AI Emergency Intelligence

> Turn messy, panicked, multilingual emergency descriptions into structured, verified, life-saving action cards — powered by AI triage.

![rakshak ai Logo](./public/rakshak_ai_logo.png)

## ✨ Features

### 🧠 AI-Powered Emergency Triage
- **Multilingual Input**: Paste emergency descriptions in any language — mixed-language is supported
- **Multilingual Output**: Get triage results in 18 languages (English, Hindi, Telugu, Tamil, Spanish, French, Arabic, Chinese, and more)
- **Severity Assessment**: Automatic classification (Low → Medium → High → Critical) with confidence scores
- **Structured Action Cards**: Immediate actions, things to avoid, escalation recommendations

### 📸 Multimodal Vision Analysis
- **Image Upload**: Upload photos of emergencies (accidents, hazards, injuries)
- **Drag & Drop**: Drop images directly into the input area
- **Visual Signal Extraction**: AI analyzes visible injuries, hazards, environmental conditions, and signage
- **Combined Analysis**: Text + image data are analyzed together for richer context

### 🎙️ Voice Input
- **Recorded Voice Notes**: Capture emergency descriptions directly from the microphone
- **Gemini Voice Path**: Voice requests are handled through the dedicated Gemini-oriented voice configuration
- **Text/Image Gemini Path**: Typed and image-assisted requests use the Gemini-oriented text and vision configuration

### 🗺️ Geospatial Intelligence
- **Nearby Hospitals**: Automatically locates closest hospitals with phone numbers, distance, and open/closed status
- **Real-Time Weather**: Shows current temperature, humidity, wind, and conditions at your location
- **GPS Integration**: Browser geolocation for location-aware triage context

### ☁️ Google Services
- **Gemini Fallback**: When configured, Gemini can act as a backup generation path if the primary AI provider fails
- **Firebase App Config**: The app uses Firebase web configuration for project-level integration
- **Firestore Persistence**: Triage history can be written to Firestore when Firebase is configured
- **Firebase Analytics**: Client-safe Analytics initialization is mounted in the app shell when the browser/runtime supports it
- **Google Maps Places**: Nearby emergency-capable hospitals are looked up through Google Maps Places APIs
- **Google Maps Geospatial Context**: Maps-based hospital ranking is paired with browser geolocation for local results
- **Weather API**: Current conditions come from Open-Meteo, not a Google weather service
- **People API**: Google People API is not currently integrated in this project

### 🔒 Safety & Reliability
- **Rate Limiting**: 10 requests/minute with in-memory rate limiter
- **Payload Validation**: Strict Zod schemas for all request/response boundaries
- **5MB Image Limit**: Base64 URI format enforced server-side
- **Deterministic Guardrails**: Verifier prevents AI overclaiming or diagnostic language
- **Safe Fallback**: Always returns actionable guidance even if AI fails

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in your API keys (see below)
# Then start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the triage app, or [http://localhost:3000/docs](http://localhost:3000/docs) for the landing page.

---

## 🔐 Environment Variables

Create a `.env` file with the following keys:

```bash
# ── Required: Gemini AI Provider (text + image) ──
# These legacy env keys are the runtime connection points for Gemini in this app.
# Configure them to point at your Gemini-compatible text/image endpoint.
LITELLM_API_KEY=your-litellm-api-key
LITELLM_BASE_URL=https://your-litellm-proxy.example.com
MODEL_NAME=gpt-4o

# ── Required: Gemini Voice Provider ──
# These legacy env keys are used for Gemini-oriented voice input handling.
DASHSCOPE_API_KEY=your-gemini-voice-api-key
DASHSCOPE_COMPAT_API_URL=https://your-gemini-voice-endpoint.example.com/v1/chat/completions
DASHSCOPE_VOICE_MODEL=your-gemini-voice-model

# ── Optional: Gemini Fallback Provider ──
GEMINI_API_KEY=your-gemini-api-key
GEMINI_FALLBACK_MODEL=gemini-2.5-flash

# ── Required: Google Maps (for nearby hospitals) ──
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ── Optional: Firebase (if using auth/storage) ──
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

For voice input, this app expects Gemini-oriented voice configuration through the legacy `DASHSCOPE_*` keys above. Text and image analysis use the Gemini text/image configuration through the legacy `LITELLM_*` keys. If a primary provider fails and `GEMINI_API_KEY` is configured, the app can fall back to the Gemini API before returning the safe fallback response.

## 🔗 Google Service Footprint

The app currently touches the following Google ecosystem services:

- **Gemini API**: Optional fallback generation path for text, image, and audio-capable requests when configured
- **Firebase**: Web app configuration bootstrap for the frontend
- **Firestore**: Stores triage history records from the analyze route when Firebase is available
- **Firebase Analytics**: A browser-only initialization path exists and is mounted from the app shell when the runtime supports it
- **Google Maps Places API**: Used by `/api/nearby-hospitals` for emergency-capable facility lookup and ranking
- **Google Maps Platform keys**: `GOOGLE_MAPS_API_KEY` powers hospital lookup requests

The app does not currently use:

- **Google People API**
- **Google Weather API**
- **Google Cloud Vision API**
- **Firebase A/B Testing / Remote Config**
- **Firebase Cloud Messaging**
- **Firebase Storage**
- **Firebase Auth**
- **Firebase App Check**
- **Firebase Performance Monitoring**

---

## 🏗️ Architecture

```
main/
├── app/
│   ├── page.tsx                    # Emergency triage UI (root /)
│   ├── docs/page.tsx               # Landing page & documentation
│   ├── layout.tsx                  # Root layout with fonts & metadata
│   ├── globals.css                 # Design system (Marvel Rivals aesthetic)
│   ├── api/
│   │   ├── analyze/route.ts        # POST /api/analyze — main triage endpoint
│   │   ├── nearby-hospitals/route.ts  # GET — Google Maps hospital lookup
│   │   ├── weather/route.ts        # GET — Open-Meteo weather data
│   │   ├── health/route.ts         # GET — Health check
│   │   └── services/
│   │       ├── ai-provider.ts      # Gemini provider routing for text, image, and voice
│   │       ├── incident-analyzer.ts # Triage orchestrator
│   │       ├── prompts.ts          # System + user prompt templates
│   │       ├── schemas.ts          # Zod request/response validation
│   │       ├── verifier.ts         # Deterministic safety guardrails
│   │       ├── action-composer.ts  # Action enrichment
│   │       ├── logger.ts           # Structured JSON logging
│   │       └── types.ts            # TypeScript interfaces
│   └── ...
├── components/emergency/
│   ├── input-panel.tsx             # Text + image + language selector
│   ├── result-card.tsx             # Triage result display
│   ├── action-list.tsx             # Immediate action items
│   ├── verification-panel.tsx       # AI verification status
│   ├── nearby-hospitals.tsx        # Hospital listing panel
│   ├── weather-panel.tsx           # Weather conditions panel
│   ├── demo-samples.tsx            # Demo scenario cards
│   └── share-panel.tsx             # Result sharing
├── lib/
│   ├── constants.ts                # App constants & language list
│   ├── firebase.ts                 # Firebase client setup
│   └── utils.ts                    # Tailwind CSS utilities
└── public/
    └── rakshak_ai_logo.png      # App logo
```

### Data Flow

```
User Input (text + image + language)
  → POST /api/analyze
    → Zod validation
    → Rate limiting
    → buildUserPrompt() (with output language instruction)
    → callLLM() (Gemini text/image path for text/image, Gemini voice path for audio, Gemini fallback on provider failure when configured)
    → Firestore persistence when Firebase is configured
    → JSON parse + Zod schema validation
    → verifyAnalysis() (safety guardrails)
    → composeActions() (action enrichment)
  → Structured AnalyzeResponse

Browser Geolocation
  → GET /api/nearby-hospitals?lat=...&lng=...
  → GET /api/weather?lat=...&lng=...
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.1 (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **AI** | Gemini-oriented split routing for text, image, and voice |
| **Maps** | Google Maps Places API |
| **Google Services** | Gemini fallback, Firebase config, Firestore persistence, Google Maps Places |
| **Weather** | Open-Meteo (free, no key required, not Google Weather) |
| **Validation** | Zod v4 |
| **Animations** | Motionwind + Motion |
| **Icons** | Lucide React |

---

## 📋 Available Scripts

```bash
npm run dev     # Start development server
npm run build   # Production build
npm start       # Start production server
npm run lint    # Run ESLint
npm test        # Run Jest unit and service tests
npm run test:e2e # Run Playwright UI and end-to-end tests
```

---

## 🧪 Testing Coverage

The repository now documents multiple test categories across the stack:

- **Unit and service tests with Jest**: Core logic is covered in `app/api/services/*.test.ts`, `app/api/nearby-hospitals/ranking.test.ts`, and `lib/firebase.test.ts`
- **Separate Google-service tests**: Focused coverage now exists for Gemini fallback, Firebase analytics/config, Google Maps Places request shaping, and Google-service env helpers
- **UI and end-to-end tests with Playwright**: Browser flows are covered in `tests/e2e/home.spec.ts` and `tests/e2e/emergency.spec.ts`
- **API fallback coverage**: Failure and retry paths are exercised in `incident-analyzer.test.ts` and `ai-provider.test.ts`
- **Routing and geospatial coverage**: Facility selection and emergency ranking are covered in `facility-router.test.ts` and `ranking.test.ts`
- **Manual verification flows**: The app is structured for manual smoke checks around microphone capture, image upload, geolocation, error handling, and safety fallback responses

Recommended manual verification areas:

- Analyze a text-only emergency description
- Analyze a text + image emergency description
- Record and submit a voice note
- Deny geolocation permissions and confirm the app still works
- Force provider failure and confirm the safe fallback response remains actionable

---

## ♿ Accessibility

Accessibility has been improved in the core emergency workflow:

- **Labeled interactive controls**: Input, upload, voice, language, and action controls use `aria-label` and related semantics
- **Live status feedback**: Character counts and loading states expose `aria-live` or `role=\"status\"` updates
- **Keyboard-friendly input**: Emergency submission supports `Ctrl/Cmd + Enter`
- **Multilingual accessibility**: Triage output can be generated in multiple supported languages so users can receive instructions in a more accessible and understandable form
- **Semantic result structure**: Action lists, result cards, and verification toggles use clearer structural roles and states
- **State-aware controls**: Disabled and expanded states are exposed with attributes such as `aria-expanded`, `aria-controls`, and `aria-selected`

These improvements are concentrated in `components/emergency/input-panel.tsx`, `components/emergency/result-card.tsx`, `components/emergency/action-list.tsx`, and `app/page.tsx`.

---

## ⚡ Efficiency

Several implementation details improve runtime efficiency and resilience:

- **Provider split by modality**: Text/image and voice requests are routed separately so unsupported payloads are not sent through the wrong provider path
- **Optional Firestore persistence**: Database writes are skipped cleanly when Firebase is not configured instead of blocking analysis
- **Request timeouts and fallback behavior**: Provider calls use bounded timeouts and can fall back to Gemini before returning a safe response
- **Parallel nearby lookup shaping**: Hospital result normalization uses concurrent detail mapping and emergency-aware ranking
- **Fail-soft context panels**: Weather and nearby-hospital panels enrich the result without blocking the main triage response
- **Strict payload boundaries**: Zod validation rejects malformed image and audio payloads before expensive downstream work

These improvements are mainly implemented in `app/api/services/ai-provider.ts`, `app/api/analyze/route.ts`, `app/api/nearby-hospitals/route.ts`, `app/api/nearby-hospitals/ranking.ts`, and `lib/firebase.ts`.

---

## 🌍 Supported Output Languages

Supported output languages also contribute to accessibility by making emergency guidance easier to understand for multilingual users and mixed-language situations.

| Language | Native | Code |
|----------|--------|------|
| English | English | en |
| Hindi | हिन्दी | hi |
| Telugu | తెలుగు | te |
| Tamil | தமிழ் | ta |
| Spanish | Español | es |
| French | Français | fr |
| Arabic | العربية | ar |
| Chinese | 中文 | zh |
| Portuguese | Português | pt |
| Russian | Русский | ru |
| Japanese | 日本語 | ja |
| German | Deutsch | de |
| Korean | 한국어 | ko |
| Bengali | বাংলা | bn |
| Urdu | اردو | ur |
| Marathi | मराठी | mr |
| Kannada | ಕನ್ನಡ | kn |
| Malayalam | മലയാളം | ml |

---

## ⚠️ Disclaimer

This tool provides AI-generated emergency triage guidance only. It is **not a substitute** for professional medical advice, diagnosis, or treatment. In a real emergency, always call your local emergency services (e.g., 911, 112, 108).

---

## 📄 License

Built for the PromptWars Hackathon 2026.
