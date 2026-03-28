# 🛡️ Triage Signal — AI Emergency Intelligence

> Turn messy, panicked, multilingual emergency descriptions into structured, verified, life-saving action cards — powered by AI triage.

![Triage Signal Logo](./public/triage_signal_logo.png)

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

### 🗺️ Geospatial Intelligence
- **Nearby Hospitals**: Automatically locates closest hospitals with phone numbers, distance, and open/closed status
- **Real-Time Weather**: Shows current temperature, humidity, wind, and conditions at your location
- **GPS Integration**: Browser geolocation for location-aware triage context

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
# ── Required: LLM Provider ──
LITELLM_API_KEY=your-litellm-api-key
LITELLM_BASE_URL=https://your-litellm-proxy.example.com
MODEL_NAME=gpt-4o

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
│   │       ├── ai-provider.ts      # LLM client (multimodal vision support)
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
    └── triage_signal_logo.png      # App logo
```

### Data Flow

```
User Input (text + image + language)
  → POST /api/analyze
    → Zod validation
    → Rate limiting
    → buildUserPrompt() (with output language instruction)
    → callLLM() (multimodal: text + image_url)
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
| **AI** | LiteLLM (OpenAI Vision API format) |
| **Maps** | Google Maps Places API |
| **Weather** | Open-Meteo (free, no key required) |
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
```

---

## 🌍 Supported Output Languages

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
