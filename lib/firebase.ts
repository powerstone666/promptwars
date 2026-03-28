import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export function isFirebaseWebConfigured(): boolean {
  return requiredFirebaseKeys.every((key) => Boolean(process.env[key]));
}

function assertFirebaseWebConfig(): void {
  const missingKeys = requiredFirebaseKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    console.warn(`[Firebase] Missing keys during init: ${missingKeys.join(", ")}. Bypassing fatal error for Next.js build step.`);
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  const missingKeys = requiredFirebaseKeys.filter((key) => !process.env[key]);
  if (missingKeys.length > 0) {
    return null;
  }
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export const firebaseApp = getFirebaseApp() as FirebaseApp;
export const db = firebaseApp ? getFirestore(firebaseApp) : null as unknown as ReturnType<typeof getFirestore>;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const analyticsSupported = await isSupported();

  if (!analyticsSupported) {
    return null;
  }

  return getAnalytics(firebaseApp);
}
