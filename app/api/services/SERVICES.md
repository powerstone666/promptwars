# Services

This directory contains reusable server-side helpers for API routes and backend logic.

## Google Services Context

These services participate in the app's Google-service footprint:

- **Gemini fallback integration** through `ai-provider.ts` when a primary AI provider fails and Gemini is configured
- **Firestore persistence** through the analyze route when Firebase is available
- **Firebase Analytics bootstrap support** through `main/lib/firebase.ts` and the app shell when the browser supports Analytics
- **Google Maps Places API** through nearby-hospital and facility lookup routes

The app does not currently integrate Google People API, Firebase A/B Testing, Remote Config, Messaging, Auth, Storage, App Check, or Performance Monitoring from this service layer.

## Testing Context

The service layer is covered primarily through Jest-based unit and service tests:

- `ai-provider.test.ts` covers audio parsing, provider routing, and Gemini fallback behavior
- `incident-analyzer.test.ts` covers invalid-model-output handling and safe fallback behavior
- `logger.test.ts` covers logger configuration and structured output behavior
- related service behavior is also covered by `facility-router.test.ts`, `verifier.test.ts`, and `action-composer.test.ts`

Playwright coverage sits outside this folder and exercises the UI paths that call into these services.

## Accessibility and Efficiency Context

This directory supports accessibility and efficiency indirectly:

- service responses are structured so UI components can expose clear status, actions, and verification content
- early validation and deterministic fallback behavior reduce wasted provider calls
- provider routing, timeout handling, and Gemini fallback reduce failed-request dead ends
- fail-soft service behavior lets the UI continue operating even when supplemental integrations are unavailable

## Included Services

### Logger

`logger.ts` provides a class-based logging utility with:

- `DEBUG`, `INFO`, `WARN`, `ERROR`, and `FATAL` levels
- text or JSON formatting
- singleton and per-instance usage
- optional caller and timestamp metadata

Basic usage:

```typescript
import { Logger, LogLevel } from "./logger";

const logger = new Logger({
  minLevel: LogLevel.DEBUG,
  includeCaller: true,
});

logger.info("API route started");
```

## Notes

- These helpers are for server-side code such as `app/api/**/route.ts`.
- Firebase and Firestore config helpers live in `main/lib/firebase.ts`.
- Google Maps facility lookup logic lives in `facility-router.ts` and `nearby-hospitals/route.ts`.
- Gemini provider routing and fallback behavior live in `ai-provider.ts`.
