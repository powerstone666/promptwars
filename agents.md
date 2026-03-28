# Project Overview for AI Agents

## Project Structure

```
promptwar/
├── skills-lock.json          # Available AI skills
├── agents.md                # This file
├── main/                    # Next.js application
│   ├── .env                 # Local environment variables
│   ├── .env.example         # Committed environment template
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   ├── globals.css     # Global styles
│   │   ├── favicon.ico
│   │   ├── api/            # API routes
│   │   │   ├── services/   # Service layer
│   │   │   │   ├── logger.ts       # Object-oriented logging service
│   │   │   │   ├── logger.test.ts  # Logger test file
│   │   │   │   └── README.md       # Services documentation
│   │   │   └── health/     # Health check endpoint
│   │   │       └── route.ts
│   ├── components/         # React components
│   │   └── ui/            # shadcn/ui components
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── lib/               # Utility functions
│   │   ├── firebase.ts    # Firebase Web SDK client setup
│   │   └── utils.ts       # Tailwind CSS utilities
│   ├── public/            # Static assets
│   ├── scripts/           # Utility scripts
│   │   └── run-imagen-mcp.mjs
│   ├── package.json       # Dependencies & scripts
│   ├── package-lock.json  # Dependency lock file
│   ├── next.config.ts     # Next.js configuration
│   ├── tsconfig.json      # TypeScript config
│   ├── next-env.d.ts      # Next.js TypeScript declarations
│   ├── components.json    # shadcn/ui configuration
│   ├── eslint.config.mjs  # ESLint configuration
│   ├── postcss.config.mjs # PostCSS configuration
│   ├── README.md          # Project README
│   └── .gitignore         # Git ignore file
```

## Available AI Skills

### Project-local skills

These are the skills explicitly available for this repository and should be preferred when the task matches them:

1. **brainstorming** - Creative ideation and planning before implementation
2. **shadcn** - shadcn/ui component management and composition
3. **tailwind-design-system** - Tailwind CSS design system work
4. **ui-ux-pro-max** - UI/UX design and review support

### Session-wide Codex skills

These skills are also available to the agent in the current Codex environment and can be used when the task matches:

1. **agent-browser** - Browser automation for website interaction and scraping
2. **find-skills** - Discover/install additional skills
3. **next-best-practices** - Next.js architecture and App Router best practices
4. **playwright** - Browser automation and UI-flow debugging
5. **security-best-practices** - Security-focused code review and hardening
6. **security-ownership-map** - Security ownership and bus-factor analysis
7. **security-threat-model** - Repository-grounded threat modeling
8. **senior-developer** - Maintainable implementation and refactoring guidance
9. **supabase-postgres-best-practices** - Postgres performance and schema guidance
10. **vercel-composition-patterns** - Scalable React composition patterns
11. **vercel-react-best-practices** - React and Next.js performance guidance
12. **web-design-guidelines** - UI/accessibility/design guideline review
13. **openai-docs** - Official OpenAI product and API documentation workflows
14. **plugin-creator** - Codex plugin scaffolding and metadata setup
15. **skill-creator** - Create or improve Codex skills
16. **skill-installer** - Install curated or repository-hosted skills

This list reflects the currently available non-image Codex skills for this workspace. Image generation is handled through `Image-MCP` rather than an `imagegen` skill entry.

### Skill usage rules

- If a user explicitly names a skill, the agent should use it.
- If a task clearly matches a skill description, the agent should use that skill without waiting for the user to restate it.
- For creative feature work, UI changes, or behavior changes, use `brainstorming` first before implementation.
- For code changes, prefer `senior-developer` when maintainability or refactoring quality matters.

## Codex-only Plugins

These plugins are available in the local Codex plugin environment and should be treated as Codex-only capabilities, not repository-native features:

1. **Build Web Apps** - Workflows for UI review, React improvements, payments, database design, and deployment support
2. **Game Studio** - Browser game design, prototyping, asset pipeline, and playtesting workflows
3. **Vercel** - Vercel ecosystem guidance with Codex-compatible skills and MCP integration

### Plugin usage rules

- These plugins are only for Codex.
- Do not describe plugin capabilities as built into this repository unless the codebase actually contains that implementation.
- Use plugin features only when the user task matches the plugin domain.

## MCP and Agent Tooling

### MCP status in this workspace

- No MCP resources or MCP resource templates are currently advertised by configured servers in this session.
- Agents should not assume repository-specific MCP data sources exist unless they appear in the active session.

### MCP/tooling available to the agent runtime

- `Image-MCP` - User-provided MCP for image generation tasks; use this path for image creation when it is available in the active MCP session
- `prompt-doctor` - Prompt enhancement and task reframing
- Local execution tools for terminal commands, patch application, plan updates, and image viewing
- Sub-agent orchestration tools for spawning, messaging, waiting on, and closing agents
- `GitKraken` - Git operations, PR management, issue tracking, code review, and branch management (only for antigravity)
- `StitchMCP` - UI design system management, screen generation from text prompts, screen editing, and design variant generation (only for antigravity)

### Guidance for agents

- Prefer local repository inspection first.
- Use skills when the request matches the skill trigger.
- Use `Imagen MCP` for image generation tasks instead of treating image generation as a built-in skill in this repository.
- Use MCP resources only when they are actually available in the active session.
- Do not claim a tool, MCP server, or skill is available unless it is present in the current environment.

## Technology Stack

### Core Framework

- **Next.js 16.2.1** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - Component library

### Key Dependencies

- **React 19.2.4** - UI library
- **React DOM 19.2.4** - React for web
- **class-variance-authority** - Component variant management
- **clsx** - CSS class utilities
- **tailwind-merge** - Tailwind class merging
- **tw-animate-css** - CSS animations
- **lucide-react** - Icon library
- **radix-ui** - Primitive UI components
- **motionwind-react** - Animation library
- **motion** - Animation library
- **axios** - HTTP client
- **firebase** - Firebase Web SDK
- **Google Services** - Google Maps nearby search, Firebase persistence, and optional Gemini fallback integration
- **react-hook-form** - Form management
- **zod** - Schema validation
- **sonner** - Toast notifications
- **litellm** - LLM API unification

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing

## Agents used

Antigravity Gemini Codex Chatgpt GitHub Copilot Claude Opus 4.6 and Cline

## Google Services Used

This project currently integrates the following Google ecosystem services:

1. **Gemini API**
- Used as an optional fallback generation path when `GEMINI_API_KEY` is configured and a primary provider fails

2. **Firebase**
- Provides project configuration bootstrap for the web app

3. **Firestore**
- Stores triage history records from the analyze route when Firebase is configured and available

4. **Firebase Analytics**
- A browser-only Analytics initialization path is mounted from the app shell when the runtime supports it

5. **Google Maps Places API**
- Powers nearby hospital and emergency-capable facility lookup

6. **Google Maps Platform**
- Uses `GOOGLE_MAPS_API_KEY` for Places-based geospatial lookups

The following Google services are not currently implemented:

- **Google People API**
- **Google Weather API**
- **Google Cloud Vision API**
- **Firebase A/B Testing / Remote Config**
- **Firebase Cloud Messaging**
- **Firebase Storage**
- **Firebase Auth**
- **Firebase App Check**
- **Firebase Performance Monitoring**

## Available Scripts

```bash
npm run dev     # Start development server (uses Webpack)
npm run build   # Build for production (uses Webpack)
npm start       # Start production server
npm run lint    # Run ESLint
npm test        # Run Jest unit and service tests
npm run test:e2e # Run Playwright UI and end-to-end tests
```

## Test Categories

This repository now reflects multiple testing layers:

1. **Unit and service tests**
- Jest covers provider routing, Firebase config helpers, verification logic, action composition, logging, facility routing, nearby-hospital ranking, and analyzer fallback behavior
- Separate Google-service tests cover Gemini fallback, Firebase analytics/config, Google Maps Places request shaping, and Google-service env helpers

2. **UI and end-to-end tests**
- Playwright specs in `tests/e2e/home.spec.ts` and `tests/e2e/emergency.spec.ts` cover the landing page, root app shell, demo-flow analysis, error states, and image/voice input affordances

3. **Manual smoke testing**
- Manual checks remain important for browser permission flows such as microphone recording, geolocation prompts, image upload, and safe fallback behavior under provider failure

## Accessibility Notes

Accessibility improvements are present in the main emergency UI:

- Input and action controls expose accessible labels
- Loading and analysis states expose status semantics
- Language selection uses `listbox` and `option` roles with selected-state metadata
- Multilingual output support improves usability and accessibility for users who need emergency guidance in their preferred language
- Result details and verification toggles use clearer expanded/collapsed state handling
- Keyboard submission is supported with `Ctrl/Cmd + Enter`

Agents should preserve these affordances when editing `components/emergency/*` or `app/page.tsx`.

## Efficiency Notes

The app includes several practical efficiency improvements:

- Provider routing is split by modality to avoid invalid text/image/audio combinations
- Primary provider failures can fall back to Gemini when configured
- Firestore persistence is optional and does not block response generation
- Nearby-hospital ranking prefers emergency-capable facilities before distance-only ordering
- Weather and nearby-hospital panels are supplemental and fail-soft
- Input validation rejects oversized or malformed payloads early

## Hackathon Readiness Guide

### For 3-Hour Hackathon Success

This project is optimized for rapid development during hackathons. Here's how to maximize productivity:

#### 1. **Quick Start Commands**

```bash
# Start development server (auto-reload)
npm run dev

# Add new shadcn/ui components
npx shadcn@latest add [component-name]

# Create new API route
touch app/api/[endpoint]/route.ts

# Create new page
touch app/[page]/page.tsx
```

#### 2. **Pre-configured AI Assistant Capabilities**

- **Brainstorming skill**: Use for ideation and planning (`use_skill brainstorming`)
- **UI/UX Pro Max**: Design and review UI components quickly
- **shadcn skill**: Rapid component generation and styling
- **Tailwind Design System**: Consistent styling system

#### 3. **Common Hackathon Project Templates**

Use these as starting points:

**AI Chat Application:**

- Uses Gemini-oriented text/image routing with optional Gemini fallback support
- Pre-configured with `axios` for API calls
- `react-hook-form` + `zod` for form validation
- `sonner` for toast notifications

**Dashboard/Admin Panel:**

- shadcn/ui components ready
- Tailwind CSS v4 for rapid styling
- Motionwind for animations

**API Integration Project:**

- Axios pre-installed for HTTP requests
- TypeScript for type safety
- Next.js API routes for backend logic

#### 4. **Rapid Development Patterns**

**Component Creation:**

```bash
# Add common components for hackathon
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

**API Route Pattern:**

```typescript
// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(request: Request) {
  const { message } = await request.json();
  // Implement your logic here
  return NextResponse.json({ response: "AI response here" });
}
```

#### 5. **Deployment Ready**

- Vercel deployment links in default page
- Next.js optimized for production
- Environment variables support

#### 6. **Time-Saving Tips**

1. **First 30 minutes**: Plan using `brainstorming` skill
2. **Next 60 minutes**: Build core functionality
3. **Next 60 minutes**: Polish UI with shadcn/ui components
4. **Last 30 minutes**: Test and deploy

### Recommended Component Stack for Hackathons

```bash
# Run these commands to add essential components
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea
```

## Configuration Notes

- Next.js configured with `withMotionwind` wrapper
- Webpack used instead of Turbopack (macOS ARM64 compatibility)
- Tailwind CSS v4 with PostCSS
- TypeScript strict mode enabled
- **Hackathon-optimized**: All dependencies chosen for rapid development
