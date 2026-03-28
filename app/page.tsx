"use client";

import { useState, useCallback, useEffect } from "react";
import { InputPanel } from "@/components/emergency/input-panel";
import { ResultCard } from "@/components/emergency/result-card";
import { DemoSamples } from "@/components/emergency/demo-samples";
import { NearbyHospitalsPanel } from "@/components/emergency/nearby-hospitals";
import { WeatherPanel } from "@/components/emergency/weather-panel";
import type { AnalyzeResponse } from "@/app/api/services/types";
import { ShieldAlert, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

type PageState = "idle" | "analyzing" | "result" | "error";

interface UserLocation {
  lat: number;
  lng: number;
}

export default function HomePage() {
  const [state, setState] = useState<PageState>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoText, setDemoText] = useState("");
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // Request geolocation on mount
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleAnalyze = useCallback(async (text: string, imageBase64?: string) => {
    setState("analyzing");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, imageBase64 }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }

      setResult(data.data);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }, []);

  const handleDemoSelect = useCallback((text: string) => {
    setDemoText(text);
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setDemoText("");
  }, []);

  const isLoading = state === "analyzing";

  return (
    <div className="min-h-screen bg-[var(--mr-base)]">
      {/* ── Sticky top bar ── */}
      <nav className="sticky top-0 z-50 bg-[var(--mr-base)] border-b border-[var(--mr-gold)]/10 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-[var(--mr-text-muted)] hover:text-white transition-colors
                       focus:outline-none focus:text-white"
            aria-label="Documentation & landing page"
          >
            <ArrowLeft className="size-4" />
            <span className="text-xs uppercase tracking-wider font-bold" style={{ fontFamily: "var(--font-label)" }}>
              Docs
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-[var(--mr-gold)]" aria-hidden="true" />
            <span
              className="text-lg font-black italic text-white tracking-widest"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              EMERGENCY INTERPRETER
            </span>
          </div>
          <div className="flex items-center gap-1">
            {locationStatus === "granted" && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <MapPin className="size-3" />
                GPS
              </span>
            )}
            {locationStatus === "requesting" && (
              <span className="text-[10px] text-[var(--mr-text-dim)] animate-pulse">
                📍 Locating...
              </span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* ── Hero tagline ── */}
        <div className="text-center space-y-3">
          <h1
            className="text-3xl md:text-5xl font-black italic text-white hero-glow"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            DECODE THE <span className="text-[var(--mr-gold)]">CHAOS</span>
          </h1>
          <p className="text-[var(--mr-text-muted)] max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Paste any messy, panicked, or multilingual emergency description — or upload a photo.
            Our AI triage system will extract the signals, assess severity, and give you clear, actionable
            next steps — <em>in seconds</em>.
          </p>
        </div>

        {/* ── Input panel ── */}
        <InputPanel
          onSubmit={handleAnalyze}
          isLoading={isLoading}
          initialText={demoText}
        />

        {/* ── Demo samples ── */}
        {state !== "result" && (
          <DemoSamples onSelect={handleDemoSelect} disabled={isLoading} />
        )}

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-12" role="status" aria-label="Analyzing">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[var(--mr-surface-highest)] border-t-[var(--mr-gold)] rounded-full animate-spin" />
              <ShieldAlert className="absolute inset-0 m-auto size-6 text-[var(--mr-gold)]" />
            </div>
            <div className="text-center">
              <p
                className="font-bold italic text-white text-lg"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                ANALYZING SITUATION...
              </p>
              <p className="text-[var(--mr-text-dim)] text-sm mt-1">
                Extracting signals, assessing severity, composing actions
              </p>
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {state === "error" && error && (
          <div className="bg-red-500/10 border border-red-500/30 p-6 text-center space-y-4 animate-float-in">
            <p className="text-red-400 font-bold">{error}</p>
            <button
              onClick={handleReset}
              className="text-sm text-[var(--mr-text-muted)] hover:text-white underline transition-colors
                         focus:outline-none focus:text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Result ── */}
        {state === "result" && result && (
          <div className="space-y-6">
            <ResultCard data={result} />

            {/* ── Location-based context ── */}
            {location && (
              <div className="space-y-6 bg-[var(--mr-surface-low)] border border-white/5 p-6">
                <WeatherPanel lat={location.lat} lng={location.lng} />
                <div className="border-t border-white/5 pt-6">
                  <NearbyHospitalsPanel lat={location.lat} lng={location.lng} />
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-sm text-[var(--mr-text-muted)] hover:text-[var(--mr-gold)] transition-colors
                           underline underline-offset-4
                           focus:outline-none focus:text-[var(--mr-gold)]"
              >
                Analyze another situation
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer disclaimer ── */}
      <footer className="border-t border-white/5 py-6 px-6">
        <p className="text-center text-xs text-[var(--mr-text-dim)] max-w-2xl mx-auto leading-relaxed">
          ⚠️ This tool provides AI-generated emergency triage guidance only. It is{" "}
          <strong>not a substitute</strong> for professional medical advice, diagnosis, or
          treatment. In a real emergency, always call your local emergency services (e.g. 911, 112,
          108).
        </p>
      </footer>
    </div>
  );
}
