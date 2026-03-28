# Google Services

This document separates the Google ecosystem footprint into two clear categories:

- **Services actively used by the app code**
- **Project-level or console-level Google / Firebase services associated with the broader project setup**

## Services Actively Used By The App Code

### Gemini

- Gemini fallback generation is implemented in `app/api/services/ai-provider.ts`
- It is used when a primary provider fails and `GEMINI_API_KEY` is configured
- This is a real runtime integration, not just a console-level capability

### Firebase App Configuration

- Firebase web bootstrap logic lives in `lib/firebase.ts`
- The app builds a browser-safe Firebase app when the required `NEXT_PUBLIC_FIREBASE_*` variables are present
- Firebase remains optional and does not block the core emergency flow when missing

### Firestore

- Firestore persistence is used in `app/api/analyze/route.ts`
- Triage records are stored when Firebase is configured and Firestore is available
- If Firestore is unavailable, persistence is skipped without breaking the response

### Firebase Analytics

- A browser-only Analytics helper exists in `lib/firebase.ts`
- Analytics initialization is gated behind browser support and Firebase configuration
- This means the repository has explicit support for Google Analytics for Firebase initialization

### Google Maps Places

- Nearby facility search is implemented in `app/api/services/facility-router.ts`
- Nearby-hospital routing and ranking flows depend on `GOOGLE_MAPS_API_KEY`
- This is an active Google Maps server-side integration

## Project-Level Or Console-Level Google / Firebase Services

These items may appear in the Firebase or Google console for the project and can be described as part of the broader Google platform footprint. They should not be confused with code-level integrations unless the repository contains explicit implementation.

### Project Context Services

- Google Analytics
- AdMob
- Google Ads
- BigQuery Sandbox
- Display & Video 360
- Google Play integration
- PagerDuty alerts
- Cloud Logging

These are documented here as **project-context platform services**. The current repository does not contain direct application code for AdMob ad rendering, Google Ads campaign APIs, BigQuery query flows, Display & Video 360 APIs, Google Play APIs, PagerDuty alert delivery, or Cloud Logging export pipelines.

## Deployment Context

### Google Cloud Run Readiness

- The repository includes a production-ready `Dockerfile`
- That makes the app suitable for container deployment targets such as Google Cloud Run

### What The Repository Proves

- The codebase is **container deployment ready**
- The codebase is **compatible with a Google Cloud Run style deployment**
- The repository does **not** currently include Cloud Run manifests, `gcloud run deploy` scripts, Terraform, or CI/CD automation proving an active Cloud Run deployment

So the accurate deployment statement is:

- **The app can be deployed to Google Cloud Run**
- **A live Cloud Run deployment is not explicitly encoded in the repository**

## Adjacent Tooling Context

- `agents.md` references `GitKraken` and `StitchMCP` for antigravity-specific environments
- Those tools are not Google services and should be described separately from the Google platform footprint

## Summary

The strongest Google-service claims directly supported by this repository are:

- Gemini fallback support
- Firebase app configuration support
- Firestore persistence
- Firebase Analytics helper support
- Google Maps Places integration
- Container deployment readiness suitable for Google Cloud Run

The wider Firebase / Google console ecosystem can also be described for project context, but those items should remain clearly labeled as project-level or console-level services unless corresponding code is added.
