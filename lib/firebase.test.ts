import {
  getFirebaseWebConfig,
  getMissingFirebaseWebKeys,
  isFirebaseWebConfigured,
} from "./firebase";

describe("firebase config helpers", () => {
  it("reports missing keys deterministically", () => {
    const env = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
    } as unknown as NodeJS.ProcessEnv;

    expect(getMissingFirebaseWebKeys(env)).toEqual([
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]);
  });

  it("returns null config when required keys are missing", () => {
    const env = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
    } as unknown as NodeJS.ProcessEnv;

    expect(getFirebaseWebConfig(env)).toBeNull();
  });

  it("builds config when all required keys are present", () => {
    const env = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "bucket",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender",
      NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "measurement-id",
    } as unknown as NodeJS.ProcessEnv;

    expect(getFirebaseWebConfig(env)).toEqual({
      apiKey: "api-key",
      authDomain: "example.firebaseapp.com",
      projectId: "project-id",
      storageBucket: "bucket",
      messagingSenderId: "sender",
      appId: "app-id",
      measurementId: "measurement-id",
    });
  });

  it("uses process env for configured check", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "bucket",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender",
      NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
    };

    expect(isFirebaseWebConfigured()).toBe(true);

    process.env = originalEnv;
  });
});
