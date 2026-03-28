"use client";

import { useEffect } from "react";
import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/firebase";

export function FirebaseAnalyticsBootstrap() {
  useEffect(() => {
    let cancelled = false;

    async function initAnalytics() {
      const analytics = await getFirebaseAnalytics();

      if (!analytics || cancelled) {
        return;
      }

      logEvent(analytics, "page_view", {
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
      });
    }

    void initAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
