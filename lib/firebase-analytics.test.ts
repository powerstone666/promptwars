const getAppsMock = jest.fn();
const initializeAppMock = jest.fn();
const getFirestoreMock = jest.fn();
const getAnalyticsMock = jest.fn();
const isSupportedMock = jest.fn();

jest.mock("firebase/app", () => ({
  getApps: () => getAppsMock(),
  initializeApp: (...args: unknown[]) => initializeAppMock(...args),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: (...args: unknown[]) => getFirestoreMock(...args),
}));

jest.mock("firebase/analytics", () => ({
  getAnalytics: (...args: unknown[]) => getAnalyticsMock(...args),
  isSupported: () => isSupportedMock(),
}));

describe("firebase analytics helper", () => {
  const originalEnv = process.env;
  const globalWithWindow = globalThis as typeof globalThis & {
    window?: Window & typeof globalThis;
  };
  const originalWindow = globalWithWindow.window;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    getAppsMock.mockReturnValue([]);
    initializeAppMock.mockReturnValue({ name: "firebase-app" });
    getFirestoreMock.mockReturnValue({ name: "firestore-db" });
    getAnalyticsMock.mockReturnValue({ name: "analytics-instance" });
    isSupportedMock.mockResolvedValue(true);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    if (typeof originalWindow === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalWithWindow as any).window;
    } else {
      globalWithWindow.window = originalWindow;
    }
  });

  it("returns null during server-side execution", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalWithWindow as any).window;

    let getFirebaseAnalytics: typeof import("./firebase").getFirebaseAnalytics;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ getFirebaseAnalytics } = require("./firebase"));
    });

    await expect(getFirebaseAnalytics!()).resolves.toBeNull();
  });

  it("returns null when Firebase web config is incomplete", async () => {
    globalWithWindow.window = {} as Window & typeof globalThis;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
    };

    let getFirebaseAnalytics: typeof import("./firebase").getFirebaseAnalytics;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ getFirebaseAnalytics } = require("./firebase"));
    });

    await expect(getFirebaseAnalytics!()).resolves.toBeNull();
    expect(getAnalyticsMock).not.toHaveBeenCalled();
  });

  it("returns null when analytics support is unavailable", async () => {
    globalWithWindow.window = {} as Window & typeof globalThis;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "bucket",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender",
      NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
    };
    isSupportedMock.mockResolvedValue(false);

    let getFirebaseAnalytics: typeof import("./firebase").getFirebaseAnalytics;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ getFirebaseAnalytics } = require("./firebase"));
    });

    await expect(getFirebaseAnalytics!()).resolves.toBeNull();
    expect(getAnalyticsMock).not.toHaveBeenCalled();
  });

  it("returns analytics when Firebase is configured and supported", async () => {
    globalWithWindow.window = {} as Window & typeof globalThis;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: "api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "bucket",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "sender",
      NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
    };

    let getFirebaseAnalytics: typeof import("./firebase").getFirebaseAnalytics;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ getFirebaseAnalytics } = require("./firebase"));
    });

    await expect(getFirebaseAnalytics!()).resolves.toEqual({
      name: "analytics-instance",
    });
    expect(initializeAppMock).toHaveBeenCalled();
    expect(getAnalyticsMock).toHaveBeenCalledWith({ name: "firebase-app" });
  });
});
