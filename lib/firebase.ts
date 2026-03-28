import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";

const requiredFirebaseKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

type FirebaseEnvKey = (typeof requiredFirebaseKeys)[number];

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export function getMissingFirebaseWebKeys(
  env: NodeJS.ProcessEnv = process.env,
): FirebaseEnvKey[] {
  return requiredFirebaseKeys.filter((key) => !env[key]);
}

export function getFirebaseWebConfig(
  env: NodeJS.ProcessEnv = process.env,
): FirebaseWebConfig | null {
  const missingKeys = getMissingFirebaseWebKeys(env);

  if (missingKeys.length > 0) {
    return null;
  }

  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export function isFirebaseWebConfigured(): boolean {
  return getMissingFirebaseWebKeys().length === 0;
}

export function getFirebaseApp(): FirebaseApp | null {
  const firebaseConfig = getFirebaseWebConfig();

  if (!firebaseConfig) {
    return null;
  }

  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export const firebaseApp = getFirebaseApp();
export const db = getFirestoreDb();

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  const analyticsSupported = await isSupported();

  if (!analyticsSupported) {
    return null;
  }

  return getAnalytics(app);
}
