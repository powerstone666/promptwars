# Services

This directory contains reusable server-side helpers for API routes and backend logic.

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
- Client-side Firebase initialization lives in `main/lib/firebase.ts`.
